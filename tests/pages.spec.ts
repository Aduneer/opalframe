import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { enterStudio } from "./enter-studio";

const { basePath, site } = JSON.parse(
  readFileSync(path.resolve("apps/docs/.pages-build.json"), "utf8"),
);
const names = [
  "interactive-code-window",
  "expandable-dock",
  "product-stage",
  "release-rail",
  "comparison-lens",
  "focus-stack",
];

test("static docs open directly with working registry, copy commands, and source links", async ({
  page,
  request,
}) => {
  for (const name of names) {
    await page.goto(`components/${name}/`);
    await expect(page.locator(".docs-heading h1")).toBeVisible();
    if (name === "focus-stack") {
      for (const image of await page
        .locator(".is-focus-stack-card img")
        .all()) {
        await expect(image).toHaveAttribute(
          "src",
          new RegExp(`^${basePath}/artwork/stack/`),
        );
        await expect
          .poll(() => image.evaluate((el: HTMLImageElement) => el.naturalWidth))
          .toBeGreaterThan(0);
      }
    }
    const command = page.locator(".command-block code");
    await expect(command).toHaveText(
      `npx shadcn@latest add http://127.0.0.1:3001${basePath}/r/${name}.json`,
    );
    const item = await request.get(`r/${name}.json`);
    expect(item.ok()).toBe(true);
    const registry = await item.json();
    expect(registry.files).toHaveLength(2);
    for (const file of registry.files) {
      expect(file.content).toBe(readFileSync(path.resolve(file.path), "utf8"));
    }
    await page
      .getByRole("link", { name: "Get the source", exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`/components/${name}/#source$`));
    await expect(
      page.getByRole("heading", { name: "Source", exact: true }),
    ).toBeInViewport();
    await page.locator(".source-details summary").first().click();
    await expect(
      page.getByRole("button", { name: `Copy ${name}.tsx`, exact: true }),
    ).toBeVisible();
  }
});

test("static artwork and opt-in audio use the project path through client navigation", async ({
  page,
  isMobile,
}) => {
  const errors: string[] = [];
  const audio: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (request.url().includes("/audio/")) audio.push(request.url());
  });
  await page.addInitScript(() => {
    const NativeContext = window.AudioContext;
    const contexts: AudioContext[] = [];
    (window as unknown as { pagesAudio: AudioContext[] }).pagesAudio = contexts;
    window.AudioContext = class extends NativeContext {
      constructor(options?: AudioContextOptions) {
        super(options);
        contexts.push(this);
      }
    };
  });
  await page.goto("./", { waitUntil: "networkidle" });
  await enterStudio(page);
  await expect(page).toHaveTitle(/Opalframe/);
  expect(audio).toHaveLength(0);
  await expect(page.locator(".signature-charcoal")).toHaveAttribute(
    "src",
    `${basePath}/artwork/ribbon-orbit-charcoal.webp`,
  );
  await expect(page.locator(".signature-lens")).toHaveAttribute(
    "data-rotation-ready",
    "true",
  );
  const off = page.getByRole("button", { name: "Sound off", exact: true });
  if (isMobile) await off.tap();
  else await off.click();
  await expect(
    page.getByRole("button", { name: "Sound on", exact: true }),
  ).toBeVisible();
  expect(audio).toEqual([
    `http://127.0.0.1:3001${basePath}/audio/quiet-01.flac`,
  ]);
  await page
    .getByRole("link", { name: "Get Expandable Dock source", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(
    new RegExp(`${basePath}/components/expandable-dock/$`),
  );
  await expect(
    page.getByRole("button", { name: "Sound on", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { pagesAudio: AudioContext[] }).pagesAudio.length,
    ),
  ).toBe(1);
  await page.getByRole("link", { name: "Opalframe home" }).click();
  await enterStudio(page);
  await page.locator('.home-main a[href$="/showcase/"]').click();
  await expect(page).toHaveURL(new RegExp(`${basePath}/showcase/$`));
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { pagesAudio: AudioContext[] }).pagesAudio[0]
            .state,
      ),
    )
    .toBe("suspended");
  await page.goBack();
  // History restores the collection scroll position and naturally clears the opening.
  await expect(
    page.getByRole("button", { name: "Sound on", exact: true }),
  ).toBeVisible();
  expect(audio).toHaveLength(1);
  expect(errors).toEqual([]);
});

test("exported metadata, 404s, and narrow layout work without a Next server", async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    `${new URL(site).origin}${basePath}/social-preview.png`,
  );
  const icon = await request.get("icon.svg");
  expect(icon.ok()).toBe(true);
  const missing = await request.get("components/not-a-study/");
  expect(missing.status()).toBe(404);
  for (const theme of ["dark", "light"]) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
    }, theme);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(width);
    }
  }
});
