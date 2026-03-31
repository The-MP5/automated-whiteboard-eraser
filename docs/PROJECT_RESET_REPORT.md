# Lab 1: Project Reset and Architecture Baseline

**Project:** Smart Board Buddy – Automated Whiteboard Eraser System (ROS Simulation)  
**Course:** Senior Project II  
**Team:** Group 21 (Nia Greene, Kamora Mccowan, Vikash Rivers, Gabriel Moore, Jibek Gupta)  
**Document:** Project Reset Report  
**Date:** February 2026

---

## 1. Architecture Diagram

The following diagram shows the main components of the system and how data and control flow between them. The application is a single-page React simulation with one primary route; all simulation state is held in a single custom hook and passed down to presentational components.

![System architecture: App → Index → useWhiteboardSimulation (central state) → UI components (Header, ControlPanel, WhiteboardCanvas, StatusDisplay, NotesPanel, CountdownOverlay); Fabric.js used by canvas; Supabase present but unused.](architecture-diagram.svg)

**Component summary**

| Component | Role |
|-----------|------|
| **App** | Root: React Query, React Router, Toaster, TooltipProvider. Renders `/` → Index, `*` → NotFound. |
| **Index** | Single main page; composes Header, ControlPanel, WhiteboardCanvas, StatusDisplay, NotesPanel, CountdownOverlay; owns `useWhiteboardSimulation()`. |
| **useWhiteboardSimulation** | Single source of truth: status, eraseMode, partialArea, notes, logs, progress, proximitySensor, countdown. Handles erase state machine, countdown, obstacle simulation, snapshot (in-memory), logging (in-memory). |
| **WhiteboardCanvas** | Fabric.js canvas: draw, text, select, partial-area selection; calls `onCanvasReady`, `onSaveSnapshot`, `onSetPartialArea`. |
| **ControlPanel** | Start/Pause/Stop, Full/Partial mode, Simulate Obstacle. |
| **StatusDisplay** | Shows current status, progress bar, proximity sensor. |
| **NotesPanel** | Lists saved snapshots and system logs; delete/download notes. |
| **CountdownOverlay** | Full-screen 10s countdown when status is `countdown`; Cancel or onComplete → erase starts. |
| **Supabase** | Client instantiated in `integrations/supabase/client.ts`; not imported or used elsewhere (notes/logs are in-memory only). |

---

## 2. Architecture Explanation (End-to-End)

**Stack:** Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui (Radix), Fabric.js, Supabase client (unused). Build uses `lovable-tagger` in development.

**Runtime flow:**

1. **Entry:** User opens the app. `main.tsx` mounts `App`, which provides React Query and React Router and renders `Index` at `/`.

2. **State:** `Index` calls `useWhiteboardSimulation()`. The hook holds all simulation state (status, eraseMode, partialArea, notes, logs, progress, proximitySensor) and refs (Fabric canvas instance, erase interval). There is no separate service layer or API; all logic lives inside the hook.

3. **Canvas:** On load, `WhiteboardCanvas` creates a Fabric.js canvas, adds default text, and calls `onCanvasReady(canvas)`. The hook stores the canvas in a ref. User can draw, add text, select, and (in partial mode) drag a rectangle to set the erase area. “Save Snapshot” calls `toDataURL()` on the Fabric canvas, creates a note object, and appends it to the hook’s `notes` state (and adds a log entry). Nothing is sent to Supabase.

4. **Erase flow:** User selects Full or Partial and clicks “Start Erase.” The hook runs `startErase()`: it calls `saveSnapshot()` (auto-snapshot before erase), then sets status to `countdown`. `CountdownOverlay` shows a 10-second countdown; user can cancel (status → idle) or let it finish. On complete, the hook sets status to `erasing` and starts `simulateErase()`: a 100 ms interval updates progress toward 100% over 10 seconds (NFR1). When progress reaches 100%, `completeErase()` runs: it clears the Fabric canvas (full) or removes objects inside the selected rectangle (partial), then sets status to `completed` and later back to `idle`.

