# Subissue 7.1 — FR1 (Digital Interface for Input)

Worked example of [`SENIOR_PROJECT_II_AGENT_WORKFLOW.md`](./SENIOR_PROJECT_II_AGENT_WORKFLOW.md): decomposition → agent plan → implementation → testing → scrum / refinement.

---

## Feature (F7.1)

**FR1 — Digital Interface for Input:** users SHALL interact with the simulated whiteboard through a standard digital surface (pointer/mouse-driven tools) to create content before erase/archival flows.

---

## Decomposition

| ID | Sub-task | Maps to |
|----|-----------|---------|
| **7.1.1** | Expose a **Fabric.js canvas** with drawing, selection, and text entry modes | Primary input surface |
| **7.1.2** | Provide **toolbar actions** (draw / select / text, undo, clear, snapshot) wired to the canvas | Teacher-facing controls aligned with FR1 |
| **7.1.3** | Support **partial-erase input** via drag rectangle when erase mode is partial | Combines FR1 input with FR2 erase selection |

---

## Agent plan (summary)

1. **Files:** `WhiteboardCanvas.tsx` (canvas + tools), `Index.tsx` (layout), `ControlPanel.tsx` (high-level erase flow — adjacent to FR1).
2. **Scope:** In-app digital input only (not ROS/hardware drivers).
3. **Risks:** Fabric upgrade breaking APIs; touch vs mouse parity untested in this sprint (document as follow-up).

---

## Implementation (traceability)

| Component / file | FR1 responsibility |
|------------------|-------------------|
| [`src/components/whiteboard/WhiteboardCanvas.tsx`](../src/components/whiteboard/WhiteboardCanvas.tsx) | Pencil brush, selection, `FabricText`, toolbar, mouse handlers for partial area |
| [`src/pages/Index.tsx`](../src/pages/Index.tsx) | Embeds canvas; labels **FR1 / FR2** digital interface region |
| [`src/hooks/useWhiteboardSimulation.ts`](../src/hooks/useWhiteboardSimulation.ts) | Receives `FabricCanvas` ref from FR1 surface for erase/snapshot |

---

## Acceptance criteria

- [ ] User can **draw** freehand on the canvas with default pencil tool.
- [ ] User can switch to **select** and **text** tools; new text objects appear on the board.
- [ ] User can **undo** last object, **clear** board (non-erase flow), **save snapshot** from the canvas toolbar.
- [ ] In **partial** erase mode, user can **click-drag** to define a rectangle on the canvas surface.
- [ ] Canvas region is programmatically identifiable for accessibility review (e.g. `aria-label` / `role` on wrapper).

---

## Testing

| Type | Check |
|------|--------|
| **Manual** | Each tool toggles; draw → undo → clear; add text → select → move; partial drag rectangle visible |
| **Regression** | Full / partial erase from `ControlPanel` still receive canvas ref and complete without console errors |
| **NFR4** | Smoke in two browsers per [`NFR4_UAT_CHECKLIST.md`](./NFR4_UAT_CHECKLIST.md) |

---

## Scrum / RTM

- Link PR to **Subissue 7.1** / **FR1** on the project board.
- Reference this file in sprint notes as **traceability** evidence for FR1.

---

## Refinement / next feature

- Optional: first-class **touch** / pen tests; keyboard shortcuts for tools; contrast audit for toolbar (**Story / a11y backlog**).
