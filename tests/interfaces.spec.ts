import { test, expect, type Page } from "@playwright/test";
import { enterStudio } from "./enter-studio";
import path from "node:path";
import { readFile } from "node:fs/promises";

async function accessibilityViolations(page: Page) {
  return page.evaluate(async () => {
    const axe = (
      window as unknown as {
        axe: {
          run: (options: object) => Promise<{
            violations: {
              id: string;
              nodes: { target: string[]; failureSummary: string }[];
            }[];
          }>;
        };
      }
    ).axe;
    const result = await axe.run({
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    });
    return result.violations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => ({
        target: node.target,
        message: node.failureSummary,
      })),
    }));
  });
}

async function waitForCanvasFit(page: Page) {
  await expect
    .poll(() =>
      page.locator(".showcase-demo").evaluate((element) => {
        const canvas = element as HTMLElement;
        const slot = canvas.parentElement!;
        const scale = Math.min(1, slot.clientHeight / canvas.offsetHeight);
        return Math.abs(
          canvas.getBoundingClientRect().width - canvas.offsetWidth * scale,
        );
      }),
    )
    .toBeLessThan(1);
}

test("product focus follows every target without resizing the preview", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of [
    "/",
    "/components/product-stage",
    "/showcase?component=product-stage",
  ]) {
    await page.goto(route);
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      if (route.startsWith("/showcase")) await waitForCanvasFit(page);
      const stage = page.locator(".is-stage");
      const initial = await stage.boundingBox();
      if (!initial) throw new Error("Missing product stage");
      for (const [name, target] of [
        ["The big picture", ".workspace-stats"],
        ["A closer look", ".workspace-chart"],
        ["The next move", ".workspace-activity"],
      ]) {
        await page.getByRole("tab", { name: new RegExp(name) }).click();
        await expect
          .poll(
            async () => {
              const focus = await stage
                .locator(".is-stage-focus")
                .boundingBox();
              const bounds = await stage.locator(target).boundingBox();
              if (!focus || !bounds) return Infinity;
              const padding = await stage
                .locator(".is-stage-scene")
                .evaluate((element) => {
                  const frame = element.getBoundingClientRect();
                  return {
                    x: (5 * frame.width) / (element as HTMLElement).offsetWidth,
                    y:
                      (5 * frame.height) /
                      (element as HTMLElement).offsetHeight,
                  };
                });
              return Math.max(
                Math.abs(focus.x - bounds.x + padding.x),
                Math.abs(focus.y - bounds.y + padding.y),
                Math.abs(focus.width - bounds.width - padding.x * 2),
                Math.abs(focus.height - bounds.height - padding.y * 2),
              );
            },
            { message: `${route} at ${width}px: ${target}` },
          )
          .toBeLessThan(1);
        const current = await stage.boundingBox();
        expect(current?.width).toBeCloseTo(initial.width, 1);
        expect(current?.height).toBeCloseTo(initial.height, 1);
      }
    }
  }
});

test("release panels reserve their space when inspecting each stage", async ({
  page,
}) => {
  for (const route of [
    "/",
    "/components/release-rail",
    "/showcase?component=release-rail",
  ]) {
    await page.goto(route);
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      if (route.startsWith("/showcase")) await waitForCanvasFit(page);
      const demo = page.locator(".release-demo");
      const initial = await demo.boundingBox();
      if (!initial) throw new Error("Missing release demo");
      for (const name of ["Source", "Build", "Checks", "Deploy"]) {
        await demo.getByRole("button", { name: new RegExp(name) }).click();
        await expect(
          demo.getByRole("region", { name: `${name} details` }),
        ).toBeVisible();
        const current = await demo.boundingBox();
        expect(current?.width).toBeCloseTo(initial.width, 1);
        expect(current?.height).toBeCloseTo(initial.height, 1);
      }
      if (route === "/") {
        const card = await page
          .locator(".gallery-release .gallery-demo")
          .boundingBox();
        const bounds = await demo.boundingBox();
        expect(bounds!.y).toBeGreaterThan(card!.y);
        expect(bounds!.y + bounds!.height).toBeLessThan(card!.y + card!.height);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        ),
        `${route} at ${width}px`,
      ).toBeLessThanOrEqual(1);
    }
  }
});

