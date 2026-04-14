# Subissue 11.2 — FR6 (User Authentication and Profiles — optional / future)

This subissue captures **FR6 — User Authentication and Profiles** as a **planned extension**, not a blocking deliverable for the classroom whiteboard simulator. The React UI remains fully usable **without** sign-in; Supabase env remains **optional** for persistence experiments.

---

## Feature (F11.2)

**FR6 — User Authentication and Profiles:** when the product adds multi-user or saved settings, users SHALL be able to authenticate and maintain a profile consistent with course security and privacy expectations.

For **Subissue 11.2**, scope is:

1. **Documentation and traceability** — backlog-ready decomposition, acceptance criteria, and a future UAT template.
2. **Integration hook** — a single, documented entry point to Supabase Auth (`getSupabaseAuth` in `src/integrations/supabase/client.ts`) so future UI and data layers do not fork the client.

---

## Decomposition

| ID | Sub-task | Maps to |
|----|----------|---------|
| **11.2.1** | Document FR6 intent, out-of-scope for current simulator, and Supabase Auth alignment | This doc + README |
| **11.2.2** | Expose optional Auth API accessor next to existing nullable client | `src/integrations/supabase/client.ts` |
| **11.2.3** | Provide future UAT checklist (sign-in, session, profile, sign-out) | `FR6_SUBISSUE_11_2_UAT_CHECKLIST.md` |
| **11.2.4** | Link from agent workflow + README | `SENIOR_PROJECT_II_AGENT_WORKFLOW.md`, `README.md` |

---

## Future implementation notes (not required for 11.2 closure)

When the team implements full FR6:

- **Supabase Auth:** email magic link, OAuth providers, or institution SSO — configure redirect URLs in the Supabase project (Auth → URL Configuration).
- **Profiles:** a `profiles` table (or view) keyed by `auth.users.id`, with RLS so users read/update only their row.
- **App shell:** React context or similar for `session`, `user`, and loading/error states; protect routes or features that require login.
- **Secrets:** never commit service role keys; keep using **anon** key in the Vite app and enforce authorization in Postgres RLS.

---

## Acceptance Criteria

- [ ] FR6 is described as **optional / future** with clear boundaries vs. the current simulator.
- [ ] `getSupabaseAuth()` is exported and documented; build passes.
- [ ] Subissue 11.2 docs and the future UAT checklist are linked from the workflow and README.
- [ ] `npm run build` succeeds.

---

## Testing

| Type | Check |
|------|-------|
| Build | `npm run build` succeeds |
| Manual (current) | App runs with no `.env`; optional Supabase unchanged |
| UAT (when FR6 ships) | Use `FR6_SUBISSUE_11_2_UAT_CHECKLIST.md` |
