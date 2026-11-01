import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { snippetQueries } from "@/api/snippets";
import { Failure } from "@/components/Failure";

export function SnippetList() {
  const snippets = useQuery(snippetQueries.list());

  if (snippets.isPending) {
    return <p aria-busy="true">Loading snippets…</p>;
  }
  if (snippets.isError) {
    return (
      <Failure
        error={snippets.error}
        notFound="The server has no snippets to list."
        onRetry={() => void snippets.refetch()}
      />
    );
  }
  if (snippets.data.length === 0) {
    return <p>No snippets yet.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {snippets.data.map((snippet) => (
        <li key={snippet.id}>
          <Link
            to="/snippets/$snippetId"
            params={{ snippetId: snippet.id }}
            className="underline underline-offset-4"
          >
            {snippet.title}
          </Link>{" "}
          <span className="text-muted-foreground text-sm">{snippet.language}</span>
        </li>
      ))}
    </ul>
  );
}
