import { test, expect } from "@playwright/test";

test.describe("Summoner Page", () => {
  test("should show summoner search hint when typing #", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill("Faker#KR1");
    await expect(page.locator("text=Press Enter to search summoner")).toBeVisible();
  });

  test("should show region selector when # is typed", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill("Test#TAG");
    // Region selector should appear
    await expect(page.locator("select")).toBeVisible();
  });

  test("should navigate to summoner page on Enter", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill("Faker#KR1");
    await searchInput.press("Enter");
    await page.waitForURL(/\/summoner\//);
    expect(page.url()).toContain("/summoner/");
    expect(page.url()).toContain("Faker-KR1");
  });

  test("should display summoner page title", async ({ page }) => {
    await page.goto("/summoner/tr1/Test-TR1");
    await expect(page).toHaveTitle(/Test#TR1/);
  });

  test("should show back navigation link", async ({ page }) => {
    await page.goto("/summoner/tr1/Test-TR1");
    await expect(page.locator("text=Back to Home")).toBeVisible();
  });

  test("should navigate back to home via back link", async ({ page }) => {
    await page.goto("/summoner/tr1/Test-TR1");
    await page.locator("text=Back to Home").click();
    await page.waitForURL("/");
    expect(page.url()).toContain("/");
  });

  test("should show error for non-existent summoner", async ({ page }) => {
    await page.goto("/summoner/tr1/ThisSummonerDoesNotExist12345-XXXXX");
    // Wait for the error message to appear
    await expect(page.locator("text=Summoner not found")).toBeVisible({ timeout: 15000 });
  });

  test("should display match history section when summoner exists", async ({ page }) => {
    // This test requires a valid summoner — it will be skipped if RIOT_API_KEY is not set
    test.skip(!process.env.RIOT_API_KEY, "Requires RIOT_API_KEY");
    await page.goto("/summoner/tr1/ValidSummoner-TR1");
    await expect(page.locator("text=Match History")).toBeVisible({ timeout: 15000 });
  });
});
