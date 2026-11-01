import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const snippets = [
  { id: "hello", title: "Hello, world", language: "rust" },
  { id: "sum", title: "Sum an array", language: "typescript" },
];
const hello = { ...snippets[0], code: 'fn main() {\n    println!("hello");\n}' };

// The built app has no server behind it here, so each test answers the API
// itself. A project whose acceptance tests need its real server starts that
// server in playwright.config.ts instead.
async function serveApi(page: Page) {
  await page.route("**/api/snippets", (route) => route.fulfill({ json: snippets }));
  await page.route("**/api/snippets/hello", (route) => route.fulfill({ json: hello }));
}

// Collects every error the page logs, including a Content-Security-Policy
// violation, so a test can expect there are none.
function consoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  return errors;
}

async function expectNoAccessibilityViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

test("a person opens a snippet from the list and reads it highlighted", async ({ page }) => {
  const errors = consoleErrors(page);
  await serveApi(page);
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Snippet shelf" })).toBeVisible();
  await expectNoAccessibilityViolations(page);

  await page.getByRole("link", { name: "Hello, world" }).click();

  await expect(page.getByRole("heading", { name: "Hello, world" })).toBeVisible();
  const code = page.getByRole("region", { name: "Code of Hello, world" });
  // Highlighted code has no role of its own, so Shiki's class shows that
  // it ran (APP-7).
  await expect(code.locator("pre.shiki")).toBeAttached();
  await expect(code).toContainText("println!");
  await expectNoAccessibilityViolations(page);
  expect(errors).toEqual([]);
});

test("a snippet that does not exist says so", async ({ page }) => {
  await serveApi(page);
  await page.route("**/api/snippets/missing", (route) => route.fulfill({ status: 404, json: {} }));
  await page.goto("/#/snippets/missing");

  await expect(page.getByRole("alert")).toHaveText(/This snippet does not exist/);
  await expectNoAccessibilityViolations(page);
});
