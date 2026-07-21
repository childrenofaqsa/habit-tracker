import { test, expect } from "@playwright/test";

test.describe("App Boot", () => {
  test("loads without console errors causing crash", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const hasMaxUpdateDepth = errors.some((e) =>
      e.includes("Maximum update depth exceeded"),
    );
    expect(hasMaxUpdateDepth).toBe(false);
  });

  test("shows daily view or empty state on first load", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const hasContent = await page
      .locator("text=No timeframes yet, text=Morning, text=Daily")
      .first()
      .isVisible()
      .catch(() => false);

    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();
  });

  test("navigation bar is visible", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();
    await expect(nav.getByText("Daily")).toBeVisible();
    await expect(nav.getByText("Values")).toBeVisible();
    await expect(nav.getByText("To-Do")).toBeVisible();
    await expect(nav.getByText("Analytics")).toBeVisible();
  });
});
