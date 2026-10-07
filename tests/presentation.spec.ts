import { test, expect } from "@playwright/test";
import { enterStudio } from "./enter-studio";

test("light responds locally without moving gallery controls and returns to rest", async ({
  page,
  isMobile,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await enterStudio(page);
  const intro = page.locator(".gallery-intro");
  const lens = page.locator(".signature-lens");
  const box = (await intro.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.3);
  if (isMobile) {
    await expect(intro).not.toHaveAttribute("data-light-active");
    await expect(lens).toHaveCSS("transform", "none");
    await page
      .getByRole("navigation", { name: "Studio navigation" })
      .getByRole("button", { name: "Notes", exact: true })
      .tap();
    await expect(
      page.getByRole("heading", { name: /Notes from/ }),
    ).toBeVisible();
    return;
  }
  await expect(intro).toHaveAttribute("data-light-active", "true");
  const offsets = await intro.evaluate((el) =>
    ["--lens-shift-x", "--lens-shift-y", "--lens-turn"].map((name) =>
      parseFloat((el as HTMLElement).style.getPropertyValue(name)),
    ),
  );
  expect(Math.abs(offsets[0])).toBeLessThanOrEqual(1);
  expect(Math.abs(offsets[1])).toBeLessThanOrEqual(0.4);
  expect(Math.abs(offsets[2])).toBeLessThanOrEqual(0.35);

  const preview = page.locator(".gallery-lens .gallery-demo");
  const slider = page.getByRole("slider");
  await preview.scrollIntoViewIfNeeded();
  // Scroll deliberately clears pointer feedback; measure and hover after it settles.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  const before = (await slider.boundingBox())!;
  await preview.hover({ position: { x: 30, y: 30 } });
  await expect(preview).toHaveAttribute("data-light-active", "true");
  await expect(intro).not.toHaveAttribute("data-light-active");
  expect(await slider.boundingBox()).toEqual(before);
  await slider.focus();
  await slider.press("ArrowRight");
  await expect(slider).toHaveValue("59");
  await expect(preview).toHaveCSS("border-top-color", "rgb(178, 207, 255)");
  await page.mouse.move(0, 0);
  await expect(preview).not.toHaveAttribute("data-light-active");
  await expect(lens).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");

  for (const study of ["wide", "product", "release"]) {
    const card = page.locator(`.gallery-${study} .gallery-demo`);
    await card.scrollIntoViewIfNeeded();
    const control = card.locator("button").first();
    const bounds = await control.boundingBox();
    await card.hover({ position: { x: 10, y: 10 } });
    await expect(card).toHaveAttribute("data-light-active", "true");
    expect(await control.boundingBox()).toEqual(bounds);
    await control.focus();
    await expect(card).toHaveCSS("border-top-color", "rgb(178, 207, 255)");
  }
  await intro.scrollIntoViewIfNeeded();
  await intro.hover({ position: { x: box.width * 0.7, y: box.height * 0.2 } });
  await expect(intro).toHaveAttribute("data-light-active", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(intro).not.toHaveAttribute("data-light-active");
  await expect(lens).toHaveCSS("transform", "none");
  await expect(lens).toHaveCSS("transition-duration", "0s");
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.4);
  await expect(intro).not.toHaveAttribute("data-light-active");
});

test("hidden and off-screen ambience freezes without continuous JS frames", async ({
  page,
  isMobile,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await enterStudio(page);
  const intro = page.locator(".gallery-intro");
  const lens = page.locator(".signature-lens");
  const float = page.locator(".signature-float");
  const box = (await intro.boundingBox())!;
  const video = page.locator('.signature-motion[data-motion-theme="charcoal"]');
  await expect(lens).toHaveAttribute("data-rotation-ready", "true");
  await expect(lens).toHaveAttribute("data-ambient-running", "true");
  if (!isMobile) {
    await page.mouse.move(box.x + 80, box.y + 80);
    await expect(intro).toHaveAttribute("data-light-active", "true");
  }
  // CSS and native video handle ambience; stationary input must not schedule JS frames.
  await page.evaluate(() => {
    const original = window.requestAnimationFrame;
    (window as unknown as { scheduledFrames: number }).scheduledFrames = 0;
    window.requestAnimationFrame = (callback) => {
      (window as unknown as { scheduledFrames: number }).scheduledFrames++;
      return original(callback);
    };
  });
  await page.waitForTimeout(350);
  expect(
    await page.evaluate(
      () => (window as unknown as { scheduledFrames: number }).scheduledFrames,
    ),
  ).toBe(0);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(intro).not.toHaveAttribute("data-light-active");
  await expect(lens).not.toHaveAttribute("data-ambient-running");
  await expect(float).toHaveCSS("animation-play-state", "paused");
  await expect
    .poll(() => video.evaluate((el) => (el as HTMLVideoElement).paused))
    .toBe(true);
  const frozenTime = await video.evaluate(
    (el) => (el as HTMLVideoElement).currentTime,
  );
  const frozen = await float.evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(250);
  await expect(float).toHaveCSS("transform", frozen);
  expect(
    await video.evaluate((el) => (el as HTMLVideoElement).currentTime),
  ).toBe(frozenTime);
  await page.evaluate(() => {
    delete (document as unknown as { hidden?: boolean }).hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(lens).toHaveAttribute("data-ambient-running", "true");
  await page.evaluate(() => window.scrollTo(0, 1200));
  await expect(intro).not.toHaveAttribute("data-light-active");
  await expect(lens).not.toHaveAttribute("data-ambient-running");
  await expect(float).toHaveCSS("animation-play-state", "paused");
  await expect
    .poll(() => video.evaluate((el) => (el as HTMLVideoElement).paused))
    .toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(lens).toHaveAttribute("data-ambient-running", "true");
});

test("diagonal rotation and float pause together with keyboard or touch", async ({
  page,
  isMobile,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await enterStudio(page);
  const float = page.locator(".signature-float");
  const lens = page.locator(".signature-lens");
  const pause = page.getByRole("button", { name: "Pause artwork" });
  for (const theme of ["dark", "light"]) {
    await page.evaluate(
      (next) => (document.documentElement.dataset.theme = next),
      theme,
    );
    const video = page.locator(
      `.signature-motion[data-motion-theme="${theme === "light" ? "pearl" : "charcoal"}"]`,
    );
    const inactive = page.locator(
      `.signature-motion[data-motion-theme="${theme === "light" ? "charcoal" : "pearl"}"]`,
    );
    await expect(video).toHaveAttribute("data-active", "true");
    await expect
      .poll(() => video.evaluate((el) => (el as HTMLVideoElement).paused))
      .toBe(false);
    await expect
      .poll(() => inactive.evaluate((el) => (el as HTMLVideoElement).paused))
      .toBe(true);
    const before = await float.evaluate((el) => getComputedStyle(el).transform);
    const timeBefore = await video.evaluate(
      (el) => (el as HTMLVideoElement).currentTime,
    );
    await page.waitForTimeout(500);
    expect(
      await float.evaluate((el) => getComputedStyle(el).transform),
    ).not.toBe(before);
    expect(
      await video.evaluate((el) => (el as HTMLVideoElement).currentTime),
    ).not.toBe(timeBefore);
    if (isMobile) await pause.tap();
    else {
      await pause.focus();
      await pause.press("Space");
    }
    const resume = page.getByRole("button", { name: "Resume artwork" });
    await expect(resume).toHaveAttribute("aria-pressed", "true");
    await expect(float).toHaveCSS("animation-play-state", "paused");
    await expect
      .poll(() => video.evaluate((el) => (el as HTMLVideoElement).paused))
      .toBe(true);
    const pausedFloat = await float.evaluate(
      (el) => getComputedStyle(el).transform,
    );
    const pausedTime = await video.evaluate(
      (el) => (el as HTMLVideoElement).currentTime,
    );
    await page.waitForTimeout(250);
    await expect(float).toHaveCSS("transform", pausedFloat);
    expect(
      await video.evaluate((el) => (el as HTMLVideoElement).currentTime),
    ).toBe(pausedTime);
    if (isMobile) await resume.tap();
    else await resume.press("Space");
    await expect(float).toHaveCSS("animation-play-state", "running");
    await expect
      .poll(() => video.evaluate((el) => (el as HTMLVideoElement).paused))
      .toBe(false);
  }
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(lens).not.toHaveAttribute("data-ambient-running");
  await expect
    .poll(() =>
      page
        .locator('.signature-motion[data-active="true"]')
        .evaluate((el) => (el as HTMLVideoElement).paused),
    )
    .toBe(true);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(lens).toHaveAttribute("data-ambient-running", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(float).toHaveCSS("animation-name", "none");
  await expect(float).toHaveCSS("transform", "none");
  await expect(lens).not.toHaveAttribute("data-rotation-ready");
  await expect(
    page.locator('.signature-motion[data-motion-theme="pearl"]'),
  ).toBeHidden();
  await expect(page.locator(".signature-pearl")).toHaveCSS("opacity", "1");
  await expect(pause).toBeHidden();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(float).toHaveCSS("animation-play-state", "running");
});

test("reduced motion avoids loading the rotation; failed media keeps the still", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const fetched: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith(".webm")) fetched.push(request.url());
  });
  await page.goto("/", { waitUntil: "networkidle" });
  await enterStudio(page);
  expect(fetched).toEqual([]);
  await expect(page.locator(".signature-charcoal")).toHaveCSS("opacity", "1");
  await page.route("**/artwork/*.webm", (route) => route.abort());
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect
    .poll(() =>
      page
        .locator('.signature-motion[data-motion-theme="charcoal"]')
        .evaluate((el) => (el as HTMLVideoElement).error !== null),
    )
    .toBe(true);
  await expect(page.locator(".signature-lens")).not.toHaveAttribute(
    "data-rotation-ready",
  );
  await expect(page.locator(".signature-charcoal")).toHaveCSS("opacity", "1");
  await page.getByRole("button", { name: "Pause artwork" }).click();
  await expect(
    page.getByRole("button", { name: "Resume artwork" }),
  ).toBeVisible();
});
