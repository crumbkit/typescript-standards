# Working on typescript-standards

[README.md](README.md) indexes the repository.

- A rule is one table row: its ID, its statement and its check.
- A rule names the cheapest check tier that can enforce it (README.md).
- A rule gives a reason only when the reason is not obvious. Long reasons go
  in the profile's Reasons section.
- A rule has one home. Other files cite its ID.
- A new rule names, in its pull request, the failure it prevents in a
  project that adopts it.
- Rule IDs are never renumbered. A withdrawn rule stays in its table, marked
  withdrawn.
- A rule that depends on a toolchain fact cites it in README.md's Toolchain
  facts, and the fact names its source and the date it was checked.
- A version in the baseline is exact, and it is the newest release that is
  at least 7 days old when it is checked (`npm view <package> time`).
- A change to a baseline file makes the same change to the example app, and
  the example passes every step of the pull-request lane.
- Rules describe general patterns. They never describe the internals of a
  project that adopts them.
- Write plain declarative sentences with a named subject. A limit says what
  it counts and what happens when it is reached.
- Commit messages and pull request bodies describe the rules that changed
  and carry no attribution lines.

## Before every push

Run these from `examples/snippetshelf`, with the Node that `.node-version`
names and the pnpm that `packageManager` names:

```bash
pnpm install --frozen-lockfile
pnpm run lint && pnpm run typecheck && pnpm run knip
pnpm run test && pnpm run build && pnpm run bundle && pnpm run size
pnpm run acceptance
../../bin/drift
```
