# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: footprint.spec.ts >> Carbon footprint form end-to-end flow
- Location: e2e\footprint.spec.ts:3:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /Next Step/i })

```

# Page snapshot

```yaml
- generic [ref=e1]:
    - link "Skip to main content" [ref=e2] [cursor=pointer]:
        - /url: "#main-content"
    - banner [ref=e3]:
        - generic [ref=e5]:
            - generic [ref=e6]:
                - generic [ref=e7]: 🌍
                - generic [ref=e8]:
                    - heading "Carbon Footprint Assistant" [level=1] [ref=e9]
                    - paragraph [ref=e10]: Understand · Track · Reduce
            - generic [ref=e12]: Powered by Gemini AI
    - main [ref=e13]:
        - generic [ref=e14]:
            - status [ref=e15]
            - generic [ref=e16]:
                - generic [ref=e17]: AI-Powered Carbon Intelligence
                - heading "Know Your Impact. Make a Difference." [level=2] [ref=e19]
                - paragraph [ref=e20]: Our intelligent platform calculates your carbon footprint and uses AI to provide highly personalized, actionable steps to reduce your environmental impact.
            - generic [ref=e22]:
                - generic [ref=e23]: Step 1 of 4
                - generic [ref=e24]:
                    - button [ref=e25]:
                        - generic [ref=e26]: 🚗
                        - generic [ref=e27]: Transport
                    - button [ref=e29]:
                        - generic [ref=e30]: 🏠
                        - generic [ref=e31]: Home
                    - button [ref=e33]:
                        - generic [ref=e34]: 🥗
                        - generic [ref=e35]: Diet
                    - button [ref=e37]:
                        - generic [ref=e38]: 🛍️
                        - generic [ref=e39]: Consumption
                - group "🚗 Transport" [ref=e41]:
                    - generic [ref=e42]: 🚗 Transport
                    - generic [ref=e43]:
                        - generic [ref=e44]: Car distance per week (km)
                        - spinbutton "Car distance per week (km)" [active] [ref=e45]: "100"
                    - generic [ref=e46]:
                        - generic [ref=e47]: Car fuel type
                        - combobox "Car fuel type" [ref=e48] [cursor=pointer]:
                            - option "Petrol / Gasoline"
                            - option "Diesel"
                            - option "Hybrid"
                            - option "Electric" [selected]
                    - generic [ref=e49]:
                        - generic [ref=e50]: Public transit per week (km)
                        - spinbutton "Public transit per week (km)" [ref=e51]
                    - generic [ref=e52]:
                        - generic [ref=e53]:
                            - generic [ref=e54]: Short-haul flights/yr
                            - spinbutton "Short-haul flights/yr" [ref=e55]
                        - generic [ref=e56]:
                            - generic [ref=e57]: Long-haul flights/yr
                            - spinbutton "Long-haul flights/yr" [ref=e58]
                - generic [ref=e59]:
                    - button "← Back" [disabled] [ref=e60]
                    - button "Next →" [ref=e61]
    - contentinfo [ref=e62]:
        - generic [ref=e63]:
            - paragraph [ref=e64]: Estimates are for awareness and education — not regulatory accounting.
            - paragraph [ref=e65]: "Sources: DEFRA 2023 · EPA · IPCC AR6"
    - generic [ref=e70] [cursor=pointer]:
        - button "Open Next.js Dev Tools" [ref=e71]:
            - img [ref=e72]
        - generic [ref=e75]:
            - button "Open issues overlay" [ref=e76]:
                - generic [ref=e77]:
                    - generic [ref=e78]: "0"
                    - generic [ref=e79]: "1"
                - generic [ref=e80]: Issue
            - button "Collapse issues badge" [ref=e81]:
                - img [ref=e82]
    - alert [ref=e84]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  |
  3  | test('Carbon footprint form end-to-end flow', async ({ page }) => {
  4  |   // Navigate to the app
  5  |   await page.goto('/');
  6  |
  7  |   // Verify the page loaded
  8  |   await expect(page.getByRole('heading', { name: /Know Your Impact/i })).toBeVisible();
  9  |
  10 |   // Wait for the form to appear (after any loading state)
  11 |   await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
  12 |
  13 |   // Fill Step 1: Transport
  14 |   await page.getByLabel(/Car Fuel Type/i).selectOption('electric');
  15 |   await page.getByLabel(/Car Distance/i).fill('100');
> 16 |   await page.getByRole('button', { name: /Next Step/i }).click();
     |                                                          ^ Error: locator.click: Test timeout of 30000ms exceeded.
  17 |
  18 |   // Fill Step 2: Home
  19 |   await page.getByLabel(/Electricity Usage/i).fill('300');
  20 |   await page.getByLabel(/Household Size/i).fill('2');
  21 |   await page.getByRole('button', { name: /Next Step/i }).click();
  22 |
  23 |   // Fill Step 3: Diet & Consumption
  24 |   await page.getByLabel(/Diet Type/i).selectOption('vegetarian');
  25 |   await page.getByRole('button', { name: /Calculate My Footprint/i }).click();
  26 |
  27 |   // Wait for the results dashboard to appear
  28 |   await expect(page.getByRole('heading', { name: /Your Carbon Footprint/i })).toBeVisible({ timeout: 15000 });
  29 |
  30 |   // Verify the history panel shows up
  31 |   await expect(page.getByRole('heading', { name: /Footprint History/i })).toBeVisible();
  32 | });
  33 |
```
