import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ApiError, getJson } from "./client";

const Thing = z.object({ name: z.string() });

function answer(body: unknown, status = 200) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(body, { status })));
}

describe("getJson", () => {
  it("returns the body parsed by the schema", async () => {
    answer({ name: "one" });
    await expect(getJson("/api/thing", Thing, new AbortController().signal)).resolves.toEqual({
      name: "one",
    });
  });

  it("refuses a body that does not match the schema", async () => {
    answer({ name: 7 });
    const failure = getJson("/api/thing", Thing, new AbortController().signal);
    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toMatchObject({ failure: { kind: "shape" } });
  });

  it("reports the status of a refused request", async () => {
    answer({}, 404);
    await expect(getJson("/api/thing", Thing, new AbortController().signal)).rejects.toMatchObject({
      failure: { kind: "status", status: 404 },
    });
  });

  it("reports a request that never reached the server as a network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(getJson("/api/thing", Thing, new AbortController().signal)).rejects.toMatchObject({
      failure: { kind: "network" },
    });
  });
});
