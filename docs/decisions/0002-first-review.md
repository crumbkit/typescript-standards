# 0002: The first review

A reviewer with no earlier context reviewed the repository on 2026-11-01 at
commit 841e52f, for correctness, simplicity and whether a small React 19 and
TanStack app could adopt it. The review had 3 high, 8 medium and 8 low
findings. This record lists what changed for each one, and why the rest did
not change.

## Changed

| Finding | Severity | Change |
| --- | --- | --- |
| A `default-src 'self'` policy blocked the inline styles in Shiki's HTML, so highlighted code lost its colours. | high | The example renders Shiki's syntax tree through `hast-util-to-jsx-runtime` (APP-18). `vite preview` sends the policy, so the acceptance tests run under it, and they fail on any console error (APP-7, EMB-6). That check also found zod's `new Function` probe, which `z.config({ jitless: true })` now turns off. |
| A project without `embedded` that deleted `rolldownOptions` got hashed names, and its first-load budget then measured only `index.html`. | high | README.md lists the four changes such a project makes, including the hashed first-load paths. APP-3 says size-limit skips a path that matches nothing. |
| A route loader that returned its prefetch blanked the page until the data arrived, and a failed request was fetched again when the screen mounted. | high | APP-15 now forbids loaders. Each screen starts its own queries. New tests check the pending state, and that a refused request is fetched once. |
| An invalid path parameter showed the router's default error with the raw zod issue. | medium | The parameter parse throws `notFound()`, and the root route has an `errorComponent` that words the failure (APP-15). A test covers the case. |
| `biome format` and `biome lint` do not check import order. | medium | The `format` and `lint` steps became one `lint` step that runs `biome ci --error-on-warnings .` (BASE-2, BASE-10). |
| knip's `ignoreExportsUsedInFile` contradicted BASE-11. | medium | BASE-11 now says what knip checks. The setting stays, because shadcn/ui's files export values that they also use themselves, such as `buttonVariants`. |
| The baseline's `!dist/` would make a project without `embedded` commit its build. | medium | README.md tells such a project to replace it with `dist/`. |
| Dependabot's npm pull requests fail the `bundle` step, because Dependabot does not rebuild `dist/`. | medium | EMB-1 says a person or agent rebuilds and commits `dist/` on each such branch. |
| The example's axe tags left out WCAG 2.1. | medium | The example adds `wcag21a` and `wcag21aa`. |
| BASE-23 forbade throwing for a refusal, which a `queryFn` must do. | medium | BASE-23 names the `queryFn` and `mutationFn` exception. |
| The example's client had no deadline (BASE-26). | medium | `getJson` combines the query's signal with `AbortSignal.timeout`. It also turns a body that is not JSON into a `shape` failure. |
| `noRestrictedGlobals` misses `globalThis.fetch` and `window.localStorage`. | low | BASE-7 says the lint catches bare names only, and review covers the rest. |
| The highlight query broke APP-10 as written. | low | APP-10 covers server data, and lets a query of local work live in its component. |
| The acceptance test found Shiki's output with a CSS selector. | low | The code block is a labelled region found by role. APP-7 allows a check of a library's own markup to see that the library ran. |
| `vitest.config.ts` imported `./vite.config` without its extension, which Vite warns about. | low | The baseline turns on `allowImportingTsExtensions`, which `noEmit` permits, and imports `./vite.config.ts`. |
| The decision record named an unreleased project and referred to the request that started the work. | low | 0001 describes the app it was checked against without naming it, and no longer refers to that request. |

## Not changed

| Finding | Severity | Reason |
| --- | --- | --- |
| The one tsconfig gives `src/` Node's types, so `process` type-checks in browser code. | low | A second tsconfig for the configuration files and tests would turn `tsc` into `tsc -b` with project references, for a mistake that the build catches: Vite does not define `process` in the browser bundle, and the acceptance tests run the bundle. The tsconfig keeps `node` in `types` until a project hits the mistake; then the split replaces it. |
| `BASELINE-READY` holds a local path and is not in the index. | low | The file was asked for, so that other work could start from the baseline before the prose was written. It is removed when the repository is first published. |
| The example map's `commit` is placeholder text, and its version 0.1.0 does not exist. | low | rust-standards and swift-standards write their examples the same way. A real hash would be stale after the next commit, and 0.1.0 is the version the first tag will have. |
