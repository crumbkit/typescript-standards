import { useQuery } from "@tanstack/react-query";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import type { Language } from "@/api/snippets";

type Props = { code: string; language: Language; label: string };

/**
 * Shows code as plain text at once, and highlighted once Shiki has loaded.
 * Highlighting is local work, not server data, so its query lives here
 * rather than in src/api/ (APP-10).
 */
export function CodeBlock({ code, language, label }: Props) {
  const highlighted = useQuery({
    queryKey: ["highlight", language, code],
    queryFn: async () => (await import("@/highlight")).highlight(code, language),
    staleTime: Number.POSITIVE_INFINITY,
  });

  return (
    <section aria-label={label} className="overflow-x-auto rounded-md text-sm [&_pre]:p-4">
      {highlighted.data === undefined ? (
        <pre className="bg-muted">
          <code>{code}</code>
        </pre>
      ) : (
        toJsxRuntime(highlighted.data, { Fragment, jsx, jsxs })
      )}
    </section>
  );
}
