# Subissue 9.1 — FR5 (Teacher Interface Controls)

Third FR5 iteration focused on control consistency and issue-specific project board evidence.

---

## Feature (F9.1)

**FR5 — Teacher Interface Controls:** teachers SHALL operate erase controls safely and predictably with clear state feedback.

---

## Decomposition

| ID | Sub-task | Maps to |
|----|----------|---------|
| **9.1.1** | Validate state-action mapping (Start/Resume/Pause/Stop) | `ControlPanel.tsx` |
| **9.1.2** | Verify mode-lock behavior while operation is active | `ControlPanel.tsx` |
| **9.1.3** | Confirm obstacle simulation semantics and status readability | `ControlPanel.tsx`, `StatusDisplay.tsx` |
| **9.1.4** | Add board-facing documentation + UAT for issue 9.1 | docs + README/workflow links |

---

## Acceptance Criteria

- [ ] Start/Resume/Pause/Stop remain state-aware and unambiguous.
- [ ] Full/Partial mode controls remain locked during active operations.
- [ ] Safety simulation control remains explicit and stateful.
- [ ] Subissue 9.1 has dedicated docs and UAT checklist links.
- [ ] Build passes with no FR5 regressions.

---

## Testing

| Type | Check |
|------|-------|
| Manual | Teacher flow from idle through complete, including pause/resume/stop |
| Safety | Simulate/remove obstacle and confirm status behavior |
| Build | `npm run build` passes |
| UAT | Complete `FR5_SUBISSUE_9_1_UAT_CHECKLIST.md` |
