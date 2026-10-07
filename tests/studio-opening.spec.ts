import { test, expect } from "@playwright/test";

async function runwayHeight(page: import("@playwright/test").Page) {
  return page
    .locator(".studio-runway")
    .evaluate((element) => element.getBoundingClientRect().height);
}

test("the runway pins the page until the glass opens and then hands off native scrolling", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/", { waitUntil: "networkidle" });
  const studio = page.locator(".studio-opening");
  const scene = page.locator(".studio-page");
  const hero = page.locator(".gallery-intro");
  const glass = page.locator(".studio-pane-north");
  await expect(studio).toHaveAttribute("data-studio-state", "opening");
  await expect(scene).toHaveAttribute("inert", "");
  await expect(glass).toHaveCSS("backdrop-filter", "blur(32px)");
  const distance = await runwayHeight(page);
  expect(distance).toBeGreaterThan(page.viewportSize()!.height);
  const start = (await hero.boundingBox())!.y;
  const firstPane = (await glass.boundingBox())!;
  await page.evaluate(
    (y) => scrollTo({ top: y, behavior: "instant" }),
    distance * 0.5,
  );
  await expect(studio).toHaveAttribute("data-stage", "clearing");
  expect((await hero.boundingBox())!.y).toBeCloseTo(start, 0);
  expect((await glass.boundingBox())!.height).toBeLessThan(firstPane.height);
  await expect(page.locator(".studio-aperture-edge")).toHaveCSS(
    "pointer-events",
    "none",
  );
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(studio).toHaveAttribute("data-stage", "arrival");
  await page.evaluate(
    (y) => scrollTo({ top: y, behavior: "instant" }),
    Math.ceil(distance),
  );
  await expect(studio).toBeHidden();
  await expect(scene).not.toHaveAttribute("inert");
  expect((await hero.boundingBox())!.y).toBeCloseTo(start, 0);
  await page.evaluate(
    (y) => scrollTo({ top: y, behavior: "instant" }),
    Math.ceil(distance) + 200,
  );
  expect((await hero.boundingBox())!.y).toBeCloseTo(start - 200, 0);
  await expect(page.locator(".gallery-study")).toHaveCount(6);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});

test("background clicks do not dismiss the opening and explicit entry removes the runway", async ({
  page,
  isMobile,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const studio = page.locator(".studio-opening");
  await expect(studio).toHaveAttribute("data-studio-state", "opening");
  if (isMobile) await page.touchscreen.tap(10, 200);
  else await page.mouse.click(10, 200);
  await expect(studio).toHaveAttribute("data-studio-state", "opening");
  await expect(page.locator(".glass-feedback")).toHaveCount(0);
  const distance = await runwayHeight(page);
  const initial = (await page.locator(".gallery-intro").boundingBox())!.y;
  await page.evaluate(
    (y) => scrollTo({ top: y, behavior: "instant" }),
    distance * 0.45,
  );
  await expect(studio).toHaveAttribute("data-stage", "clearing");
  const button = page.getByRole("button", {
    name: "Enter studio",
    exact: true,
  });
  if (isMobile) await button.tap();
  else {
    await button.focus();
    await button.press("Enter");
  }
  await expect(studio).toBeHidden();
  expect(await runwayHeight(page)).toBe(0);
  expect((await page.locator(".gallery-intro").boundingBox())!.y).toBeCloseTo(
    initial,
    0,
  );
  const notes = page.getByRole("button", { name: "Notes", exact: true });
  await notes.click();
  await expect(notes).toHaveAttribute("aria-pressed", "true");
});

test(
  "motion preference, anchors, and no-script loading bypass the runway",
  { tag: "@smoke" },
  async ({ page, browser, baseURL }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator(".studio-opening")).toHaveAttribute(
      "data-studio-state",
      "clear",
    );
    expect(await runwayHeight(page)).toBe(0);
    await expect(page.locator(".studio-page")).not.toHaveAttribute("inert");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/#components", { waitUntil: "networkidle" });
    await expect(page.locator(".studio-opening")).toBeHidden();
    expect(await runwayHeight(page)).toBe(0);
    await page.goto("/", { waitUntil: "networkidle" });
    const distance = await runwayHeight(page);
    await page.evaluate(
      (y) => scrollTo({ top: y, behavior: "instant" }),
      distance * 0.4,
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    // CSS hides the runway before matchMedia delivers its change event. Wait for
    // bypass() to remove the enabled state and restore the content position.
    await expect(page.locator(".studio-experience")).not.toHaveAttribute(
      "data-studio-enabled",
    );
    await expect(page.locator(".studio-opening")).toBeHidden();
    expect(await runwayHeight(page)).toBe(0);
    await expect
      .poll(async () => (await page.locator(".studio-page").boundingBox())!.y)
      .toBeCloseTo(0, 0);
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 320, height: 844 },
    });
    try {
      const fallback = await context.newPage();
      await fallback.goto(baseURL!);
      await expect(fallback.locator(".studio-opening")).toBeHidden();
      expect(await runwayHeight(fallback)).toBe(0);
      await expect(fallback.locator(".gallery-study")).toHaveCount(6);
      await fallback
        .getByRole("link", { name: "Get Expandable Dock source", exact: true })
        .click();
      await expect(fallback).toHaveURL(/\/components\/expandable-dock/);
    } finally {
      await context.close();
    }
    await page.goto("/components/expandable-dock");
    await expect(page.locator(".studio-experience")).toHaveCount(0);
    await page.goto("/showcase");
    await expect(page.locator(".studio-experience")).toHaveCount(0);
  },
);
