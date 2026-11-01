import { describe, expect, it } from "vitest";
import { ApiError } from "./client";
import { describeFailure } from "./failure";

describe("describeFailure", () => {
  it("uses the screen's own words for a missing thing", () => {
    const error = new ApiError({ kind: "status", status: 404 });
    expect(describeFailure(error, "No such note.")).toBe("No such note.");
  });

  it("tells the person to update the app when the server's data cannot be read", () => {
    const error = new ApiError({ kind: "shape", issues: "name: expected string" });
    expect(describeFailure(error, "")).toMatch(/Update the app/);
  });

  it("never shows the message of an error it does not know", () => {
    expect(describeFailure(new Error("TypeError: x is undefined"), "")).not.toMatch(/TypeError/);
  });
});
