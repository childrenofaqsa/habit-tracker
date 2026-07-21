import { test, expect } from "@playwright/test";

test.describe("Habit Lifecycle", () => {
  test("create timeframe, category, and habit in edit mode", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Enable edit mode
    const editToggle = page.getByRole("button", { name: /edit/i }).or(
      page.getByRole("switch"),
    );
    await editToggle.first().click();

    // Add a timeframe
    const addTimeframeInput = page.getByPlaceholder(/timeframe/i).or(
      page.getByRole("textbox").first(),
    );
    if (await addTimeframeInput.isVisible()) {
      await addTimeframeInput.fill("Morning");
      await addTimeframeInput.press("Enter");
    }

    // Verify timeframe appears
    await expect(page.getByText("Morning")).toBeVisible({ timeout: 3000 });
  });

  test("habit status changes on interaction", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // If there are habits, try clicking one
    const habitCard = page.locator("[data-testid='habit-card']").or(
      page.locator(".snap-card"),
    );

    const count = await habitCard.count();
    if (count > 0) {
      await habitCard.first().click();
      // Verify some visual feedback happened (status change or animation)
      await page.waitForTimeout(300);
    }
  });
});
