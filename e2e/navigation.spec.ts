import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("clicking To-Do tab shows todo view", async ({ page }) => {
    await page.getByText("To-Do").click();
    await expect(
      page.getByText("No todos yet").or(page.getByText("Add")),
    ).toBeVisible();
  });

  test("clicking Values tab shows values view", async ({ page }) => {
    await page.getByText("Values").click();
    await expect(
      page.getByText("No value trackers").or(page.getByText("Values")),
    ).toBeVisible();
  });

  test("clicking Analytics tab shows analytics view", async ({ page }) => {
    await page.getByText("Analytics").click();
    await expect(page.locator("[data-testid], .recharts-wrapper, text=Completion")).toBeVisible({ timeout: 5000 });
  });

  test("clicking Daily tab returns to daily view", async ({ page }) => {
    await page.getByText("To-Do").click();
    await page.getByText("Daily").click();
    await expect(
      page.getByText("No timeframes yet").or(page.getByText("Morning")),
    ).toBeVisible();
  });
});
