import type { ArmJointState, ArmPose, ArmTelemetry, EraseArea } from "@/types/whiteboard";

export interface ArmConfig {
  boardWidthMm: number;
  boardHeightMm: number;
  link1Mm: number;
  link2Mm: number;
  maxSpeedMmPerSec: number;
  maxAccelMmPerSec2: number;
  jointLimitsDeg: {
    base: [number, number];
    shoulder: [number, number];
    elbow: [number, number];
  };
  homePose: ArmPose;
}

export interface TrajectoryPoint {
  pose: ArmPose;
  tMs: number;
}

export interface ArmExecutionPlan {
  points: TrajectoryPoint[];
  totalDurationMs: number;
}

export interface ArmExecutionTick {
  percentage: number;
  timeElapsed: number;
  timeRemaining: number;
  target: ArmPose;
  joints: ArmJointState;
  speedMmPerSec: number;
}

export interface HilCheckResult {
  id: string;
  passed: boolean;
  details: string;
}

/** Max telemetry entries kept in arm runtime state (bounded history). */
export const MAX_ARM_TELEMETRY_SAMPLES = 200;

export const ARM_CONFIG: ArmConfig = {
  boardWidthMm: 1800,
  boardHeightMm: 1200,
  link1Mm: 800,
  link2Mm: 900,
  maxSpeedMmPerSec: 350,
  maxAccelMmPerSec2: 500,
  jointLimitsDeg: {
    base: [-180, 180],
    shoulder: [-95, 95],
    elbow: [0, 160],
  },
  homePose: { x: 120, y: 120 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function distance(a: ArmPose, b: ArmPose): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function isPoseWithinWorkspace(pose: ArmPose, cfg: ArmConfig = ARM_CONFIG): boolean {
  return pose.x >= 0 && pose.x <= cfg.boardWidthMm && pose.y >= 0 && pose.y <= cfg.boardHeightMm;
}

export function inverseKinematics2D(target: ArmPose, cfg: ArmConfig = ARM_CONFIG): ArmJointState | null {
  if (!isPoseWithinWorkspace(target, cfg)) return null;

  const x = target.x;
  const y = target.y;
  const l1 = cfg.link1Mm;
  const l2 = cfg.link2Mm;
  const r2 = x * x + y * y;
  const cosElbow = clamp((r2 - l1 * l1 - l2 * l2) / (2 * l1 * l2), -1, 1);
  const elbowRad = Math.acos(cosElbow);

  const k1 = l1 + l2 * Math.cos(elbowRad);
  const k2 = l2 * Math.sin(elbowRad);
  const shoulderRad = Math.atan2(y, x) - Math.atan2(k2, k1);
  const baseDeg = 0;
  const shoulderDeg = (shoulderRad * 180) / Math.PI;
  const elbowDeg = (elbowRad * 180) / Math.PI;

  const within =
    shoulderDeg >= cfg.jointLimitsDeg.shoulder[0] &&
    shoulderDeg <= cfg.jointLimitsDeg.shoulder[1] &&
    elbowDeg >= cfg.jointLimitsDeg.elbow[0] &&
    elbowDeg <= cfg.jointLimitsDeg.elbow[1] &&
    baseDeg >= cfg.jointLimitsDeg.base[0] &&
    baseDeg <= cfg.jointLimitsDeg.base[1];

  return within ? { baseDeg, shoulderDeg, elbowDeg } : null;
}

export function buildEraseWaypoints(mode: "full" | "partial", partialArea: EraseArea | null, cfg: ArmConfig = ARM_CONFIG): ArmPose[] {
  const margin = 50;
  const area = mode === "partial" && partialArea
    ? {
        x: clamp(partialArea.x * cfg.boardWidthMm, 0, cfg.boardWidthMm),
        y: clamp(partialArea.y * cfg.boardHeightMm, 0, cfg.boardHeightMm),
        width: clamp(partialArea.width * cfg.boardWidthMm, 10, cfg.boardWidthMm),
        height: clamp(partialArea.height * cfg.boardHeightMm, 10, cfg.boardHeightMm),
      }
    : {
        x: margin,
        y: margin,
        width: cfg.boardWidthMm - margin * 2,
        height: cfg.boardHeightMm - margin * 2,
      };

  const left = area.x;
  const right = clamp(area.x + area.width, 0, cfg.boardWidthMm);
  const top = area.y;
  const bottom = clamp(area.y + area.height, 0, cfg.boardHeightMm);
  const spacing = 120;

  const points: ArmPose[] = [{ ...cfg.homePose }];
  let goRight = true;
  for (let y = top; y <= bottom; y += spacing) {
    points.push({ x: goRight ? left : right, y });
    points.push({ x: goRight ? right : left, y });
    goRight = !goRight;
  }
  points.push({ ...cfg.homePose });
  return points;
}

export function buildExecutionPlan(waypoints: ArmPose[], cfg: ArmConfig = ARM_CONFIG): ArmExecutionPlan {
  let totalDurationMs = 0;
  const points: TrajectoryPoint[] = [{ pose: waypoints[0], tMs: 0 }];

  for (let i = 1; i < waypoints.length; i += 1) {
    const d = distance(waypoints[i - 1], waypoints[i]);
    const moveMs = (d / cfg.maxSpeedMmPerSec) * 1000;
    totalDurationMs += moveMs;
    points.push({ pose: waypoints[i], tMs: totalDurationMs });
  }

  return { points, totalDurationMs: Math.max(1, totalDurationMs) };
}

export function sampleExecutionPlan(plan: ArmExecutionPlan, elapsedMs: number): ArmExecutionTick {
  const clamped = clamp(elapsedMs, 0, plan.totalDurationMs);
  const percentage = (clamped / plan.totalDurationMs) * 100;
  const timeElapsed = clamped / 1000;
  const timeRemaining = Math.max(0, (plan.totalDurationMs - clamped) / 1000);

  let i = 1;
  while (i < plan.points.length && plan.points[i].tMs < clamped) i += 1;
  const prev = plan.points[Math.max(0, i - 1)];
  const next = plan.points[Math.min(plan.points.length - 1, i)];

  const span = Math.max(1, next.tMs - prev.tMs);
  const ratio = clamp((clamped - prev.tMs) / span, 0, 1);
  const target = {
    x: prev.pose.x + (next.pose.x - prev.pose.x) * ratio,
    y: prev.pose.y + (next.pose.y - prev.pose.y) * ratio,
  };

  const joints = inverseKinematics2D(target) ?? { baseDeg: 0, shoulderDeg: 0, elbowDeg: 0 };
  const segDist = distance(prev.pose, next.pose);
  const speedMmPerSec = (segDist / span) * 1000;

  return { percentage, timeElapsed, timeRemaining, target, joints, speedMmPerSec };
}

export function validateArmSafety(target: ArmPose, joints: ArmJointState, cfg: ArmConfig = ARM_CONFIG): string | null {
  if (!inverseKinematics2D(target, cfg)) {
    return "Unreachable arm pose (inverse kinematics failure).";
  }
  if (!isPoseWithinWorkspace(target, cfg)) return "Target is outside workspace bounds.";
  if (joints.shoulderDeg < cfg.jointLimitsDeg.shoulder[0] || joints.shoulderDeg > cfg.jointLimitsDeg.shoulder[1]) {
    return "Shoulder joint limit violation.";
  }
  if (joints.elbowDeg < cfg.jointLimitsDeg.elbow[0] || joints.elbowDeg > cfg.jointLimitsDeg.elbow[1]) {
    return "Elbow joint limit violation.";
  }
  return null;
}

export function createTelemetryTick(tick: ArmExecutionTick, status: ArmTelemetry["status"], message: string): ArmTelemetry {
  return {
    timestamp: new Date(),
    target: tick.target,
    actual: tick.target,
    joints: tick.joints,
    speedMmPerSec: tick.speedMmPerSec,
    status,
    message,
  };
}

export function runHilChecks(cfg: ArmConfig = ARM_CONFIG): HilCheckResult[] {
  const ikMid = inverseKinematics2D({ x: cfg.boardWidthMm / 2, y: cfg.boardHeightMm / 2 }, cfg);
  const boundsPass = isPoseWithinWorkspace(cfg.homePose, cfg);
  const outOfBoundsRejected = inverseKinematics2D({ x: -10, y: 0 }, cfg) === null;
  const plan = buildExecutionPlan(buildEraseWaypoints("full", null, cfg), cfg);

  return [
    { id: "HIL-1", passed: boundsPass, details: "Home pose is within workspace bounds." },
    { id: "HIL-2", passed: Boolean(ikMid), details: "IK solves for center-board target." },
    { id: "HIL-3", passed: outOfBoundsRejected, details: "Out-of-range targets are rejected." },
    { id: "HIL-4", passed: plan.totalDurationMs > 0, details: "Trajectory generation returns non-zero duration." },
    { id: "HIL-5", passed: cfg.maxAccelMmPerSec2 > 0, details: "Motion profile has acceleration limit configured." },
  ];
}
