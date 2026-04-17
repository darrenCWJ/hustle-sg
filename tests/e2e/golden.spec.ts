import { test, expect } from "@playwright/test";

test("landing page loads with hero and CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/side hustle/i);
  await expect(page.getByRole("link", { name: /get verified with singpass/i })).toBeVisible();
});

test("singpass page renders NRIC form", async ({ page }) => {
  await page.goto("/singpass");
  await expect(page.getByText(/verify your identity/i)).toBeVisible();
  await expect(page.getByPlaceholder("S1234567D")).toBeVisible();
});

test("start-a-business page renders checklist", async ({ page }) => {
  await page.goto("/start-a-business");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/register your.*singapore business/i);
  await expect(page.getByText(/sole proprietorship/i)).toBeVisible();
  await expect(page.getByText(/private limited/i)).toBeVisible();
});

test("gigs browse page renders", async ({ page }) => {
  await page.goto("/gigs");
  await expect(page.getByRole("heading", { name: /open gigs/i })).toBeVisible();
});
