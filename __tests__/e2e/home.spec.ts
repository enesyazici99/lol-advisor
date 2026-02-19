import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/LOL Advisor/);
  });

  test("should display the logo", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=LOL").first()).toBeVisible();
  });

  test("should display the search bar", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
  });

  test("should display role filter buttons", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=ALL").first()).toBeVisible();
    await expect(page.locator("text=TOP").first()).toBeVisible();
    await expect(page.locator("text=MID").first()).toBeVisible();
  });

  test("should display champion grid", async ({ page }) => {
    await page.goto("/");
    // Wait for champions to load (they come from DDragon)
    await page.waitForTimeout(2000);
    // Champion grid should have multiple cards
    const links = page.locator('a[href^="/champion/"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should filter champions by search", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);

    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill("Ezreal");
    await page.waitForTimeout(500);

    // Should show Ezreal
    await expect(page.locator("text=Ezreal").first()).toBeVisible();
  });

  test("should navigate to champion page on click", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);

    // Click on any champion
    const firstChampLink = page.locator('a[href^="/champion/"]').first();
    await firstChampLink.click();
    await page.waitForURL(/\/champion\//);

    // Should navigate to champion page
    expect(page.url()).toContain("/champion/");
  });
});
