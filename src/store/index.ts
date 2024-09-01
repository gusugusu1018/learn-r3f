import { proxy } from "valtio";
import type * as THREE from "three";

// Create a Valtio store to hold the intersection points
const state = proxy({
  hitPoints: [] as THREE.Vector3[],
  hitCount: 0 as number,
  setHitPoints(points: THREE.Vector3[]) {
    this.hitPoints = points;
  },
  setHitCount(count: number) {
    this.hitCount = count;
  },
});

export default state;
