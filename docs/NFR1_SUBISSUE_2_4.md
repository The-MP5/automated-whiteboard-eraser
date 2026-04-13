# Subissue 2.4 — NFR1 (Usability)

Worked example of `[SENIOR_PROJECT_II_AGENT_WORKFLOW.md](./SENIOR_PROJECT_II_AGENT_WORKFLOW.md)` for **non-functional requirement: usability** of the erase experience. This complements the **10 s performance target** (same NFR1 family in product language) with **observable, controllable** UI behavior.

---

## Feature (F2.4)

**NFR1 — Usability:** operators SHALL understand system state, time remaining, and available actions during countdown, erase, pause, obstacle, and completion—without undocumented side effects.

---

## Decomposition


| ID        | Sub-task                                                                               | Maps to                                |
| --------- | -------------------------------------------------------------------------------------- | -------------------------------------- |
| **2.4.1** | **Status visibility** — plain-language labels + progress (percent, elapsed, remaining) | `StatusDisplay.tsx`                    |
| **2.4.2** | **Pre-erase warning** — full-screen countdown with cancel (Story 6 alignment)          | `CountdownOverlay.tsx`                 |
| **2.4.3** | **Control affordances** — Start / Pause / Stop / mode selection; disabled when invalid | `ControlPanel.tsx`                     |
| **2.4.4** | **Assistive feedback** — live regions / progress semantics for screen readers          | ARIA on status, countdown, progressbar |


---

## Agent plan (summary)

1. **Files:** `StatusDisplay.tsx`, `CountdownOverlay.tsx`, `ControlPanel.tsx`; timing constants in `[src/config/simulation.ts](../src/config/simulation.ts)` (`NFR1_ERASE_DURATION_MS`, `STORY6_COUNTDOWN_SECONDS`).
2. **Scope:** UX and a11y hints only; no change to erase physics unless usability bug.
3. **Risks:** Over-announcement in `aria-live`; keep **polite** for status, **assertive** only for countdown region.

---

## Implementation (traceability)


| Artifact                                                                                              | NFR1 usability role                                     |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `[src/components/whiteboard/StatusDisplay.tsx](../src/components/whiteboard/StatusDisplay.tsx)`       | System state, linear progress, proximity readout        |
| `[src/components/whiteboard/CountdownOverlay.tsx](../src/components/whiteboard/CountdownOverlay.tsx)` | Modal warning, seconds remaining, cancel                |
| `[src/components/whiteboard/ControlPanel.tsx](../src/components/whiteboard/ControlPanel.tsx)`         | Labeled actions, mode hints                             |
| `[src/config/simulation.ts](../src/config/simulation.ts)`                                             | Documented **10 s** erase + countdown (requirement IDs) |


---

## Acceptance criteria

- User always sees **current phase** (idle, countdown, erasing, paused, obstacle, completed).
- During erase, user sees **percentage** and **elapsed / remaining** time consistent with **NFR1** duration config.
- Countdown is **impossible to miss** (overlay) and user can **cancel** before erase starts.
- **Pause** and **Stop** are only active when meaningful; primary button explains **Start** vs **Resume**.
- Status / countdown expose **ARIA** suitable for a quick assistive-tech check (see UAT).

---

## Testing


| Type           | Check                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------- |
| **Manual**     | Full flow: start → countdown → erase → watch progress hit 100%; pause/resume; obstacle pause |
| **UAT**        | `[NFR1_USABILITY_UAT_CHECKLIST.md](./NFR1_USABILITY_UAT_CHECKLIST.md)`                       |
| **Regression** | `npm run build`; Story 6 / FR4 behaviors unchanged                                           |


---

## Scrum / RTM

- Link PR to **Subissue 2.4** / **NFR1 (Usability)**.
- Cross-link **Story 6** (countdown) and **NFR1** timing in sprint notes.

---

## Refinement / next feature

- Optional: toast copy audit; high-contrast theme check; keyboard shortcuts for Cancel.

