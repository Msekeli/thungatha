import { expect, test } from "@playwright/test";

test("home page loads successfully", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Thungatha/i);
  await expect(page.getByRole("banner").getByRole("link", { name: "THUNGATHA home" })).toBeVisible();
});

test("protected feature routes require authentication or direct to setup", async ({
  page,
}) => {
  const routes = [
    "/jobs",
    "/cv-studio",
    "/applications",
    "/profile",
    "/account",
  ];

  for (const route of routes) {
    await page.goto(route);
    await expect(page).toHaveURL(/(?:sign-in|auth=setup)/);
  }
});
