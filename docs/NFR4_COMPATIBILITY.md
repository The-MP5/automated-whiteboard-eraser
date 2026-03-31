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

## Verification (acceptance)

- [ ] `npm install` succeeds on Node LTS (see `engines`).
- [ ] `npm run build` completes with exit code 0.
- [ ] `npm run preview` — smoke test: canvas draws, countdown starts, obstacle toggle works in **at least two** of Chrome / Firefox / Safari / Edge.
- [ ] No dependency on vendor-specific dev plugins for production (standard Vite + React).

## Out of scope (this subissue)

- Legacy browsers (e.g. IE11) — not supported.
- ROS / hardware runtime compatibility — tracked under robotics integration, not this UI NFR.
