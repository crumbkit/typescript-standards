# 0001: Toolchain choices

Decided 2026-11-01. Each choice below names what it was chosen over and why.
The versions are in README.md.

## pnpm 12, with the version pinned in `packageManager`

pnpm installs from a content-addressed store, so a second checkout installs
in seconds. It refuses to run install scripts that `allowBuilds` does not
list, and `minimumReleaseAge` holds back a release until it is 7 days old.
npm has neither setting. Bun's package manager has fewer settings for
install scripts and release age, and Bun as a runtime adds a second
JavaScript engine next to the Node that Vite and Playwright need.

Node is pinned in `.node-version` alone, which actions/setup-node, mise, fnm
and nodenv all read. The baseline does not repeat it in `engines.node`: pnpm
ignores the field unless `engineStrict` is on, and `engineStrict` also fails
the install of any dependency whose own `engines` field leaves out the
pinned Node.

## Biome, not ESLint with typescript-eslint and Prettier

The candidates were ESLint with typescript-eslint's type-checked rules and
Prettier, and Biome. Biome is the choice, for three reasons:

- typescript-eslint 8.72.1 supports TypeScript below 6.1, and TypeScript
  7.0.2 exports no stable compiler API for it to use. ESLint's type-checked
  rules would hold the project on TypeScript 6.0.3.
- eslint-plugin-jsx-a11y, the usual accessibility plugin, was last published
  in October 2024 and declares no support for ESLint 10.
- Biome is one pinned binary that formats and lints TypeScript, CSS and
  JSON, sorts imports and sorts Tailwind classes. The ESLint route needs
  ESLint, typescript-eslint, a hooks plugin, an accessibility plugin,
  Prettier, a Prettier Tailwind plugin and the configuration that joins them.

What the choice gives up: Biome infers types itself, and its inference
covers fewer types than the TypeScript checker, so its promise rules can
miss a promise whose type it cannot infer. typescript-eslint's
`no-unsafe-*` rules, which follow an `any` through the code, have no Biome
equivalent; BASE-3 forbids writing `any`, but a dependency's `any` still
flows in unchecked. TanStack
Query's ESLint plugin, which checks that a query key holds every value its
function reads, has no Biome equivalent; APP-10 states that rule for
review. The rules that Biome lacks are review rules until Biome or
typescript-eslint can check them against TypeScript 7.

## TanStack Router, with routes defined in code

TanStack Router is the default for an app with more than one screen, because
it types each path and search parameter from the route definitions, so `tsc`
rejects a link to a route that does not exist. It accepts zod schemas for
path and search parameters. The standard leaves its loaders unused (APP-15),
so TanStack Query alone fetches. React Router is the common alternative, and
it types route parameters only in its framework mode, through generated
types.

Routes are defined in code in one file. File-based routing would add
TanStack's Vite plugin and a generated `routeTree.gen.ts` that every change
rewrites. A small app has a few routes, which one file holds. An app with
one screen has no router at all (APP-15).

## zod, not valibot

Both implement Standard Schema, which TanStack Router accepts. zod is the
choice because shadcn/ui's form components and most of the React ecosystem
use it, so a project needs one schema library rather than two. valibot's
bundle is smaller for the same schemas. A project whose first-load budget
(APP-3) cannot carry zod can move to `zod/mini`, which has the same schemas
with a functional API that the bundler can trim.

## jsdom for component tests, Playwright for acceptance tests

Vitest's browser mode would run component tests in Chromium. jsdom is the
choice for component tests because they then run in milliseconds and need no
browser install, so `pnpm run test` works on a fresh checkout. Everything
that needs a real browser, such as layout, the appearance media query,
scrolling and axe's contrast checks, is covered by the Playwright acceptance
tests, which run in both appearances.

## Size budgets with size-limit

Vite's `chunkSizeWarningLimit` only warns, and only per chunk. size-limit
fails the lane, measures with Brotli as a browser receives the files, and
holds its budgets in `package.json`. Its `@size-limit/file` plugin measures
built files without bundling them again, so it adds two small packages.

## No React Compiler

`@vitejs/plugin-react` 6 can run the React Compiler through Babel. It is left
out of the baseline because it adds Babel to every build, and APP-16 already
forbids memoisation that no measurement asks for. A project that measures a
slow render may add it as a decision in its map.

## Where the standard differs from an existing embedded app

The rules were checked against an existing React app whose bundle a Rust
binary embeds. The standard keeps its choices of pnpm 12, React 19, Vite 8,
Tailwind 4 with tokens in one stylesheet that switch under
`prefers-color-scheme`, a committed `dist/` with fixed file names that a
Rust binary embeds with `include_bytes!`, and a lint step that fails when a
build changes the committed bundle. EMB-1 to EMB-3 come from that setup. It
differs in these places:

- The existing app uses TypeScript 6.0.3 and a tsconfig with `strict` alone. The
  standard uses TypeScript 7.0.2 and adds `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `verbatimModuleSyntax` and
  `erasableSyntaxOnly` (BASE-1).
- The existing app has no lint or format step. The standard adds Biome (BASE-2,
  BASE-10).
- The existing app casts response bodies with `as`. The standard parses them with
  zod at the boundary (BASE-21) and forbids the cast (BASE-3).
- The existing app runs every test in Chromium through Vitest's browser mode, and
  compares Storybook stories with golden screenshots inside a pinned
  Playwright container. The standard runs component tests in jsdom and
  acceptance tests through Playwright, and makes Storybook and screenshot
  goldens optional. Golden screenshots differ between platforms, which is
  why the existing app pins an arm64 container; a small app gets most of their value
  from axe and role-based assertions in both appearances, without the
  container.
- The existing app builds inside a Docker container so that its screenshots match.
  The standard builds with the pinned Node and pnpm on the host, and EMB-4
  makes the bundle the same on every machine. The example's bundle was
  built on macOS and in a Linux container from the same commit, and the two
  builds wrote identical bytes.
- The existing app does not restrict Tailwind's source detection. The standard
  does (EMB-4), because the example's stylesheet changed when an unrelated
  file in the app changed.