test(
  "failed releases keep the previous version live and can retry",
  { tag: "@smoke" },
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/components/release-rail");
    await page.getByLabel("Deployment scenario").selectOption("failure");
    await page.getByRole("button", { name: "Replay deployment" }).click();
    await expect(page.getByText("Blocked", { exact: true })).toBeVisible();
    const panel = page.getByRole("region", { name: "Checks details" });
    await expect(panel).toContainText("Caught before production.");
    await expect(panel).toContainText("Missing required prop: currency");
    await expect(panel).toContainText("Previous version stays live");
    await expect(panel).toContainText("v1.0.2");
    await expect(page.getByRole("button", { name: /Deploy/ })).toContainText(
      "pending",
    );
    await page.addScriptTag({
      path: path.resolve("node_modules/axe-core/axe.min.js"),
    });
    for (const theme of ["dark", "light"]) {
      await page.evaluate((theme) => {
        document.documentElement.dataset.theme = theme;
      }, theme);
      expect(
        await accessibilityViolations(page),
        `Failed release in ${theme}`,
      ).toEqual([]);
    }
    await page.getByRole("button", { name: "Retry checks" }).click();
    await expect(page.getByText("Ready", { exact: true })).toBeVisible();
    const deployed = page.getByRole("region", { name: "Deploy details" });
    await expect(deployed).toContainText("New version is live");
    await expect(deployed).toContainText("v1.0.3");
  },
);

test("recording backdrops change the canvas independently of the demo theme", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/showcase");
  const frame = page.locator(".showcase-frame");
  const demo = page.locator(".showcase-demo");
  const background = () =>
    frame.evaluate((element) => getComputedStyle(element).background);
  const carbon = await background();
  await page.getByLabel("Backdrop", { exact: true }).selectOption("aero");
  await expect.poll(background).not.toBe(carbon);
  const aero = await background();
  await expect(demo).toHaveAttribute("data-demo-theme", "dark");
  await page.getByLabel("Demo theme", { exact: true }).selectOption("light");
  await expect(demo).toHaveAttribute("data-demo-theme", "light");
  expect(await background()).toBe(aero);
  await page.getByLabel("Backdrop", { exact: true }).selectOption("pearl");
  await expect.poll(background).not.toBe(aero);
  await page.addScriptTag({
    path: path.resolve("node_modules/axe-core/axe.min.js"),
  });
  for (const backdrop of ["carbon", "pearl", "aero"]) {
    await page.getByLabel("Backdrop", { exact: true }).selectOption(backdrop);
    for (const theme of ["dark", "light"]) {
      await page.getByLabel("Demo theme", { exact: true }).selectOption(theme);
      expect(
        await accessibilityViolations(page),
        `${backdrop} with ${theme} demo`,
      ).toEqual([]);
    }
  }
});

test("every recording aspect ratio fits the full demo inside the frame", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/showcase");
  for (const component of [
    "product-stage",
    "release-rail",
    "comparison-lens",
    "interactive-code-window",
    "expandable-dock",
  ]) {
    await page.getByLabel("Component", { exact: true }).selectOption(component);
    for (const ratio of ["16/9", "1/1", "9/16"]) {
      await page.getByLabel("Frame", { exact: true }).selectOption(ratio);
      const [width, height] = ratio.split("/").map(Number);
      await expect
        .poll(
          async () => {
            const frame = await page.locator(".showcase-frame").boundingBox();
            const demo = await page.locator(".showcase-demo").boundingBox();
            const slot = await page
              .locator(".showcase-demo-slot")
              .boundingBox();
            if (!frame || !demo || !slot) return Infinity;
            expect(frame.width / frame.height).toBeCloseTo(width / height, 2);
            return Math.max(
              slot.y - demo.y,
              demo.y + demo.height - slot.y - slot.height,
              frame.x - demo.x,
              demo.x + demo.width - frame.x - frame.width,
            );
          },
          { message: `${component} in ${ratio}` },
        )
        .toBeLessThan(1);
    }
  }
});

test(
  "product story supports selection and keyboard navigation without hydration errors",
  { tag: "@smoke" },
  async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto("/");
    await enterStudio(page);
    const first = page.getByRole("tab", { name: /The big picture/ });
    await expect(first).toHaveAttribute("aria-selected", "true");
    await page.getByRole("tab", { name: /A closer look/ }).click();
    await expect(page.locator(".is-stage-body")).toContainText(
      "Guide attention",
    );
    await page.getByRole("tab", { name: /A closer look/ }).press("ArrowRight");
    await expect(
      page.getByRole("tab", { name: /The next move/ }),
    ).toBeFocused();
    await expect(
      page.getByRole("tab", { name: /The next move/ }),
    ).toHaveAttribute("aria-selected", "true");
    await page.getByRole("tab", { name: /The next move/ }).press("Home");
    await expect(first).toBeFocused();
    await expect(page.locator(".is-stage-focus")).toHaveCSS("left", /.+px/);
    expect(errors).toEqual([]);
  },
);

