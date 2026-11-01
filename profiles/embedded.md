# embedded

A project adopts this profile when a program, such as a Rust binary, embeds
the built app and serves it. The project commits the built bundle, so the
program builds without Node.

## tool

| ID | Rule | Check |
| --- | --- | --- |
| EMB-1 | A build of the committed source leaves the committed bundle unchanged. The `bundle` step runs after `build` and fails when git reports any changed, deleted, untracked or ignored file under `dist/`. The pull request that changes the app commits the rebuilt bundle in the same commit as the change. | the `bundle` step |

## drift

| ID | Rule | Check |
| --- | --- | --- |
| EMB-2 | The build writes fixed file names: `assets/app.js` for the entry, `assets/<name>.js` for each lazily loaded chunk and `assets/<name>.<ext>` for every other file, as [baseline/vite.config.ts](../baseline/vite.config.ts) sets. | drift |
| EMB-3 | Commit `dist/`, and un-ignore it with `!dist/` in the app's `.gitignore`, so a global ignore of `dist` cannot hide it. The build writes no source maps. | drift |
| EMB-4 | The bundle depends only on the committed source, the lockfile and the pinned Node and pnpm (BASE-13). Tailwind reads class names only from `src/`, through `@import "tailwindcss" source("./")` in `src/index.css`. The build reads no clock, environment variable or git state, so it writes the same bytes on every machine. | drift for the import, review for the rest |

## test

| ID | Rule | Check |
| --- | --- | --- |
| EMB-5 | The program embeds the bundle from the committed files at compile time, for example with `include_bytes!` for each fixed name or `include_dir!` for the whole directory, and its build never runs Node or pnpm. A test in the program checks that every file under `dist/` is served, with the right media type, so a new chunk that the program does not embed fails the test. When the program is published as a crate, the crate's `include` list contains `dist/`. | a test in the program |

## review

| ID | Rule |
| --- | --- |
| EMB-6 | The app is one page at `/`. It routes with hash history (`createHashHistory`), so the program serves only the bundle's files and answers no other path with the page. The app reaches its API at relative paths under `/api/`, on the origin that served the page, and `pnpm dev` proxies `/api` to a locally running program through Vite's `server.proxy`. The program serves the bundle's files with `Cache-Control: no-cache`, because their names do not change between versions, and with a `Content-Security-Policy` of at least `default-src 'self'`. A chart library that sets `style` attributes, such as Observable Plot, needs `style-src 'self' 'unsafe-inline'` as well. |

## Reasons

- EMB-1: A bundle that does not match its source ships behaviour that no
  reviewer saw. Git's `--ignored` status also reports a built file that a
  global ignore would hide.
- EMB-2: A name with a content hash changes on every build, so the program's
  list of embedded files would change with it. A fixed name keeps that list,
  and the diff of the bundle, readable.
- EMB-4: Tailwind's automatic source detection reads every file git does
  not ignore, including tests, configuration and documentation. A word in
  one of them that happens to be a utility name, such as `fixed` or
  `container`, adds a rule to the built stylesheet, so an edit to a README
  changes the bundle.
- EMB-5: A Rust contributor builds the program with Cargo alone, and a
  `cargo install` from crates.io works without Node.
- EMB-6: History routing needs the program to answer every unknown path
  with the page, which also answers paths that should be a 404. A hash route
  never reaches the program.
