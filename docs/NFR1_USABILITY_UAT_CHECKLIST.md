# NFR1 / Subissue 2.4 — Usability UAT checklist

Complete for PR or issue **2.4**. Date and tester at bottom.

## Visibility & progress

- [ ] **Idle:** Status shows "System Ready" (or equivalent).
- [ ] **Start erase:** Full-screen countdown appears; large number counts down each second.
- [ ] **Cancel** during countdown returns to idle without erasing.
- [ ] **During erase:** Progress bar moves; **%**, **elapsed**, and **remaining** seconds look consistent (about **10 s** total for full erase per config).
- [ ] **Paused:** Status shows paused; progress values still visible.
- [ ] **Obstacle simulated during erase:** Status shows obstacle; progress reflects pause semantics.
- [ ] **Complete:** Clear success state then returns to idle.

## Controls

- [ ] **Full / Partial** mode cannot be switched mid-operation (disabled when appropriate).
- [ ] **Start** vs **Resume** label matches state.
- [ ] **Pause** only when erasing; **Stop** available during active operation.

## Assistive tech (lightweight)

- [ ] With **VoiceOver** (macOS) or **NVDA** (Windows): status area announces changes when phase changes (spot-check).
- [ ] Countdown overlay exposes a **live** summary of seconds remaining (screen reader users hear updates).

## Sign-off

- Date: _______________
- Branch / PR: _______________
- Tester: _______________
