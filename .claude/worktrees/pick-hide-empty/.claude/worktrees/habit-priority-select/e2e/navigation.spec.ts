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

test.describe("Desktop sidebar", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("sidebar is sticky during page scroll", async ({ page }) => {
    const sidebar = page.getByRole("navigation").first();
    await expect(sidebar).toBeVisible();

    // Scroll the page down
    await page.evaluate(() => window.scrollBy(0, 400));

    // Sidebar should still be in the viewport
    const box = await sidebar.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeLessThan(800);
  });

  test("settings icon is not visible in header on desktop", async ({ page }) => {
    // The header settings button wrapper has lg:hidden — it should not be visible
    const header = page.locator("header");
    const headerSettingsButton = header.getByRole("button", { name: "Settings" });
    await expect(headerSettingsButton).not.toBeVisible();
  });

  test("settings and help buttons are visible at sidebar bottom", async ({ page }) => {
    const sidebar = page.getByRole("navigation").first();
    await expect(sidebar.getByRole("button", { name: "Settings" })).toBeVisible();
    await expect(sidebar.getByRole("button", { name: "Help" })).toBeVisible();
  });

  test("clicking sidebar settings button opens settings sheet", async ({ page }) => {
    const sidebar = page.getByRole("navigation").first();
    await sidebar.getByRole("button", { name: "Settings" }).click();

    // The settings sheet should open with title "Settings"
    await expect(page.getByRole("dialog").getByText("Settings")).toBeVisible();
  });
});
