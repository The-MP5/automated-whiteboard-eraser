# AI Verification Checklist — Safety- and Timing-Sensitive Changes

> **Risk task R1 (#93).** Mandatory review gate for any pull request that
> contains AI-generated edits touching **NFR1 (responsiveness / timing)**,
> **FR4 (safety and proximity)**, or **Story 6 (pre-erase notification)**
> behavior. The author and at least one human reviewer must both complete
> this checklist before merge.

---

## 1. Scope triage — does this PR trigger R1?

Tick **Yes** if the diff touches any of the files or directories in each
row. If every answer is **No**, skip to §6 and record the PR as
"non-triggering".

| Area | Representative paths | Triggered? |
|---|---|---|
| **FR4 — safety / proximity** | `src/simulation/proximity*`, `src/simulation/safety*`, `src/simulation/compliance*`, `src/simulation/energyBudget.ts`, `src/simulation/dutyCycle.ts`, `robot/erase_whiteboard.py` (motion / E-stop paths) | ☐ |
| **NFR1 — responsiveness / timing** | `src/simulation/touchRateLimit.ts`, `src/simulation/eraseSchedule.ts`, `src/simulation/eraseNotification.ts`, any `setTimeout` / `setInterval` / `requestAnimationFrame` / debounce / throttle, Python `time.sleep` on the control loop | ☐ |
| **Story 6 — pre-erase notification** | `src/simulation/eraseNotification.ts`, `src/simulation/notificationEvents.ts`, `src/components/**/Notification*`, countdown / acknowledgment UI | ☐ |
| **Command guards / voice intent** (indirect FR4) | `src/simulation/commandGuards.ts`, `src/simulation/voiceIntent.ts`, `src/simulation/voiceEvents.ts` | ☐ |

If **any** row is ticked, all sections below are mandatory.

---

## 2. AI attribution disclosure

- [ ] The PR description names **which** sections of the diff were
  AI-generated (file list or line ranges) and **which** tool produced them.
- [ ] No machine-generated `Co-authored-by` / `Made-with` / `Generated-by`
  trailers appear in commits or PR body (project policy).
- [ ] Every AI-generated hunk has been **read line-by-line** by the
  author, not merely skimmed. The author is prepared to defend every line.

## 3. Safety invariants (FR4)

Confirm each invariant still holds after the diff. Link the file + line
that proves it if the diff is large.

- [ ] E-stop path cannot be shadowed: `estopVerified === false` still
  produces `status: "fail"` in `evaluateCompliance`.
- [ ] Proximity `danger` still forces `safetyPolicy` to `halt` regardless
  of upstream status.
- [ ] Proximity hysteresis thresholds are unchanged, or if changed, the
  new values are justified in the PR body and matched in the tests.
- [ ] Energy budget caps (`DEFAULT_ENERGY_BUDGET`) are unchanged, or the
  change is accompanied by a safety rationale citing the robot datasheet.
- [ ] Duty-cycle cap (`DEFAULT_DUTY_CYCLE.maxActiveRatio`) is unchanged,
  or the change is justified by thermal evidence.
- [ ] No new path reaches `runCartesianTrajectory` / motion commands
  without first passing a command guard.

## 4. Timing invariants (NFR1)

- [ ] Touch rate-limit minimum interval (`DEFAULT_TOUCH_MIN_INTERVAL_MS`)
  is unchanged, or the change is documented.
- [ ] Countdown durations (`DEFAULT_PRE_WARN_MS`, `DEFAULT_COUNTDOWN_MS`,
  `DEFAULT_FINAL_MS`) are unchanged, or the change is documented.
- [ ] No blocking `await` was added to a UI render path or a 50 ms
  control loop tick.
- [ ] No new `setInterval` without a matching teardown in the same
  effect / lifecycle scope.
- [ ] Any new timer uses injectable `now` / `Date` so tests remain
  deterministic (consistent with existing `simulation/*` modules).

## 5. Story 6 — pre-erase notification invariants

- [ ] `CommandContext.requireAcknowledgment === true` still blocks
  `canStart` when `acknowledgedAt` is null
  (`commandGuards.ts` → rejection `notification_not_acknowledged`).
- [ ] Countdown phases (`pre_warn → countdown → final → go → canceled`)
  cannot be skipped except via an explicit `stopErase`.
- [ ] Acknowledgment events (`createNotificationEvent`) are emitted for
  every shown / acknowledged / canceled transition.

## 6. Verification evidence

Paste or link evidence into the PR body.

- [ ] `npx tsc --noEmit` — no errors.
- [ ] `npm run build` — succeeds.
- [ ] `npm run lint` (if configured) — no new warnings.
- [ ] Unit / integration tests run and pass on a triggered area, or the
  author states explicitly that no test suite covers the change and
  files a follow-up issue.
- [ ] For FR4 changes: a manual dry-run on the robot in `--verify` mode
  (no motion) is described, or the PR is labeled **ui-only** and the
  author states the robot was not exercised.

## 7. Reviewer sign-off

- [ ] **Author**: I have completed §1–§6 and disclosed all AI-generated
  sections.
- [ ] **Reviewer**: I independently re-verified §3 (safety invariants)
  against the diff.
- [ ] **Reviewer**: I independently re-verified §4 (timing invariants)
  against the diff.
- [ ] **Reviewer**: If §1 Story 6 is ticked, I verified §5.

---

## Appendix A — Why this checklist exists

AI-generated edits are fast but can silently invert a guard clause,
drop an acknowledgment branch, or rescale a timing constant. Whiteboard
eraser safety depends on small numeric constants and early-return
patterns that diff tools do not highlight as risky. This checklist
forces both the author and a human reviewer to re-read those specific
paths before merge.

## Appendix B — Escalation

If §3 or §5 cannot be confirmed, **do not merge**. Open a blocking
follow-up issue referencing #93 and re-request review after the
invariant is restored.