5. **Pause / Stop / Obstacle:** “Pause” clears the interval and sets status to `paused`; “Resume” restarts the interval. “Stop” clears the interval and resets to idle. “Simulate Obstacle” toggles `proximitySensor` (e.g. distance 0.3 m &lt; 0.5 m threshold); if status is `erasing`, the hook clears the interval and sets status to `obstacle-detected`. Removing the obstacle resumes the erase (FR4).

6. **Notes and logs:** Notes (snapshots) and system logs exist only in the hook’s React state. They are lost on refresh. The Supabase client is never used; README’s claim of “Notes and SystemLogs in Supabase” is not implemented.

**Summary:** The system is a client-only simulation. One hook owns all state and behavior; the UI is a thin layer over that hook. There are no API boundaries, no persistence layer, and no backend calls. The architecture is suitable for a prototype but must be refactored (service layer, persistence, tests) for production readiness.

---

## 3. Risk & Technical Debt List (with Severity & Impact)

The following table summarizes technical debt and risks from the team’s Risk & Technical Debt Inventory (`DEBT_AND_RISK.md`). **Severity** is High / Medium / Low. **Impact** describes the consequence if unaddressed.

| # | Item | Category | Severity | Impact |
|---|------|----------|----------|--------|
| 1 | **Monolithic simulation hook; no API boundaries; Supabase never used** | Architectural | High | Hard to test, extend, or swap persistence; NFR2/Story 7 not met; refactors are risky. |
| 2 | **No unit or integration tests** | Test | High | Regressions likely; AI or manual changes can break NFR1/FR4/Story 6 with no automated signal. |
| 3 | **Env var mismatch (README vs code); dead Supabase integration** | Architectural | Medium | New developers fail setup; persistence promised in README but not implemented. |
| 4 | **No requirement-to-code traceability; sparse JSDoc** | Documentation | Medium | Hard to verify AI or human changes against FR/NFR/Stories; onboarding and audits are difficult. |
| 5 | **Hardcoded constants (10s countdown, 10s erase, 0.5 m, colors, dimensions)** | Architectural | Medium | Easy to break NFR1/FR4/Story 6 by editing “magic numbers”; no single source of truth. |
| 6 | **Stale closure in simulateErase/completeErase** | Architectural | Medium | Partial erase could behave as full (or vice versa) if user changes mode during countdown/erase. |
| 7 | **Lovable tooling lock-in (lovable-tagger, conventions)** | Architectural | Medium | Migration cost if Lovable changes or team leaves Lovable; goal is to replace these dependencies. |
| — | **AI reliability / hallucination** | Risk | High | AI may suggest changes that violate timing/safety; no tests or centralized constants to catch them. |
| — | **Security & ethics (PII in future persistence, .env exposure)** | Risk | Medium | If persistence added without design: PII/access/retention issues; .env in repo could leak keys (mitigated by adding .env to .gitignore). |
| — | **Dependency risk (Lovable + Supabase/Fabric version drift)** | Risk | Medium | Lovable lock-in; external API changes can break build or behavior without clear signal. |

**Severity key:**  
- **High:** Directly affects correctness, safety, or ability to ship (e.g., no tests, no persistence, AI-induced bugs).  
- **Medium:** Slows development, causes confusion, or creates future rework (e.g., env mismatch, no traceability, Lovable lock-in).

---

## 4. Backlog Health Assessment

**Purpose:** Assess the team’s GitHub Project Board for backlog quality and readiness for Senior Project II.

### 4.1 Evidence of Review

