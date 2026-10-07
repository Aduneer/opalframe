import { test, expect } from "@playwright/test";
import { enterStudio } from "./enter-studio";

test("study links reach real previews and reduced motion keeps the exhibit static", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const index = page.getByRole("navigation", { name: "Jump to a study" });
  await expect(page.locator(".gallery-study").first()).toHaveAttribute(
    "id",
    "study-code",
  );
  for (const id of ["code", "dock", "lens", "product", "release"]) {
    await index.locator(`a[href="#study-${id}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#study-${id}$`));
    const study = page.locator(`#study-${id}`);
    const caption = (await study.locator(".gallery-caption").boundingBox())!;
    expect(caption.y).toBeGreaterThanOrEqual(0);
    expect(caption.y).toBeLessThan(100);
    await expect(study.locator(".gallery-caption")).toHaveCSS(
      "animation-name",
      "none",
    );
    await expect(study.locator(".gallery-demo")).toBeVisible();
    await expect(
      study.getByRole("link", { name: /^Get .* source$/ }),
    ).toHaveAttribute("href", /\/components\//);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
  }
  await index.locator('a[href="#study-code"]').click();
  await expect(
    page.getByRole("button", { name: "Pause walkthrough" }),
  ).toHaveCount(0);
  await page
    .getByRole("group", { name: "Walkthrough steps" })
    .getByRole("button", { name: /Artwork/ })
    .click();
  await expect(
    page.locator('.is-code-step-list button[aria-pressed="true"]'),
  ).toContainText("Artwork");
});

test("the landing walkthrough waits for the opening and visibility, then yields to interaction", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const active = page.locator('.is-code-step-list button[aria-pressed="true"]');
  await expect(active).toContainText("Artwork");
  await expect(
    page.getByRole("button", { name: "Pause walkthrough" }),
  ).toHaveCount(0);
  await enterStudio(page);
  await page
    .locator(".gallery-code-demo")
    .evaluate((element) =>
      element.scrollIntoView({ block: "center", behavior: "instant" }),
    );
  await expect(
    page.getByRole("button", { name: "Pause walkthrough" }),
  ).toBeVisible();
  await expect(active).toContainText("Artwork", { timeout: 4000 });
  await page.getByRole("button", { name: "Pause walkthrough" }).click();
  const selected = await active.textContent();
  await page.waitForTimeout(1800);
  expect(await active.textContent()).toBe(selected);
  await page
    .getByRole("group", { name: "Walkthrough steps" })
    .getByRole("button", { name: /Details/ })
    .click();
  await expect(active).toContainText("Details");

  // Keyboard exploration takes ownership before an introduction can start.
  await page.reload({ waitUntil: "networkidle" });
  await enterStudio(page);
  const details = page
    .getByRole("group", { name: "Walkthrough steps" })
    .getByRole("button", { name: /Details/ });
  await details.focus();
  await details.press("Enter");
  await expect(active).toContainText("Details");
  await expect(
    page.getByRole("button", { name: "Pause walkthrough" }),
  ).toHaveCount(0);
});
