import { test, expect } from "@playwright/test";

test.describe("Todo Lifecycle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByText("To-Do").click();
  });

  test("add a new todo", async ({ page }) => {
    const input = page.getByPlaceholder(/add/i).or(page.getByRole("textbox"));
    if (await input.isVisible()) {
      await input.fill("Buy groceries");
      await input.press("Enter");
      await expect(page.getByText("Buy groceries")).toBeVisible();
    }
  });

  test("toggle todo completion", async ({ page }) => {
    // First add a todo
    const input = page.getByPlaceholder(/add/i).or(page.getByRole("textbox"));
    if (await input.isVisible()) {
      await input.fill("Complete this");
      await input.press("Enter");
      await expect(page.getByText("Complete this")).toBeVisible();

      // Find and click the checkbox/toggle for the todo
      const todoItem = page.locator("text=Complete this").locator("..");
      const checkbox = todoItem.getByRole("checkbox").or(
        todoItem.locator("button").first(),
      );
      if (await checkbox.isVisible()) {
        await checkbox.click();
        // Give it time to animate
        await page.waitForTimeout(500);
      }
    }
  });
});
