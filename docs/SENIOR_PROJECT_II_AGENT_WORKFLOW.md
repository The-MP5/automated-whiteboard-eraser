# Senior Project II — Backlog ↔ Agent workflow (team reference)

Use this mapping for sprint work and AI-assisted implementation. **Load or @-mention this file** when starting a new task.

---

## End-to-end flow (example hierarchy: F6.1)

One feature moves through planning, agent-assisted delivery, course artifacts, and the next iteration:

```text
Feature (F6.1)
   ↓
Decomposition (F6.1.1, F6.1.2)
   ↓
Agent Plan
   ↓
Implementation
   ↓
Testing
   ↓
Scrum Report Submission
   ↓
Feedback
   ↓
Refinement / Next Feature
```

Sections **1** and **2** below map mainly to **Decomposition** → **Agent Plan** → **Implementation**; add **Testing**, **Scrum Report**, and **Feedback** per course deadlines before **Refinement**.

---

## 1. Backlog item (sprint planning)

**Example ID:** `F6.1.2` — User login validation  

**Student defines:**

- The **feature** (what ships)
- **Decomposed tasks** (mapped to course / backlog requirements)

**AI role:**

- Break the feature into **sub-tasks**
- Suggest **acceptance criteria** (testable, backlog-ready)

---

## 2. Plan (agent planning mode)

**Student prompts the agent** (pattern):

```text
You are my software engineering agent.

Task: Implement F6.1.2 (login validation)

Steps:
1. Identify relevant files
2. Propose implementation plan
3. Define test cases
4. Wait for approval
```

**Expected output from the agent:**

- **Plan artifact** (clear steps, scope boundaries)
- **Files to modify** (or create)
- **Risks** (technical, schedule, regression, security as relevant)

**Process:** Agent proposes plan → human approves → agent implements (VIBE / verification as needed).

---

## Worked example (Subissue 7.1 — FR1)

End-to-end application of this workflow for **digital interface / input** is documented in **[`FR1_SUBISSUE_7_1.md`](./FR1_SUBISSUE_7_1.md)** (decomposition **7.1.1–7.1.3**, plan, traceability, acceptance tests).

---

## Related project docs

- **FR1 (Subissue 7.1):** [`FR1_SUBISSUE_7_1.md`](./FR1_SUBISSUE_7_1.md)
- Risk & debt: [`DEBT_AND_RISK.md`](./DEBT_AND_RISK.md)
- VIBE gatekeeper example: [`VIBE_REFACTOR_ASSIGNMENT.md`](./VIBE_REFACTOR_ASSIGNMENT.md)
