# Subissue 10.2 — FR5 (Teacher Interface Controls)

Fourth FR5 iteration focused on repeatable teacher control behavior and explicit issue-level evidence for project board tracking.

---

## Feature (F10.2)

**FR5 — Teacher Interface Controls:** teachers SHALL be able to manage erase operations confidently using state-aware controls and safety simulation tools.

---

## Decomposition

| ID | Sub-task | Maps to |
|----|----------|---------|
| **10.2.1** | Verify state-action reliability for Start/Resume/Pause/Stop | `ControlPanel.tsx` |
| **10.2.2** | Keep Full/Partial mode lock and explanatory guidance | `ControlPanel.tsx`, `WhiteboardCanvas.tsx` |
| **10.2.3** | Validate safety simulation semantics and status reflection | `ControlPanel.tsx`, `StatusDisplay.tsx` |
| **10.2.4** | Add board-facing docs + dedicated UAT checklist for 10.2 | docs + README/workflow |

---

## Acceptance Criteria

- [ ] Teacher control actions remain state-aware and invalid actions are blocked.
- [ ] Full/Partial mode lock remains visible during active operation.
- [ ] Safety simulation semantics stay explicit and understandable.
- [ ] Subissue 10.2 docs and checklist are linked from workflow + README.
- [ ] Build passes.

---

## Testing

| Type | Check |
|------|-------|
| Manual | Start/Resume/Pause/Stop from appropriate states |
| Safety | Simulate and remove obstacle, verify status response |
| Build | `npm run build` succeeds |
| UAT | Fill `FR5_SUBISSUE_10_2_UAT_CHECKLIST.md` |
