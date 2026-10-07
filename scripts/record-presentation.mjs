import { chromium } from "playwright";
import { mkdir, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const run = promisify(execFile);
const output = path.resolve("artifacts/presentation");
const raw = path.join(output, ".raw");
const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:3000";
const viewport = { width: 1440, height: 1040 };
await mkdir(raw, { recursive: true });
await run("ffmpeg", ["-version"]);
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
});

async function recordingRange(videoPath, posterPath) {
  // Browser video timestamps can drift from wall time. Match the first usable
  // scene against its actual poster, then retain the complete recorded action.
  const sampleSize = 96 * 70 * 3;
  const options = { encoding: "buffer", maxBuffer: 32 * 1024 * 1024 };
  const [{ stdout: samples }, { stdout: poster }, { stdout: info }] =
    await Promise.all([
      run(
        "ffmpeg",
        [
          "-loglevel",
          "error",
          "-i",
          videoPath,
          "-vf",
          "fps=5,scale=96:70",
          "-f",
          "rawvideo",
          "-pix_fmt",
          "rgb24",
          "-",
        ],
        options,
      ),
      run(
        "ffmpeg",
        [
          "-loglevel",
          "error",
          "-i",
          posterPath,
          "-vf",
          "scale=96:70",
          "-frames:v",
          "1",
          "-f",
          "rawvideo",
          "-pix_fmt",
          "rgb24",
          "-",
        ],
        options,
      ),
      run("ffprobe", [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "json",
        videoPath,
      ]),
    ]);
  const scores = [];
  for (
    let frame = 0;
    frame < Math.floor(samples.length / sampleSize);
    frame++
  ) {
    let difference = 0;
    for (let pixel = 0; pixel < sampleSize; pixel++)
      difference += Math.abs(
        samples[frame * sampleSize + pixel] - poster[pixel],
      );
    scores.push(difference / sampleSize);
  }
  if (!scores.length) throw new Error("No browser video frames to export");
  const start =
    scores.findIndex((score) => score <= Math.min(...scores) + 2) / 5;
  const duration = Number(JSON.parse(info).format.duration) - start;
  if (duration <= 0) throw new Error("Invalid browser recording duration");
  return { start, duration };
}

async function record(theme, treatment, opening) {
  const context = await browser.newContext({
    viewport,
    recordVideo: { dir: raw, size: viewport },
  });
  const stem = `${opening ? "studio-opening" : "light-response"}-${treatment}`;
  try {
    await context.addInitScript(
      (next) => localStorage.setItem("interface-theme", next),
      theme,
    );
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(base, { waitUntil: "networkidle" });
    const glass = page.locator(".studio-opening");
    await glass.waitFor({ state: "visible" });
    if (opening) {
      await page.screenshot({ path: path.join(output, `${stem}.png`) });
      const distance = await page
        .locator(".studio-runway")
        .evaluate((el) => el.getBoundingClientRect().height);
      const scrollAt = performance.now() + 1200;
      await page.waitForTimeout(1200);
      for (let step = 1; step <= 24; step++) {
        await page.mouse.wheel(0, distance / 24);
        const delay = scrollAt + step * (4200 / 24) - performance.now();
        if (delay > 0) await page.waitForTimeout(delay);
      }
      // Fractional wheel deltas can leave a final subpixel of runway.
      await page.mouse.wheel(0, 2);
      await glass.waitFor({ state: "hidden" });
      await page.waitForTimeout(2500);
    } else {
      await page
        .getByRole("button", { name: "Enter studio", exact: true })
        .click();
      await glass.waitFor({ state: "hidden" });
      await page.waitForFunction(
        () =>
          document
            .querySelector(".signature-lens")
            ?.getAttribute("data-rotation-ready") === "true",
      );
      await page.screenshot({ path: path.join(output, `${stem}.png`) });
      const intro = await page.locator(".gallery-intro").boundingBox();
      if (!intro) throw new Error("Missing opening composition");
      await page.waitForTimeout(2600);
      for (let step = 0; step <= 24; step++) {
        await page.mouse.move(
          intro.x + intro.width * (0.2 + (0.65 * step) / 24),
          intro.y + intro.height * (0.3 + (0.2 * step) / 24),
        );
        await page.waitForTimeout(60);
      }
      await page.mouse.move(0, 0);
      await page.waitForTimeout(4000);
    }
    const video = page.video();
    await context.close();
    if (!video) throw new Error("Browser did not produce a recording");
    const videoPath = await video.path();
    const { start, duration } = await recordingRange(
      videoPath,
      path.join(output, `${stem}.png`),
    );
    const mp4 = path.join(output, `${stem}.mp4`);
    await run("ffmpeg", [
      "-y",
      "-ss",
      String(start),
      "-i",
      videoPath,
      "-t",
      "8",
      "-vf",
      `setpts=${8 / duration}*(PTS-STARTPTS),fps=30,tpad=stop_mode=clone:stop_duration=0.2`,
      "-an",
      "-c:v",
      "libx264",
      "-threads",
      "4",
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
    await run("ffmpeg", [
      "-y",
      "-i",
      mp4,
      "-filter_complex",
      "fps=12,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=3",
      "-loop",
      "0",
      path.join(output, `${stem}.gif`),
    ]);
    await rm(videoPath);
    console.log(`Recorded ${stem}: eight-second MP4, GIF, and poster.`);
  } finally {
    await context.close();
  }
}

try {
  for (const [theme, treatment] of [
    ["dark", "charcoal"],
    ["light", "pearl"],
  ]) {
    await record(theme, treatment, true);
    await record(theme, treatment, false);
  }
} finally {
  await browser.close();
}
