/**
 * Central configuration for whiteboard simulation timing, safety limits, and canvas defaults.
 * Consolidates values previously scattered as magic numbers (see docs/DEBT_AND_RISK.md — Debt Item 5).
 *
 * Requirement traceability is called out per constant so human and AI edits can be checked against spec.
 */

/** Story 6 — countdown (seconds) before automated erase may begin. */
export const STORY6_COUNTDOWN_SECONDS = 10;

/** NFR1 — target duration for a full-board erase in the simulator (milliseconds). */
export const NFR1_ERASE_DURATION_MS = 10_000;

/** FR4 — proximity threshold: pause when obstacle is at or within this distance (meters). */
export const FR4_PROXIMITY_THRESHOLD_METERS = 0.5;

/**
 * Simulated obstacle distance when the “object present” toggle is on (meters).
 * Must stay strictly below {@link FR4_PROXIMITY_THRESHOLD_METERS} so the safety path triggers.
 */
export const FR4_SIMULATED_OBSTACLE_DISTANCE_METERS = 0.3;

/** Default reading when no obstacle is simulated (meters). */
export const FR4_DEFAULT_CLEAR_DISTANCE_METERS = 2.0;

/** Canvas fill after full erase or manual clear; kept in sync across Fabric setup and hook. */
export const WHITEBOARD_CANVAS_BACKGROUND_COLOR = "#f8fafc";

/** Default Fabric canvas height cap (pixels). */
export const WHITEBOARD_CANVAS_MAX_HEIGHT_PX = 500;

/** Portion of viewport height used to size the canvas before the max-height cap. */
export const WHITEBOARD_CANVAS_HEIGHT_VIEWPORT_RATIO = 0.5;
