# Data Retention & Security Controls — Snapshots, Logs, Env, Supabase

> **Risk task R2 (#94).** Policy and implementation notes that must be
> satisfied **before** persistence is expanded (e.g., moving snapshot
> notes or system logs off `localStorage` into Supabase, or logging
> safety / compliance events to an external sink). This document is
> normative: PRs that expand persistence must cite the relevant
> section(s) below.

---

## 1. Data inventory

| Data class | Source | Contains PII? | Current store | Retention today |
|---|---|---|---|---|
| Snapshot note (`SavedNote`) | `createSnapshotNote(pngDataUrl)` (canvas export) | **Possible** — image of whiteboard content can include handwriting, names, student IDs, academic material | `localStorage` (browser only) | Kept until user deletes or clears storage |
| System log (`SystemLog`) | `createSystemLog(type, message)` | No direct PII; may echo user commands and timestamps | `localStorage` (browser only) | Same as above |
| Command / safety / notification / voice / compliance audit events (`*Event` factories in `src/simulation/*Events.ts`) | In-process React state | No direct PII; includes timing + decision codes | In-memory only (no persistence) | Lost on refresh |
| Voice transcript (`VoiceIntent.transcript`) | `parseVoiceIntent(transcript)` | **Yes** — raw speech can contain names, room numbers, incidental PII | In-memory only | Lost on refresh |
| Proximity sensor distance (`ProximityZone` inputs) | Hardware stream | Indirect — presence/location of a person | In-memory only | Lost on refresh |
| Supabase session / auth tokens | Supabase client (`client.ts`) | Yes (identifies the authenticated user) | `localStorage` via `@supabase/supabase-js` | Session lifetime |
| `.env` (`VITE_SUPABASE_*`) | Vite build | Public **anon** key only (not a secret), plus project URL | Filesystem | Persistent |

"PII" here means FERPA-relevant student information (names, photos of
student-authored work, voices, body location) as well as anything
identifying an operator account.

## 2. Governing principles

1. **No PII expansion without an RLS policy.** No snapshot, log, or
   transcript leaves the browser until Row-Level Security policies
   exist for the target Supabase table (see §5).
2. **Minimize by default.** Don't persist a field unless a feature
   actively reads it back. Specifically: **do not** log the full
   `transcript` of a voice command — log the parsed `VoiceIntent.kind`
   and `confidence` instead.
3. **Injectable time.** All event factories already accept an explicit
   `at: Date`. When/if we move to server-side logging, the server
   timestamp replaces the client one to prevent clock skew abuse.
4. **Opaque IDs.** All event / note / log IDs are opaque random
   strings; do not derive them from user input.
5. **Fail closed.** If RLS is not in place or the auth session is
   missing, persistence calls must no-op rather than write under the
   `anon` role.

## 3. Retention policy

| Data class | Short-term (local) | Long-term (if/when persisted) | Hard max |
|---|---|---|---|
| Snapshot note | Session + manual save | 30 days in owner account, then delete | 90 days |
| System log | Session only | 14 days rolling, then delete | 30 days |
| Audit events (safety, notification, compliance, voice, command) | Session only | 90 days, then anonymize (drop `userId`, keep decision codes + timestamps) | 1 year anonymized |
| Voice transcript | **Never persisted** — parsed intent only | Intent `{kind, confidence, at}` only | Same as audit events |
| Proximity sample | In-memory only | Not persisted | — |
| Supabase session | Browser lifetime | N/A (managed by Supabase) | N/A |

Implementation note: `createSnapshotNote` / `createSystemLog` in
[`src/simulation/snapshotAndLog.ts`](../src/simulation/snapshotAndLog.ts)
currently set `timestamp: new Date()`. A future retention job reads
that field; **do not** remove it.

## 4. `.env` hygiene

### 4.1 What kind of key is `VITE_SUPABASE_PUBLISHABLE_KEY`?

It is the Supabase **anon** (publishable) JWT. By design it is
embedded in the client bundle and is **not** a secret; its only power
is the one that RLS grants. It is, however, convention to keep `.env`
files out of version control because they frequently get extended to
hold service-role keys, third-party API tokens, or Stripe keys later,
and people do not always remember to re-sanitize.

### 4.2 Rules (enforced by this PR)

1. `.env`, `.env.local`, `.env.development`, `.env.production` are
   **not** committed. `.env.example` (placeholders only) is the only
   tracked env file. Enforced in `.gitignore`.
2. Only `VITE_`-prefixed variables may be referenced by the browser
   build. `SUPABASE_SERVICE_ROLE_KEY` or any non-`VITE_` secret **must
   never** be referenced from `src/` and **must never** be added to a
   `.env` that ships with the project; they belong in the Supabase
   dashboard or the hosting provider's secret store.
3. PR reviewers must reject any diff that introduces a new non-`VITE_`
   `import.meta.env.*` read, or a `.env*` file that is not
   `.env.example`.

### 4.3 Known gap + follow-up

The historical `.env` tracked on `main` contains **only** the project
URL, project id, and the anon (publishable) key — public-by-design
values — so rotation is not required. The file should still be
un-tracked going forward:

```bash
git rm --cached .env
git commit -m "Stop tracking .env per R2 (#94)"
```

A follow-up issue is tracked for that step so this policy PR does not
destabilize any developer's local build.

## 5. Supabase RLS requirements

Before **any** table below is written to from the client, the listed
policies must exist and be verified (`select * from pg_policies
where tablename = '<name>'`):

### `snapshot_notes`

- `owner_id uuid not null` column, populated with `auth.uid()`.
- **select**: `auth.uid() = owner_id`.
- **insert**: `auth.uid() = owner_id` with a `with check` clause.
- **update / delete**: `auth.uid() = owner_id`.
- No `anon` access. Verified with an unauthenticated request in
  staging.

### `system_logs`

- Append-only from the client's point of view: only `insert` is
  granted to `authenticated`; no `update` / `delete` / `select` for
  end users. A server-side role handles reads for ops.
- `owner_id` column filled with `auth.uid()`; enforced by `with
  check`.
- Retention job runs server-side on a schedule (§3).

### `audit_events` (safety / notification / compliance / voice / command)

- Append-only, same pattern as `system_logs`.
- Payload is the typed event struct (`SafetyEvent`, `ComplianceEvent`,
  etc.) minus any `transcript` field.

### `voice_intents`

- Stores `{ kind, confidence, at, owner_id }` — **never** the
  transcript.
- Same RLS pattern as `snapshot_notes`.

### General

- Every table: `enable row level security` is a migration requirement.
- CI / pre-merge check: a seed test attempts an `anon` write and
  expects `401/403` before the PR introducing the table may merge.

## 6. PII handling specifics

- Snapshot images **may** contain FERPA-protected content. Until RLS
  is in place, snapshots must stay in `localStorage`. When server
  storage is added, it must be bucketed under the owner's uid and
  access-controlled by the same `owner_id` RLS rule.
- Voice: we capture only the parsed **intent** (command type +
  confidence), never the transcript string, when moving off-device.
- Proximity: distance values never identify a person by name; they
  may be persisted for debugging but not exported with account
  linkage.
- Reporting a security concern: open a private security advisory on
  the GitHub repo rather than a public issue.

## 7. Change-management checklist (mandatory for persistence PRs)

Cite this section in the PR body when adding server-side persistence
or a new client → Supabase write path.

- [ ] New data class added to §1 **Data inventory**.
- [ ] Retention window added to §3 table.
- [ ] Affected table has an RLS policy matching §5 and a test proving
  `anon` cannot write.
- [ ] No non-`VITE_` secret was added to any `.env`; none of them are
  committed (§4.2).
- [ ] No voice transcript is persisted (§6).
- [ ] The PR cross-links the R1 AI-verification checklist if the diff
  also touches FR4 / NFR1 / Story 6 (see
  [`AI_VERIFICATION_CHECKLIST.md`](./AI_VERIFICATION_CHECKLIST.md)).

## 8. Owners

- **Data-retention policy + RLS review**: project lead.
- **`.env` hygiene + CI enforcement**: infra owner.
- **Audit-event schema**: simulation module owner (same person who
  maintains `src/simulation/*Events.ts`).

## Appendix — Relevant source

- `src/simulation/snapshotAndLog.ts` — snapshot and system-log
  factories.
- `src/simulation/safetyEvents.ts`, `notificationEvents.ts`,
  `voiceEvents.ts`, `complianceEvents.ts` — audit-event factories
  that would be persisted.
- `src/integrations/supabase/client.ts` — Supabase client init
  (session persisted to `localStorage`).
- `src/types/whiteboard.ts` — `SavedNote` / `SystemLog` types.
