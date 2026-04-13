# Subissue 6.2 — FR5 (Teacher Interface Controls)

Worked example of [`SENIOR_PROJECT_II_AGENT_WORKFLOW.md`](./SENIOR_PROJECT_II_AGENT_WORKFLOW.md) for teacher-facing controls and operational safety.

---

## Feature (F6.2)

**FR5 — Teacher Interface Controls:** teachers SHALL be able to start, pause, resume, stop, choose erase mode, and run safety simulation controls with clear state-aware feedback.

---

## Decomposition

| ID | Sub-task | Maps to |
|----|----------|---------|
| **6.2.1** | Define state-action model for Start/Resume/Pause/Stop | `ControlPanel.tsx` |
| **6.2.2** | Clarify mode controls (Full vs Partial) with operation lock behavior | `ControlPanel.tsx`, `WhiteboardCanvas.tsx` |
| **6.2.3** | Integrate safety simulation control and status reflection | `ControlPanel.tsx`, `StatusDisplay.tsx` |
| **6.2.4** | Add traceability + UAT checklist for board evidence | `README.md`, docs |

---

## Agent Plan Summary

1. Verify state-action mapping in `ControlPanel`.
2. Add teacher-facing hints and ARIA cues for control intent.
3. Ensure status panel reflects safety context for teachers.
4. Add FR5 docs + UAT checklist and link from README/workflow docs.

---

## Acceptance Criteria

- [ ] Start/Resume/Pause/Stop controls are state-aware and prevent invalid actions.
- [ ] Full/Partial mode switching is locked while operation is active.
- [ ] Safety simulation control is explicit and communicates expected behavior.
- [ ] FR5 is traceable in docs and project README.
- [ ] Manual UAT checklist exists for board/PR evidence.

---

## Testing

| Type | Check |
|------|-------|
| Manual | Start → countdown → erase; Pause/Resume; Stop behavior from all valid states |
| Safety | Toggle simulated obstacle and validate status + pause behavior |
| Docs | README and workflow include FR5 links and summary |
| Build | `npm run build` succeeds |

---

## Scrum / RTM Notes

- Link PR to **Subissue 6.2 / FR5**.
- Attach completed UAT checklist in issue/PR comments.
