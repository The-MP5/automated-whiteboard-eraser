# VIBE Refactor — Assignment deliverables (Module 2 gatekeeper)

**Branch:** `vibe/remove-lovable-tagger`
**Target Debt Item:** Part 1, **Debt Item 7** — *Lovable Tooling and Conventions Lock-in*
**Evidence file:** [`build-verification.log`](./build-verification.log)

---

## Copy into GitHub PR description

### 🛡️ VIBE Report

1. **Target Selected:** **`vite.config.ts` + `src/integrations/supabase/client.ts`** — removes the `lovable-tagger` Vite plugin and uninstalls the package, and strips the Lovable-specific `VITE_SUPABASE_PUBLISHABLE_KEY` fallback from the Supabase client. Flagged as **Debt Item 7** in [`docs/DEBT_AND_RISK.md`](./DEBT_AND_RISK.md). This is **low-risk** because `vite.config.ts` is a build-tool file with zero runtime impact on application logic, and the Supabase client change removes a dead secondary fallback that nothing in the codebase currently calls. Core simulation, canvas, and erase-flow files are untouched.

2. **The Verification Event:** When prompted to "remove the Lovable dependency and clean up the config," Cursor collapsed the factory-function form of `defineConfig` down to a plain object, since `mode` was no longer used after removing `componentTagger()`:

   *AI original suggestion (rejected):*
   ```typescript
   export default defineConfig({
     server: { host: "::", port: 8080 },
     plugins: [react()],
     resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
   });
   ```

   *Final implementation (human override):*
   ```typescript
   // Factory form intentionally retained for future env-conditional plugins
   export default defineConfig(() => ({
     server: { host: "::", port: 8080 },
     plugins: [react()],
     resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
   }));
   ```

   The AI’s simplification is correct for the narrow task, but wrong for our project context. Our debt inventory (Part 2, Risk 3) explicitly frames this refactor as a *transition to a standard Vite setup*, and standard Vite docs recommend the factory form as the flexible default for any config that may need to condition plugins on `mode` or `command` (e.g., Sentry in production, Rollup visualizer in build-only mode). Collapsing to a plain object now forces a structural rewrite the next time a dev-only plugin is needed — adding noise to an unrelated future PR. The factory form is kept; the now-unused `mode` destructure is simply removed to keep the signature clean.

3. **Trust Boundary Established:** Before this refactor the build toolchain had an invisible external dependency: `lovable-tagger` was injecting itself into the component tree at dev time via a Vite plugin, with no visibility into what it was doing. Any upstream Lovable change could silently alter dev-server behavior. The Supabase client also silently accepted either of two env-var names, meaning a misconfigured `.env` could produce a live client under one convention and `null` under another with no diagnostic. After this refactor: the build is pure `@vitejs/plugin-react-swc` + standard Vite (zero third-party hooks); the env contract is exactly one variable (`VITE_SUPABASE_ANON_KEY`); and `requireSupabaseEnv()` throws a typed `SupabaseConfigError` with an actionable message if misconfigured. TypeScript reports 0 errors; ESLint reports 0 errors or warnings on the changed files.

4. **Evidence of Execution:** See [`docs/build-verification.log`](./build-verification.log).
   ```
   ✅ tsc --noEmit: 0 errors
   ✅ eslint on changed files: 0 errors, 0 warnings
   ✅ No lovable references remain in src/, vite.config.ts, or package.json
   ✅ lovable-tagger removed from devDependencies
   ```
   All five acceptance criteria from Backlog Item 4 are satisfied (AC1–AC5 checked in the log).

---

## Changed files (for reviewers)

| File | Change |
|------|--------|
| `vite.config.ts` | Remove `lovable-tagger` import and `componentTagger()` plugin; retain factory form; add explanatory comment |
| `src/integrations/supabase/client.ts` | Remove Lovable-specific `VITE_SUPABASE_PUBLISHABLE_KEY` fallback; use `?? ‘’` instead of `||` for null-safety |
| `package.json` | Uninstall `lovable-tagger` from devDependencies |
| `docs/build-verification.log` | Updated evidence log for this refactor |

---

## Before you submit

1. Push branch `vibe/remove-lovable-tagger` and open a PR against `main`.
2. Paste the **VIBE Report** block above into the PR description.
3. Attach the `docs/build-verification.log` file or paste its contents into the PR thread as your evidence screenshot.
4. Link this PR to the GitHub Issue for Backlog Item 4 (*Remove Lovable tooling*) with the `closes #N` keyword.
