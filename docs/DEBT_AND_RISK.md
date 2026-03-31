# Risk & Technical Debt Inventory

**Project:** Smart Board Buddy – Automated Whiteboard Eraser System (ROS Simulation)  
**Module:** Senior Project II – From Prototypes to Products  
**Team:** Group 21 (Nia Greene, Kamora Mccowan, Vikash Rivers, Gabriel Moore, Jibek Gupta)

This document captures the architectural audit of the Lovable.dev-generated prototype to identify **Technical Debt** and **Agentic/AI Project Risks** before scaling toward production.

---

## Part 1: Technical Debt Audit

### 1. Monolithic Simulation Hook & No API Boundaries

**Item Name:** Monolithic Simulation Logic in Single Hook  
**Category:** Architectural Debt  

**Description:** All whiteboard simulation state and behavior (erase flow, countdown, obstacle detection, notes, logs, progress) lives in a single hook `useWhiteboardSimulation.ts` (~275 lines). There is no separation between UI state, domain logic, and side effects. The Supabase client is created and typed but **never used** for persistence; README states "Notes (for snapshots) and SystemLogs (for NFR2 compliance)" in Supabase, yet notes and logs exist only in React state and are lost on refresh. There are no clear API boundaries (e.g., a dedicated service layer for erase operations or logging).

**Remediation Plan:** Extract domain logic into a simulation service (or context + reducers), introduce a persistence layer that actually uses Supabase for Notes and SystemLogs, and keep the hook as a thin orchestrator that delegates to services. Define explicit boundaries (e.g., `EraseService`, `LogService`, `NotesRepository`).

---

### 2. No Unit or Integration Tests

**Item Name:** Absence of Automated Test Suite  
**Category:** Test Debt  

**Description:** The repository has no test runner (no Vitest, Jest, or React Testing Library in `package.json`) and no test files. The README describes an "Agile Testing Approach" (unit, HIL, integration, UAT) but there is no "trust but verify" automation for AI-generated code. Critical logic (e.g., partial-erase bounds, countdown completion, obstacle pause/resume) is untested, making regressions likely when refactoring or when AI agents suggest changes.

**Remediation Plan:** Add Vitest and React Testing Library; write unit tests for pure logic (e.g., coordinate/area calculations, status transitions) and integration tests for the erase flow and countdown. Run tests in CI and require passing tests before accepting AI-suggested changes.

---

### 3. Inconsistent Environment Configuration & Unused Persistence

**Item Name:** Environment Variable Mismatch and Dead Supabase Integration  
**Category:** Architectural Debt  

**Description:** The Supabase client (`src/integrations/supabase/client.ts`) reads `VITE_SUPABASE_PUBLISHABLE_KEY`, while the README instructs users to set `VITE_SUPABASE_ANON_KEY`. This inconsistency causes setup failures. Furthermore, the client is never imported outside its file—no component or hook calls `supabase`—so the entire Supabase integration is dead code. The generated `types.ts` defines an empty `Database` (no tables), contradicting README claims about Notes and SystemLogs tables.

**Remediation Plan:** Standardize on one env var name (e.g., `VITE_SUPABASE_ANON_KEY`) in both code and README. Implement and use Supabase tables for snapshots and system logs; update `Database` types (e.g., via Supabase CLI codegen) and add a small persistence layer that the simulation uses for NFR2 and Story 7.

---

### 4. Missing Traceability and Inline Documentation

**Item Name:** No Requirement-to-Code Traceability and Sparse Inline Documentation  
**Category:** Documentation Debt  

**Description:** Comments and UI labels reference requirement IDs (e.g., FR1, FR2, FR4, NFR1, NFR2, Story 6, Story 7) but there is no central map or ADR linking these to Agile backlog items or acceptance criteria. AI-generated code has minimal JSDoc; complex logic (e.g., partial-erase bounds check in `completeErase`, countdown/obstacle state machine) is hard for a human to verify against the original requirements. This makes it difficult to confirm that AI output still satisfies the product spec.

