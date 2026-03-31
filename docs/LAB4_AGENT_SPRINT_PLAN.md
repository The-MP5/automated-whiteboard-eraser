# Lab 4 — Agent-Generated Sprint Plan (Group 21)

**Course:** Senior Project II — Module 4 (Agentic IDEs)  
**Repository:** https://github.com/The-MP5/automated-whiteboard-eraser  
**Project board:** https://github.com/orgs/The-MP5/projects/5  
**Team (Group 21):** Nia Greene, Kamora Mccowan, Vikash Rivers, Gabriel Moore, Jibek Gupta  
**Submitted for:** Sprint planning + publish (**plan only; no implementation in this lab**)

---

## A) Agent output (RAW — verbatim)

The following is the **raw initial planning output from Cursor** before team revisions.

**[BEGIN RAW CURSOR OUTPUT]**

### Sprint goal

Deliver a production-ready Smart Board Buddy interface by completing Supabase integration, adding full Vitest coverage, removing all technical debt from `DEBT_AND_RISK.md`, and preparing ROS hardware hooks for the Kinova arm.

### Sprint backlog (candidates)

1. **SUP-1:** Create Supabase tables for notes and logs; migrate all in-memory state to the database.  
2. **TST-1:** Add Vitest + React Testing Library; achieve 80% code coverage on `src/`.  
3. **DOC-1:** Add `TRACEABILITY.md` mapping every FR/NFR to code; add JSDoc to every component.  
4. **REF-1:** Finish refactoring `useWhiteboardSimulation` to under 50 lines and extract a Redux store.  
5. **DEV-1:** Add GitHub Actions CI for lint, test, and deploy to Vercel.  
6. **HW-1:** Define ROS topic interfaces and a Python bridge stub for the physical eraser.

### Dependencies

- SUP-1 before REF-1 (persistence must exist before “thin hook”).  
- TST-1 can run in parallel with DOC-1.  
- HW-1 depends on SUP-1.

### Risks

- Team may underestimate Supabase RLS and migration complexity.  
- Fabric.js may be difficult to test at 80% coverage.  
- ROS integration might be out of scope for the web repo.

### Suggested owners (initial draft)

- Person A: Supabase  
- Person B: Tests  
- Person C: Docs  
- Person D: CI/CD  
- Person E: ROS

**[END RAW CURSOR OUTPUT]**

---

## B) Human revision (what the team changed and why)

Rubric alignment: The team revised the raw AI plan to (1) enforce a focused sprint goal, (2) decompose tasks with explicit dependencies, (3) assign clear ownership from the Project Board, and (4) remove out-of-scope items.

### 1) Scope tightened to a single vertical slice
- **Raw AI issue:** included too many initiatives at once (persistence + tests + traceability + CI + ROS/hardware + large refactors).
- **Human revision:** narrowed to **Supabase-backed persistence for snapshots and system logs** (Story 7 / NFR2) plus the **minimum verification** needed for a safe demo.
- **Why:** This slice gives the team one end-to-end outcome we can complete and verify in a single sprint. It also minimizes integration risk by changing only the persistence path while preserving existing erase/countdown/FR4 behavior.

### 2) Defer out-of-scope subsystems
- **Raw AI issue:** proposed ROS bridge and broad architecture changes in the same sprint.
- **Human revision:** deferred ROS hardware bridging and Redux/store rewrites to later sprints.
- **Why:** Those are different integration layers and would increase risk and time-to-demo.

### 3) Replace vague “owners” with assigned teammates
- **Raw AI issue:** used placeholder owners (Person A–E).
- **Human revision:** mapped ownership to real board assignees:
  - `rivcode` = Vikash Rivers
  - `GabrielosMoore` = Gabriel Moore
  - `niasekayi` = Nia Greene
  - `jibekgupta` = Jibek Gupta
  - `kamoramccowan` = Kamora Mccowan

### 4) Reduce traceability work to what is needed *for this sprint*
- **Raw AI issue:** required broad docs work not needed for this sprint objective.
- **Human revision:** no “JSDoc everywhere” target this sprint; only add/adjust documentation for modules directly touched by persistence integration.

---

## C) Final sprint scope + assignments (PUBLISH)

### Sprint goal (single sentence)

