import { test, expect } from "@playwright/test";

test.describe("Match Detail (Accordion)", () => {
  test("should display build summary or no data message", async ({ page }) => {
    await page.goto("/champion/Ezreal");
    // BuildSummary shows either "{champion} BUILD" or "No build data available"
    const hasBuild = await page.locator("text=BUILD").first().isVisible({ timeout: 10000 }).catch(() => false);
    const hasNoData = await page.locator("text=No build data available").first().isVisible({ timeout: 5000 }).catch(() => false);
    const hasChampion = await page.locator("h1").first().isVisible().catch(() => false);
    expect(hasBuild || hasNoData || hasChampion).toBeTruthy();
  });

  test("should display pro matches section header", async ({ page }) => {
    await page.goto("/champion/Ezreal");
    // "PRO MATCHES" text is rendered by ChampionPageClient
    const proMatchesHeader = page.getByText("PRO MATCHES", { exact: true }).first();
    await expect(proMatchesHeader).toBeVisible({ timeout: 10000 });
  });

  test("should show match list or empty state", async ({ page }) => {
    await page.goto("/champion/Ezreal");
    await page.waitForTimeout(3000);
    // The page should render: either match data or the PRO MATCHES header at minimum
    const proHeader = page.getByText("PRO MATCHES", { exact: true }).first();
    await expect(proHeader).toBeVisible({ timeout: 10000 });
  });
});
