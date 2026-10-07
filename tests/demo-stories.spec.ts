import { test, expect } from "@playwright/test";
import { enterStudio } from "./enter-studio";

test("product story completes once and manual exploration cancels playback", async ({
  page,
}) => {
  await page.goto("/");
  await enterStudio(page);
  const stage = page.locator("#study-product");
  const initial = await stage.locator(".is-stage").boundingBox();
  await stage
    .getByRole("button", { name: "Watch the story", exact: true })
    .click();
  await expect(
    stage.getByRole("tab", { name: /A closer look/ }),
  ).toHaveAttribute("aria-selected", "true", { timeout: 3000 });
  await expect(
    stage.getByRole("tab", { name: /The next move/ }),
  ).toHaveAttribute("aria-selected", "true", { timeout: 3000 });
  await expect(
    stage.getByRole("button", { name: "Replay story", exact: true }),
  ).toBeVisible({ timeout: 3000 });
  const final = await stage.locator(".is-stage").boundingBox();
  expect(final!.height).toBeCloseTo(initial!.height, 1);
  await stage
    .getByRole("button", { name: "Replay story", exact: true })
    .click();
  const detail = stage.getByRole("tab", { name: /A closer look/ });
  await detail.click();
  await expect(
    stage.getByRole("button", { name: "Replay story", exact: true }),
  ).toBeVisible();
  await page.waitForTimeout(1900);
  await expect(detail).toHaveAttribute("aria-selected", "true");
  await stage
    .getByRole("button", { name: "Replay story", exact: true })
    .click();
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(
    stage.getByRole("button", { name: "Replay story", exact: true }),
  ).toBeVisible();
  await stage
    .getByRole("button", { name: "Replay story", exact: true })
    .click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    stage.getByRole("button", { name: "Replay story", exact: true }),
  ).toBeDisabled();
});

test("recovery story holds the old production version until checks pass", async ({
  page,
}) => {
  await page.goto("/");
  await enterStudio(page);
  const rail = page.locator("#study-release");
  await rail
    .getByRole("button", { name: "Watch recovery", exact: true })
    .click();
  await expect(rail.getByText("Blocked", { exact: true })).toBeVisible({
    timeout: 3000,
  });
  await expect(
    rail.getByRole("heading", { name: "Caught before production." }),
  ).toBeVisible();
  await expect(
    rail.locator(
      '.is-rail-panel[data-active="true"] .release-output[aria-label="Production preview, version 1.0.2"]',
    ),
  ).toBeVisible();
  await expect(
    rail.getByRole("button", { name: "Replay recovery", exact: true }),
  ).toBeVisible({ timeout: 5000 });
  await expect(
    rail.locator(
      '.is-rail-panel[data-active="true"] .release-output[aria-label="Production preview, version 1.0.3"]',
    ),
  ).toBeVisible();
  await rail
    .getByRole("button", { name: "Replay recovery", exact: true })
    .click();
  await rail
    .getByRole("button", { name: "Pause recovery", exact: true })
    .click();
  await expect(rail.getByText("Paused", { exact: true })).toBeVisible();
  await rail.getByLabel("Deployment scenario").selectOption("success");
  await rail
    .getByRole("button", { name: "Replay deployment", exact: true })
    .click();
  await expect(rail.getByText("Ready", { exact: true })).toBeVisible({
    timeout: 5500,
  });
});

test("homepage scenes replace real content and reset interaction without restarting the introduction", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const dock = page.locator("#study-dock");
  await dock
    .getByRole("group", { name: "Dock scenes" })
    .getByRole("button", { name: "Travel journal", exact: true })
    .click();
  await expect(
    dock.getByRole("navigation", { name: "Travel navigation" }),
  ).toBeVisible();
  await dock.getByRole("button", { name: "Kit", exact: true }).click();
  await dock
    .getByRole("group", { name: "Dock scenes" })
    .getByRole("button", { name: "Studio", exact: true })
    .click();
  await expect(
    dock.getByRole("button", { name: "Work", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const code = page.locator("#study-code");
  await code
    .getByRole("group", { name: "Code Window scenes" })
    .getByRole("button", { name: "Product detail", exact: true })
    .click();
  await expect(
    code.getByRole("heading", { name: /Quiet, by design/ }),
  ).toBeVisible();
  await code
    .getByRole("group", { name: "Walkthrough steps" })
    .getByRole("button", { name: /Finish/ })
    .click();
  await expect(
    code.getByRole("tab", { name: "product-finish.css" }),
  ).toHaveAttribute("aria-selected", "true");
  await code
    .getByRole("group", { name: "Code Window scenes" })
    .getByRole("button", { name: "Field Notes", exact: true })
    .click();
  await expect(
    code.getByRole("tab", { name: "field-note.tsx" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    code.getByRole("button", { name: "Pause walkthrough" }),
  ).toHaveCount(0);
});
