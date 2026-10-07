import { test, expect, type Page, type Locator } from "@playwright/test";
import sharp from "sharp";

async function reveal(page: Page, fraction: number) {
  const distance = await page
    .locator(".studio-runway")
    .evaluate((element) => element.getBoundingClientRect().height);
  await page.evaluate(
    (y) => scrollTo({ top: y, behavior: "instant" }),
    distance * fraction,
  );
  await expect(page.locator(".studio-page")).not.toHaveAttribute("inert");
}

async function smoothClick(page: Page, link: Locator, target: Locator) {
  await page.evaluate(() => {
    const samples: number[] = [];
    const record = () => samples.push(scrollY);
    (
      window as unknown as { scrollSamples: number[]; stopSamples: () => void }
    ).scrollSamples = samples;
    (window as unknown as { stopSamples: () => void }).stopSamples = () =>
      removeEventListener("scroll", record);
    addEventListener("scroll", record);
  });
  await link.click();
  await expect
    .poll(async () => (await target.boundingBox())!.y)
    .toBeLessThan(85);
  // Wait for the native scroll to settle before checking the intermediate positions.
  await expect
    .poll(async () => Math.abs((await target.boundingBox())!.y - 60))
    .toBeLessThan(5);
  const samples = await page.evaluate(() => {
    const state = window as unknown as {
      scrollSamples: number[];
      stopSamples: () => void;
    };
    state.stopSamples();
    return state.scrollSamples;
  });
  expect(new Set(samples.map(Math.round)).size).toBeGreaterThan(3);
}

test("the cleared glass releases header controls before the rim finishes", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await reveal(page, 0.86);
  const opening = page.locator(".studio-opening");
  await expect(opening).toHaveAttribute("data-studio-state", "opening");
  await expect(opening).toHaveAttribute("data-studio-interactive", "true");
  await expect(opening).toHaveAttribute("inert", "");
  await expect(opening).toHaveCSS("pointer-events", "none");
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await reveal(page, 1);
  await expect(opening).toBeHidden();
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("link", { name: "Get the source", exact: true }).click();
  await expect(page).toHaveURL(
    /\/components\/interactive-code-window#installation/,
  );
});

test("collection and study links scroll smoothly after the native opening", async ({
  page,
  isMobile,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await reveal(page, 1);
  const entry = isMobile
    ? page.getByRole("link", { name: "Explore the collection" })
    : page
        .getByRole("navigation", { name: "Main navigation" })
        .getByRole("link", { name: "Components", exact: true });
  await smoothClick(page, entry, page.locator("#components"));
  await expect(page).toHaveURL(/#components$/);
  await expect(page.locator(".studio-runway")).toHaveCSS("height", "0px");
  const link = page
    .getByRole("navigation", { name: "Jump to a study" })
    .locator('a[href="#study-product"]');
  await smoothClick(page, link, page.locator("#study-product"));
  await expect(page).toHaveURL(/#study-product$/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page
    .getByRole("navigation", { name: "Jump to a study" })
    .locator('a[href="#study-lens"]')
    .click();
  await expect(page).toHaveURL(/#study-lens$/);
  await expect
    .poll(async () =>
      Math.abs((await page.locator("#study-lens").boundingBox())!.y - 60),
    )
    .toBeLessThan(5);
});

test("alpha stays transparent across the complete rotation in both themes", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await reveal(page, 1);
  for (const theme of ["dark", "light"]) {
    await page.evaluate(
      (value) => (document.documentElement.dataset.theme = value),
      theme,
    );
    const lens = page.locator(".signature-lens");
    await expect(lens).toHaveAttribute("data-rotation-ready", "true");
    const video = page.locator(
      `.signature-motion[data-motion-theme="${theme === "dark" ? "charcoal" : "pearl"}"]`,
    );
    await expect(video).toHaveAttribute("data-active", "true");
    await page.getByRole("button", { name: "Pause artwork" }).click();
    await expect(lens).toHaveCSS("mix-blend-mode", "normal");
    await expect(video).toHaveAttribute("data-alpha-ready", "true");
    for (const time of [0.25, 1, 2, 3, 4, 5, 6, 7]) {
      const frame = await video.evaluate(async (element, seconds) => {
        const media = element as HTMLVideoElement;
        await new Promise<void>((resolve) => {
          media.addEventListener("seeked", () => resolve(), { once: true });
          media.currentTime = seconds;
        });
        const canvas = document.createElement("canvas");
        canvas.width = media.videoWidth;
        canvas.height = media.videoHeight;
        const context = canvas.getContext("2d")!;
        context.drawImage(media, 0, 0);
        const pixels = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        ).data;
        let clear = 0;
        let translucent = 0;
        for (let i = 3; i < pixels.length; i += 4) {
          if (pixels[i] === 0) clear++;
          else if (pixels[i] < 255) translucent++;
        }
        return {
          corners: [
            pixels[3],
            pixels[canvas.width * 4 - 1],
            pixels[pixels.length - 1],
          ],
          clear,
          translucent,
          count: canvas.width * canvas.height,
        };
      }, time);
      expect(frame.corners).toEqual([0, 0, 0]);
      expect(frame.clear / frame.count).toBeGreaterThan(0.5);
      expect(frame.translucent).toBeGreaterThan(0);
    }
    const bounds = (await video.boundingBox())!;
    const png = await page.screenshot({
      clip: {
        x: Math.ceil(bounds.x + 5),
        y: Math.ceil(bounds.y + 5),
        width: 4,
        height: 4,
      },
    });
    const { data } = await sharp(png)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const background = await page
      .locator("body")
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    const expected = background.match(/\d+/g)!.map(Number);
    for (let i = 0; i < data.length; i++)
      expect(Math.abs(data[i] - expected[i % 3])).toBeLessThanOrEqual(2);
    await page.getByRole("button", { name: "Resume artwork" }).click();
  }
});

test("a decoder that drops alpha retains the transparent still", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const read = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function (...args) {
      const pixels = read.apply(this, args);
      pixels.data[3] = 255;
      return pixels;
    };
  });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Enter studio", exact: true }).click();
  const video = page.locator('.signature-motion[data-motion-theme="charcoal"]');
  await expect(video).toHaveAttribute("data-motion-failed", "true");
  await expect(video).not.toHaveAttribute("data-active");
  await expect(page.locator(".signature-lens")).not.toHaveAttribute(
    "data-rotation-ready",
  );
  await expect(page.locator(".signature-charcoal")).toHaveCSS("opacity", "1");
  expect(
    await video.evaluate((element) => (element as HTMLVideoElement).error),
  ).toBeNull();
  await expect
    .poll(() =>
      video.evaluate((element) => (element as HTMLVideoElement).paused),
    )
    .toBe(true);
});
