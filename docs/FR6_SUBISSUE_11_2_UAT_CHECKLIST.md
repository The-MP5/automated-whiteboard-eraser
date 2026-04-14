# FR6 — Subissue 11.2 UAT checklist (optional / future)

Use this when **User Authentication and Profiles (FR6)** is implemented beyond documentation. For **Subissue 11.2** as delivered in the repo, verification is: docs linked, `getSupabaseAuth` present, and build green — see **§ Current release (11.2 documentation scope)**.

---

## Current release (11.2 documentation scope)

- [ ] `README.md` lists FR6 (optional) and links to `docs/FR6_SUBISSUE_11_2.md`.
- [ ] `docs/SENIOR_PROJECT_II_AGENT_WORKFLOW.md` includes the Subissue 11.2 worked example.
- [ ] `npm run build` completes without errors.

---

## Future — authentication flow

- [ ] Sign-in path works for the chosen method (e.g. magic link or OAuth) in a staging Supabase project.
- [ ] Invalid credentials or expired links show a clear, accessible error message.
- [ ] Session persists across refresh when persistence is enabled (`localStorage` is already configured on the client).

---

## Future — session and sign-out

- [ ] Authenticated state is visible where the UI promises it (e.g. header or settings).
- [ ] Sign-out clears session and returns to the unauthenticated experience without stale data leaks in the UI.

---

## Future — profiles

- [ ] Profile data loads for the signed-in user only.
- [ ] Users cannot read or edit other users’ profile rows (verify with RLS or equivalent).

---

## Future — security and compatibility

- [ ] No service role or private keys in the frontend bundle or repo.
- [ ] Auth-related behavior is smoke-tested on at least two supported browsers (see `docs/NFR4_COMPATIBILITY.md`).
