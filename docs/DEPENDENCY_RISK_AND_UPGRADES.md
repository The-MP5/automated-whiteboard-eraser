# Dependency Risk Guardrails & Upgrade Strategy

> **Risk task R3 (#95).** Tracks external dependency risk (Supabase,
> Fabric, React, Vite, Radix, etc.) and defines the pinned / narrowed
> upgrade process with verification steps. Normative: any PR that
> bumps a dependency must cite the tier below and run the tier's
> verification matrix.

---

## 1. Risk tiers

Every dependency falls into one of four tiers. Tier decides the
upgrade cadence, who approves, and how the change is verified.

| Tier | Meaning | Version policy | Upgrade cadence | Approval |
|---|---|---|---|---|
| **T1 — Critical / external service** | Breakage takes down the product or corrupts data; external SaaS contract. | **Exact-pin on major**, `~` (patch-only) on minor during stabilization windows. No auto-merge. | Opportunistic, never on a Friday; tracked as its own issue. | Human review + full verification matrix (§5). |
| **T2 — Rendering / canvas / realtime** | Breakage silently corrupts the whiteboard experience (wrong strokes, lost snapshots, FPS regressions). | Caret (`^`) within current major only. Major bump = RFC first. | Monthly; majors behind a feature branch. | Human review + UI smoke test (§5.3). |
| **T3 — UI primitives (Radix, lucide, shadcn helpers)** | Breakage is cosmetic or a single component; easy to revert. | Caret (`^`) within current major. | Grouped weekly via Dependabot (§4). | Passing CI is sufficient. |
| **T4 — Build / dev tooling** | Breakage is contained to dev (TS compiler, ESLint, plugins, `@types/*`). | Caret (`^`); follow upstream majors on their own timeline. | Grouped weekly via Dependabot. | Passing CI is sufficient. |

## 2. Current dependency register

Grounded in the real `package.json` on `main`. Update this table as
part of any bump PR.

### T1 — Critical / external service

