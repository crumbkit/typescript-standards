# base

Every project follows these rules.

## lint

| ID | Rule | Check |
| --- | --- | --- |
| BASE-1 | Every project type-checks with [baseline/tsconfig.json](../baseline/tsconfig.json). It turns on `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, `erasableSyntaxOnly` and `isolatedModules`. A project may add options. Removing or weakening one is an exception in the map. | `tsc` |
| BASE-2 | Every project lints with [baseline/biome.jsonc](../baseline/biome.jsonc), and CI fails on any warning. Suppress a finding only with `// biome-ignore lint/<group>/<rule>: <reason>` on the smallest node that needs it. A rule turned off in the configuration is an exception in the map, except the two overrides the baseline carries. | `biome ci --error-on-warnings .` |
| BASE-3 | Write no `any`, no type assertion other than `as const`, no non-null assertion `!` and no `@ts-ignore`. Code narrows a value with a check, a type predicate or a schema parse (BASE-21). A test may use `@ts-expect-error` with a comment that says what it expects. | `noExplicitAny`, `noUnsafeTypeAssertion`, `noNonNullAssertion`, `noTsIgnore` |
| BASE-4 | Write only TypeScript whose types can be erased: no `enum`, no `namespace` and no constructor parameter properties. A closed set of values is a union of string literals, or a zod enum (BASE-21). | `erasableSyntaxOnly`, `noEnum`, `noNamespace` |
| BASE-5 | Handle every promise. Code awaits it, returns it, or marks it with `void` where nothing waits for the result, such as an event handler that starts a refetch. A promise never stands where a boolean or a callback returning `void` is expected. | `noFloatingPromises`, `noMisusedPromises` |
| BASE-6 | A `switch` over a union handles every member, so adding a member fails the build until each `switch` handles it. | `useExhaustiveSwitchCases`, `noImplicitReturns` |
| BASE-7 | Give each effect, such as the network, storage, the clock or the console, one owning module. Only `src/api/client.ts` calls `fetch`, and only a storage owner that the map names uses `localStorage` or `sessionStorage`. Shipped code never writes to the console. | `noRestrictedGlobals` with the baseline's overrides, which catches only a bare name such as `fetch(...)`, and `noConsole`; review for `globalThis.fetch`, `window.localStorage` and the clock |
| BASE-8 | Import each module from the file that defines it. Write no barrel file that only re-exports other modules, no `export *`, and no import cycle. | `noBarrelFile`, `noReExportAll`, `noImportCycles` |
| BASE-9 | A conditional with more than two outcomes is an `if` chain or a `switch`, never a nested ternary. | `noNestedTernary` |

## tool

| ID | Rule | Check |
| --- | --- | --- |
| BASE-10 | Format every file and order every file's imports with Biome and the baseline's settings. | `biome ci --error-on-warnings .`, which checks formatting and import order as well as lint |
| BASE-11 | Every declared dependency is used, every file is reachable from an entry point, and every export is either imported by another file or used in its own file. | `knip` |

## drift

