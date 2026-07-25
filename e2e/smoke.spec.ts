import { test, expect } from "@playwright/test";

/**
 * Smoke tests — no secrets required. Verify route protection and SliceUI branding.
 */
test.describe("unauthenticated routing", () => {
  test("protected /slice redirects to /auth", async ({ page }) => {
    await page.goto("/slice");
    await expect(page).toHaveURL(/\/auth/);
  });

  test("protected /dashboard redirects to /auth", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth/);
  });
});

test.describe("auth page branding", () => {
  test("shows SliceUI branding with email/password tabs (no Google OAuth)", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.getByText("SliceUI").first()).toBeVisible();
    await expect(page.getByRole("tab", { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /sign up/i })).toBeVisible();
    // Lovable Google OAuth was removed — ensure it's gone.
    await expect(page.getByRole("button", { name: /google/i })).toHaveCount(0);
  });
});