| Package | Current | Why it's T1 | Upgrade notes |
|---|---|---|---|
| `@supabase/supabase-js` | `^2.86.0` | Backs auth, RLS, and every future server-side snapshot / audit path (see R2 / #94). A 3.x would require auth-flow and RLS re-testing end-to-end. | Exact-pin the moment 3.x appears upstream. Do not take 3.x without rewriting the RLS + anon-write tests described in R2 §5. |
| `kortex_api` (Python, robot side) | Vendored wheel from Kinova artifactory (`robot/requirements.txt`) | Breakage = robot cannot move. Kinova publishes infrequently; each wheel is effectively exact-pinned. | Wheel URL pinned in `robot/README.md`. Bump only after a successful `python erase_whiteboard.py --verify` dry-run on physical hardware. |

### T2 — Rendering / canvas / realtime

| Package | Current | Why it's T2 | Upgrade notes |
|---|---|---|---|
| `fabric` | `^6.9.0` | Drives the whiteboard canvas itself. Fabric 5→6 was breaking (ESM, API renames); future majors are assumed breaking until proven otherwise. | Majors: feature-branch, run UI smoke test (§5.3) and snapshot visual diff before merge. |
| `react` / `react-dom` | `^18.3.1` | Every component and the simulation hooks depend on React 18 semantics (concurrent, `useSyncExternalStore`). 19 has server-component / async-transition surface changes. | React 19 upgrade = RFC + all hooks re-audited against `src/simulation/*` for time-sensitive updates. |
| `vite` | `^5.4.19` | Build and dev-server contract for the web app; affects `.env` handling and SSR posture. | Follow React upgrade cadence; re-run R2 `.env` rules (§4) after any Vite major. |
| `@tanstack/react-query` | `^5.83.0` | Caches server state; 5.x changed the retry / suspense contract. A 6.x could silently change refetch semantics. | Majors: re-verify any query that triggers safety UI; add smoke test for auth-gated queries. |
| `recharts` | `^2.15.4` | Status dashboards and any future telemetry chart. 3.x introduces breaking API. | Majors: re-render each chart and diff the output. |
| `sonner` | `^1.7.4` | Toasts include safety-state transitions (FR4). Breakage hides user-visible safety feedback. | Bump only with a visual check on all `toast.*` call sites in `useWhiteboardSimulation`. |

### T3 — UI primitives

`@radix-ui/*` (accordion, alert-dialog, aspect-ratio, avatar,
checkbox, collapsible, context-menu, dialog, dropdown-menu,
hover-card, label, menubar, navigation-menu, popover, progress,
radio-group, scroll-area, select, separator, slider, slot, switch,
tabs, toast, toggle, toggle-group, tooltip), `lucide-react`,
`class-variance-authority`, `clsx`, `cmdk`, `date-fns`,
`embla-carousel-react`, `input-otp`, `next-themes`,
`react-day-picker`, `react-hook-form`, `react-resizable-panels`,
`react-router-dom`, `tailwind-merge`, `tailwindcss-animate`, `vaul`,
`zod`, `@hookform/resolvers`.

Caret within current major. Dependabot groups all Radix packages
into a single weekly PR (§4).

### T4 — Build / dev tooling

`typescript`, `vite` (dev plugins only), `@vitejs/plugin-react-swc`,
`eslint`, `@eslint/js`, `eslint-plugin-react-hooks`,
`eslint-plugin-react-refresh`, `typescript-eslint`,
`@tailwindcss/typography`, `tailwindcss`, `postcss`, `autoprefixer`,
`globals`, `@types/node`, `@types/react`, `@types/react-dom`.

Caret. Dependabot groups weekly (§4).

## 3. Pinning policy

1. **Default is caret (`^`) within the current major.** npm / yarn
   semver ranges are the baseline.
2. **T1 packages must be exact-pinned on any major bump** (drop the
   caret, commit the resolved version). Return to `^` only after the
   full verification matrix passes on staging.
3. **Never loosen a range.** A PR may tighten `^` → `~` or `~` →
   exact, but never the reverse.
4. **Lockfile is authoritative.** `package-lock.json` is always
   committed. Do not run `npm install --no-save` in CI.
5. **Robot side.** Python dependencies in `robot/requirements.txt`
   are pinned exactly (`pkg==X.Y.Z`). The Kinova wheel URL in
   `robot/README.md` is the only mutable pin; bump via a tracked
   issue.

## 4. Automation — Dependabot

`.github/dependabot.yml` (added alongside this policy) configures:

- **npm ecosystem**, weekly on Monday, grouped updates:
  - `supabase` group — `@supabase/*` (T1). Label `tier/1`.
  - `fabric` group — `fabric` (T2). Label `tier/2`.
  - `react` group — `react*`, `@types/react*` (T2). Label `tier/2`.
  - `radix` group — `@radix-ui/*` (T3). Label `tier/3`.
  - `tooling` group — everything under `devDependencies` (T4). Label
    `tier/4`.
  - `other` — ungrouped fallback, label `tier/3`.
- **GitHub Actions ecosystem**, weekly.
- **Max 5 open PRs** per ecosystem to prevent flood.

Humans still review every T1 / T2 group PR.

## 5. Verification matrix

### 5.1 T3 / T4 bumps (passing CI only)

- [ ] `npm ci` clean.
- [ ] `npx tsc --noEmit` clean.
- [ ] `npm run lint` clean.
- [ ] `npm run build` succeeds.
- [ ] Dependabot PR body shows no breaking changes in the
  changelog(s).

### 5.2 T2 bumps (rendering / realtime)

Everything in §5.1 plus:

- [ ] Manual smoke test — open the app, draw on the canvas, save a
  snapshot, reload, verify the snapshot list renders.
- [ ] Toasts still surface for Start / Pause / Stop and for the
  rejection codes owned by `commandGuards.ts`.
- [ ] No console errors during a normal session.
- [ ] If `fabric` is in scope — re-run a visual diff of a reference
  whiteboard (`docs/` sample) before and after.

### 5.3 T1 bumps (Supabase / kortex)

Everything in §5.1 and §5.2 plus:

- [ ] RLS re-verified per R2 §5 — seed test attempts `anon` writes
  to `snapshot_notes`, `system_logs`, `audit_events`, `voice_intents`
  and receives 401/403.
- [ ] Auth flow re-tested in staging project (not production).
- [ ] For `kortex_api`: `python erase_whiteboard.py --verify` passes
  on the actual arm before merge.
- [ ] If any new scope or claim appears in the Supabase anon JWT,
  R2 §4.2 is re-audited.

## 6. Incident response — a bad upgrade landed

1. Revert the dependency PR directly (`git revert`) — never hot-patch
   a downstream workaround on top of a bad bump.
2. Open an issue titled `R3: <package> <bad version> regression`
   with the failure mode and reproduction.
3. Downgrade in `package.json` to the last-known-good exact version
   (move the package into an exact pin even if it is T3, until the
   upstream is fixed).
4. Record the bad version in this doc's §8 (**Known-bad versions**)
   so future upgrades don't walk back into it.

## 7. Cadence & ownership

| Tier | Owner | Cadence |
|---|---|---|
| T1 | Project lead + simulation owner | As-needed, tracked as issues |
| T2 | Frontend / rendering owner | Monthly |
| T3 | Anyone on the team | Weekly (Dependabot) |
| T4 | Infra owner | Weekly (Dependabot) |

## 8. Known-bad versions

None recorded yet. Populate as incidents occur (§6).

## 9. Cross-links

- R1 — [`AI_VERIFICATION_CHECKLIST.md`](./AI_VERIFICATION_CHECKLIST.md) — any
  dependency bump that *also* touches FR4 / NFR1 / Story 6 code must
  run R1 as well.
- R2 — [`DATA_RETENTION_AND_SECURITY.md`](./DATA_RETENTION_AND_SECURITY.md) —
  any `@supabase/*` bump that changes the auth / JWT / RLS contract
  re-opens R2 §5.
