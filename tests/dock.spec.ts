import { test, expect } from "@playwright/test";

test(
  "dock focus explores labels without changing the current page",
  { tag: "@smoke" },
  async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto("/components/expandable-dock");
    const dock = page.getByRole("navigation", { name: "Studio navigation" });
    const work = dock.getByRole("button", { name: "Work", exact: true });
    const notes = dock.getByRole("button", { name: "Notes", exact: true });
    await work.focus();
    await work.press("ArrowRight");
    await expect(notes).toBeFocused();
    await expect(notes).toHaveAttribute("data-expanded", "true");
    await expect(work).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("heading", { name: /A different/ }),
    ).toBeVisible();
    await notes.press("Enter");
    await expect(notes).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("heading", { name: /Notes from/ }),
    ).toBeVisible();
    await notes.press("End");
    const contact = dock.getByRole("button", { name: "Contact", exact: true });
    await expect(contact).toBeFocused();
    await contact.press("ArrowRight");
    await expect(work).toBeFocused();
    await work.press("ArrowLeft");
    await expect(contact).toBeFocused();
    await contact.press("Home");
    await expect(work).toBeFocused();
    await work.press("Tab");
    await expect(notes).toBeFocused();
    await notes.press("Tab");
    await expect(
      dock.getByRole("button", { name: "About", exact: true }),
    ).toBeFocused();
    expect(errors).toEqual([]);
  },
);

test("hover or touch keeps a single current destination", async ({
  page,
  isMobile,
}) => {
  await page.goto("/components/expandable-dock");
  const dock = page.getByRole("navigation", { name: "Studio navigation" });
  const notes = dock.getByRole("button", { name: "Notes", exact: true });
  if (isMobile) {
    await notes.tap();
  } else {
    await notes.hover();
    await expect(notes).toHaveAttribute("data-expanded", "true");
    await expect(
      dock.getByRole("button", { name: "Work", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("heading", { name: /A different/ }),
    ).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(notes).toHaveAttribute("data-expanded", "false");
    await notes.click();
  }
  await expect(page.getByRole("heading", { name: /Notes from/ })).toBeVisible();
  await expect(dock.locator('[aria-pressed="true"]')).toHaveCount(1);
  await expect(dock.locator('[aria-pressed="true"]')).toHaveAttribute(
    "aria-label",
    "Notes",
  );
});

test("dock and portfolio keep their dimensions and marker alignment across destinations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/expandable-dock");
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const demo = page.locator(".dock-demo");
    const dock = page.locator(".is-dock");
    const initial = await demo.boundingBox();
    const navBounds = await dock.boundingBox();
    for (const name of ["Notes", "About", "Contact", "Work"]) {
      const current = dock.getByRole("button", { name, exact: true });
      await current.click();
      await expect(
        demo.getByText("FICTIONAL PORTFOLIO", { exact: true }),
      ).toBeVisible();
      if (name === "About") {
        await expect(
          demo.getByText(/Meet Avery, the fictional designer/),
        ).toBeVisible();
      }
      await expect
        .poll(async () => {
          const marker = await dock.locator(".is-dock-marker").boundingBox();
          const target = await current.boundingBox();
          if (!marker || !target) return Infinity;
          return Math.max(
            Math.abs(marker.x - target.x),
            Math.abs(marker.width - target.width),
          );
        })
        .toBeLessThan(1);
      const bounds = await demo.boundingBox();
      const nav = await dock.boundingBox();
      expect(bounds!.width).toBeCloseTo(initial!.width, 1);
      expect(bounds!.height).toBeCloseTo(initial!.height, 1);
      expect(nav!.width).toBeCloseTo(navBounds!.width, 1);
      expect(nav!.height).toBeCloseTo(navBounds!.height, 1);
      for (const button of await dock.getByRole("button").all()) {
        const buttonBounds = await button.boundingBox();
        expect(buttonBounds!.width).toBeGreaterThanOrEqual(44);
        expect(buttonBounds!.height).toBeGreaterThanOrEqual(44);
        expect(buttonBounds!.x + buttonBounds!.width).toBeLessThanOrEqual(
          nav!.x + nav!.width,
        );
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        ),
      ).toBeLessThanOrEqual(1);
    }
  }
});

test("dock respects OS and simulated reduced motion and restart resets selection", async ({
  page,
}) => {
  await page.goto("/components/expandable-dock");
  const dock = page.locator(".is-dock");
  await dock.getByRole("button", { name: "Contact", exact: true }).click();
  await page.getByRole("button", { name: "Simulate reduced motion" }).click();
  for (const selector of [
    ".is-dock-item",
    ".is-dock-label",
    ".is-dock-marker",
  ]) {
    await expect(dock.locator(selector).first()).toHaveCSS(
      "transition-duration",
      "0s",
    );
  }
  await page.getByRole("button", { name: "Restart preview" }).click();
  await expect(
    dock.getByRole("button", { name: "Work", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Simulate reduced motion" }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const selector of [
    ".is-dock-item",
    ".is-dock-label",
    ".is-dock-marker",
  ]) {
    await expect(dock.locator(selector).first()).toHaveCSS(
      "transition-duration",
      "0s",
    );
  }
});

test("every portfolio destination passes accessibility checks in both themes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/expandable-dock");
  await page.addScriptTag({ path: "node_modules/axe-core/axe.min.js" });
  for (const theme of ["dark", "light"]) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
    }, theme);
    for (const name of ["Work", "Notes", "About", "Contact"]) {
      await page
        .getByRole("navigation", { name: "Studio navigation" })
        .getByRole("button", { name, exact: true })
        .click();
      const violations = await page.evaluate(async () => {
        const axe = (
          window as unknown as {
            axe: {
              run: (options: object) => Promise<{
                violations: { id: string; nodes: { target: string[] }[] }[];
              }>;
            };
          }
        ).axe;
        const result = await axe.run({
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
        });
        return result.violations.map((violation) => ({
          id: violation.id,
          targets: violation.nodes.map((node) => node.target),
        }));
      });
      expect(violations, `${name} in ${theme}`).toEqual([]);
    }
  }
});
