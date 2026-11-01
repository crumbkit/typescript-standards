import { QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { makeQueryClient } from "@/queryClient";
import { makeRouter } from "@/router";

const snippets = [{ id: "hello", title: "Hello, world", language: "rust" }];
const hello = { ...snippets[0], code: 'fn main() { println!("hello"); }' };

// Answers each path in `routes` with its body, and any other path with 404.
function serve(routes: Record<string, unknown>) {
  vi.stubGlobal(
    "fetch",
    vi.fn((path: string) => {
      const body = routes[path];
      return Promise.resolve(
        body === undefined ? new Response(null, { status: 404 }) : Response.json(body),
      );
    }),
  );
}

function renderApp(path = "/") {
  const queryClient = makeQueryClient();
  const router = makeRouter(queryClient, createMemoryHistory({ initialEntries: [path] }));
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("the snippet list", () => {
  it("links each snippet to its page", async () => {
    serve({ "/api/snippets": snippets, "/api/snippets/hello": hello });
    renderApp();

    await userEvent.click(await screen.findByRole("link", { name: "Hello, world" }));

    expect(await screen.findByRole("heading", { name: "Hello, world" })).toBeInTheDocument();
    expect(screen.getByText(/println!/)).toBeInTheDocument();
  });

  it("says so when there are no snippets", async () => {
    serve({ "/api/snippets": [] });
    renderApp();

    expect(await screen.findByText("No snippets yet.")).toBeInTheDocument();
  });

  it("words a refused request and offers to try again", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    renderApp();

    expect(await screen.findByRole("alert")).toHaveTextContent("The server refused the request");
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});
