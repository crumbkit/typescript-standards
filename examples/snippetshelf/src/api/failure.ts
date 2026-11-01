import { ApiError } from "./client";

/**
 * The one wording of every API failure a screen shows (APP-14). A screen
 * names what a 404 means for the thing it asked for.
 */
export function describeFailure(error: unknown, notFound: string): string {
  if (!(error instanceof ApiError)) {
    return "Something went wrong. Reload the page to try again.";
  }
  switch (error.failure.kind) {
    case "network":
      return "The server did not answer. Check that it is running, then try again.";
    case "status":
      return error.failure.status === 404
        ? notFound
        : `The server refused the request (status ${error.failure.status}). Try again.`;
    case "shape":
      return "The server sent data this version of the app cannot read. Update the app.";
  }
}
