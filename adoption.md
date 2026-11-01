# Adoption map

A project that adopts these standards keeps `typescript-standards.toml` at
the root of its app. The map says which profiles the project adopts, where it
meets the rules that need a local owner, which choices it made where a rule
leaves one open, and where it breaks a rule.
[examples/snippetshelf/typescript-standards.toml](examples/snippetshelf/typescript-standards.toml)
is a worked example.

## Tables

| Table | Holds | Required |
| --- | --- | --- |
| `schema` | `"typescript-standards/adoption/v1"` | yes |
| `standards` | `version`, and the `commit` of this repository that the map was last reviewed against | yes |
| `profiles` | the adopted profiles, always including `"base"` | yes |
| `[[binding]]` | `rule`, `owners` (files), `checks`, `note`: where the project meets a rule | for BASE-7 when the project uses storage, and for EMB-5; optional for any other rule |
| `[[decision]]` | a choice that a rule leaves to the project | see below |
| `[[exception]]` | `rule`, `paths`, `items`, `owner`, `reason`, `correction` | for each place that breaks a rule |

## Decisions

A decision has four fields, and none may be empty:

- `id`: one of the names in the table below, or a name the project chooses
  for a rule it sets itself.
- `requirement`: what the project does.
- `reason`: why it does that, and, for a check that nothing waits for, the
  failure the check catches and why finding it after merge is safe.
- `realizations`: the files that carry the decision out. Each path exists.

| Decision | Required when | `requirement` states |
| --- | --- | --- |
| `lanes` | always (BASE-16) | each lane: what runs, its trigger, what waits for it, and the pull-request lane's time budget |
| `budgets` | the project adopts `app` (APP-3) | each size budget and what it covers |

- A merge waits for a check only when branch protection requires it. The
  `lanes` decision names the required checks, and a reviewer compares them
  with branch protection, because the repository's files do not show it.
- A project may record any stricter rule it sets for itself, such as a lower
  file length limit, as a decision.

## Exceptions

- An exception covers one rule at the listed `paths` (files, or directories
  ending in `/`) or `items` (baseline entries such as
  `tsconfig:exactOptionalPropertyTypes` or `biome:nursery/noFloatingPromises`).
- An exception lists at least one path or item.
- `owner` names the person who removes the exception. `reason` says why the
  rule is broken. `correction` says what removes the exception.
- An exception whose paths no longer exist, or that covers nothing, is
  deleted in the change that makes it stale.
- A finding suppressed at the code with `// biome-ignore <rule>: <reason>`
  needs no exception. The comment's reason is the record (BASE-2).
