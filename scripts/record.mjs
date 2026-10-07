import { chromium } from "playwright";
import { mkdir, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const run = promisify(execFile);
const names = [
  "interactive-code-window",
  "product-stage",
  "release-rail",
  "comparison-lens",
  "expandable-dock",
  "focus-stack",
];
const args = process.argv.slice(2);
const option = (name, fallback) =>
  args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const component = option("--component", "all");
const ratio = option("--ratio", "16/9");
const preset = option("--preset", "original");
const frames = {
  "16/9": { width: 1120, viewport: { width: 1280, height: 900 } },
  "1/1": { width: 800, viewport: { width: 1000, height: 1100 } },
  "9/16": { width: 450, viewport: { width: 720, height: 1100 } },
};
if (!frames[ratio] || (component !== "all" && !names.includes(component))) {
  throw new Error(
    "Use --component all|interactive-code-window|product-stage|release-rail|comparison-lens|expandable-dock|focus-stack and --ratio 16/9|1/1|9/16.",
  );
}
if (
  !["original", "alternate"].includes(preset) ||
  (preset === "alternate" &&
    !["expandable-dock", "interactive-code-window"].includes(component))
) {
  throw new Error(
    "Use --preset original|alternate; alternate requires --component expandable-dock or interactive-code-window.",
  );
}
await run("ffmpeg", ["-version"]).catch(() => {
  throw new Error("Recording exports require ffmpeg on PATH.");
});
const output = path.resolve("artifacts/clips");
const raw = path.join(output, ".raw");
await mkdir(raw, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
});

async function perform(page, name) {
  if (name === "expandable-dock") {
    for (const destination of preset === "alternate"
      ? ["Journal", "Kit", "Postcard", "Route"]
      : ["Notes", "About", "Contact", "Work"]) {
      const button = page
        .getByRole("navigation", {
          name:
            preset === "alternate" ? "Travel navigation" : "Studio navigation",
        })
        .getByRole("button", { name: destination, exact: true });
      await button.hover();
      await page.waitForTimeout(650);
      await button.click();
      await page.waitForTimeout(1400);
    }
  } else if (name === "focus-stack") {
    for (const title of ["Still Water", "Open Air", "Soft Orbit"]) {
      await page.getByRole("tab", { name: new RegExp(title) }).click();
      await page.waitForTimeout(2000);
    }
    await page
      .getByRole("button", { name: "Stack the deck", exact: true })
      .click();
    await page.waitForTimeout(1200);
    await page
      .getByRole("button", { name: "Spread the deck", exact: true })
      .click();
    await page.waitForTimeout(800);
  } else if (name === "interactive-code-window") {
    await page.getByRole("button", { name: "Replay walkthrough" }).click();
    await page.waitForTimeout(8200);
  } else if (name === "product-stage") {
    for (const [tab, duration] of [
      ["The big picture", 2000],
      ["A closer look", 2000],
      ["The next move", 2000],
      ["The big picture", 2200],
    ]) {
      await page.getByRole("tab", { name: new RegExp(tab) }).click();
      await page.waitForTimeout(duration);
    }
  } else if (name === "release-rail") {
    await page.getByLabel("Deployment scenario").selectOption("failure");
    await page.getByRole("button", { name: "Replay deployment" }).click();
    await page.getByText("Blocked", { exact: true }).waitFor();
    await page.waitForTimeout(800);
    await page.getByRole("button", { name: "Retry checks" }).click();
    await page.getByText("Ready", { exact: true }).waitFor();
    await page.waitForTimeout(1900);
  } else {
    const slider = page.getByRole("slider");
    const box = await slider.boundingBox();
    if (!box) throw new Error("Missing comparison canvas.");
    await page.waitForTimeout(1200);
    await page.mouse.move(box.x + box.width * 0.58, box.y + box.height / 2);
    await page.mouse.down();
    for (const fraction of [0.82, 0.18, 0.65, 0.58]) {
      await page.mouse.move(
        box.x + box.width * fraction,
        box.y + box.height / 2,
        { steps: 45 },
      );
      await page.waitForTimeout(900);
    }
    await page.mouse.up();
    await page.waitForTimeout(2600);
  }
}

try {
  for (const name of component === "all" ? names : [component]) {
    const { viewport, width } = frames[ratio];
    const context = await browser.newContext({
      viewport,
      recordVideo: { dir: raw, size: viewport },
    });
    try {
      const page = await context.newPage();
      await page.emulateMedia({ reducedMotion: "no-preference" });
      const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:3000";
      await page.goto(`${base}/showcase?component=${name}&preset=${preset}`, {
        waitUntil: "networkidle",
      });
      await page.getByLabel("Frame", { exact: true }).selectOption(ratio);
      await page.getByLabel("Backdrop", { exact: true }).selectOption("aero");
      await page.getByLabel("Demo theme", { exact: true }).selectOption("dark");
      await page.getByRole("button", { name: "Hide controls" }).click();
      const frame = page.locator(".showcase-frame");
      await frame.evaluate((element, width) => {
        element.style.width = `${width}px`;
      }, width);
      await page.waitForTimeout(400);
      const bounds = await frame.boundingBox();
      if (!bounds) throw new Error("Missing recording frame.");
      const stem = `${name}${preset === "alternate" ? "-alternate" : ""}-${ratio.replace("/", "x")}`;
      await frame.screenshot({ path: path.join(output, `${stem}.png`) });
      await perform(page, name);
      const video = page.video();
      await context.close();
      if (!video) throw new Error("Browser did not produce a recording.");
      const videoPath = await video.path();
      const crop = `crop=${Math.floor(bounds.width / 2) * 2}:${Math.floor(bounds.height / 2) * 2}:${Math.floor(bounds.x)}:${Math.floor(bounds.y)},fps=30`;
      const mp4 = path.join(output, `${stem}.mp4`);
      await run("ffmpeg", [
        "-y",
        "-sseof",
        "-8",
        "-i",
        videoPath,
        "-vf",
        crop,
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "20",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        mp4,
      ]);
      const palette = `fps=12,scale=${Math.min(900, width)}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse=dither=bayer:bayer_scale=3`;
      await run("ffmpeg", [
        "-y",
        "-i",
        mp4,
        "-filter_complex",
        palette,
        "-loop",
        "0",
        path.join(output, `${stem}.gif`),
      ]);
      await rm(videoPath);
      console.log(`Recorded ${stem}: MP4, GIF, and poster.`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
