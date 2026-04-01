# NFR4 — Compatibility (Subissue 4.4)

**Requirement:** The web simulator SHALL run on a defined baseline of end-user browsers and developer tooling so demos and classroom use are predictable.

## Supported environments

| Layer | Baseline | Notes |
|--------|-----------|--------|
| **Browsers (production build)** | Last 2 major versions of **Chrome**, **Edge**, **Firefox**, and **Safari**; not dead browsers | Matches `browserslist` in `package.json`; Autoprefixer and toolchain use this |
| **JavaScript runtime (bundle)** | **ES2020** | Aligned with `tsconfig.app.json` `target` / Vite `build.target` |
| **Node.js (development & CI)** | **20.x or 22.x LTS** | Declared under `engines` in `package.json`; use `nvm` / installer LTS |

## Code / config traceability

| Artifact | Purpose |
|----------|---------|
| [`package.json`](../package.json) | `browserslist`, `engines.node` |
| [`vite.config.ts`](../vite.config.ts) | `build.target: 'es2020'` |
| [`tsconfig.app.json`](../tsconfig.app.json) | `target` / `lib` ES2020 + DOM |

## Verification (acceptance) — Subissue 4.4

| Criterion | Status | How verified |
|-----------|--------|----------------|
| `npm install` / `npm ci` on Node LTS | Met | `package.json` `engines`; **GitHub Actions** `CI — build` on Node **20** and **22** (`.github/workflows/ci-build.yml`) |
| `npm run build` exit 0 | Met | Same workflow runs `npm run build` on each Node version |
| No vendor-only dev plugins in production bundle | Met | `vite.config.ts` uses only `react` plugin from `@vitejs/plugin-react-swc`; no Lovable or similar taggers |
| **UAT** — smoke in ≥2 browsers | Manual | Team runs steps below and records evidence in PR or [`NFR4_UAT_CHECKLIST.md`](./NFR4_UAT_CHECKLIST.md) |

### UAT steps (manual)

1. `npm run build && npm run preview` (defaults to **http://localhost:4173** unless configured).
2. In **browser A** and **browser B** (choose from Chrome, Firefox, Safari, Edge):
   - Draw on canvas.
   - **Start erase** → 10 s countdown appears; let it finish or cancel once.
   - Toggle **simulate obstacle** during or before erase and confirm pause/resume behavior matches FR4.
3. Note browser names + versions and date (screenshots optional).

## Out of scope (this subissue)

- Legacy browsers (e.g. IE11) — not supported.
- ROS / hardware runtime compatibility — tracked under robotics integration, not this UI NFR.
