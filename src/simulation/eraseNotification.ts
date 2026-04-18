/**
 * F6 "notify me before the whiteboard is erased" — pure pre-erase
 * notification pipeline.
 *
 * Maps a planned erase start into three lifecycle moments:
 *   - warnAt       : first user-visible notification (e.g. banner / toast)
 *   - finalWarnAt  : last-chance heads-up (e.g. full-screen countdown)
 *   - eraseAt      : the actual trajectory fire
 *
 * and derives the current phase from `now`. Pure — no timers, no DOM,
 * no React. Consumed by the React bridge and the FR2 command guard.
 */

export type CountdownPhase =
  | "idle"
  | "pre_warn"
  | "countdown"
  | "final"
  | "expired";

/** Defaults match the existing 10 s COUNTDOWN_SECONDS with a 30 s lead-in. */
export const DEFAULT_PRE_WARN_MS = 30_000;
export const DEFAULT_COUNTDOWN_MS = 10_000;
export const DEFAULT_FINAL_MS = 3_000;

export interface EraseNotificationConfig {
  preWarnMs?: number;
  countdownMs?: number;
  finalMs?: number;
}

export interface EraseNotificationPlan {
  warnAt: Date;
  countdownAt: Date;
  finalWarnAt: Date;
  eraseAt: Date;
  preWarnMs: number;
  countdownMs: number;
  finalMs: number;
}

const toDate = (value: Date | string | number): Date =>
  value instanceof Date ? value : new Date(value);

export function buildEraseNotificationPlan(
  eraseAt: Date | string | number,
  config: EraseNotificationConfig = {},
): EraseNotificationPlan {
  const erase = toDate(eraseAt);
  const preWarnMs = Math.max(0, config.preWarnMs ?? DEFAULT_PRE_WARN_MS);
  const countdownMs = Math.max(0, config.countdownMs ?? DEFAULT_COUNTDOWN_MS);
  const finalMs = Math.max(0, config.finalMs ?? DEFAULT_FINAL_MS);
  const eraseMs = erase.getTime();

  return {
    warnAt: new Date(eraseMs - preWarnMs - countdownMs),
    countdownAt: new Date(eraseMs - countdownMs),
    finalWarnAt: new Date(eraseMs - finalMs),
    eraseAt: erase,
    preWarnMs,
    countdownMs,
    finalMs,
  };
}

export interface CountdownTick {
  phase: CountdownPhase;
  remainingMs: number;
}

export function getCountdownPhase(
  now: Date | number,
  plan: EraseNotificationPlan,
): CountdownTick {
  const nowMs = now instanceof Date ? now.getTime() : now;
  const remainingMs = Math.max(0, plan.eraseAt.getTime() - nowMs);

  if (nowMs < plan.warnAt.getTime()) return { phase: "idle", remainingMs };
  if (nowMs < plan.countdownAt.getTime())
    return { phase: "pre_warn", remainingMs };
  if (nowMs < plan.finalWarnAt.getTime())
    return { phase: "countdown", remainingMs };
  if (nowMs < plan.eraseAt.getTime()) return { phase: "final", remainingMs };
  return { phase: "expired", remainingMs: 0 };
}
