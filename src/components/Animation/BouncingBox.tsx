import { Box } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { forwardRef, useImperativeHandle, useRef } from "react";
import * as THREE from "three";

interface BouncingBoxProps {
  start?: THREE.Vector3;
  end?: THREE.Vector3;
  size?: [number, number, number];
  color?: string;
  speed?: number;
  phase?: number;
}

const BouncingBox = forwardRef<THREE.Mesh, BouncingBoxProps>(
  (
    {
      start = new THREE.Vector3(-4, 1, 2),
      end = new THREE.Vector3(10, 3, -6),
      size = [1, 1, 1],
      color = "pink",
      speed = 1.0,
      phase = 0,
    },
    ref
  ) => {
    const boxRef = useRef(null);
    const direction = new THREE.Vector3().copy(end).sub(start).normalize();
    const length = new THREE.Vector3().copy(end).distanceTo(start);

    useFrame(({ clock }) => {
      if (!boxRef.current) return;
      const time = clock.getElapsedTime();
      (boxRef.current as THREE.Mesh).position
        .copy(start)
        .add(
          new THREE.Vector3()
            .copy(direction)
            .multiplyScalar((Math.sin(time * speed + phase) / 2 + 0.5) * length)
        );
    });

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    useImperativeHandle(ref, () => boxRef.current!);

    return (
      <>
        <Box ref={boxRef} args={size}>
          <meshBasicMaterial color={color} wireframe wireframeLinewidth={2} />
        </Box>
      </>
    );
  }
);

export default BouncingBox;
