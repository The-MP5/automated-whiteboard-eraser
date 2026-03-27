export {
  COUNTDOWN_SECONDS,
  ERASE_DURATION_MS,
  PROXIMITY_THRESHOLD,
  PROXIMITY_CLEAR_DISTANCE_M,
  PROXIMITY_OBSTACLE_DISTANCE_M,
} from "./constants";
export { applyEraseToCanvas } from "./eraseCanvas";
export { computeEraseProgressTick } from "./eraseProgress";
export type { EraseProgressTick } from "./eraseProgress";
export { proximityWhenClear, proximityWhenObstacleDetected } from "./proximityState";
export { createSnapshotNote, createSystemLog } from "./snapshotAndLog";
