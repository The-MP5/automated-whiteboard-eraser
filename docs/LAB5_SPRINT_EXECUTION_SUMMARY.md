# Lab 5 — Agile Sprint Execution (AI-Augmented)

**Course:** Senior Project II — Module 5  
**Repository:** https://github.com/The-MP5/automated-whiteboard-eraser  
**Project Board:** https://github.com/orgs/The-MP5/projects/5  
**Team:** Nia Greene, Kamora Mccowan, Vikash Rivers, Gabriel Moore, Jibek Gupta  
**Sprint Type:** AI-augmented implementation sprint (planning + implementation + review)

---

## 1) Sprint objective

Execute one sprint cycle using AI-aware Agile workflow: maintain board hygiene, implement backlog-driven work, and preserve traceability from requirements/backlog to PR evidence.

---

## 2) Sprint plan (what was prioritized)

### Sprint goal
Stabilize the whiteboard simulation architecture and reliability by completing priority technical debt items with AI-assisted implementation and human verification.

### Planned sprint backlog (board-driven)

| Item | Board ID | Owner | Dependency | Planned outcome |
|---|---|---|---|---|
| Remove Lovable coupling | TD7 (#92) | Vikash (`rivcode`) | none | Standard Vite/React setup with no Lovable-specific dependency |
| Harden countdown edge cases | TD5 (#90) | Vikash (`rivcode`) | none | Countdown remains correct under edge timing/cancel states |
| Extract simulation logic boundary | TD1 (#86) | Vikash (`rivcode`) | TD7 preferred first | Hook delegates core simulation logic to clearer module boundaries |
| Standardize Supabase env + persistence wiring | TD3 (#88) | Team backlog (unassigned) | TD1 architectural baseline | Start/plan persistence wiring, continue in next sprint |

---

## 3) Sprint execution results (completed vs incomplete)

### Completed implementation items (AI-assisted)

| Item | Status in board | Evidence | Acceptance result |
|---|---|---|---|
| **TD7 (#92)** Complete Lovable decoupling/config cleanup | In Review | PR **#96** | Implemented and validated by build/run checks; moved project toward standard toolchain |
| **TD5 (#90)** Harden countdown logic against edge cases | In Review | PR **#85** | Countdown stability improved; no regression observed in manual flow tests |
| **TD1 (#86)** Refactor monolithic simulation hook into service boundaries | In Review | PR **#97** | Domain logic extracted to simulation modules; hook responsibilities reduced and safer callback dependency handling added |

### Incomplete / deferred items

| Item | Current state | Reason deferred | Next sprint action |
|---|---|---|---|
| **TD3 (#88)** Standardize Supabase env vars + wire real persistence | Backlog | Scope limit: sprint focused on architecture stabilization first | Implement persistence vertical slice (schema, types, repository, integration, verification) |
| **TD2 (#87)** Add baseline automated tests for erase/countdown/safety flows | Backlog | Timeboxed behind TD1/TD5 refactor work | Add Vitest baseline tests in next sprint tied to TD3 integration |
| **R1–R3 (#93–#95)** risk hardening items | Backlog | Planned after core architecture/persistence milestones | Convert into staged, test-backed hardening tasks next cycle |

---

## 4) AI usage and human oversight (responsible use)

At least two backlog items were implemented with AI-assisted development (TD7, TD5, TD1).

### AI contributions
- Proposed refactor candidates and implementation drafts.
- Suggested extraction boundaries and callback/dependency cleanup for simulation logic.
- Helped generate implementation notes and test/checklist ideas.

### Human decisions (required supervision)
- Rejected over-broad AI suggestions that exceeded sprint scope.
- Validated architecture choices against existing debt inventory.
- Performed manual verification on erase/countdown/FR4 behavior before moving work to review.
- Ensured board linkage (item -> PR) and traceability notes were retained.

---

## 5) Sprint board accuracy & hygiene evidence

Board hygiene updates maintained during sprint:
- Task statuses updated (`Backlog` vs `In Review`) with linked PRs where available.
- Active implementation items mapped to visible PR links:
  - TD1 -> PR #97
  - TD5 -> PR #85
  - TD7 -> PR #96
- Remaining technical debt and risk items left in backlog with clear next actions.

**Evidence artifact (for PDF appendix):** attach screenshot/export of GitHub Project Board table view showing assignees, status, and linked PRs.

---

## 6) Team collaboration evidence

### Ownership snapshot from board
- Vikash (`rivcode`): led TD items under active implementation/review in this sprint.
- Gabriel (`GabrielosMoore`), Nia (`niasekayi`), Jibek (`jibekgupta`): assigned subissues in backlog and positioned for next sprint persistence/testing/distributed implementation work.
- Kamora (`kamoramccowan`): included in team ownership distribution and planned verification/testing load in next cycle.

### Collaboration outcomes
- Shared board visibility across team-specific views (Vikash/Gabriel/Jibek/Nia task tabs).
- Team-level backlog remained aligned to requirement areas (FR/NFR + TD + Risk).
- In-review PR linkage created a clear handoff path from implementation to team review.

---

## 7) Requirement traceability update (RTM)

Updated RTM artifact for this sprint is documented in:

**`docs/RTM_LAB5_UPDATE.md`**

---

## 8) Sprint retrospective (short)

### What went well
- Sprint stayed focused on high-impact technical debt.
- AI acceleration was useful when bounded by human review.
- Board-to-PR traceability was visible for implemented TD work.

### What to improve next sprint
- Convert deferred backlog (TD3/TD2) into smaller, owner-specific tasks with explicit acceptance criteria.
- Increase shared commit/PR footprint across team members.
- Add stronger automated verification to complement manual checks.

---
Link to Screnshots of Project Board: https://drive.google.com/drive/folders/1R_WCgfhsrpJ7ZTfeBaHRtTm28p2afikS?usp=sharing
