import type { z } from "zod";

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

/**
 * The one place that calls `fetch` (BASE-7). It reads `path` as JSON and
 * parses the body with `schema`, so every value past this function has the
 * schema's type (BASE-21).
 */
export async function getJson<T>(
  path: string,
  schema: z.ZodType<T>,
  signal: AbortSignal,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { signal, headers: { Accept: "application/json" } });
  } catch (error) {
    throw new ApiError({ kind: "network" }, { cause: error });
  }
  if (!response.ok) {
    throw new ApiError({ kind: "status", status: response.status });
  }
  const parsed = schema.safeParse(await response.json());
  if (!parsed.success) {
    throw new ApiError({ kind: "shape", issues: parsed.error.message }, { cause: parsed.error });
  }
  return parsed.data;
}
