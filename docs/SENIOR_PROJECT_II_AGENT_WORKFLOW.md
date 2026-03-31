# Senior Project II — Backlog ↔ Agent workflow (team reference)

Use this mapping for sprint work and AI-assisted implementation. **Load or @-mention this file** when starting a new task.

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

## Related project docs

- Risk & debt: [`DEBT_AND_RISK.md`](./DEBT_AND_RISK.md)
- VIBE gatekeeper example: [`VIBE_REFACTOR_ASSIGNMENT.md`](./VIBE_REFACTOR_ASSIGNMENT.md)
