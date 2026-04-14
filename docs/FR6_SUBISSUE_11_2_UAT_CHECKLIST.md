# FR6 — Subissue 11.2 UAT checklist

## Without Supabase (offline simulator)

- [ ] App loads; whiteboard and teacher controls work.
- [ ] Header **Account** opens; message explains missing `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
- [ ] No console errors from auth code.

## With Supabase configured

**Prerequisites:** `.env` set; Supabase **Email** provider enabled; **Redirect URLs** include your dev origin (e.g. `http://localhost:8080`).

- [ ] **Account** → enter email → **Send magic link** shows success toast.
- [ ] Email link completes sign-in; after redirect, **Account** shows the signed-in email.
- [ ] **Display name** can be saved; reopen menu and confirm it persists after refresh.
- [ ] **Sign out** clears session; menu returns to magic-link form.

## Security spot-check

- [ ] Only **anon** key is in the frontend env (no service role in repo or `.env` committed).
