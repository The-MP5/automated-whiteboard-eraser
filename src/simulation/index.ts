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
export {
  DEFAULT_PROXIMITY_THRESHOLDS,
  classifyProximityZone,
} from "./proximityClassifier";
export type {
  ProximityZone,
  ProximityZoneThresholds,
} from "./proximityClassifier";
export {
  DEFAULT_HYSTERESIS,
  initialHysteresisState,
  reduceProximityHysteresis,
} from "./proximityHysteresis";
export type {
  HysteresisConfig,
  ProximityHysteresisState,
} from "./proximityHysteresis";
export { evaluateSafetyAction } from "./safetyPolicy";
export type {
  SafetyAction,
  SafetyDecision,
  SafetyReason,
} from "./safetyPolicy";
export { createSafetyEvent } from "./safetyEvents";
export type {
  SafetyEvent,
  SafetyEventInput,
  SafetyEventKind,
} from "./safetyEvents";
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
  CommandSource,
} from "./commandGuards";
export {
  DEFAULT_TOUCH_MIN_INTERVAL_MS,
  checkTouchRateLimit,
} from "./touchRateLimit";
export type { TouchRateLimitResult } from "./touchRateLimit";
export {
  DEFAULT_PRE_WARN_MS,
  DEFAULT_COUNTDOWN_MS,
  DEFAULT_FINAL_MS,
  buildEraseNotificationPlan,
  getCountdownPhase,
} from "./eraseNotification";
export type {
  CountdownPhase,
  CountdownTick,
  EraseNotificationConfig,
  EraseNotificationPlan,
} from "./eraseNotification";
export { createNotificationEvent } from "./notificationEvents";
export type {
  NotificationEvent,
  NotificationEventInput,
  NotificationEventKind,
} from "./notificationEvents";
export {
  DEFAULT_VOICE_CONFIDENCE_MIN,
  DEFAULT_WAKE_WORDS,
  parseVoiceIntent,
} from "./voiceIntent";
export type {
  ParseVoiceIntentOptions,
  VoiceIntent,
} from "./voiceIntent";
export { createVoiceEvent } from "./voiceEvents";
export type {
  VoiceEvent,
  VoiceEventInput,
  VoiceEventKind,
} from "./voiceEvents";
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