test(
  "comparison supports touch or pointer and keyboard and descriptive values",
  { tag: "@smoke" },
  async ({ page, isMobile }) => {
    await page.goto("/components/comparison-lens");
    const slider = page.getByRole("slider");
    await expect(slider).toHaveValue("58");
    await slider.focus();
    await slider.press("ArrowRight");
    await expect(slider).toHaveValue("59");
    await slider.press("Home");
    await expect(slider).toHaveValue("0");
    await slider.press("End");
    await expect(slider).toHaveValue("100");
    const box = await slider.boundingBox();
    if (!box) throw new Error("Missing comparison bounds");
    if (isMobile)
      await page.touchscreen.tap(
        box.x + box.width * 0.25,
        box.y + box.height * 0.5,
      );
    else
      await page.mouse.click(
        box.x + box.width * 0.25,
        box.y + box.height * 0.5,
      );
    await expect(slider).toHaveValue(/2[34567]/);
    await expect(slider).toHaveAttribute("aria-valuetext", /Refined/);
  },
);

test("release states are inspectable and replay completes", async ({
  page,
}) => {
  await page.goto("/components/release-rail");
  await page.getByRole("button", { name: /Source/ }).click();
  await expect(
    page.getByRole("region", { name: "Source details" }),
  ).toContainText("Source, ready.");
  await page.getByRole("button", { name: "Replay deployment" }).click();
  await expect(page.getByText("Deploying", { exact: true })).toBeVisible();
  await expect(page.getByText("Ready", { exact: true })).toBeVisible({
    timeout: 12_000,
  });
  await expect(
    page.getByRole("region", { name: "Deploy details" }),
  ).toContainText("Hello, production.");
});

test("reduced motion completes replay immediately and removes focus transitions", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await enterStudio(page);
  await expect(page.locator(".is-stage-focus")).toHaveCSS(
    "transition-duration",
    "0s",
  );
  await page.getByRole("button", { name: "Replay deployment" }).click();
  await expect(page.getByText("Ready", { exact: true })).toBeVisible({
    timeout: 1500,
  });
});

test("theme persists and the page fits the viewport", async ({ page }) => {
  await page.goto("/");
  await enterStudio(page);
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await enterStudio(page);
  await expect(
    page.getByRole("button", { name: "Switch to dark mode" }),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("recording mode respects ratios, hides controls, and returns with Escape", async ({
  page,
}) => {
  await page.goto("/showcase?component=release-rail");
  await page.getByLabel("Frame", { exact: true }).selectOption("9/16");
  const frame = await page.locator(".showcase-frame").boundingBox();
  if (!frame) throw new Error("Missing recording frame");
  expect(frame.width / frame.height).toBeCloseTo(9 / 16, 2);
  await page.getByRole("button", { name: "Restart animation" }).click();
  await expect(page.getByText("Deploying", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Hide controls" }).click();
  await expect(page.locator(".showcase-controls")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.locator(".showcase-controls")).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test(
  "all pages pass automated accessibility checks in both themes",
  { tag: "@smoke" },
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of [
      "/",
      "/components/product-stage",
      "/components/release-rail",
      "/components/comparison-lens",
      "/components/interactive-code-window",
      "/components/expandable-dock",
      "/components/focus-stack",
      "/showcase",
    ]) {
      await page.goto(route);
      await page.addScriptTag({
        path: path.resolve("node_modules/axe-core/axe.min.js"),
      });
      for (const theme of ["dark", "light"]) {
        await page.evaluate((theme) => {
          document.documentElement.dataset.theme = theme;
        }, theme);
        const violations = await accessibilityViolations(page);
        expect(violations, `${route} ${theme}`).toEqual([]);
      }
    }
  },
);

test(
  "registry distributes current source and stylesheet together",
  { tag: "@smoke" },
  async ({ request }) => {
    for (const name of [
      "product-stage",
      "release-rail",
      "comparison-lens",
      "interactive-code-window",
      "expandable-dock",
      "focus-stack",
    ]) {
      const response = await request.get(`/r/${name}.json`);
      expect(response.ok()).toBe(true);
      const registry = await response.json();
      expect(registry.files).toHaveLength(2);
      expect(registry.files[0].content).toContain(`import "./${name}.css"`);
      expect(registry.files[1].target).toBe(`@ui/${name}.css`);
      expect(registry.files[0].content).toBe(
        await readFile(path.resolve(`packages/components/${name}.tsx`), "utf8"),
      );
      expect(registry.files[1].content).toBe(
        await readFile(path.resolve(`packages/components/${name}.css`), "utf8"),
      );
    }
  },
);
