/**
 * F4 "operate using a simple touchscreen or mobile interface" — pure
 * rate-limit helper for FR2 command control.
 *
 * Touch UIs commonly deliver unintended double-taps (finger bounce, tremor,
 * misalignment on the projected kiosk). FR2 must reject the second tap
 * distinctly from `invalid_state` / `already_running` so the audit trail
 * reflects *why* the command was dropped and the UI can surface a
 * touch-specific message.
 *
 * This module is intentionally a single pure function: `checkTouchRateLimit`.
 * No timers, no DOM, no React. `now` is injected for deterministic tests.
 */

/** Default minimum interval between two touch-sourced commands (ms). */
export const DEFAULT_TOUCH_MIN_INTERVAL_MS = 350;

export type TouchRateLimitResult =
  | { ok: true }
  | { ok: false; reason: "too_soon"; retryAfterMs: number };

export function checkTouchRateLimit(
  lastAt: Date | number | null | undefined,
  now: Date | number,
  minIntervalMs: number = DEFAULT_TOUCH_MIN_INTERVAL_MS,
): TouchRateLimitResult {
  if (lastAt == null) return { ok: true };
  if (minIntervalMs <= 0) return { ok: true };

  const lastMs = lastAt instanceof Date ? lastAt.getTime() : lastAt;
  const nowMs = now instanceof Date ? now.getTime() : now;
  if (!Number.isFinite(lastMs) || !Number.isFinite(nowMs)) return { ok: true };

  const elapsed = nowMs - lastMs;
  if (elapsed >= minIntervalMs) return { ok: true };

  return {
    ok: false,
    reason: "too_soon",
    retryAfterMs: Math.max(0, minIntervalMs - elapsed),
  };
}