- [ ] **Backlog exists:** The board has a Backlog (or equivalent) column with items that are not yet in progress.
- [ ] **Technical debt captured:** At least the top 3–4 technical debt items from `DEBT_AND_RISK.md` are represented as issues (e.g., “Extract simulation service + Supabase persistence,” “Add test suite + centralize constants,” “Traceability + JSDoc,” “Replace Lovable dependencies”).
- [ ] **Labels in use:** Issues are tagged (e.g., `technical-debt`, `refactor`, `testing`, `documentation`) so they can be filtered and prioritized.
- [ ] **Acceptance criteria:** High-impact and technical-debt issues have clear acceptance criteria (e.g., from Part 3 of `DEBT_AND_RISK.md`) so “done” is unambiguous.
- [ ] **Risks acknowledged:** AI/reliability, security, and dependency risks are either reflected in backlog items or documented in the Risk & Technical Debt Inventory and this report.

**Instructions:** Review your GitHub Project Board and check the boxes above that apply. In your submitted report (or in a short “Backlog review notes” section), list what you found, for example:

- “We have X backlog items; Y are tagged technical-debt. The four items from DEBT_AND_RISK Part 3 are created with acceptance criteria. We do not yet have separate issues for each risk; we rely on DEBT_AND_RISK.md and this report.”

### 4.2 Improvement Recommendations

Based on the current codebase and the Risk & Technical Debt Inventory:

1. **Ensure technical debt is on the board.** Create (or link) issues for: (1) Simulation service extraction + Supabase persistence, (2) Test suite + constants centralization, (3) Traceability + JSDoc, (4) Replace Lovable dependencies. Use the acceptance criteria in `DEBT_AND_RISK.md` Part 3.
2. **Define “Definition of Done.”** For every story/task, require: acceptance criteria, and for code changes touching simulation/canvas/safety: human review and (once tests exist) passing tests.
3. **Prioritize by impact.** Put “Add test suite” and “Extract simulation + persistence” early so later work is safer and NFR2/Story 7 are met.
4. **Keep backlog small and clear.** Avoid vague items (e.g., “Improve code quality”); use concrete items (e.g., “Remove lovable-tagger and verify build”).
5. **Revisit after Lab 1.** After submitting this report, schedule a short backlog refinement to add any missing debt/risk items and align priorities with Section 5 below.

---

## 5. Initial Senior Project II Priorities

Recommended order of focus for the start of Senior Project II, aligned with the architecture baseline and the risk & technical debt list.

| Priority | Focus | Rationale |
|----------|--------|-----------|
| **1** | **Replace Lovable dependencies** | Low effort, high independence. Remove `lovable-tagger` from Vite config and uninstall the package; verify build and dev. Unblocks any future tooling change. |
| **2** | **Fix env vars and add tests** | Standardize Supabase env var name (code + README). Add Vitest (and React Testing Library); add at least one test for the erase flow or status transitions. Reduces risk of AI/human regressions and clarifies setup. |
| **3** | **Centralize constants** | Move countdown, erase duration, proximity threshold, and key canvas defaults into one config module with requirement IDs. Reduces chance of breaking NFR1/FR4/Story 6. |
| **4** | **Extract simulation logic and add persistence** | Introduce a simulation service (or context) and use Supabase for Notes and SystemLogs. Fix stale-closure risk in the hook. Delivers NFR2 and Story 7 and improves testability. |
| **5** | **Traceability and documentation** | Add traceability matrix (FR/NFR/Story → code) and JSDoc for the simulation hook, canvas, and countdown. Improves verification and onboarding. |

These priorities address the highest-severity debt (monolithic hook, no tests, unused Supabase) and the goal of replacing Lovable dependencies first, then lay the groundwork for a more maintainable and production-ready system.

---

## Document Control

- **Reference:** `DEBT_AND_RISK.md` (Risk & Technical Debt Inventory) for full debt descriptions, remediation plans, and backlog-ready issues with acceptance criteria.
- **Submission:** Export this document to PDF for Lab 1 file upload. To get a PDF with the diagram visible: open `PROJECT_RESET_REPORT.html` in your browser, then use **File → Print → Save as PDF** (or **Ctrl/Cmd + P** → choose “Save as PDF”).
