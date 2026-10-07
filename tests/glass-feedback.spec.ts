import { test, expect } from "@playwright/test";

test("glass feedback follows native pointer, touch, and keyboard activation then clears", async ({
  page,
  isMobile,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Enter studio" }).click();
  const frame = page.locator(".gallery-dock .gallery-demo");
  // Settle the native scroll before checking the short-lived feedback.
  await frame.evaluate((element) =>
    element.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  await expect(page.locator(".studio-opening")).toHaveAttribute(
    "data-studio-state",
    "clear",
  );
  const dock = page.getByRole("navigation", { name: "Studio navigation" });
  const notes = dock.getByRole("button", { name: "Notes", exact: true });
  const bounds = (await frame.boundingBox())!;
  if (isMobile) await notes.tap();
  else await notes.click();
  const feedback = page.locator(".glass-feedback");
  await expect(feedback).toHaveCount(1);
  await expect(feedback).toHaveAttribute("aria-hidden", "true");
  await expect(feedback).toHaveCSS("pointer-events", "none");
  await expect(notes).toHaveAttribute("aria-pressed", "true");
  const next = (await frame.boundingBox())!;
  expect(next.width).toBe(bounds.width);
  expect(next.height).toBe(bounds.height);
  await expect(feedback).toHaveCount(0, { timeout: 1500 });

  const work = dock.getByRole("button", { name: "Work", exact: true });
  await work.evaluate((element) => {
    element.addEventListener(
      "click",
      () => {
        const parent = element
          .closest(".gallery-demo")!
          .getBoundingClientRect();
        const control = element.getBoundingClientRect();
        (
          window as unknown as {
            expectedRippleOrigin: { x: number; y: number };
          }
        ).expectedRippleOrigin = {
          x: control.x + control.width / 2 - parent.x,
          y: control.y + control.height / 2 - parent.y,
        };
      },
      { once: true, capture: true },
    );
  });
  await work.focus();
  await work.press("Enter");
  await expect(feedback).toHaveCount(1);
  await expect(work).toHaveAttribute("aria-pressed", "true");
  const origin = await feedback.evaluate((element) => ({
    x: parseFloat((element as HTMLElement).style.left),
    y: parseFloat((element as HTMLElement).style.top),
  }));
  const expected = await page.evaluate(
    () =>
      (window as unknown as { expectedRippleOrigin: { x: number; y: number } })
        .expectedRippleOrigin,
  );
  expect(origin.x).toBeCloseTo(expected.x, 0);
  expect(origin.y).toBeCloseTo(expected.y, 0);
  await notes.focus();
  await notes.press("Enter");
  await expect(feedback).toHaveCount(1);
  await expect(feedback).toHaveCount(0, { timeout: 1500 });
});

test("reduced motion suppresses feedback and visibility changes clear it", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  const dock = page.getByRole("navigation", { name: "Studio navigation" });
  const notes = dock.getByRole("button", { name: "Notes", exact: true });
  const work = dock.getByRole("button", { name: "Work", exact: true });
  const feedback = page.locator(".glass-feedback");
  await notes.click();
  await expect(notes).toHaveAttribute("aria-pressed", "true");
  await expect(feedback).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await work.focus();
  await work.press("Enter");
  await expect(feedback).toHaveCount(1);
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(feedback).toHaveCount(0);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await notes.focus();
  await notes.press("Enter");
  await expect(feedback).toHaveCount(1);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(feedback).toHaveCount(0);
  await page.evaluate(() => {
    delete (document as unknown as { hidden?: boolean }).hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await work.focus();
  await work.press("Enter");
  await expect(feedback).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(feedback).toHaveCount(0);
  await page.goto("/components/expandable-dock");
  await page
    .getByRole("navigation", { name: "Studio navigation" })
    .getByRole("button", { name: "Notes", exact: true })
    .click();
  await expect(feedback).toHaveCount(0);
});
