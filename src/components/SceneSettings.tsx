import {
  StatsGl,
  OrbitControls,
  GizmoHelper,
  GizmoViewport,
  PerspectiveCamera,
  Grid,
} from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import AxisOrigin from "./AxisOrigin";

function CameraController() {
  const { camera } = useThree();

  useEffect(() => {
    camera.layers.enableAll();
  }, [camera]);

  return null;
}

function CameraUtil() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[12, 12, 12]} fov={25} />
      <CameraController />
    </>
  );
}

interface SceneSettingsProps {
  enableOrbitControl: boolean;
}

export default function SceneSettings({
  enableOrbitControl,
}: SceneSettingsProps) {
  const gridSize: [number, number] = [10, 10];
  const gridConfig = {
    cellSize: 1,
    cellThickness: 1,
    sectionSize: 5,
    sectionThickness: 1,
    sectionColor: "#3ea8ff",
    cellColor: "#888",
    fadeDistance: 100,
    fadeStrength: 1,
    infiniteGrid: true,
  };
  return (
    <>
      <CameraUtil />
      <AxisOrigin lineLength={1} lineWidth={3} />
      <Grid args={gridSize} position={[0, -0.01, 0]} {...gridConfig} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[1, 5, 5]} color="white" />
      <StatsGl className="stats" />

      <OrbitControls
        enablePan={enableOrbitControl}
        enableRotate={enableOrbitControl}
        enableZoom={enableOrbitControl}
      />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport
          axisColors={["#9d4b4b", "#2f7f4f", "#3b5b9d"]}
          labelColor="white"
        />
      </GizmoHelper>
    </>
  );
}
