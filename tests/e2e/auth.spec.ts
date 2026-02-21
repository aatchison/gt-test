import { test, expect } from "@playwright/test";
import { E2E_USER } from "./global-setup";

test.describe("Register flow", () => {
  test("shows register page", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();
  });

  test("registers a new user and redirects to login", async ({ page }) => {
    await page.goto("/register");

    await page.getByLabel("Email").fill("newuser@example.com");
    await page.getByLabel("Password").fill("NewPassword123!");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL("/login");
  });

  test("shows error for duplicate email", async ({ page }) => {
    await page.goto("/register");

    // E2E_USER is seeded in global-setup
    await page.getByLabel("Email").fill(E2E_USER.email);
    await page.getByLabel("Password").fill("SomePassword1!");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText(/already exists/i)).toBeVisible();
  });
});

test.describe("Login flow", () => {
  test("shows login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("logs in with valid credentials and shows authenticated home", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill(E2E_USER.email);
    await page.getByLabel("Password").fill(E2E_USER.password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByText(E2E_USER.email)).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  });

  test("shows error for wrong password", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill(E2E_USER.email);
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("shows error for unknown email", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByLabel("Password").fill("SomePassword1!");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });
});

test.describe("Sign out flow", () => {
  test.beforeEach(async ({ page }) => {
    // Log in before each sign-out test
    await page.goto("/login");
    await page.getByLabel("Email").fill(E2E_USER.email);
    await page.getByLabel("Password").fill(E2E_USER.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/");
  });

  test("sign out returns to unauthenticated home", async ({ page }) => {
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Register" })).toBeVisible();
  });
});
