import { expect, test } from "@playwright/test";

test("home page loads successfully", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Thungatha/i);
  await expect(page.getByRole("img", { name: "Thungatha" })).toBeVisible();
});

test("dashboard requires a signed-in session or directs to setup", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/(?:sign-in|auth=setup)/);
});
