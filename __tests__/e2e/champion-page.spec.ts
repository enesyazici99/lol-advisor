import { test, expect } from "@playwright/test";

test.describe("Champion Page", () => {
  test("should load the champion page", async ({ page }) => {
    await page.goto("/champion/Ezreal");
    await expect(page).toHaveTitle(/Ezreal.*LOL Advisor/);
  });

  test("should display champion name", async ({ page }) => {
    await page.goto("/champion/Ezreal");
    await expect(page.locator("text=EZREAL").first()).toBeVisible();
  });

  test("should display back navigation", async ({ page }) => {
    await page.goto("/champion/Ezreal");
    await expect(page.locator("text=Back to Champions")).toBeVisible();
  });

  test("should navigate back to home", async ({ page }) => {
    await page.goto("/champion/Ezreal");
    await page.locator("text=Back to Champions").click();
    await page.waitForURL("**/", { timeout: 5000 });
    expect(page.url()).toMatch(/\/$/);
  });

  test("should display role filter tabs", async ({ page }) => {
    await page.goto("/champion/Ezreal");
    await expect(page.locator("button:text('ALL')").first()).toBeVisible();
    await expect(page.locator("button:text('TOP')").first()).toBeVisible();
    await expect(page.locator("button:text('MID')").first()).toBeVisible();
  });

  test("should display pro matches section", async ({ page }) => {
    await page.goto("/champion/Ezreal");
    await expect(page.locator("text=PRO MATCHES").first()).toBeVisible();
  });

  test("should display region filter dropdown", async ({ page }) => {
    await page.goto("/champion/Ezreal");
    const regionSelect = page.locator("select[aria-label='Filter by region']");
    await expect(regionSelect).toBeVisible();
    await expect(regionSelect).toHaveValue("");
    // Verify "All Regions" is the default option
    await expect(regionSelect.locator("option").first()).toHaveText("All Regions");
  });
});
