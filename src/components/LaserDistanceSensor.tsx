import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { type RefObject, useRef } from "react";
import BouncingBox from "./Animation/BouncingBox";

const lineMaterial = new THREE.LineBasicMaterial({
  color: 0xff3333,
});

const pointMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.4,
});

interface LaserDistanceSensorProps {
  objectsRef: RefObject<
    THREE.Mesh<
      THREE.BufferGeometry<THREE.NormalBufferAttributes>,
      THREE.Material | THREE.Material[],
      THREE.Object3DEventMap
    >
  >;
  sensorOrigin: THREE.Vector3;
  sensorDirection: THREE.Vector3;
  workingDistance: {
    min: number;
    max: number;
  };
}

export function LaserDistanceSensor({
  objectsRef,
  sensorOrigin,
  sensorDirection,
  workingDistance,
}: LaserDistanceSensorProps) {
  const raycaster = new THREE.Raycaster(
    sensorOrigin,
    sensorDirection,
    workingDistance.min,
    workingDistance.max
  );

  const laserLimitPoint = new THREE.Vector3()
    .copy(sensorOrigin)
    .add(
      new THREE.Vector3()
        .copy(sensorDirection)
        .multiplyScalar(workingDistance.max)
    );

  const laserLine: THREE.Vector3[] = [sensorOrigin, laserLimitPoint];

  const lineRef = useRef(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(laserLine),
      lineMaterial
    )
  );

  const pointRef = useRef(
    new THREE.Points(
      new THREE.BufferGeometry().setFromPoints([laserLimitPoint]),
      pointMaterial
    )
  );

  useFrame(({ scene }) => {
    if (!lineRef.current || !objectsRef.current) return;

    // const intersects = raycaster.intersectObject(objectsRef.current);
    const intersects = raycaster.intersectObjects([objectsRef.current]);

    let updatePoints: THREE.Vector3[];
    if (intersects.length > 0) {
      updatePoints = [sensorOrigin, intersects[0].point];
      pointRef.current.geometry.setFromPoints([intersects[0].point]);
    } else {
      updatePoints = [sensorOrigin, laserLimitPoint];
      pointRef.current.geometry.setFromPoints([]);
    }
    lineRef.current.geometry.setFromPoints(updatePoints);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    scene.add(lineRef.current);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    scene.add(pointRef.current);
  });
  return <></>;
}

export function LaserDistanceSensorExample() {
  const sensor1Config: Omit<LaserDistanceSensorProps, "objectsRef"> = {
    sensorOrigin: new THREE.Vector3(1, 0, 1),
    sensorDirection: new THREE.Vector3(1, 0, 2).normalize(),
    workingDistance: { min: 1, max: 15 },
  };
  const sensor2Config: Omit<LaserDistanceSensorProps, "objectsRef"> = {
    sensorOrigin: new THREE.Vector3(-1, 0, 1),
    sensorDirection: new THREE.Vector3(1, 0, 2).normalize(),
    workingDistance: { min: 1, max: 15 },
  };
  const sensor3Config: Omit<LaserDistanceSensorProps, "objectsRef"> = {
    sensorOrigin: new THREE.Vector3(-5, 0, 3),
    sensorDirection: new THREE.Vector3(4, 0, 1).normalize(),
    workingDistance: { min: 1, max: 15 },
  };

  const obstacleBoxRef = useRef<THREE.Mesh>(null);

  return (
    <>
      <BouncingBox
        ref={obstacleBoxRef}
        start={new THREE.Vector3(-1, 0, 4)}
        end={new THREE.Vector3(7, 0, 12)}
        size={[4, 0.3, 2]}
        color={"orange"}
        speed={2}
        phase={0.4}
      />
      <LaserDistanceSensor {...sensor1Config} objectsRef={obstacleBoxRef} />
      <LaserDistanceSensor {...sensor2Config} objectsRef={obstacleBoxRef} />
      <LaserDistanceSensor {...sensor3Config} objectsRef={obstacleBoxRef} />
    </>
  );
}
