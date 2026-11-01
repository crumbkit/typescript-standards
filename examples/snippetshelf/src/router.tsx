import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  notFound,
  Outlet,
  type RouterHistory,
} from "@tanstack/react-router";
import { SnippetId } from "@/api/snippets";
import { Failure } from "@/components/Failure";
import { SnippetDetail } from "@/routes/SnippetDetail";
import { SnippetList } from "@/routes/SnippetList";

const root = createRootRoute({
  component: () => (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Snippet shelf</h1>
      <Outlet />
    </main>
  ),
  notFoundComponent: () => <p>This page does not exist.</p>,
  // A failure that no screen handles is worded like every other (APP-14).
  errorComponent: ({ error, reset }) => (
    <Failure error={error} notFound="This page does not exist." onRetry={reset} />
  ),
});

// Each screen starts its own queries, so it renders at once and shows its
// own pending and failed states (APP-13, APP-15).
const list = createRoute({
  getParentRoute: () => root,
  path: "/",
  component: SnippetList,
});

const detail = createRoute({
  getParentRoute: () => root,
  path: "/snippets/$snippetId",
  // The path parameter is parsed once, here, into its type (BASE-21). A
  // parameter that is not a snippet ID is a page that does not exist.
  params: {
    parse: ({ snippetId }) => {
      const parsed = SnippetId.safeParse(snippetId);
      if (!parsed.success) {
        throw notFound();
      }
      return { snippetId: parsed.data };
    },
    stringify: ({ snippetId }) => ({ snippetId }),
  },
  component: function Detail() {
    const { snippetId } = detail.useParams();
    return <SnippetDetail id={snippetId} />;
  },
});

const routeTree = root.addChildren([list, detail]);

/**
 * The app's router. Hash history keeps every route inside the one page the
 * embedding binary serves (EMB-6); a test passes a memory history.
 */
export function makeRouter(history: RouterHistory = createHashHistory()) {
  return createRouter({ routeTree, history });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof makeRouter>;
  }
}
