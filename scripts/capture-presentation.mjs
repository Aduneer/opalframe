import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

// Detailed review stills complement the README, social, and recording captures.
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
});
try {
  await mkdir("artifacts/presentation", { recursive: true });
  const page = await browser.newPage();
  await page.emulateMedia({ reducedMotion: "reduce" });
  const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:3000";
  for (const [name, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(base, { waitUntil: "networkidle" });
    for (const [theme, treatment] of [
      ["dark", "charcoal"],
      ["light", "pearl"],
    ]) {
      await page.evaluate((next) => {
        document.documentElement.dataset.theme = next;
        localStorage.setItem("interface-theme", next);
      }, theme);
      await page
        .locator(`.signature-${treatment}`)
        .evaluate((element) => element.decode());
      await page.screenshot({
        path: `artifacts/presentation/${name}-${treatment}.png`,
      });
    }
  }
  for (const [name, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    await page.setViewportSize(viewport);
    for (const [theme, treatment] of [
      ["dark", "charcoal"],
      ["light", "pearl"],
    ]) {
      await page.evaluate((next) => {
        document.documentElement.dataset.theme = next;
        localStorage.setItem("interface-theme", next);
      }, theme);
      await page.goto(`${base}/components/interactive-code-window`, {
        waitUntil: "networkidle",
      });
      await page.screenshot({
        path: `artifacts/presentation/docs-${name}-${treatment}.png`,
      });
      if (theme === "dark") {
        await page
          .getByRole("heading", { name: "Installation", exact: true })
          .scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `artifacts/presentation/installation-${name}.png`,
        });
      }
      if (name === "desktop") {
        await page
          .getByRole("heading", { name: "Installation", exact: true })
          .scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `artifacts/presentation/docs-reading-${treatment}.png`,
        });
        await page.goto(base, { waitUntil: "networkidle" });
        await page.locator(".gallery-stack").scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `artifacts/presentation/gallery-lower-${treatment}.png`,
        });
      }
    }
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const [name, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    await page.setViewportSize(viewport);
    for (const [theme, treatment] of [
      ["dark", "charcoal"],
      ["light", "pearl"],
    ]) {
      await page.evaluate(
        (next) => localStorage.setItem("interface-theme", next),
        theme,
      );
      await page.goto(base, { waitUntil: "networkidle" });
      const opening = page.locator(".studio-opening");
      await opening.waitFor({ state: "visible" });
      await page.screenshot({
        path: `artifacts/presentation/opening-${name}-${treatment}.png`,
      });
      const distance = await page
        .locator(".studio-runway")
        .evaluate((el) => el.getBoundingClientRect().height);
      await page.evaluate(
        (y) => scrollTo({ top: y, behavior: "instant" }),
        distance * 0.5,
      );
      await page.waitForTimeout(150);
      await page.screenshot({
        path: `artifacts/presentation/opening-mid-${name}-${treatment}.png`,
      });
      await page.evaluate(
        (y) => scrollTo({ top: Math.ceil(y), behavior: "instant" }),
        distance,
      );
      await opening.waitFor({ state: "hidden" });
      await page.screenshot({
        path: `artifacts/presentation/opening-clear-${name}-${treatment}.png`,
      });
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/showcase?component=interactive-code-window`, {
    waitUntil: "networkidle",
  });
  for (const [backdrop, theme, treatment] of [
    ["carbon", "dark", "charcoal"],
    ["pearl", "light", "pearl"],
    ["aero", "light", "aero"],
  ]) {
    await page.getByLabel("Backdrop", { exact: true }).selectOption(backdrop);
    await page.getByLabel("Demo theme", { exact: true }).selectOption(theme);
    await page.screenshot({
      path: `artifacts/presentation/studio-${treatment}.png`,
    });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/components/interactive-code-window`, {
    waitUntil: "networkidle",
  });
  await page
    .getByRole("group", { name: "Walkthrough steps", exact: true })
    .getByRole("button", { name: /Frame/ })
    .click();
  for (const theme of ["dark", "light"]) {
    await page.evaluate((next) => {
      document.documentElement.dataset.theme = next;
    }, theme);
    await page.locator(".field-note").screenshot({
      path: `artifacts/presentation/field-note-header-${theme}.png`,
    });
  }
  console.log(
    "Saved opening, docs, reading, lower gallery, studio, and header-detail stills in artifacts/presentation/.",
  );
} finally {
  await browser.close();
}
