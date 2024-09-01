import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { type RefObject, useRef } from "react";
import BouncingBox from "./Animation/BouncingBox";
import { Box, PivotControls } from "@react-three/drei";
import useOrbitControlToggle from "../hooks/useOrbitControl";
import state from "../store";

const pointMaterial = new THREE.PointsMaterial({
  color: 0xff0000,
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

function createRayRangeVertexAndIndices(
  startVec: THREE.Vector3[],
  endVec: THREE.Vector3[]
): { vertex: number[]; indices: number[] } {
  const vertex: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i < startVec.length; i++) {
    const j = 2 * i;
    vertex.push(startVec[i].x, startVec[i].y, startVec[i].z);
    vertex.push(endVec[i].x, endVec[i].y, endVec[i].z);
    if (j + 3 < 2 * startVec.length) indices.push(j, j + 1, j + 3);
    indices.push(j + 2, j, j + 3);
  }

  return { vertex, indices };
}

function createRayRange(
  startVec: THREE.Vector3[],
  endVec: THREE.Vector3[]
): THREE.Mesh {
  const { vertex, indices } = createRayRangeVertexAndIndices(startVec, endVec);
  const rayGeometry = new THREE.BufferGeometry();
  const verticesFloatArray = new Float32Array(vertex);
  rayGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(verticesFloatArray, 3)
  );
  rayGeometry.setIndex(indices);

  const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    side: THREE.FrontSide, // DoubleSide,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  });

  return new THREE.Mesh(rayGeometry, material);
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
  const raycasters: THREE.Raycaster[] = [];

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

    const end = new THREE.Vector3()
      .copy(sensorOrigin)
      .add(
        new THREE.Vector3()
          .copy(laserDirection)
          .multiplyScalar(workingDistance.max)
      );

    endVec.push(end);

    const newRay = new THREE.Raycaster(
      sensorOrigin,
      laserDirection,
      workingDistance.min,
      workingDistance.max
    );
    raycasters.push(newRay);
  }
  const pointRef = useRef(
    new THREE.Points(
      new THREE.BufferGeometry().setFromPoints(endVec),
      pointMaterial
    )
  );
  const rayMesh = useRef(createRayRange(startVec, endVec));

  useFrame(({ scene }) => {
    const updatePointVec: THREE.Vector3[] = [];
    const hitPoints: THREE.Vector3[] = [];
    for (let i = 0; i < numberOfRays; i++) {
      const intersects = raycasters[i].intersectObjects(
        objectsRefs
          .map((ref) => ref.current)
          .filter((obj) => obj !== null) as THREE.Object3D[]
      );
      if (intersects.length > 0) {
        updatePointVec.push(intersects[0].point);
        hitPoints.push(intersects[0].point);
      } else {
        updatePointVec.push(endVec[i]);
      }
    }
    pointRef.current.geometry.setFromPoints(hitPoints);
    const { vertex, indices } = createRayRangeVertexAndIndices(
      startVec,
      updatePointVec
    );
    rayMesh.current.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertex, 3)
    );
    rayMesh.current.geometry.setIndex(indices);

    state.setHitPoints(hitPoints);
    state.setHitCount(hitPoints.length);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    scene.add(pointRef.current);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    scene.add(rayMesh.current);
  });

  return <></>;
}

export function LiDAR2DExample() {
  const lidarConfig: Omit<LiDAR2DProps, "objectsRefs"> = {
    sensorOrigin: new THREE.Vector3(0, 0, -5),
    sensorDirection: new THREE.Vector3(0, 0, -1).normalize(),
    workingDistance: { min: 1, max: 15 },
    apertureAngle: 276,
    angularResolution: 0.05, // 0.05, 0.1, 0.125, 0.25, 0.33, 0.5, 1
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
