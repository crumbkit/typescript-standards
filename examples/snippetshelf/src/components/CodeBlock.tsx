import { useQuery } from "@tanstack/react-query";
import type { Language } from "@/api/snippets";

type Props = { code: string; language: Language };

/** Shows code as plain text at once, and highlighted once Shiki has loaded. */
export function CodeBlock({ code, language }: Props) {
  const highlighted = useQuery({
    queryKey: ["highlight", language, code],
    queryFn: async () => (await import("@/highlight")).highlight(code, language),
    staleTime: Number.POSITIVE_INFINITY,
  });

  if (highlighted.data === undefined) {
    return (
      <pre className="bg-muted overflow-x-auto rounded-md p-4 text-sm">
        <code>{code}</code>
      </pre>
    );
  }
  return (
    <div
      className="overflow-x-auto rounded-md text-sm [&_pre]:p-4"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki escapes the code it highlights, and the HTML comes from Shiki alone.
      dangerouslySetInnerHTML={{ __html: highlighted.data }}
    />
  );
}
