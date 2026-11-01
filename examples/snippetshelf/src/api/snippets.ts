import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { getJson } from "./client";

export const Language = z.enum(["rust", "typescript"]);
export type Language = z.infer<typeof Language>;

export const SnippetId = z
  .string()
  .regex(/^[a-z0-9-]+$/)
  .brand<"SnippetId">();
export type SnippetId = z.infer<typeof SnippetId>;

const SnippetSummary = z.object({
  id: SnippetId,
  title: z.string().min(1),
  language: Language,
});

const Snippet = SnippetSummary.extend({ code: z.string() });

/**
 * Every query of snippets (APP-10). A key starts with "snippets", so
 * invalidating ["snippets"] refreshes all of them.
 */
export const snippetQueries = {
  all: () => ["snippets"] as const,
  list: () =>
    queryOptions({
      queryKey: [...snippetQueries.all(), "list"],
      queryFn: ({ signal }) => getJson("/api/snippets", z.array(SnippetSummary), signal),
    }),
  detail: (id: SnippetId) =>
    queryOptions({
      queryKey: [...snippetQueries.all(), "detail", id],
      queryFn: ({ signal }) => getJson(`/api/snippets/${id}`, Snippet, signal),
    }),
};
