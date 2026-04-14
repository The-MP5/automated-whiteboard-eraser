# Subissue 8.2 — FR5 (Teacher Interface Controls)

Follow-up FR5 pass for improved teacher-facing control clarity, state guidance, and board traceability.

---

## Feature (F8.2)

**FR5 — Teacher Interface Controls:** teachers SHALL confidently control erase operations through explicit, state-aware actions and safety controls.

---

## Decomposition

| ID | Sub-task | Maps to |
|----|----------|---------|
| **8.2.1** | Clarify available action by state (Start/Resume/Pause/Stop) | `ControlPanel.tsx` |
| **8.2.2** | Keep mode controls predictable while operation is active | `ControlPanel.tsx` |
| **8.2.3** | Improve safety toggle semantics and feedback text | `ControlPanel.tsx`, `StatusDisplay.tsx` |
| **8.2.4** | Add issue-specific docs + UAT checklist for project board evidence | README + docs |

---

## Acceptance Criteria

- [ ] Teacher sees clear hint text for the next valid action.
- [ ] Full/Partial controls remain locked while operation is active.
- [ ] Safety toggle communicates current state and intent.
- [ ] FR5 Subissue 8.2 links are present in docs/README.
- [ ] UAT checklist exists and is ready to be filled by testers.

---

## Testing

| Type | Check |
|------|-------|
| Manual | Verify Start/Resume/Pause/Stop flow from each state |
| Safety | Verify obstacle toggle copy, state, and status reflection |
| Build | `npm run build` passes |
| UAT | Complete `FR5_SUBISSUE_8_2_UAT_CHECKLIST.md` |
