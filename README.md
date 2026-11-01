# typescript-standards

These are the rules that Luke Randall's TypeScript and React projects follow.
They cover React apps built with Vite, Tailwind CSS, shadcn/ui and TanStack,
including apps whose built bundle a Rust program embeds and serves. They are
opinionated on purpose. Each rule says what to do, gives a reason when the
reason is not obvious, and names the cheapest check that enforces it.

The rules are a draft. Nothing here is versioned or tagged yet.

[rust-standards](https://github.com/crumbkit/rust-standards) and
[swift-standards](https://github.com/crumbkit/swift-standards) are the
companion sets for Rust and Swift. The rules that apply to any language, such
as test-first, the simplest design that works and a module diagram in every
plan, say the same thing in all three.

## Index

```text
README.md                      profiles, lanes, check tiers, toolchain, versions
AGENTS.md                      rules for editing this repository
adoption.md                    the typescript-standards.toml format
profiles/
├── base.md                    BASE-*  every project
├── app.md                     APP-*   React apps that run in a browser
└── embedded.md                EMB-*   apps whose bundle a program embeds
baseline/                      files a project copies unchanged
├── .node-version              the exact Node release (BASE-13)
├── package.json               the scripts, the pins and the size budgets
├── pnpm-workspace.yaml        pnpm's install settings (BASE-13, BASE-14)
├── tsconfig.json              the compiler settings (BASE-1)
├── biome.jsonc                the lint and format settings (BASE-2, BASE-10)
├── knip.json                  the unused-code check (BASE-11)
├── vite.config.ts             the build (EMB-2)
├── vitest.config.ts           unit and component tests (APP-6)
├── vitest.setup.ts            the component-test setup (APP-6)
├── playwright.config.ts       acceptance tests in light and dark (APP-7)
├── components.json            the shadcn/ui settings (APP-5)
└── .gitignore                 ignores that keep the committed bundle (EMB-3)
templates/                     files a project copies and edits
├── ci.yml                     a GitHub Actions workflow that runs the lanes below
└── dependabot.yml             weekly updates of every pin Dependabot can move (BASE-13)
examples/
└── snippetshelf/              a small app that adopts every profile and passes every check
docs/decisions/                the choices behind the rules, and review findings not taken
bin/drift                      checks that the example uses the baseline unchanged
```

## Profiles

- A project adopts `base` and every other profile that describes it.
- A project ignores the rules of a profile it does not adopt.
- A project may use a baseline file or setting from a profile it does not
  adopt. Using the file adopts none of that profile's rules. A project that
  does not adopt `embedded` deletes the `rolldownOptions` block from
  `vite.config.ts`, as the comment there says, and the `bundle` script.

## Pull-request lane

Every project runs these steps on each pull request (BASE-16). Each step
except `workflows` and `install` is a script in `package.json`, so CI and a
person or agent at a terminal run it by the same name, such as
`pnpm run lint`.

Within one job the steps run cheapest first, so a pull request fails as early
as it can. `workflows` reads only the workflow files and runs before the
install. A project may split the steps across parallel jobs instead.

| Step | Command | Runs when |
| --- | --- | --- |
| `workflows` | `zizmor .` | the project has `.github/workflows/` |
| `install` | `pnpm install --frozen-lockfile` | always |
| `format` | `biome format .` | always |
| `lint` | `biome lint --error-on-warnings .` | always |
| `typecheck` | `tsc` | always |
| `knip` | `knip` | always |
| `test` | `vitest run` | always |
| `build` | `vite build` | always |
| `bundle` | a `git status` that must report nothing under `dist/` | the project adopts `embedded` (EMB-1) |
| `size` | `size-limit` | the project adopts `app` (APP-3) |
| `acceptance` | `playwright test` | the project adopts `app` (APP-7) |

[templates/ci.yml](templates/ci.yml) runs these steps in this order. Before
a push, a person or agent runs `pnpm run fix`, which formats the code and
applies Biome's safe fixes, and then the steps from `format` on.

## Scheduled and release checks

These checks run outside the pull-request lane, because their result can
change while the project does not.

| Check | Command | Runs |
| --- | --- | --- |
| `advisories` | `pnpm audit` | daily on main, and in the release lane, which it blocks (BASE-17) |

## Check tiers

Every rule names its check. The tiers run from cheapest to most expensive.

| Tier | Where it runs | Cost |
| --- | --- | --- |
| `lint` | `tsc` or Biome, in the `typecheck` and `lint` steps | seconds |
| `tool` | one other command in the pull-request lane | seconds |
| `drift` | a comparison of the project's files with the baseline | seconds |
| `test` | a test that the project writes | the test's runtime |
| `release` | the release lane | minutes |
| `review` | a reviewer reading the change | the reviewer's time |

- A rule uses the cheapest tier that can check it.
- A `review` rule moves to a cheaper tier as soon as a tool can check it.
- [bin/drift](bin/drift) checks this repository's example against the
  baseline. No drift check for adopting projects ships yet. Until one does,
  a reviewer checks each `drift` rule against the project's files. The rules
  are written so that a script can check them.

## Toolchain facts

These facts were checked against the npm registry and primary sources on
2026-11-01. A rule that depends on one cites it.

- Node 26.13.0 is the current LTS release (nodejs.org, 28 October 2026).
- TypeScript 7.0.2 is the current release. TypeScript 7 is the compiler
  rewritten in Go. Its package exports only an unstable API, and
  typescript-eslint 8.72.1 declares support for TypeScript below 6.1, so
  ESLint's type-checked rules cannot run against TypeScript 7.
- Biome 2.6 lints and formats TypeScript, JSX, CSS and JSON. Its `types`
  domain infers types without the TypeScript compiler, which the promise and
  `switch` rules need, and its `tailwind` domain checks Tailwind 4 classes.
  These rules are in Biome's nursery group, so their behaviour can change
  in a minor release.
- pnpm 12 writes `pnpm-lock.yaml` as two YAML documents when the project
  pins its pnpm version. GitHub's dependency graph does not read that form
  yet, so Dependabot opens version updates but no security alerts for those
  dependencies (GitHub changelog, "Dependabot now supports npm 12, pnpm 11
  and 12, and Bun 1.4").
- pnpm's `minimumReleaseAge` setting, in minutes, refuses to resolve a
  version younger than that age, and `allowBuilds` lists the packages that
  may run install scripts.
- The shadcn CLI 4.22 writes components that import `cn` from the `cn`
  package, which replaces `clsx` and `tailwind-merge`.
- Vite 8 bundles with Rolldown, configured through `build.rolldownOptions`,
  and resolves tsconfig `paths` itself when `resolve.tsconfigPaths` is set.
- Tailwind CSS 4 detects source files automatically unless the import names
  them with `source(...)`.

The baseline pins these versions, and the example app shows that they work
together.

| Package | Version | Package | Version |
| --- | --- | --- | --- |
| node | 26.13.0 | pnpm | 12.15.0 |
| typescript | 7.0.2 | @biomejs/biome | 2.6.3 |
| react, react-dom | 19.3.1 | @types/react, @types/react-dom | 19.3.0 |
| vite | 8.3.5 | @vitejs/plugin-react | 6.1.2 |
| tailwindcss, @tailwindcss/vite | 4.3.3 | tw-animate-css | 1.4.0 |
| @tanstack/react-query | 5.104.5 | @tanstack/react-router | 1.170.46 |
| zod | 4.6.7 | radix-ui | 1.8.1 |
| cn | 0.5.0 | class-variance-authority | 0.7.1 |
| lucide-react | 1.61.0 | shadcn (CLI) | 4.22.1 |
| shiki | 4.5.0 | @observablehq/plot | 0.6.17 |
| vitest | 5.0.5 | jsdom | 30.1.3 |
| @testing-library/react | 16.3.3 | @testing-library/dom | 10.4.2 |
| @testing-library/user-event | 14.6.8 | @testing-library/jest-dom | 7.0.1 |
| @playwright/test | 1.64.1 | @axe-core/playwright | 4.14.0 |
| knip | 6.43.0 | size-limit, @size-limit/file | 14.3.0 |
| @types/node | 26.6.5 | zizmor | 1.31.1 |

Each version was the newest release at least 7 days old on 2026-11-01, so
that pnpm's release-age setting (BASE-14) installs it. Shiki and Observable
Plot are not in the baseline's `package.json`, and a project adds the one it
uses at the version above.

## Versions

- A rule ID never changes meaning. A withdrawn rule keeps its ID and is
  marked withdrawn.
- A project names the version it follows in `typescript-standards.toml`
  ([adoption.md](adoption.md)). Nothing upgrades a project automatically.
- Each version will be a tag `v<version>` on main once the first version is
  released.

## Licence

These standards are available under either the [MIT licence](LICENSE-MIT)
or the [Apache License, Version 2.0](LICENSE-APACHE), at your option.
