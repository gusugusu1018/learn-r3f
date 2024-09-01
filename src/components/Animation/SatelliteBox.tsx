import { Box } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh } from "three";

export default function SatelliteBox() {
  const boxRef = useRef(null);
  const radius = 5;
  useFrame(({ clock }) => {
    if (!boxRef.current) return;
    const time = clock.getElapsedTime();
    (boxRef.current as Mesh).rotation.x = time;
    (boxRef.current as Mesh).rotation.y = time;
    (boxRef.current as Mesh).position.x = Math.sin(time) * radius;
    (boxRef.current as Mesh).position.z = Math.cos(time) * radius;
    (boxRef.current as Mesh).position.y = (Math.cos(time / 2) * radius) / 2 + 4;
  });
  return (
    <>
      <Box ref={boxRef}>
        <meshBasicMaterial color="royalblue" wireframe wireframeLinewidth={2} />
      </Box>
    </>
  );
}
