import { z } from "zod";

// zod compiles fast parsers with `new Function` when the page allows it, and
// its probe for that permission breaks the program's Content-Security-Policy
// (EMB-6). Every schema module imports this one, so the setting applies
// before any schema is built.
z.config({ jitless: true });

/** Why a request to the API failed, in terms a screen can word (APP-14). */
export type ApiFailure =
  | { kind: "status"; status: number }
  | { kind: "shape"; issues: string }
  | { kind: "network" };

export class ApiError extends Error {
  readonly failure: ApiFailure;

  constructor(failure: ApiFailure, options?: ErrorOptions) {
    super(`api request failed: ${failure.kind}`, options);
    this.name = "ApiError";
    this.failure = failure;
  }
}

/** How long one request may take before it counts as a network failure (BASE-26). */
const deadlineMs = 10_000;

/**
 * The one place that calls `fetch` (BASE-7). It reads `path` as JSON and
 * parses the body with `schema`, so every value past this function has the
 * schema's type (BASE-21). It throws ApiError for a refused or
 * malformed answer, because TanStack Query takes a thrown error as the
 * query's failure (BASE-23).
 */
export async function getJson<T>(
  path: string,
  schema: z.ZodType<T>,
  signal: AbortSignal,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      signal: AbortSignal.any([signal, AbortSignal.timeout(deadlineMs)]),
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    throw new ApiError({ kind: "network" }, { cause: error });
  }
  if (!response.ok) {
    throw new ApiError({ kind: "status", status: response.status });
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    throw new ApiError({ kind: "shape", issues: "the body is not JSON" }, { cause: error });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError({ kind: "shape", issues: parsed.error.message }, { cause: parsed.error });
  }
  return parsed.data;
}
