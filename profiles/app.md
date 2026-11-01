# app

A project adopts this profile when it builds a React app that runs in a
browser.

## lint

| ID | Rule | Check |
| --- | --- | --- |
| APP-1 | Colour comes only from the token owner (APP-9). The token owner removes Tailwind's default palette with `--color-*: initial`, so a utility such as `bg-red-500` does not exist. No class names a palette colour or an arbitrary value such as `text-[#555]` or `w-[400px]`, and no component sets a colour in a `style` attribute. The files that shadcn/ui writes (APP-5) keep their arbitrary sizes. | `noTailwindRawColors`, `noTailwindArbitraryValue`; review for `style` |
| APP-2 | Every accessibility rule and every React hooks rule fails the lane. A hook runs only at the top level of a component or another hook, an effect lists every value it reads, and a component is never defined inside another component. | Biome's `a11y` group, `useExhaustiveDependencies`, `useHookAtTopLevel`, `noNestedComponentDefinitions` |

## tool

| ID | Rule | Check |
| --- | --- | --- |
| APP-3 | The built app stays within the size budgets in the `size-limit` field of `package.json`: one for the first load (`index.html`, the entry script and the stylesheet) and one for every built file, both measured with Brotli compression. The pull request that raises a budget says what the added bytes buy. | `size-limit` |

## drift

| ID | Rule | Check |
| --- | --- | --- |
| APP-4 | Lay the app out as follows. `index.html` and `src/main.tsx` are the entry points. `src/router.tsx` holds every route (APP-15), and `src/routes/` holds one component per screen. `src/api/client.ts` is the network owner (BASE-7), and `src/api/<resource>.ts` holds one resource's schemas and query options (APP-10). `src/index.css` is the token owner (APP-9). `src/components/ui/` holds the components shadcn/ui writes, and `src/components/` holds the app's own. Tests sit beside the file they test as `<name>.test.ts` or `<name>.test.tsx`, and acceptance tests are `tests/acceptance/*.spec.ts`. | drift |
| APP-5 | Add each shadcn/ui component with its CLI at a pinned version, such as `pnpm dlx shadcn@4.22.1 add button`, using [baseline/components.json](../baseline/components.json): the new-york style, lucide icons, CSS variables and the `@/` aliases. The component's file is the project's own code from then on. A change to it keeps the component's structure and names, so a later `shadcn diff` still applies. | drift on `components.json`; review for the files |

## test

| ID | Rule | Check |
| --- | --- | --- |
| APP-6 | Test components with Vitest in jsdom through Testing Library. A test finds elements the way a person does, in this order: `getByRole` with its name, `getByLabelText`, `getByText`. It never queries by test ID, class or `container.querySelector`, and it acts through `userEvent`, not `fireEvent`. A component that fetches is tested inside the app's providers with `fetch` stubbed (BASE-24), so the test data passes through the same schemas as the server's. | the `test` step |
| APP-7 | Each journey a person takes through the app has a Playwright acceptance test against the built app. Every acceptance test runs in light and in dark appearance, the two projects of [baseline/playwright.config.ts](../baseline/playwright.config.ts). It finds elements by role and name. | the `acceptance` step |
| APP-8 | Every acceptance test checks each screen it reaches with axe, through `@axe-core/playwright` and the WCAG 2.0, 2.1 and 2.2 A and AA tags, and expects no violations. A violation the project accepts is disabled in that one check with a comment that states why. | the `acceptance` step |

## review

