import { defineConfig, devices } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

const { basePath } = JSON.parse(
  readFileSync(path.resolve("apps/docs/.pages-build.json"), "utf8"),
);
export default defineConfig({
  testDir: "./tests",
  testMatch: "pages.spec.ts",
  fullyParallel: true,
  workers: 2,
  use: {
    baseURL: `http://127.0.0.1:3001${basePath}/`,
    trace: "retain-on-failure",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : undefined,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: {
    command: "npm run preview:pages",
    url: `http://127.0.0.1:3001${basePath}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },
});
