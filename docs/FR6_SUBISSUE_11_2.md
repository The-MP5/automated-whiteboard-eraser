# Subissue 11.2 — FR6 (User Authentication and Profiles — optional / future)

**FR6 — User Authentication and Profiles** is **optional**: the whiteboard simulator runs fully **without** Supabase. When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set, teachers can sign in from the header and save a **display name** (demo profile via auth metadata).

---

## Feature (F11.2)

**FR6 — User Authentication and Profiles:** users can authenticate and maintain a profile consistent with course security expectations.

**Delivered in this repo:**

1. **`AuthProvider` + `useAuth`** — session lifecycle and auth actions (`src/contexts/AuthProvider.tsx`, `src/contexts/auth-context.ts`, `src/hooks/useAuth.ts`).
2. **Header Account menu** — magic link sign-in, sign-out, display name (`src/components/auth/UserAccountMenu.tsx`).
3. **`getSupabaseAuth()`** — documented accessor on the nullable client (`src/integrations/supabase/client.ts`).
4. **Docs + UAT** — this file and `FR6_SUBISSUE_11_2_UAT_CHECKLIST.md`.

---

## Decomposition

| ID | Sub-task | Maps to |
|----|----------|---------|
| **11.2.1** | Session listener + sign-in / sign-out / profile update | `AuthProvider.tsx`, `auth-context.ts`, `useAuth.ts` |
| **11.2.2** | Account UI (popover) + accessibility | `UserAccountMenu.tsx`, `Header.tsx` |
| **11.2.3** | Optional Auth API accessor | `client.ts` (`getSupabaseAuth`) |
| **11.2.4** | Docs, README, UAT | `README.md`, checklists, workflow links |

---

## Implementation notes

- **Magic link:** `signInWithOtp` with `emailRedirectTo` set to `window.location.origin`. Configure **Redirect URLs** in Supabase (Auth → URL Configuration).
- **Profile (demo):** `display_name` in `user.user_metadata` via `updateUser`. Production may add a `profiles` table and RLS (see debt docs).
- **No `.env`:** menu explains how to enable backend; simulator unchanged.

---

## Acceptance Criteria

- [ ] Account menu works when Supabase env is set (magic link + sign-out + display name).
- [ ] App runs with no `.env`; menu shows configuration guidance, no crashes.
- [ ] `getSupabaseAuth()` remains available; `npm run build` succeeds.
- [ ] README and this doc describe Auth setup at a high level.

---

## Testing

| Type | Check |
|------|-------|
| Build | `npm run build` succeeds |
| Manual | No `.env` → open Account → see offline message |
| Manual + Supabase | Magic link, session after redirect, save display name, sign out |
| UAT | `FR6_SUBISSUE_11_2_UAT_CHECKLIST.md` |