**Remediation Plan:** Add a traceability matrix (e.g., in docs or README) mapping FR/NFR/Story IDs to files and functions. Add JSDoc to key modules (simulation hook, canvas component, countdown) describing intent and referencing requirement IDs. Consider lightweight ADRs for major design decisions (e.g., in-memory vs. persisted logs).

---

### 5. Hardcoded Constants and Magic Numbers

**Item Name:** Hardcoded Business Rules and Magic Numbers  
**Category:** Architectural Debt  

**Description:** Critical values are scattered as magic numbers and literals: countdown duration (10), erase duration (10000 ms), proximity threshold (0.5 m), canvas dimensions (e.g., `height = Math.min(500, window.innerHeight * 0.5)`), and colors (e.g., `#f8fafc`, `#1e293b`). These correspond to NFR1/FR4 and product constraints but are not centralized or configurable, making it easy for AI or future edits to break compliance and hard to change for different environments (e.g., demo vs. production).

**Remediation Plan:** Introduce a single configuration module or constants file (e.g., `src/config/constants.ts` or env-based config) for countdown seconds, erase duration, proximity threshold, and canvas defaults. Reference these from the simulation hook and WhiteboardCanvas; document the source requirement (e.g., NFR1) next to each constant.

---

### 6. Stale Closure Risk in Erase Completion Logic

**Item Name:** Potential Stale Closure in `simulateErase` / `completeErase`  
**Category:** Architectural Debt  

**Description:** In `useWhiteboardSimulation.ts`, `simulateErase` uses `setInterval` and calls `completeErase()` when progress reaches 100%. `completeErase` depends on `eraseMode` and `partialArea`, but `simulateErase`’s dependency array does not include `completeErase`. As a result, the callback running in the interval may close over an outdated `completeErase` (and thus outdated `eraseMode`/`partialArea`), leading to incorrect behavior (e.g., full erase when partial was selected after a quick mode change). This is a subtle bug that AI-generated code often introduces when combining intervals and React state.

**Remediation Plan:** Refactor so the interval callback does not rely on a stale `completeErase`. Options: use refs for latest `eraseMode`/`partialArea`, or move the completion logic into the interval callback and read current state from refs updated on each render. Add a unit or integration test that switches mode during countdown/erase and asserts correct area is erased.

---

### 7. Lovable.dev-Specific Dependencies

**Item Name:** Lovable Tooling and Conventions Lock-in  
**Category:** Architectural Debt  

**Description:** The build uses **Lovable.dev**-specific tooling: `lovable-tagger` is registered in `vite.config.ts` (development mode) and listed in `devDependencies`. The project was generated with Lovable conventions (e.g., env var naming, structure). Remaining tied to Lovable creates vendor lock-in and migration risk if the team or tooling changes.

**Remediation Plan:** **Replace** Lovable dependencies with a standard setup. Remove the `lovable-tagger` plugin from `vite.config.ts`; uninstall the `lovable-tagger` package; align env vars and any other config with standard Vite/React usage. Verify the app builds and runs (`npm run build`, `npm run dev`) without any Lovable packages or plugins so the codebase is standalone.

---

## Part 2: AI & System Risk Assessment

### 1. Reliability / Hallucination

**Risk:** AI agents (e.g., Cursor/Lovable) may suggest changes that violate NFR1 (10s erase), FR4 (0.5 m obstacle pause), or Story 6 (10s countdown) because those constraints exist only as magic numbers and comments. Refactors that "simplify" the simulation hook or extract functions without preserving dependency order could introduce stale closures (as in Debt Item 6) or reorder operations (e.g., snapshot-before-erase, pause-on-obstacle). Without tests or a single source of truth for constants, hallucinations are hard to detect.

**Mitigation:** Centralize requirements and constants in one place; add automated tests that encode NFR1/FR4/Story 6; require human review of any change to the simulation hook or erase/countdown flow; consider a short checklist (e.g., "Does this change affect erase timing or safety?") before merging.

