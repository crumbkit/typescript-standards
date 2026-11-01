import type { QueryClient } from "@tanstack/react-query";
import {
  createHashHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  type RouterHistory,
} from "@tanstack/react-router";
import { SnippetId, snippetQueries } from "@/api/snippets";
import { SnippetDetail } from "@/routes/SnippetDetail";
import { SnippetList } from "@/routes/SnippetList";

type Context = { queryClient: QueryClient };

const root = createRootRouteWithContext<Context>()({
  component: () => (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Snippet shelf</h1>
      <Outlet />
    </main>
  ),
  notFoundComponent: () => <p>This page does not exist.</p>,
});

const list = createRoute({
  getParentRoute: () => root,
  path: "/",
  loader: ({ context }) => context.queryClient.prefetchQuery(snippetQueries.list()),
  component: SnippetList,
});

const detail = createRoute({
  getParentRoute: () => root,
  path: "/snippets/$snippetId",
  // The path parameter is parsed once, here, into its type (BASE-21).
  params: {
    parse: ({ snippetId }) => ({ snippetId: SnippetId.parse(snippetId) }),
    stringify: ({ snippetId }) => ({ snippetId }),
  },
  loader: ({ context, params }) =>
    context.queryClient.prefetchQuery(snippetQueries.detail(params.snippetId)),
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
export function makeRouter(queryClient: QueryClient, history: RouterHistory = createHashHistory()) {
  return createRouter({ routeTree, history, context: { queryClient } });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof makeRouter>;
  }
}
