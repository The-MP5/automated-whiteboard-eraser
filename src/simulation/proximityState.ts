import {
  PROXIMITY_CLEAR_DISTANCE_M,
  PROXIMITY_OBSTACLE_DISTANCE_M,
  PROXIMITY_THRESHOLD,
} from "./constants";
import type { ProximitySensor } from "@/types/whiteboard";

/** FR4: simulated sensor when an obstacle is present */
export function proximityWhenObstacleDetected(): ProximitySensor {
  return {
    isObstacleDetected: true,
    distance: PROXIMITY_OBSTACLE_DISTANCE_M,
    threshold: PROXIMITY_THRESHOLD,
  };
}

/** FR4: simulated sensor when the area is clear */
export function proximityWhenClear(): ProximitySensor {
  return {
    isObstacleDetected: false,
    distance: PROXIMITY_CLEAR_DISTANCE_M,
    threshold: PROXIMITY_THRESHOLD,
  };
}
