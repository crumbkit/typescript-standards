# 0003: Generated schemas for wire types that another program owns

Decided 2026-11-04. BASE-21 gives every type one zod schema and names two
ways to write it. This record says why a wire type that another program
owns gets a generated schema, while every other type keeps a hand-written
one.

## The problem

Some apps talk to a server whose own types are the source of every wire
type. A Rust server, for example, defines each request and response as a
struct and publishes an OpenAPI 3.1 document built from those structs. If
the app writes its zod schemas by hand, each type then has two homes, the
struct and the schema, and nothing checks that they agree. A field that the
server renames or makes optional reaches the app as a parse failure in
production, or as a value the app accepts and misreads.

## The choice

A generator writes the zod schemas from the other program's published
schema, and the project commits the output in `src/api/generated/`. The
struct stays the one home of the type, and the generated schema is its copy
in TypeScript. Types still come from `z.infer`, so the rest of BASE-21 holds
unchanged. Shapes that exist only in the UI, such as a form, have no other
owner, so they stay hand-written.

The project commits the generated files, and its `schemas` step regenerates
them and fails when they differ. A reviewer then sees the change to the
wire types in the pull request's diff, and a build needs neither the server
nor the generator to run first. A pull request that changes the published
schema without regenerating fails the step.

Generated files live in one directory and start with a comment that names
the generator and the source. The directory lets the baseline's Biome and
knip settings exempt the files by one pattern, and lets a reviewer skip
them. The comment says where a change must be made instead.

## What the baseline changes

- Biome neither formats nor lints `src/api/generated/`, because the next
  regeneration would undo any fix. `tsc` still checks the files.
- knip does not report unused exports in `src/api/generated/`, because the
  generator writes a schema for every type in the published schema, and an
  app uses only some of them. knip still reports a generated file that
  nothing imports.
- BASE-15's line limit does not apply to generated files, because splitting
  one is the generator's choice.
- The baseline has no `schemas` script, because the generator depends on the
  other program. A project that generates schemas adds the script and the
  `schemas` step in `templates/ci.yml`.

## What was not chosen

- Hand-written schemas checked by a test against the published document
  would keep two homes for each type, and the test would have to compare
  two schema languages.
- Generating at build time without committing the output would hide wire
  changes from review, and every build and editor session would need the
  published document and the generator first.
