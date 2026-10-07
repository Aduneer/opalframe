import { test, expect, type Page } from "@playwright/test";
import { enterStudio } from "./enter-studio";

declare global {
  interface Window {
    soundProbe: {
      contexts: AudioContext[];
      active: number;
      offsets: number[];
      gains: GainNode[];
      analysers: AnalyserNode[];
      rejectResume: boolean;
    };
  }
}

test.beforeEach(async ({ page }) => {
  // Observe real browser audio nodes rather than replacing playback with a mock.
  await page.addInitScript(() => {
    const probe: Window["soundProbe"] = {
      contexts: [],
      active: 0,
      offsets: [],
      gains: [],
      analysers: [],
      rejectResume: false,
    };
    window.soundProbe = probe;
    const NativeContext = window.AudioContext;
    window.AudioContext = class extends NativeContext {
      constructor(options?: AudioContextOptions) {
        super(options);
        probe.contexts.push(this);
      }
      resume() {
        if (probe.rejectResume) {
          probe.rejectResume = false;
          return Promise.reject(
            new DOMException("Playback denied", "NotAllowedError"),
          );
        }
        return super.resume();
      }
      createGain() {
        const gain = super.createGain();
        const analyser = this.createAnalyser();
        gain.connect(analyser);
        probe.gains.push(gain);
        probe.analysers.push(analyser);
        return gain;
      }
      createBufferSource() {
        const source = super.createBufferSource();
        const start = source.start.bind(source);
        source.start = (when = 0, offset = 0, duration?: number) => {
          probe.active++;
          probe.offsets.push(offset);
          start(when, offset, duration);
        };
        source.addEventListener("ended", () => probe.active--);
        return source;
      }
    };
  });
});