| ID | Rule | Check |
| --- | --- | --- |
| BASE-12 | A test runner never retries a failed test, and a focused or skipped test fails the lane. Vitest sets `retry: 0`. Playwright sets `retries: 0` and `forbidOnly: true`. | drift on [baseline/vitest.config.ts](../baseline/vitest.config.ts) and [baseline/playwright.config.ts](../baseline/playwright.config.ts); `noFocusedTests`, `noSkippedTests` |
| BASE-13 | Pin every build input. `.node-version` names an exact Node LTS release, and it is the one place the Node version is written. `packageManager` names an exact pnpm version. Every entry in `dependencies` and `devDependencies` is an exact version, and `savePrefix: ""` makes `pnpm add` write one. `pnpm-lock.yaml` is committed, and CI installs with `--frozen-lockfile`. CI installs each tool at a stated version and pins each GitHub Action to a commit. Dependabot opens a pull request each week that moves these pins. | drift for the files, review for the rest |
| BASE-14 | `pnpm-workspace.yaml` sets `minimumReleaseAge: 10080`, so pnpm installs no release younger than 7 days. `allowBuilds` lists every package that may run an install script, and the pull request that adds one says why it needs to. | drift on [baseline/pnpm-workspace.yaml](../baseline/pnpm-workspace.yaml); review for each `allowBuilds` entry |
| BASE-15 | A production `.ts` or `.tsx` file has at most 1,000 lines, counting every line. A file over the limit is split by responsibility, or listed as an exception in the map with a correction. Test files have no limit. | drift |
| BASE-16 | The pull-request lane runs the steps in [README.md](../README.md#pull-request-lane) within a time budget that the map's `lanes` decision states. A check that does not fit the budget runs in another lane that the decision also records. | drift for the decision, review for its content |

## release

| ID | Rule | Check |
| --- | --- | --- |
| BASE-17 | Ship no dependency with a known security advisory. `pnpm audit` runs daily on main and blocks every release. An advisory the project accepts is listed in `auditConfig.ignoreGhsas` in `pnpm-workspace.yaml`, with a comment that says why it does not apply and the date by which it is reviewed again. | `pnpm audit`, scheduled and in the release lane |

## review

| ID | Rule |
| --- | --- |
| BASE-18 | Write the test first. A change starts with a test that fails for want of the behaviour, and a bug fix starts with a test that reproduces the bug. When no automated test can show the change, such as a change of spacing, the pull request says how it was checked, for example with screenshots in light and dark. |
| BASE-19 | Choose the simplest design that works. It keeps every existing feature and its fidelity, and has the fewest types, files and moving parts. Add code only when removing code cannot make the change. Add an abstraction only when it removes two copies or another rule needs it. |
| BASE-20 | Compose small types. Give each domain meaning one type with one validation rule, and build larger values from those types. An identifier is a branded type, such as `z.string().brand<"SnippetId">()`, so two kinds of identifier cannot be swapped. Do not build one large object type whose many optional fields only some callers fill. |
| BASE-21 | Parse input into its type once, where it enters the program: a response body, a route parameter, a search parameter, storage or a message. The zod schema is the type's one home, and the type is `z.infer<typeof Schema>`. Every function inside the program takes the parsed type, and the raw value appears only where the value leaves the program. |
| BASE-22 | A type admits only the states the code handles. Where booleans and optional fields can combine into a state the code cannot handle, use a discriminated union with one member per state that carries that state's data. |
| BASE-23 | Make each outcome the domain expects, such as a refusal or an empty result, a member of the operation's result union. Throw only for technical failures outside the domain's outcomes, such as an unreachable server or a malformed answer. A TanStack Query `queryFn` or `mutationFn` is the exception: it throws a typed error for every failure, including a refused request, because the library takes a thrown error as the query's failure and retries on it (APP-12). Throw only `Error` subclasses. An error that wraps another passes it as `cause` and does not copy it into its message. Code either reports an error or throws it, never both. |
| BASE-24 | Write unit tests with Vitest and name each test with a sentence that states the behaviour it checks. A test owns everything it touches. It never reaches the network: it stubs `fetch` with `vi.stubGlobal`, and Vitest's `unstubGlobals` removes the stub after the test. A test that involves time uses `vi.useFakeTimers()` and never compares elapsed time with an upper bound. |
| BASE-25 | Wait for an event the code can observe, and never sleep to let something happen. Code does not call `setTimeout` to wait for a render, a request or an animation. A component test waits with `findBy*` or `waitFor`, and an acceptance test with Playwright's auto-waiting locators and web-first assertions. |
| BASE-26 | Give every request an `AbortSignal`, every retry a count, and each operation one deadline that covers all its steps. A query passes on the signal TanStack Query gives its `queryFn`. A deadline is `AbortSignal.timeout(ms)`, combined with the caller's signal through `AbortSignal.any`. |
| BASE-27 | Prefer the platform, the framework and an existing dependency to a new one. A pull request that adds a dependency names what it does that they cannot, its licence, its maintainers, whether it runs an install script (BASE-14), and the cost of removing it. A shipped dependency, one that `pnpm licenses list --prod` lists, has one of these licences: MIT, MIT-0, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD, Zlib, Unlicense, CC0-1.0 or BlueOak-1.0.0. A development tool may also use MPL-2.0. |
| BASE-28 | A comment states an invariant, a limit or a reason, and never history. A deliberate shortcut carries a comment that says what it misses and what replaces it. |
| BASE-29 | Every plan includes a module diagram. The diagram shows each module that the change adds or touches, marks which are new, and draws the dependencies between them, including dependencies the change adds or removes. It is written in a text format that renders where the plan is read, such as a Mermaid block in the pull request. |
| BASE-30 | Documents describe current behaviour, and each fact has one home. Plans and logs go in the pull request. `AGENTS.md` names the commands to run before every push. |
| BASE-31 | A new CI check names the failure it catches, why existing checks miss it, its lane and its cost. Prefer a type or compiler check to a text scan. |
| BASE-32 | Use a standard format or a maintained tool before writing a new one. |
| BASE-33 | Spell names out. Use an abbreviation only when it is common outside the project, such as `id`, `url` or `http`. A file is named after what it exports: a component file `SnippetList.tsx`, any other module in lower camel case, such as `queryClient.ts`. |

## Reasons

- BASE-1: `noUncheckedIndexedAccess` types `list[0]` as possibly `undefined`,
  which is what it is at run time. `exactOptionalPropertyTypes` keeps a
  missing field and a field set to `undefined` apart, which matters for JSON
  from a server that omits empty fields. `verbatimModuleSyntax` and
  `erasableSyntaxOnly` keep every file compilable one at a time by stripping
  types, which is how Vite and Node read TypeScript.
- BASE-2: Biome reports a suppression comment that no longer suppresses
  anything, so a stale suppression is found and removed.
- BASE-3: A type assertion tells the compiler what to believe without a
  check at run time, so a wrong assertion becomes a wrong value far from its
  cause.
- BASE-5: A promise that nothing handles loses its rejection, so the
  failure never reaches the person or the error boundary.
- BASE-8: A barrel file makes every importer load every module it lists,
  which slows tests and defeats the bundler's removal of unused code.
- BASE-12: A retry turns a flaky test into a passing one and hides it.
- BASE-13: An unpinned toolchain or dependency changes the build when a new
  version is released, and a pull request then fails for a change it did not
  make.
- BASE-14: Most malicious npm releases are found and withdrawn within days
  of publication, and an install script runs with the developer's or the CI
  runner's rights.
- BASE-15: Long files mix responsibilities and are too large for a person
  or an agent to read whole.
- BASE-17: Dependabot security alerts do not see the dependencies in the
  lockfile that pnpm 12 writes (README.md, Toolchain facts), so `pnpm audit`
  is the advisory check. An advisory can be published after a dependency is
  locked, so a check on pull requests alone misses advisories against code
  already on main.
- BASE-22 follows Yaron Minsky's principle "make illegal states
  unrepresentable" ("Effective ML Revisited", 2011). TypeScript narrows a
  discriminated union on its tag, and BASE-6 makes a `switch` on the tag
  exhaustive, while nothing checks a combination of flags.
- BASE-23: A copied cause loses its type, so a caller cannot inspect it. An
  error that is both reported and thrown is reported again by every caller
  that handles it.
- BASE-26: A request without a signal keeps running after the screen that
  asked for it has gone, and its late answer can overwrite newer data.
