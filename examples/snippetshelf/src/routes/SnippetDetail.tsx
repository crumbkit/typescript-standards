import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { type SnippetId, snippetQueries } from "@/api/snippets";
import { CodeBlock } from "@/components/CodeBlock";
import { Failure } from "@/components/Failure";

type Props = { id: SnippetId };

export function SnippetDetail({ id }: Props) {
  const snippet = useQuery(snippetQueries.detail(id));

  let body: ReactNode;
  if (snippet.isPending) {
    body = <p aria-busy="true">Loading snippet…</p>;
  } else if (snippet.isError) {
    body = (
      <Failure
        error={snippet.error}
        notFound="This snippet does not exist."
        onRetry={() => void snippet.refetch()}
      />
    );
  } else {
    body = (
      <>
        <h2 className="text-xl font-semibold">{snippet.data.title}</h2>
        <CodeBlock
          code={snippet.data.code}
          language={snippet.data.language}
          label={`Code of ${snippet.data.title}`}
        />
      </>
    );
  }

  return (
    <article className="flex flex-col gap-4">
      <Link to="/" className="text-muted-foreground text-sm underline underline-offset-4">
        All snippets
      </Link>
      {body}
    </article>
  );
}
