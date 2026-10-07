import { chromium } from "playwright";
import { mkdir, readFile } from "node:fs/promises";

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
});
try {
  await mkdir("artifacts", { recursive: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:3000";
  await page.goto(base, { waitUntil: "networkidle" });
  await page
    .locator(".signature-charcoal")
    .evaluate((element) => element.decode());
  await page.screenshot({
    path: "artifacts/homepage-dark.png",
    fullPage: true,
  });
  await page.screenshot({ path: "artifacts/hero.png" });
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await page.screenshot({
    path: "artifacts/homepage-light.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "artifacts/homepage-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto(`${base}/components/interactive-code-window`, {
    waitUntil: "networkidle",
  });
  await page
    .locator(".is-code-window")
    .screenshot({ path: "artifacts/code-window-dark.png" });
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await page
    .locator(".is-code-window")
    .screenshot({ path: "artifacts/code-window-light.png" });
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .locator(".is-code-window")
    .screenshot({ path: "artifacts/code-window-mobile.png" });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto(`${base}/showcase?component=comparison-lens`, {
    waitUntil: "networkidle",
  });
  await page.getByLabel("Backdrop", { exact: true }).selectOption("aero");
  await page.getByLabel("Demo theme", { exact: true }).selectOption("light");
  await page.getByRole("button", { name: "Hide controls" }).click();
  await page
    .locator(".showcase-frame")
    .screenshot({ path: "artifacts/showcase-aero.png" });
  await page.goto(`${base}/components/release-rail`, {
    waitUntil: "networkidle",
  });
  await page.getByLabel("Deployment scenario").selectOption("failure");
  await page.getByRole("button", { name: "Replay deployment" }).click();
  await page.getByText("Blocked", { exact: true }).waitFor();
  await page
    .locator(".release-demo")
    .screenshot({ path: "artifacts/release-blocked.png" });
  await page.goto(`${base}/components/expandable-dock`, {
    waitUntil: "networkidle",
  });
  await page
    .locator(".dock-demo")
    .screenshot({ path: "artifacts/dock-dark.png" });
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await page
    .locator(".dock-demo")
    .screenshot({ path: "artifacts/dock-light.png" });
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .locator(".dock-demo")
    .screenshot({ path: "artifacts/dock-mobile.png" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/components/focus-stack`, {
    waitUntil: "networkidle",
  });
  await page
    .locator(".is-focus-stack")
    .screenshot({ path: "artifacts/focus-stack-dark.png" });
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await page
    .locator(".is-focus-stack")
    .screenshot({ path: "artifacts/focus-stack-light.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .locator(".is-focus-stack")
    .screenshot({ path: "artifacts/focus-stack-mobile.png" });
  await page.setViewportSize({ width: 1200, height: 630 });
  const ribbon = (
    await readFile("apps/docs/public/artwork/ribbon-orbit-charcoal.webp")
  ).toString("base64");
  const thumbnail = (await readFile("artifacts/code-window-dark.png")).toString(
    "base64",
  );
  await page.setContent(`<html><head><style>
    *{box-sizing:border-box}body{margin:0;background:#101216;color:#f0f3f8;font-family:Arial,Helvetica,sans-serif;width:1200px;height:630px;overflow:hidden;padding:56px 64px}
    header{display:flex;justify-content:space-between;align-items:center}header strong{font-size:30px;letter-spacing:-1.5px}header span,footer{font:10px monospace;letter-spacing:1px;color:#adb7c6}
    header strong span{font:inherit;letter-spacing:inherit;color:#b2cfff}
    h1{font-size:58px;font-weight:500;line-height:1.04;letter-spacing:-3px;margin:75px 0 24px;width:420px}h1 span{color:#adb7c6}p{font-size:15px;line-height:1.8;color:#adb7c6;margin:0}
    .demo{position:absolute;width:580px;right:-5px;top:110px;border-radius:18px;box-shadow:0 24px 70px #0007;transform:rotate(-3deg);border:1px solid #343d4a}
    .ribbon{position:absolute;width:160px;left:360px;top:382px}
    footer{position:absolute;bottom:50px;left:64px;right:64px;border-top:1px solid #343d4a;padding-top:20px;display:flex;justify-content:space-between}
  </style></head><body><header><strong>opalframe<span>.</span></strong><span>COPY-PASTE REACT COMPONENTS</span></header><h1>Interfaces worth<br><span>a second look.</span></h1><p>Little interactions.<br>A lasting impression.</p><img class="ribbon" alt="" src="data:image/webp;base64,${ribbon}"><img class="demo" alt="Interactive code walkthrough" src="data:image/png;base64,${thumbnail}"><footer><span>YOUR CONTENT. YOUR CODE.</span><span>SIX INTERFACE STUDIES / 2026</span></footer></body></html>`);
  await page
    .locator("img")
    .evaluateAll((images) =>
      Promise.all(images.map((element) => element.decode())),
    );
  await page.screenshot({ path: "apps/docs/public/social-preview.png" });
  console.log(
    "Saved homepage, recording, and release screenshots in artifacts/.",
  );
} finally {
  await browser.close();
}