async function activate(page: Page, touch: boolean) {
  const button = page.getByRole("button", { name: "Sound off", exact: true });
  if (touch) await button.tap();
  else {
    await button.focus();
    await button.press("Space");
  }
  await expect(
    page.getByRole("button", { name: "Sound on", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
}

async function hidden(page: Page, value: boolean) {
  await page.evaluate((value) => {
    Object.defineProperty(document, "hidden", { configurable: true, value });
    document.dispatchEvent(new Event("visibilitychange"));
  }, value);
}

test("sound is opt-in, audible, independent of reduced motion, and preserved across docs", async ({
  page,
  isMobile,
}) => {
  const downloads: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/audio/")) downloads.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/showcase", { waitUntil: "networkidle" });
  expect(downloads).toHaveLength(0);
  expect(await page.evaluate(() => window.soundProbe.contexts.length)).toBe(0);
  await page.goto("/", { waitUntil: "networkidle" });
  await enterStudio(page);
  expect(downloads).toHaveLength(0);
  expect(await page.evaluate(() => window.soundProbe.contexts.length)).toBe(0);
  await activate(page, isMobile);
  expect(downloads).toHaveLength(1);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const analyser = window.soundProbe.analysers[0];
        const data = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(data);
        return Math.max(...data.map(Math.abs));
      }),
    )
    .toBeGreaterThan(0.005);

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page
    .getByRole("button", { name: "Pause artwork", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Sound on", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => window.soundProbe.active)).toBe(1);

  const started = await page.evaluate(
    () => window.soundProbe.contexts[0].currentTime,
  );
  await page.getByRole("link", { name: "Get the source", exact: true }).click();
  await expect(page).toHaveURL(/components\/interactive-code-window/);
  await expect(
    page.getByRole("button", { name: "Sound on", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => window.soundProbe.contexts.length)).toBe(1);
  expect(await page.evaluate(() => window.soundProbe.offsets.length)).toBe(1);
  expect(
    await page.evaluate(() => window.soundProbe.contexts[0].currentTime),
  ).toBeGreaterThan(started);
  expect(downloads).toHaveLength(1);

  await page.getByRole("button", { name: "Sound on", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Sound off", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect
    .poll(() => page.evaluate(() => window.soundProbe.active))
    .toBe(0);
  await expect
    .poll(() => page.evaluate(() => window.soundProbe.contexts[0].state))
    .toBe("suspended");
  await activate(page, isMobile);
  expect(downloads).toHaveLength(1);
  expect(
    await page.evaluate(() => window.soundProbe.offsets[1]),
  ).toBeGreaterThan(0);
  await page.reload({ waitUntil: "networkidle" });
  await expect(
    page.getByRole("button", { name: "Sound off", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => window.soundProbe.contexts.length)).toBe(0);
  expect(downloads).toHaveLength(1);
});

test("hidden tabs freeze playback and recording mode stays silent", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  await enterStudio(page);
  await activate(page, isMobile);
  await hidden(page, true);
  await expect(
    page.getByRole("button", { name: "Sound paused", exact: true }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.soundProbe.contexts[0].state))
    .toBe("suspended");
  const frozen = await page.evaluate(
    () => window.soundProbe.contexts[0].currentTime,
  );
  await page.waitForTimeout(200);
  expect(
    await page.evaluate(() => window.soundProbe.contexts[0].currentTime),
  ).toBe(frozen);
  await hidden(page, false);
  await expect(
    page.getByRole("button", { name: "Sound on", exact: true }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.soundProbe.active))
    .toBe(1);
  await page.getByRole("link", { name: "Opalframe home" }).click();
  await enterStudio(page);
  await page.locator('.home-main a[href="/showcase"]').click();
  await expect(page).toHaveURL(/showcase/);
  await expect
    .poll(() => page.evaluate(() => window.soundProbe.active))
    .toBe(0);
  await page.goBack();
  await expect(
    page.getByRole("button", { name: "Sound on", exact: true }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.soundProbe.active))
    .toBe(1);
  expect(await page.evaluate(() => window.soundProbe.contexts.length)).toBe(1);
});

test("failed downloads and rejected playback return an honest retry state", async ({
  page,
  isMobile,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/audio/quiet-01.flac", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.goto("/");
  await enterStudio(page);
  const off = page.getByRole("button", { name: "Sound off", exact: true });
  await off.click();
  const retry = page.getByRole("button", {
    name: "Sound unavailable — retry",
    exact: true,
  });
  await expect(retry).toHaveAttribute("aria-pressed", "false");
  expect(await page.evaluate(() => window.soundProbe.active)).toBe(0);
  await page.unroute("**/audio/quiet-01.flac");
  await page.evaluate(() => {
    window.soundProbe.rejectResume = true;
  });
  await retry.click();
  await expect(retry).toHaveAttribute("aria-pressed", "false");
  if (isMobile) await retry.tap();
  else {
    await retry.focus();
    await retry.press("Enter");
  }
  await expect(
    page.getByRole("button", { name: "Sound on", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => window.soundProbe.active)).toBe(1);
  expect(errors).toEqual([]);
});

test("canceling a pending download cannot start late and the header fits both themes", async ({
  page,
}) => {
  let release!: () => void;
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/audio/quiet-01.flac", async (route) => {
    await waiting;
    await route.continue().catch(() => {});
  });
  await page.goto("/");
  await enterStudio(page);
  await page.getByRole("button", { name: "Sound off", exact: true }).click();
  const loading = page.getByRole("button", {
    name: "Sound loading",
    exact: true,
  });
  await expect(loading).toBeVisible();
  await loading.click();
  release();
  await expect(
    page.getByRole("button", { name: "Sound off", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.soundProbe.active)).toBe(0);
  for (const theme of ["dark", "light"]) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
    }, theme);
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(width);
      const toggle = await page
        .getByRole("button", { name: "Sound off", exact: true })
        .boundingBox();
      expect(toggle!.width).toBeGreaterThanOrEqual(36);
      expect(toggle!.x + toggle!.width).toBeLessThanOrEqual(width);
    }
  }
});
