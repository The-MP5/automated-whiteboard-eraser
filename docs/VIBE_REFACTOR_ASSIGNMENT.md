# VIBE Refactor — Assignment deliverables (Module gatekeeper)

Use the **Pull Request description** below verbatim (fill in bracketed links only). Evidence files: [`build-verification.log`](./build-verification.log).

---

## Inventory reference

- **Primary target:** Part 1, **Debt Item 5** — *Hardcoded Constants and Magic Numbers* (`docs/DEBT_AND_RISK.md`).
- **Secondary (same PR, isolated file):** **Debt Item 3** — env handling for Supabase made explicit and type-safe without requiring a configured backend for UI-only runs.

---

## Copy into GitHub PR description

### 🛡️ VIBE Report

1. **Target Selected:** **Centralized simulation configuration** — new module [`src/config/simulation.ts`](../src/config/simulation.ts) holds Story 6 / NFR1 / FR4 timing, proximity, and whiteboard canvas defaults that previously lived as magic numbers in [`useWhiteboardSimulation.ts`](../src/hooks/useWhiteboardSimulation.ts) and [`WhiteboardCanvas.tsx`](../src/components/whiteboard/WhiteboardCanvas.tsx). This is **low-risk** because it does not touch auth, database schema, or the erase state machine’s control flow—only replaces literals with named, documented constants. Cross-referenced in **Debt Item 5** of [`docs/DEBT_AND_RISK.md`](./DEBT_AND_RISK.md).

2. **The Verification Event:** The AI suggested initializing Supabase with **non-null assertions** on raw `import.meta.env` values, e.g. `createClient(import.meta.env.VITE_SUPABASE_URL!, anonKey!)`, which would compile but (a) crash or misconfigure silently in some edge cases and (b) force every import of the client module to assume env is always present—even though **no feature in the app imports `supabase` yet** and teammates often run the simulator without `.env`.

   - **AI-style suggestion (rejected):** `createClient<Database>(import.meta.env.VITE_SUPABASE_URL!, key!, { ... })`
   - **Final implementation:** [`tryResolveSupabaseEnv()`](../src/integrations/supabase/client.ts) returns `ResolvedSupabaseEnv | null`; `export const supabase: SupabaseClient<Database> | null` is only created when both URL and key are non-empty strings; **`requireSupabaseEnv()`** throws a dedicated **`SupabaseConfigError`** with an actionable message when future persistence code must fail fast. This matches *our* context: optional backend today, strict boundary tomorrow.

3. **Trust Boundary Established:** Requirement-linked constants now have a **single edit surface** (reducing risk that an AI or quick edit scrambles NFR1/FR4/Story 6 numbers in one file but not another). Supabase setup is **explicitly typed** (`ResolvedSupabaseEnv`, `SupabaseConfigError`, nullable client) so humans and reviewers can see when persistence is unset versus misconfigured. Together, this is a verifiable choke point before larger refactors (e.g. monolithic hook split in Debt Item 1).

4. **Evidence of Execution:** Attached: [`docs/build-verification.log`](./build-verification.log) (clean `npm run build`, exit code 0). **Add your screenshot** of `npm run dev` showing countdown + erase still working after the change, or paste it into the PR thread.

---

## Changed files (for reviewers)

| File | Change |
|------|--------|
| `src/config/simulation.ts` | New — centralized constants + JSDoc / requirement IDs |
| `src/hooks/useWhiteboardSimulation.ts` | Imports config; no behavior change |
| `src/components/whiteboard/WhiteboardCanvas.tsx` | Imports canvas-related config; no behavior change |
| `src/integrations/supabase/client.ts` | Typed env resolution, `SupabaseConfigError`, `supabase \| null` |
| `src/index.css` | `@import` moved above `@tailwind` to satisfy CSS ordering (cleaner Vite build) |

---

## Before you submit

1. Create a branch, commit, push, open PR against your default branch.
2. Paste the **VIBE Report** block into the PR description; attach screenshot or link to CI if your course requires it.
3. Optionally comment on the GitHub Issue that maps to Debt Item 5 / Item 3 with this PR link.
