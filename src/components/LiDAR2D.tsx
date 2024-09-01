import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { type RefObject, useRef } from "react";
import BouncingBox from "./Animation/BouncingBox";
import { Box, PivotControls } from "@react-three/drei";
import useOrbitControlToggle from "../hooks/useOrbitControl";

const lineMaterial = new THREE.LineBasicMaterial({
  color: 0xff3333,
  transparent: false,
  opacity: 0.1,
});

const pointMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.4,
});

interface LiDAR2DProps {
  objectsRefs: RefObject<
    THREE.Mesh<
      THREE.BufferGeometry<THREE.NormalBufferAttributes>,
      THREE.Material | THREE.Material[],
      THREE.Object3DEventMap
    >
  >[];
  sensorOrigin: THREE.Vector3;
  sensorDirection: THREE.Vector3;
  workingDistance: {
    min: number;
    max: number;
  };
  apertureAngle: number;
  angularResolution: number;
}

export function LiDAR2D({
  objectsRefs,
  sensorOrigin,
  sensorDirection,
  workingDistance,
  apertureAngle,
  angularResolution,
}: LiDAR2DProps) {
  const numberOfRays = Math.floor(apertureAngle / angularResolution);

  const startVec: THREE.Vector3[] = [];
  const endVec: THREE.Vector3[] = [];
  const laserVec: THREE.Vector3[] = [];
  const raycasters: THREE.Raycaster[] = [];
  const rayVertices: number[] = [];
  for (let i = 0; i < numberOfRays; i++) {
    const angle = (i * angularResolution - apertureAngle / 2) * (Math.PI / 180);
    const laserDirection = new THREE.Vector3()
      .copy(sensorDirection)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);

    const start = new THREE.Vector3()
      .copy(sensorOrigin)
      .add(
        new THREE.Vector3()
          .copy(laserDirection)
          .multiplyScalar(workingDistance.min)
      );

    startVec.push(start);
    laserVec.push(start);
    rayVertices.push(start.x, start.y, start.z);

    const end = new THREE.Vector3()
      .copy(sensorOrigin)
      .add(
        new THREE.Vector3()
          .copy(laserDirection)
          .multiplyScalar(workingDistance.max)
      );

    endVec.push(end);
    laserVec.push(end);
    rayVertices.push(end.x, end.y, end.z);

    const newRay = new THREE.Raycaster(
      sensorOrigin,
      laserDirection,
      workingDistance.min,
      workingDistance.max
    );
    raycasters.push(newRay);
  }

  const lineRef = useRef(
    new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(laserVec),
      lineMaterial
    )
  );
  const pointRef = useRef(
    new THREE.Points(
      new THREE.BufferGeometry().setFromPoints(endVec),
      pointMaterial
    )
  );

  const rayGeometry = new THREE.BufferGeometry();
  const verticesFloatArray = new Float32Array(rayVertices);
  rayGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(verticesFloatArray, 3)
  );

  // 半透明のマテリアルを作成
  const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.1,
  });

  // メッシュを作成
  const rayMesh = new THREE.Mesh(rayGeometry, material);

  useFrame(({ scene }) => {
    if (!lineRef.current || !objectsRefs) return;
    const updateLaserVec: THREE.Vector3[] = [];
    const updatePointVec: THREE.Vector3[] = [];
    for (let i = 0; i < numberOfRays; i++) {
      const intersects = raycasters[i].intersectObjects(
        objectsRefs
          .map((ref) => ref.current)
          .filter((obj) => obj !== null) as THREE.Object3D[]
      );
      updateLaserVec.push(startVec[i]);
      if (intersects.length > 0) {
        updateLaserVec.push(intersects[0].point);
        updatePointVec.push(intersects[0].point);
      } else {
        updateLaserVec.push(endVec[i]);
        updatePointVec.push(endVec[i]);
      }
    }
    pointRef.current.geometry.setFromPoints(updatePointVec);

    lineRef.current.geometry.setFromPoints(updateLaserVec);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    scene.add(lineRef.current);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    scene.add(pointRef.current);
    // scene.add(rayMesh);
  });
  return <></>;
}

export function LiDAR2DExample() {
  const lidarConfig: Omit<LiDAR2DProps, "objectsRefs"> = {
    sensorOrigin: new THREE.Vector3(0, 0, -5),
    sensorDirection: new THREE.Vector3(0, 0, -1).normalize(),
    workingDistance: { min: 1, max: 15 },
    apertureAngle: 276,
    angularResolution: 1, // 0.05, 0.1, 0.125, 0.25, 0.33, 0.5, 1
  };

  const obstacleBoxRefs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];

  const { handleDragEnd, handleDragStart } = useOrbitControlToggle();

  return (
    <>
      <BouncingBox
        ref={obstacleBoxRefs[0]}
        start={new THREE.Vector3(-8, 0, -4)}
        end={new THREE.Vector3(3, 0, -9)}
        size={[1, 3, 2]}
        color={"green"}
        speed={0.8}
        phase={1.5}
      />
      <PivotControls
        anchor={[0, 0, 0]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box ref={obstacleBoxRefs[1]} args={[4, 1, 2]} position={[4, 0, 0]}>
          <meshBasicMaterial wireframe wireframeLinewidth={2} />
        </Box>
      </PivotControls>
      <LiDAR2D objectsRefs={obstacleBoxRefs} {...lidarConfig} />
    </>
  );
}
