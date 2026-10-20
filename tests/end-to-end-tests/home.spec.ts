import { expect, test } from "@playwright/test";

test("home page loads successfully", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  await expect(page).toHaveTitle(/Thungatha/i);
  await expect(
    page.getByRole("button", { name: "Sign in to save jobs" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Find your next opportunity" }),
  ).toBeVisible();
  await expect(
    page.getByRole("complementary", { name: "Thungatha features" }),
  ).toBeVisible();
  await expect(
    page.getByRole("complementary", { name: "Main navigation" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("combobox", {
      name: "Search roles, skills, or companies",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Job search results" }),
  ).toBeVisible();
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