| ID | Rule |
| --- | --- |
| APP-9 | Keep every colour, radius and font in `src/index.css`, the token owner. Each token is a CSS variable named by its role, such as `--background`, `--muted-foreground` or `--destructive`, with a value for light appearance in `:root` and one for dark appearance under `@media (prefers-color-scheme: dark)`. `@theme inline` maps each role to a Tailwind utility. The app follows the system's appearance, and offers its own switch only when the signed-off design has one. |
| APP-10 | Every query is a `queryOptions` call in the module of its resource, `src/api/<resource>.ts`. Its key starts with the resource's name, then the kind of query, then every value its `queryFn` reads, such as `["snippets", "detail", id]`, so invalidating `["snippets"]` refreshes them all. Its `queryFn` calls the network owner with the schema of the answer (BASE-21). |
| APP-11 | Components read server data only through `useQuery`, `useSuspenseQuery` or `useMutation` with options from APP-10. A component never calls `fetch` or the network owner, and never fetches in `useEffect`. A mutation invalidates the keys of the data it changes. |
| APP-12 | One function builds the app's `QueryClient` and sets its defaults: a `staleTime`, and a `retry` that retries only a network failure, at most twice. A refused or malformed answer is not retried, because a retry gets the same answer. |
| APP-13 | Every screen that waits on data shows each state: pending, failed, empty and loaded. A failed request is shown through one component, which words the failure (APP-14), has the `alert` role, and offers to try again. |
| APP-14 | Word every failure the person sees in one function, which says what happened and what to do next. A screen never shows the message of an error it does not know. |
| APP-15 | An app with more than one screen routes with TanStack Router, with every route defined in code in `src/router.tsx` and the router type registered through `declare module`. A route parses its path and search parameters with zod (BASE-21). A route's `loader` prefetches the route's queries through the `QueryClient` in the router context, and the screen reads them with `useQuery`. An app with one screen has no router. |
| APP-16 | Use an effect only to synchronize with something outside React, such as a chart library's DOM or a subscription. Compute a value that derives from props or state during render. Add `useMemo`, `useCallback` or `memo` only where a measurement shows a slow render. The app renders inside `StrictMode`. |
| APP-17 | Use semantic HTML before ARIA. Every control has a name a screen reader reads; an icon-only button has an `aria-label`, and a decorative icon has `aria-hidden="true"`. Every action works from the keyboard, and focus is always visible. A state is never shown by colour alone. Movement on screen stops when the person prefers reduced motion. |
| APP-18 | Load a library that only some screens need through a dynamic `import()`, so it is a separate file that the first load does not fetch. Shiki loads through `shiki/core` with the JavaScript regular-expression engine and only the languages and themes the app shows, and writes both themes' colours as CSS variables, which the token owner switches. Highlighting runs in a query, so the code shows as plain text until Shiki has loaded. |
| APP-19 | Draw each Observable Plot chart in one component that owns it. The component builds the chart in an effect, appends it to an element it holds in a ref, and removes it when the effect cleans up. The chart takes its colours from the token owner's CSS variables or `currentColor`, has an `ariaLabel` and an `ariaDescription`, and the data it draws is also available as a table or a text summary. |

## Reasons

- APP-1: A literal colour looks right in the appearance it was written in
  and wrong in the other, and nothing else catches it. Removing the default
  palette makes a palette class fail to exist rather than only fail a lint.
- APP-3: A dependency or an eager import can double the size of the first
  load without any visible change in the pull request.
- APP-5: shadcn/ui copies each component into the project, so the project
  owns the code, and the CLI version fixes what the copy contains.
- APP-6: A query by role and name fails when a control loses its accessible
  name, so component tests check accessibility as they run. jsdom runs a
  component test in milliseconds; the acceptance tests cover what only a
  real browser shows.
- APP-8: axe finds missing names, low contrast and invalid ARIA that a
  person checking screenshots misses, and it runs on every change.
- APP-10: A key that leaves out a value its `queryFn` reads serves one
  request's answer for another.
- APP-11: A fetch in `useEffect` races with the next render and has no
  cache, retry, deduplication or cancellation; TanStack Query has all four.
- APP-15: TanStack Router types each route's path and search parameters
  from the route definitions, so a link to a route that does not exist, or
  with a missing parameter, fails `tsc`. Code-based routes need no generated
  route file and no build plugin, which keeps a small app's build to Vite's
  own steps. An app that outgrows one routes file can move to the router's
  file-based routes later without changing its screens.
- APP-17: Large movement on screen can make people with vestibular
  disorders feel ill, which is why systems offer reduced motion.
- APP-18: Shiki's full bundle, with every language and its WebAssembly
  engine, adds several megabytes. In the example app, Shiki adds nothing to
  the first load, and about 65 kB with Brotli compression when the first
  snippet opens, for two languages and two themes.
