import { test, expect } from "@playwright/test";

test("Carbon footprint form end-to-end flow", async ({ page }) => {
  // Navigate to the app
  await page.goto("/");

  // Verify the page loaded
  await expect(page.getByRole("heading", { name: /Know Your Impact/i })).toBeVisible();

  // Wait for the form to appear (after any loading state)
  await expect(page.locator("form")).toBeVisible({ timeout: 10000 });

  // Fill Step 1: Transport
  await page.getByLabel(/Car Fuel Type/i).selectOption("electric");
  await page.getByLabel(/Car Distance/i).fill("100");
  await page.getByRole("button", { name: /Next/i }).click();

  // Fill Step 2: Home
  await page.getByLabel(/Electricity Usage/i).fill("300");
  await page.getByLabel(/Household Size/i).fill("2");
  await page.getByRole("button", { name: /Next/i }).click();

  // Fill Step 3: Diet & Consumption
  await page.getByLabel(/Diet Type/i).selectOption("vegetarian");
  await page.getByRole("button", { name: /Calculate My Footprint/i }).click();

  // Wait for the results dashboard to appear
  await expect(page.getByRole("heading", { name: /Your Carbon Footprint/i })).toBeVisible(
    { timeout: 15000 }
  );

  // Verify the history panel shows up
  await expect(page.getByRole("heading", { name: /Footprint History/i })).toBeVisible();
});

test("Handles missing history gracefully (offline/incognito mode)", async ({ page }) => {
  await page.goto("/");

  // Fill the form quickly to reach dashboard
  await page.getByLabel(/Car Fuel Type/i).selectOption("petrol");
  await page.getByRole("button", { name: /Next/i }).click();
  await page.getByRole("button", { name: /Next/i }).click();
  await page.getByRole("button", { name: /Calculate My Footprint/i }).click();

  // Results should still load even if history/auth fails or is delayed
  await expect(page.getByRole("heading", { name: /Your Carbon Footprint/i })).toBeVisible(
    { timeout: 15000 }
  );
});
