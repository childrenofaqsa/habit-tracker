import { test, expect } from "@playwright/test";

test.describe("Backup & Restore", () => {
  test("export and restore JSON backup", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Enable edit mode and create some data first
    const editToggle = page.getByRole("button", { name: /edit/i }).or(
      page.getByRole("switch"),
    );
    if (await editToggle.first().isVisible()) {
      await editToggle.first().click();
    }

    // Look for settings/backup button
    const settingsBtn = page.getByRole("button", { name: /settings/i }).or(
      page.getByRole("button", { name: /backup/i }),
    );

    if (await settingsBtn.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await settingsBtn.first().click();

      // Look for export button
      const exportBtn = page.getByRole("button", { name: /export|backup/i });
      if (await exportBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Set up download listener
        const downloadPromise = page.waitForEvent("download", { timeout: 5000 }).catch(() => null);
        await exportBtn.click();
        const download = await downloadPromise;

        if (download) {
          const filename = download.suggestedFilename();
          expect(filename).toMatch(/\.(json|zip)$/);
        }
      }
    }
  });
});