Implement **Supabase-backed persistence** for **canvas snapshots (Notes)** and **system logs**, including **typed DB wiring**, **environment/README alignment**, and **baseline verification**—while preserving existing erase/countdown/FR4 behavior.

This maps directly to the backlog item theme in `docs/DEBT_AND_RISK.md` (Backlog Item 1 AC2–AC4), with the sprint limited to a demo-ready vertical slice.

---

### Sprint backlog (decomposed tasks, with dependencies + acceptance checks)

| ID | Decomposed item (not just a ticket) | Definition of Done (acceptance) | Depends on | Owner |
|---|---|---|---|---|
| **SP4.1** | **Supabase schema + RLS policies** for Notes (snapshots) and SystemLogs (logs) | Tables exist; policies allow required reads/writes for the app’s use case; fields support storing snapshot imageData and log message metadata | — | Gabriel Moore (`GabrielosMoore`) |
| **SP4.2** | **Type wiring**: ensure generated/updated Supabase `Database` types match the schema | TypeScript compiles; CRUD calls use correct types for insert/select | SP4.1 | Jibek Gupta (`jibekgupta`) |
| **SP4.3** | **Env + README alignment** for Supabase variables (code, `.env.example`, docs) | A new developer can configure the app; env var names match between docs and code; no dead env naming remains | SP4.1 (at least conceptually) | Vikash Rivers (`rivcode`) |
| **SP4.4** | **Repository layer**: add small persistence functions (Notes repo + Logs repo) used by the hook | Functions are thin and well-bounded; persistence logic not duplicated inside UI; clear error handling | SP4.2 | Nia Greene (`niasekayi`) |
| **SP4.5** | **Hook integration**: persist snapshots + append logs in `useWhiteboardSimulation` (or delegated service/repo) | Snapshot save writes to Notes; `addLog` writes to SystemLogs; UI still works if Supabase is misconfigured (degraded mode documented) | SP4.4, SP4.3 | Nia Greene (`niasekayi`) |
| **SP4.6** | **Baseline verification** (test + demo checklist) | Minimal automated checks (Vitest or equivalent) for key flows + manual checklist: full erase, partial erase, countdown, FR4 pause/resume, snapshot + log persistence | SP4.5 | Kamora Mccowan (`kamoramccowan`) |
| **SP4.7** | **Sprint demo package** | Short checklist document + evidence link(s) for the demo; PRs updated with run instructions | SP4.6 | Whole team |

---

### Dependencies

```text
SP4.1 schema + policies
        -> SP4.2 types
                -> SP4.4 repository layer
                        -> SP4.5 hook integration

SP4.1 schema + policies
        -> SP4.3 env + README alignment
                -> SP4.5 hook integration

SP4.5 hook integration
        -> SP4.6 verification
                -> SP4.7 demo package
```

### Risks + mitigations

1. **Supabase RLS blocks writes**
   - Mitigation: start with dev-friendly policies for capstone demo; document harder production policies as follow-up work.
2. **Type drift between schema and generated TS**
   - Mitigation: lock ordering (SP4.1 before SP4.2) and require compile-time checks before integration.
3. **Regression risk for erase/countdown/FR4**
   - Mitigation: persistence calls are additive; preservation verified via the manual checklist + targeted tests.
4. **AI-generated persistence code mistakes**
   - Mitigation: human review on every query + verify against the “definition of done” checklist before merging.

### In-scope vs out-of-scope (explicit sprint boundary)

**In scope (this sprint):**
- Supabase schema/policies for Notes + SystemLogs
- Type wiring and env/docs consistency
- Hook integration for save snapshot + append log
- Baseline verification + sprint demo artifact

**Out of scope (deferred):**
- ROS bridge/hardware integration
- Full-repo test coverage target (e.g., 80%+)
- Full traceability/JSDoc sweep across all modules
- CI/CD pipeline redesign

---

### Ownership summary (for Scrum / walkthrough)

- **Vikash Rivers (`rivcode`)**: SP4.3 env + docs alignment
- **Gabriel Moore (`GabrielosMoore`)**: SP4.1 schema + RLS policies
- **Jibek Gupta (`jibekgupta`)**: SP4.2 generated/updated types
- **Nia Greene (`niasekayi`)**: SP4.4 repository layer + SP4.5 hook integration
- **Kamora Mccowan (`kamoramccowan`)**: SP4.6 baseline verification (tests + checklist)

