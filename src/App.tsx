import { Canvas } from "@react-three/fiber";
import { Box, PivotControls } from "@react-three/drei";
import SceneSettings from "./components/SceneSettings";
import SatelliteBox from "./components/Animation/SatelliteBox";
import BouncingBox from "./components/Animation/BouncingBox";
import { LaserDistanceSensorExample } from "./components/LaserDistanceSensor";
import { LiDAR2DExample } from "./components/LiDAR2D";
import useOrbitControl from "./hooks/useOrbitControl";
import { OrbitControlProvider } from "./context/OrbitControlContext";

function World() {
  const { enableOrbitControl, handleDragStart, handleDragEnd } =
    useOrbitControl();

  return (
    <>
      <SceneSettings enableOrbitControl={enableOrbitControl} />
      <group name={"objects"}>
        <PivotControls
          anchor={[0, 0, 0]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Box args={[1, 1, 2]} position={[4, 3, 7]}>
            <meshBasicMaterial wireframe wireframeLinewidth={2} color="red" />
          </Box>
        </PivotControls>
        <SatelliteBox />
        <BouncingBox speed={0.5} phase={0.6} />
        <LaserDistanceSensorExample />
        <LiDAR2DExample />
      </group>
    </>
  );
}

export default function App() {
  return (
    <div id="main-wrapper">
      <div className="absolute top-0 w-full bg-background text-white px-4 py-2 z-10">
        <h1>Learn react three fiber</h1>
      </div>
      <Canvas id="canvas-wrapper" frameloop="always">
        <OrbitControlProvider>
          <World />
        </OrbitControlProvider>
      </Canvas>
    </div>
  );
}
