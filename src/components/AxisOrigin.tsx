import { Line } from "@react-three/drei";

interface AxisOriginProps {
  lineLength?: number;
  lineWidth?: number;
}

export default function AxisOrigin({
  lineLength = 1,
  lineWidth = 1,
}: AxisOriginProps) {
  const origin: [number, number, number] = [0, 0, 0];
  const lineX: [number, number, number][] = [origin, [lineLength, 0, 0]];
  const lineY: [number, number, number][] = [origin, [0, lineLength, 0]];
  const lineZ: [number, number, number][] = [origin, [0, 0, lineLength]];

  return (
    <>
      <Line points={lineX} color="red" lineWidth={lineWidth} />
      <Line points={lineY} color="green" lineWidth={lineWidth} />
      <Line points={lineZ} color="blue" lineWidth={lineWidth} />
    </>
  );
}
