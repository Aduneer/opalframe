import { test, expect } from "@playwright/test";

const studies = [
  ["interactive-code-window", ".is-code-window", "--code-accent"],
  ["expandable-dock", ".is-dock", "--dock-accent"],
  ["product-stage", ".is-stage", "--stage-accent"],
  ["release-rail", ".is-rail", "--rail-accent"],
  ["comparison-lens", ".is-lens", "--lens-accent"],
  ["focus-stack", ".is-focus-stack", "--stack-accent"],
] as const;

const renderedStyles: Record<
  string,
  { background: string; shape: string; radius: string }
> = {
  "interactive-code-window": {
    background: ".is-code-preview",
    shape: "",
    radius: "20px",
  },
  "expandable-dock": {
    background: ".is-dock-marker",
    shape: "",
    radius: "28px",
  },
  "product-stage": {
    background: '.is-stage-features button[aria-selected="true"]',
    shape: ".is-stage-features button",
    radius: "16px",
  },
  "release-rail": {
    background: '[data-status="complete"] .is-rail-node',
    shape: ".is-rail-panel",
    radius: "16px",
  },
  "comparison-lens": {
    background: ".is-lens-divider span",
    shape: "",
    radius: "24px",
  },
  "focus-stack": {
    background: '.is-focus-stack-tabs button[aria-selected="true"]',
    shape: ".is-focus-stack-card",
    radius: "24px",
  },
};

test("all six studies accept keyboard customization and reset their actual styles", async ({
  page,
}) => {
  for (const [name, selector, property] of studies) {
    await page.goto(`/components/${name}`);
    const root = page.locator(`.preview-canvas ${selector}`);
    const appearance = renderedStyles[name];
    const background = await root
      .locator(appearance.background)
      .first()
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    const radius = await root.evaluate(
      (element, shape) =>
        getComputedStyle(shape ? element.querySelector(shape)! : element)
          .borderRadius,
      appearance.shape,
    );
    const original = await root.evaluate(
      (element, property) => ({
        accent: getComputedStyle(element).getPropertyValue(property).trim(),
        width: element.getBoundingClientRect().width,
      }),
      property,
    );
    const toggle = page.getByRole("button", { name: /^Customize/ });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    const panel = page.getByRole("region", { name: "Live customization" });
    await expect(panel).toBeHidden();
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(panel).toBeVisible();
    await expect(
      panel.getByRole("button", { name: "Copy CSS" }),
    ).toBeDisabled();
    const choice = panel.getByRole("button", {
      name: "Sea glass",
      exact: true,
    });
    await choice.focus();
    await page.keyboard.press("Space");
    await expect(choice).toHaveAttribute("aria-pressed", "true");
    await expect
      .poll(() =>
        root.evaluate(
          (element, property) =>
            getComputedStyle(element).getPropertyValue(property).trim(),
          property,
        ),
      )
      .toBe("#468f82");
    await expect
      .poll(() =>
        root
          .locator(appearance.background)
          .first()
          .evaluate((element) => getComputedStyle(element).backgroundColor),
      )
      .not.toBe(background);
    await panel
      .getByRole("group", { name: "Finish", exact: true })
      .getByRole("button", { name: "Soft", exact: true })
      .click();
    await expect
      .poll(() =>
        root.evaluate(
          (element, shape) =>
            getComputedStyle(shape ? element.querySelector(shape)! : element)
              .borderRadius,
          appearance.shape,
        ),
      )
      .toBe(appearance.radius);
    const width = panel.getByRole("slider", { name: /Width/ });
    await width.focus();
    await page.keyboard.press("Home");
    await expect(width).toHaveValue("80");
    await expect
      .poll(() =>
        root.evaluate((element) => element.getBoundingClientRect().width),
      )
      .toBeLessThan(original.width);
    if (name === "interactive-code-window") {
      await expect
        .poll(async () => {
          const frame = await root.locator(".is-code-focus").boundingBox();
          const target = await root.locator(".note-artwork").boundingBox();
          if (!frame || !target) return Infinity;
          return Math.max(
            Math.abs(frame.x - target.x),
            Math.abs(frame.y - target.y),
            Math.abs(frame.width - target.width),
            Math.abs(frame.height - target.height),
          );
        })
        .toBeLessThan(1);
    }
    await toggle.click();
    await expect(panel).toBeHidden();
    await expect(root).toBeVisible();
    await toggle.click();
    await panel.getByRole("button", { name: "Reset styles" }).click();
    await expect(width).toHaveValue("100");
    await expect
      .poll(() =>
        root.evaluate(
          (element, property) =>
            getComputedStyle(element).getPropertyValue(property).trim(),
          property,
        ),
      )
      .toBe(original.accent);
    await expect
      .poll(() =>
        root
          .locator(appearance.background)
          .first()
          .evaluate((element) => getComputedStyle(element).backgroundColor),
      )
      .toBe(background);
    await expect
      .poll(() =>
        root.evaluate(
          (element, shape) =>
            getComputedStyle(shape ? element.querySelector(shape)! : element)
              .borderRadius,
          appearance.shape,
        ),
      )
      .toBe(radius);
    await expect
      .poll(() =>
        root.evaluate((element) => element.getBoundingClientRect().width),
      )
      .toBeCloseTo(original.width, 0);
    await expect(
      panel.getByRole("button", { name: "Copy CSS" }),
    ).toBeDisabled();
  }
});

test("CSS copying preserves interaction state and open controls fit a narrow viewport", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/components/expandable-dock");
  const dock = page.getByRole("navigation", { name: "Studio navigation" });
  await dock.getByRole("button", { name: "Notes", exact: true }).click();
  await page.getByRole("button", { name: /^Customize/ }).click();
  const panel = page.getByRole("region", { name: "Live customization" });
  await panel.getByRole("button", { name: "Ice", exact: true }).click();
  const width = panel.getByRole("slider", { name: /Width/ });
  await width.focus();
  await page.keyboard.press("Home");
  await expect(
    dock.getByRole("button", { name: "Notes", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await panel.getByRole("button", { name: "Copy CSS" }).click();
  await expect(
    panel.getByRole("button", { name: "Copied to clipboard" }),
  ).toBeVisible();
  const css = await page.evaluate(() => navigator.clipboard.readText());
  expect(css).toContain(".is-dock.my-expandable-dock {");
  expect(css).toContain("--dock-accent: #5a91df;");
  expect(css).toContain("width: max(80%, 220px);");
  await panel.locator("summary").click();
  await expect(panel.locator("pre code")).toHaveText(css);
  await page.setViewportSize({ width: 320, height: 844 });
  for (const theme of ["dark", "light"]) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
    }, theme);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(320);
    await expect(width).toBeVisible();
  }
  await page
    .locator(".preview-tabs")
    .getByRole("button", { name: "Code", exact: true })
    .click();
  await expect(panel).toBeHidden();
  await expect(page.locator(".source-preview")).toBeVisible();
  await page
    .locator(".preview-tabs")
    .getByRole("button", { name: "Preview", exact: true })
    .click();
  await expect(panel).toBeVisible();
  await expect(width).toHaveValue("80");
});