---

### 2. Security & Ethics

**Risk:** The app currently stores snapshot image data (base64 data URLs) and system logs in React state only. If persistence is later added without proper design, there is risk of storing sensitive or PII-containing content (e.g., student names on the board) in Supabase without access control or retention policy. The Supabase client uses `localStorage` for auth and exposes the anon key in the frontend; any future server-side or backend-for-frontend must not trust client-supplied data without validation. `.env` is not listed in `.gitignore`, so there is a risk of committing real `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the repo, exposing the project.

**Mitigation:** Add `.env` and `.env.local` to `.gitignore`; document that only anon/public keys may be used in the frontend and that RLS must be configured for any Supabase tables. Before persisting snapshots/logs, define data classification and retention; avoid storing unnecessary PII and document any accessibility/ethics considerations for archived board content.

---

### 3. Dependency Risk (Lovable Lock-in)

**Risk:** The project depends on **Lovable.dev**-specific tooling (e.g., `lovable-tagger` in `vite.config.ts`) and Lovable’s conventions (env var names, component structure). Build and behavior are tied to Lovable; if Lovable changes its interface or the team moves away from Lovable, the codebase would require non-trivial migration. External APIs (Supabase, Fabric.js) can also change or deprecate versions; the project currently uses caret ranges, so minor updates could introduce breaking changes without notice.

**Goal — Replace Lovable dependencies:** Remove Lovable-specific dependencies and conventions so the project is standalone and no longer locked to Lovable.dev. Specifically: (1) Remove the `lovable-tagger` plugin from `vite.config.ts` and uninstall the `lovable-tagger` package; (2) Replace any Lovable-specific env var names or config with standard Vite/React conventions; (3) Ensure the app builds and runs with a plain Vite + React + Supabase setup with no Lovable tooling. For other external deps (Supabase, Fabric.js), abstract integration points where practical and consider locking critical dependencies to exact or narrow versions for the capstone period, with tests before upgrading.

---

## Part 3: Backlog Integration

The **top 3 Technical Debt items** below have been converted into backlog-ready form with **AI-aware acceptance criteria** suitable for your GitHub Project Board. Create corresponding **Issues**, tag them with `technical-debt` or `refactor`, and paste the acceptance criteria into the issue descriptions.

---

### Backlog Item 1: Extract Simulation Logic and Add Persistence (Debt Items 1 & 3)

**Title:** Refactor: Extract simulation service layer and persist Notes/Logs to Supabase  

**Labels:** `technical-debt`, `refactor`, `architecture`  

**Description:** Replace the monolithic `useWhiteboardSimulation` hook with a clear service layer and actually use Supabase for snapshots and system logs. Fix env var naming and document setup.

**Acceptance Criteria (AI-aware):**

- [ ] **AC1:** A dedicated module (e.g., `EraseService` or simulation context) contains erase/countdown/obstacle logic; `useWhiteboardSimulation` delegates to it and remains thin (< 80 lines).
- [ ] **AC2:** Supabase tables for Notes (snapshots) and SystemLogs exist; `Database` types are generated or updated to match.
- [ ] **AC3:** Snapshot-on-save (Story 7) and system logs (NFR2) are persisted to Supabase; app works when env vars are set; README and code use the same env var name (e.g., `VITE_SUPABASE_ANON_KEY`).
- [ ] **AC4:** No regression: full erase, partial erase, 10s countdown (Story 6), 10s erase (NFR1), and obstacle pause (FR4) behave as before (manual or automated check).
- [ ] **AC5:** Any AI-suggested refactor to this area is verified against AC1–AC4 before merge.

---

### Backlog Item 2: Introduce Test Suite and Centralize Constants (Debt Items 2 & 5)

**Title:** Add Vitest test suite and centralize NFR/FR constants  

**Labels:** `technical-debt`, `testing`, `refactor`  

**Description:** Add a test runner and tests for simulation and canvas logic; move magic numbers (countdown, erase duration, proximity threshold, canvas defaults) into a single config/constants module.

**Acceptance Criteria (AI-aware):**

- [ ] **AC1:** Vitest (and optionally React Testing Library) are added; `npm run test` (or equivalent) runs the suite.
- [ ] **AC2:** At least one unit test covers status/erase flow (e.g., idle → countdown → erasing → completed) or partial-erase area logic.
- [ ] **AC3:** All NFR1/FR4/Story 6–related constants (countdown seconds, erase duration ms, proximity threshold, key canvas dimensions) live in one file (e.g., `src/config/constants.ts`) with comments referencing requirement IDs.
- [ ] **AC4:** Simulation hook and WhiteboardCanvas read from this config; no hardcoded magic numbers for those requirements remain in components/hooks.
- [ ] **AC5:** New or modified logic in the simulation or canvas that touches safety/timing must include or update tests; AI-generated test changes must be reviewed for correctness.

---

### Backlog Item 3: Documentation and Traceability (Debt Item 4)

**Title:** Add requirement traceability and JSDoc for simulation/canvas  

**Labels:** `technical-debt`, `documentation`  

**Description:** Provide a traceability matrix (FR/NFR/Story → code) and JSDoc on key modules so humans and AI can verify that the implementation matches the original Agile requirements.

**Acceptance Criteria (AI-aware):**

- [ ] **AC1:** A traceability section (in README or `TRACEABILITY.md`) lists each FR/NFR/Story ID with at least one file or function reference (e.g., FR4 → `useWhiteboardSimulation.simulateObstacle`, NFR1 → constants + `simulateErase`).
- [ ] **AC2:** `useWhiteboardSimulation.ts`, `WhiteboardCanvas.tsx`, and `CountdownOverlay.tsx` have JSDoc at the top describing purpose and referencing requirement IDs where relevant.
- [ ] **AC3:** Complex functions (e.g., `completeErase`, countdown effect, obstacle toggle) have brief inline comments or JSDoc describing intent and any requirement link.
- [ ] **AC4:** Any AI-generated change that adds or removes behavior in these modules must not remove requirement references without updating the traceability matrix.

---

### Backlog Item 4: Replace Lovable Dependencies (Debt Item 7)

**Title:** Remove Lovable tooling and make build standalone  

**Labels:** `technical-debt`, `refactor`, `dependencies`  

**Description:** Replace Lovable-specific dependencies so the project no longer depends on Lovable.dev. The goal is a standard Vite + React + Supabase setup with no Lovable packages or plugins.

**Acceptance Criteria (AI-aware):**

- [ ] **AC1:** The `lovable-tagger` plugin is removed from `vite.config.ts`; the config uses only standard Vite and `@vitejs/plugin-react-swc` (or equivalent).
- [ ] **AC2:** The `lovable-tagger` package is removed from `package.json` devDependencies and uninstalled.
- [ ] **AC3:** `npm run build` and `npm run dev` succeed with no Lovable-related code or config; the app behavior is unchanged from a user perspective.
- [ ] **AC4:** Any env var or config that was Lovable-specific is renamed or documented as standard (e.g., README reflects actual env var names used in code).
- [ ] **AC5:** No remaining imports or references to `lovable-tagger` or other Lovable packages exist in the repo.

---

## Summary

| Part | Count | Focus |
|------|--------|--------|
| **Part 1 – Technical Debt** | 7 items | Architecture (5), Test (1), Documentation (1) |
| **Part 2 – Risks** | 3 areas | Reliability/Hallucination, Security & Ethics, Dependency (goal: replace Lovable deps) |
| **Part 3 – Backlog** | 4 issues | Service layer + Supabase; Tests + constants; Traceability + JSDoc; **Replace Lovable dependencies** |

Use this inventory as the basis for your architectural refactoring and security planning for the rest of Senior Project II. Apply VIBE (Verify, Improve, Build, Execute) by verifying AI output against these debt and risk items before accepting changes.
