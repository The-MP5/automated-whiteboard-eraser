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
export {
  canPause,
  canScheduledStart,
  canStart,
  canStop,
  evaluateCommand,
} from "./commandGuards";
export type {
  CommandContext,
  CommandGuardResult,
  CommandRejection,
  CommandRejectionCode,
} from "./commandGuards";
export { validateEraseArea } from "./validateEraseArea";
export type {
  CanvasBounds,
  EraseAreaInvalidReason,
  EraseAreaValidation,
} from "./validateEraseArea";
export {
  SCHEDULE_DUE_WINDOW_MS,
  isScheduleDue,
  nextDueSchedule,
  scheduleDueState,
  validateSchedule,
} from "./eraseSchedule";
export type {
  EraseSchedule,
  ScheduleDueState,
  ScheduleInput,
  ScheduleInvalidReason,
  ScheduleValidation,
} from "./eraseSchedule";
