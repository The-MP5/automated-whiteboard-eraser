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
Manual verification template: **[`FR1_DIGITAL_INPUT_UAT_CHECKLIST.md`](./FR1_DIGITAL_INPUT_UAT_CHECKLIST.md)**.

---

## Worked example (Subissue 2.4 — NFR1 Usability)

**Erase experience usability** (status, countdown, controls, assistive cues) is documented in **[`NFR1_SUBISSUE_2_4.md`](./NFR1_SUBISSUE_2_4.md)** with manual verification in **[`NFR1_USABILITY_UAT_CHECKLIST.md`](./NFR1_USABILITY_UAT_CHECKLIST.md)**.

---

## Worked example (Subissue 6.2 — FR5 Teacher Interface Controls)

Teacher-facing state controls (Start/Resume/Pause/Stop, mode locking during active operation, and safety simulation controls) are documented in **[`FR5_SUBISSUE_6_2.md`](./FR5_SUBISSUE_6_2.md)** with manual verification in **[`FR5_TEACHER_CONTROLS_UAT_CHECKLIST.md`](./FR5_TEACHER_CONTROLS_UAT_CHECKLIST.md)**.

---

## Worked example (Subissue 8.2 — FR5 Teacher Interface Controls, follow-up)

Follow-up FR5 refinement for board issue 8.2 is documented in **[`FR5_SUBISSUE_8_2.md`](./FR5_SUBISSUE_8_2.md)** with checklist **[`FR5_SUBISSUE_8_2_UAT_CHECKLIST.md`](./FR5_SUBISSUE_8_2_UAT_CHECKLIST.md)**.

---

## Worked example (Subissue 9.1 — FR5 Teacher Interface Controls, follow-up)

FR5 board issue 9.1 is documented in **[`FR5_SUBISSUE_9_1.md`](./FR5_SUBISSUE_9_1.md)** with checklist **[`FR5_SUBISSUE_9_1_UAT_CHECKLIST.md`](./FR5_SUBISSUE_9_1_UAT_CHECKLIST.md)**.

---

## Related project docs

- **NFR1 Usability (Subissue 2.4):** [`NFR1_SUBISSUE_2_4.md`](./NFR1_SUBISSUE_2_4.md)
- **FR5 Teacher Controls (Subissue 6.2):** [`FR5_SUBISSUE_6_2.md`](./FR5_SUBISSUE_6_2.md)
- **FR5 Teacher Controls (Subissue 8.2):** [`FR5_SUBISSUE_8_2.md`](./FR5_SUBISSUE_8_2.md)
- **FR5 8.2 UAT checklist:** [`FR5_SUBISSUE_8_2_UAT_CHECKLIST.md`](./FR5_SUBISSUE_8_2_UAT_CHECKLIST.md)
- **FR5 Teacher Controls (Subissue 9.1):** [`FR5_SUBISSUE_9_1.md`](./FR5_SUBISSUE_9_1.md)
- **FR5 9.1 UAT checklist:** [`FR5_SUBISSUE_9_1_UAT_CHECKLIST.md`](./FR5_SUBISSUE_9_1_UAT_CHECKLIST.md)
- **FR1 (Subissue 7.1):** [`FR1_SUBISSUE_7_1.md`](./FR1_SUBISSUE_7_1.md)
- **FR1 UAT checklist:** [`FR1_DIGITAL_INPUT_UAT_CHECKLIST.md`](./FR1_DIGITAL_INPUT_UAT_CHECKLIST.md)
- Risk & debt: [`DEBT_AND_RISK.md`](./DEBT_AND_RISK.md)
- VIBE gatekeeper example: [`VIBE_REFACTOR_ASSIGNMENT.md`](./VIBE_REFACTOR_ASSIGNMENT.md)
