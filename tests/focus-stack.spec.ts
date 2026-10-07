import { test, expect } from "@playwright/test";
import path from "node:path";
import { readFile } from "node:fs/promises";

test(
  "stack selection, expansion, and keyboard exploration keep the canvas stable",
  { tag: "@smoke" },
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/components/focus-stack");
    const stack = page.locator(".is-focus-stack");
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const initial = await stack.boundingBox();
      const tabs = stack.getByRole("tablist", { name: "Choose an image" });
      await tabs.getByRole("tab", { name: /Soft Orbit/ }).click();
      await tabs.getByRole("tab", { name: /Soft Orbit/ }).press("ArrowRight");
      await expect(
        tabs.getByRole("tab", { name: /Still Water/ }),
      ).toBeFocused();
      await expect(
        tabs.getByRole("tab", { name: /Still Water/ }),
      ).toHaveAttribute("aria-selected", "true");
      await expect(stack.getByRole("tabpanel")).toHaveAccessibleName(
        /Still Water/,
      );
      await tabs.getByRole("tab", { name: /Still Water/ }).press("End");
      await expect(tabs.getByRole("tab", { name: /Open Air/ })).toBeFocused();
      await stack
        .getByRole("button", { name: "Stack the deck", exact: true })
        .click();
      await expect(stack).toHaveAttribute("data-expanded", "false");
      await stack
        .getByRole("button", { name: "Spread the deck", exact: true })
        .click();
      const current = await stack.boundingBox();
      expect(current!.height).toBeCloseTo(initial!.height, 1);
      expect(current!.width).toBeCloseTo(initial!.width, 1);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(1);
      const fit = await stack.evaluate((el) => {
        const stage = el
          .querySelector(".is-focus-stack-stage")!
          .getBoundingClientRect();
        return [
          ...el.querySelectorAll<HTMLElement>(
            ".is-focus-stack-card:not([hidden])",
          ),
        ].map((card) => {
          const bounds = card.getBoundingClientRect();
          return Math.max(stage.left - bounds.left, bounds.right - stage.right);
        });
      });
      expect(Math.max(...fit)).toBeLessThanOrEqual(1);
    }
    await stack.scrollIntoViewIfNeeded();
    await page.addScriptTag({
      path: path.resolve("node_modules/axe-core/axe.min.js"),
    });
    const violations = await page.evaluate(async () => {
      const axe = (
        window as unknown as {
          axe: {
            run: (
              element: Element,
              options: object,
            ) => Promise<{ violations: { id: string }[] }>;
          };
        }
      ).axe;
      return (
        await axe.run(document.querySelector(".is-focus-stack")!, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
        })
      ).violations;
    });
    expect(violations).toEqual([]);
  },
);

test("back cards select on pointer or touch and customization preserves the selection", async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/focus-stack");
  const stack = page.locator(".is-focus-stack");
  const card = stack.getByRole("button", {
    name: "Show Still Water",
    exact: true,
  });
  await card.scrollIntoViewIfNeeded();
  // Hit the exposed face, rather than a corner of its rotated bounding box.
  const point = await card.evaluate((el) => {
    const bounds = el.getBoundingClientRect();
    for (const y of [0.3, 0.5, 0.7]) {
      for (const x of [0.9, 0.8, 0.7, 0.6]) {
        const point = {
          x: bounds.x + bounds.width * x,
          y: bounds.y + bounds.height * y,
        };
        if (
          document.elementFromPoint(point.x, point.y)?.closest("button") === el
        )
          return point;
      }
    }
    return null;
  });
  expect(point).not.toBeNull();
  if (isMobile) await page.touchscreen.tap(point!.x, point!.y);
  else await page.mouse.click(point!.x, point!.y);
  await expect(stack.getByRole("tab", { name: /Still Water/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.getByRole("button", { name: /Customize/ }).click();
  await page.getByRole("button", { name: "Sea glass", exact: true }).click();
  await page.getByRole("button", { name: "Square", exact: true }).click();
  await expect(stack.getByRole("tab", { name: /Still Water/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(await card.evaluate((el) => getComputedStyle(el).borderRadius)).toBe(
    "0px",
  );
  await page
    .getByRole("button", { name: "Switch to light mode", exact: true })
    .click();
  await page.addScriptTag({
    path: path.resolve("node_modules/axe-core/axe.min.js"),
  });
  const violations = await page.evaluate(async () => {
    const axe = (
      window as unknown as {
        axe: {
          run: (
            element: Element,
            options: object,
          ) => Promise<{ violations: unknown[] }>;
        };
      }
    ).axe;
    return (
      await axe.run(document.querySelector(".is-focus-stack")!, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      })
    ).violations;
  });
  expect(violations).toEqual([]);
});

test("stack sources match the registry and all recording frames fit", async ({
  page,
  request,
}) => {
  const response = await request.get("/r/focus-stack.json");
  expect(response.ok()).toBe(true);
  const registry = await response.json();
  for (const [index, extension] of ["tsx", "css"].entries())
    expect(registry.files[index].content).toBe(
      await readFile(
        path.resolve(`packages/components/focus-stack.${extension}`),
        "utf8",
      ),
    );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/showcase?component=focus-stack");
  for (const ratio of ["16/9", "1/1", "9/16"]) {
    await page.getByLabel("Frame", { exact: true }).selectOption(ratio);
    const slot = page.locator(".showcase-demo-slot");
    await expect
      .poll(async () => {
        const outer = (await slot.boundingBox())!;
        const panel = (await page.locator(".is-focus-stack").boundingBox())!;
        return Math.max(
          outer.y - panel.y,
          panel.y + panel.height - outer.y - outer.height,
          outer.x - panel.x,
          panel.x + panel.width - outer.x - outer.width,
        );
      })
      .toBeLessThanOrEqual(1);
    await page.getByRole("tab", { name: /Still Water/ }).click();
    await expect(
      page.getByRole("tab", { name: /Still Water/ }),
    ).toHaveAttribute("aria-selected", "true");
  }
});
