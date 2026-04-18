<!--
Thanks for the PR. Fill in every section.
Safety / timing / Story-6 changes MUST run the AI Verification Checklist
(docs/AI_VERIFICATION_CHECKLIST.md). See Risk Task R1 (#93).
-->

## Summary

<!-- 1–3 sentences on what changed and why. -->

## Linked issues

<!-- e.g. Closes #NN — parent feature or risk task. -->

## AI disclosure (R1 — #93)

- [ ] No AI-generated edits in this PR.
- [ ] AI-generated edits present. Sections + tool:
  - `path/to/file.ts` lines `XX–YY` — tool: `...`
- [ ] No machine-generated `Co-authored-by` / `Made-with` / `Generated-by`
  trailers in commits or PR body.

## Scope triage (R1 — §1 of the checklist)

Tick every area the diff touches. If any is ticked, the **AI
Verification Checklist** (`docs/AI_VERIFICATION_CHECKLIST.md`) must be
completed inline below or linked from a review comment.

- [ ] FR4 — safety / proximity (`simulation/proximity*`, `safety*`, `compliance*`, `energyBudget.ts`, `dutyCycle.ts`, `robot/erase_whiteboard.py` motion paths)
- [ ] NFR1 — responsiveness / timing (`touchRateLimit.ts`, `eraseSchedule.ts`, `eraseNotification.ts`, new `setTimeout`/`setInterval`)
- [ ] Story 6 — pre-erase notification (`eraseNotification.ts`, `notificationEvents.ts`, notification UI)
- [ ] Command guards / voice intent (`commandGuards.ts`, `voiceIntent.ts`, `voiceEvents.ts`)
- [ ] None of the above — R1 does not trigger.

## Verification

- [ ] `npx tsc --noEmit` clean
- [ ] `npm run build` succeeds
- [ ] Manual check or test evidence (describe):

## Reviewer sign-off (R1 — §7)

- [ ] Author completed §1–§6 of the checklist.
- [ ] Reviewer re-verified §3 (safety invariants).
- [ ] Reviewer re-verified §4 (timing invariants).
- [ ] Reviewer re-verified §5 if Story 6 was ticked.
