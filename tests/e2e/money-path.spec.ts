import { test, expect, type Page } from "@playwright/test";

// The money path — the flow the whole product exists for:
//   employer posts → freelancer applies → shortlist → message → hire →
//   complete → both leave double-blind reviews.
//
// Runs against the demo database with seeded identities (demo mode must be
// on). Uses a no-questions gig so the flow doesn't require camera access.

const EMPLOYER_NRIC = "M1001001A";
const FREELANCER_NRIC = "S1111111A";

async function loginWithNric(page: Page, nric: string) {
  await page.goto("/singpass");
  // The mock Singpass page defaults to the QR tab; the NRIC form lives
  // behind "Password login".
  await page.getByRole("button", { name: "Password login" }).click();
  await page.getByPlaceholder("S1234567D").fill(nric);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(/\/(feed|dashboard|onboarding|gigs)/, { timeout: 30_000 });
}

test.describe("money path", () => {
  test.describe.configure({ mode: "serial" });
  test.setTimeout(240_000);

  test("post → apply → shortlist → message → hire → complete → double-blind rate", async ({ browser }) => {
    const gigTitle = `E2E Money Path ${Date.now().toString(36)}`;

    const employer = await browser.newContext();
    const freelancer = await browser.newContext();
    const emp = await employer.newPage();
    const fre = await freelancer.newPage();

    // ── Employer posts a gig (no interview questions → no camera needed) ──
    await loginWithNric(emp, EMPLOYER_NRIC);
    await emp.goto("/gigs/new");
    await emp.getByLabel("Gig title").fill(gigTitle);
    await emp
      .getByLabel("Description")
      .fill("End-to-end test gig: verify the full hiring loop works. Please ignore.");
    await emp.getByLabel("Budget (S$)").fill("120");
    await emp.getByRole("button", { name: /Publish gig/ }).click();
    await emp.waitForURL(/\/gigs\/[0-9a-f-]{36}$/, { timeout: 60_000 });
    const gigUrl = new URL(emp.url()).pathname;

    // ── Freelancer applies ──
    await loginWithNric(fre, FREELANCER_NRIC);
    await fre.goto(gigUrl);
    await fre.locator('textarea[name="cover_note"]').fill("E2E application — hire me!");
    await fre.getByRole("button", { name: /Apply/ }).click();
    await expect(fre.getByText(/Applied/i).first()).toBeVisible({ timeout: 30_000 });

    // ── Employer shortlists from the interview/review page ──
    await emp.goto("/applicants?status=applied");
    const gigSection = emp.locator("section", { hasText: gigTitle });
    await expect(gigSection).toBeVisible({ timeout: 30_000 });
    await gigSection.getByRole("link", { name: /Review/ }).first().click();
    await emp.waitForURL(/\/interviews\//);
    const interviewUrl = new URL(emp.url()).pathname;
    await emp.getByRole("button", { name: "Shortlist", exact: true }).click();
    await expect(emp.getByText(/Shortlisted — applicant has been notified/i)).toBeVisible({
      timeout: 30_000,
    });

    // ── Shortlist unlocks messaging: freelancer sends, employer sees it ──
    await fre.goto("/messages");
    await fre.getByRole("link", { name: new RegExp(gigTitle) }).click();
    await fre.waitForURL(/\/messages\//);
    const msgText = `Hello from the E2E freelancer ${Date.now().toString(36)}`;
    await fre.locator("#message-draft").fill(msgText);
    await fre.getByRole("button", { name: "Send" }).click();
    await expect(fre.getByText(msgText)).toBeVisible({ timeout: 15_000 });

    await emp.goto("/messages");
    await emp.getByRole("link", { name: new RegExp(gigTitle) }).click();
    await expect(emp.getByText(msgText)).toBeVisible({ timeout: 30_000 });

    // ── Employer hires ──
    await emp.goto(interviewUrl);
    await emp.getByRole("button", { name: "Hire directly" }).click();
    await expect(emp.getByText(/hired/i).first()).toBeVisible({ timeout: 30_000 });

    // ── Freelancer marks the gig completed ──
    await fre.goto("/applications");
    const hiredRow = fre.locator("article", { hasText: gigTitle });
    await expect(hiredRow).toBeVisible({ timeout: 30_000 });
    await hiredRow.getByRole("button", { name: "Mark completed" }).click();
    await expect(
      fre.locator("article", { hasText: gigTitle }).getByRole("link", { name: /Rate employer/ }),
    ).toBeVisible({ timeout: 30_000 });

    // ── Freelancer rates (review must stay hidden — double-blind) ──
    await fre
      .locator("article", { hasText: gigTitle })
      .getByRole("link", { name: /Rate employer/ })
      .click();
    await fre.waitForURL(/\/rate\//);
    const rateUrl = new URL(fre.url()).pathname;
    await fre.getByRole("radio", { name: /5 stars/ }).click();
    await fre.locator("#review-text").fill("Great employer — smooth E2E run.");
    await fre.getByRole("button", { name: "Submit review" }).click();
    await expect(fre.getByText(/stays hidden until/i)).toBeVisible({ timeout: 30_000 });

    // ── Employer rates back; the pair reveals ──
    await emp.goto("/applicants?status=completed");
    const completedSection = emp.locator("section", { hasText: gigTitle });
    await completedSection.getByRole("link", { name: /Rate this worker/ }).click();
    await emp.waitForURL(/\/rate\//);
    await emp.getByRole("radio", { name: /5 stars/ }).click();
    await emp.locator("#review-text").fill("Great worker — smooth E2E run.");
    await emp.getByRole("button", { name: "Submit review" }).click();
    await expect(emp.getByText(/Both reviews are in/i)).toBeVisible({ timeout: 30_000 });

    // Freelancer's rate page now shows mutual reveal too.
    await fre.goto(rateUrl);
    await expect(fre.getByText(/Both reviews are in/i)).toBeVisible({ timeout: 30_000 });

    await employer.close();
    await freelancer.close();
  });
});
