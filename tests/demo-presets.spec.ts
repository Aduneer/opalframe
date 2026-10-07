import { test, expect, type Page } from "@playwright/test";

async function expectFocus(page: Page, selector: string) {
  await expect
    .poll(async () => {
      const focus = await page.locator(".is-code-focus").boundingBox();
      const target = await page.locator(selector).boundingBox();
      if (!focus || !target) return Infinity;
      return Math.max(
        Math.abs(focus.x - target.x),
        Math.abs(focus.y - target.y),
        Math.abs(focus.width - target.width),
        Math.abs(focus.height - target.height),
      );
    })
    .toBeLessThan(1);
}

test("travel preset supplies new destinations while customization and native navigation still work", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/expandable-dock");
  await page.getByRole("button", { name: "Customize", exact: false }).click();
  await page.getByRole("button", { name: "Sea glass", exact: true }).click();
  await page
    .getByLabel("Demo preset", { exact: true })
    .selectOption("alternate");
  const navigation = page.getByRole("navigation", {
    name: "Travel navigation",
  });
  await expect(navigation).toHaveClass(/my-expandable-dock/);
  expect(
    await navigation.evaluate((element) =>
      getComputedStyle(element).getPropertyValue("--dock-accent").trim(),
    ),
  ).toBe("#468f82");
  const initial = (await page.locator(".dock-demo").boundingBox())!;
  for (const [destination, title] of [
    ["Journal", /Collected/],
    ["Kit", /Pack less/],
    ["Postcard", /A little note/],
    ["Route", /Take the/],
  ] as const) {
    await navigation
      .getByRole("button", { name: destination, exact: true })
      .click();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    const current = (await page.locator(".dock-demo").boundingBox())!;
    expect(current.height).toBeCloseTo(initial.height, 1);
  }
  const route = navigation.getByRole("button", { name: "Route", exact: true });
  await route.focus();
  await route.press("ArrowRight");
  const journal = navigation.getByRole("button", {
    name: "Journal",
    exact: true,
  });
  await expect(journal).toBeFocused();
  await expect(route).toHaveAttribute("aria-pressed", "true");
  await journal.press("Enter");
  await expect(journal).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("link", { name: "Open recording mode" }),
  ).toHaveAttribute("href", /preset=alternate/);
  await page
    .getByLabel("Demo preset", { exact: true })
    .selectOption("original");
  await expect(
    page
      .getByRole("navigation", { name: "Studio navigation" })
      .getByRole("button", { name: "Work", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "Sea glass", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("product preset synchronizes snippets, copied files, measured targets, and original reset", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/interactive-code-window");
  await page
    .getByLabel("Demo preset", { exact: true })
    .selectOption("alternate");
  const initial = (await page.locator(".is-code-window").boundingBox())!;
  for (const [step, selector, count] of [
    ["Frame", ".headphone-header", 5],
    ["Artwork", ".headphone-artwork", 4],
    ["Details", ".headphone-details", 6],
    ["Finish", ".headphone-card", 11],
  ] as const) {
    await page
      .getByRole("group", { name: "Walkthrough steps", exact: true })
      .getByRole("button", { name: new RegExp(step) })
      .click();
    await expectFocus(page, selector);
    await expect(
      page.locator('.is-code-line[data-highlighted="true"]'),
    ).toHaveCount(count);
    expect(
      (await page.locator(".is-code-window").boundingBox())!.height,
    ).toBeCloseTo(initial.height, 1);
  }
  await expect(
    page.getByRole("tab", { name: "product-finish.css", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".headphone-card")).toHaveAttribute(
    "data-finished",
    "true",
  );
  await page
    .getByRole("button", { name: "Copy product-finish.css", exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    ".headphone-artwork",
  );
  await page
    .getByRole("tab", { name: "product-detail.tsx", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Copy product-detail.tsx", exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "HALO / 01",
  );
  await page
    .getByLabel("Demo preset", { exact: true })
    .selectOption("original");
  await expect(
    page.getByRole("tab", { name: "field-note.tsx", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expectFocus(page, ".note-artwork");
  await expect(page.locator(".headphone-card")).toHaveCount(0);
});

test("alternate recording presets fit all ratios and narrow docs in both themes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const name of ["expandable-dock", "interactive-code-window"]) {
    await page.goto(`/showcase?component=${name}&preset=alternate`);
    await expect(page.getByLabel("Demo preset", { exact: true })).toHaveValue(
      "alternate",
    );
    for (const ratio of ["16/9", "1/1", "9/16"]) {
      await page.getByLabel("Frame", { exact: true }).selectOption(ratio);
      await expect
        .poll(async () => {
          const demo = (await page.locator(".showcase-demo").boundingBox())!;
          const slot = (await page
            .locator(".showcase-demo-slot")
            .boundingBox())!;
          return Math.max(
            slot.y - demo.y,
            demo.y + demo.height - slot.y - slot.height,
            slot.x - demo.x,
            demo.x + demo.width - slot.x - slot.width,
          );
        })
        .toBeLessThan(1);
      if (name === "interactive-code-window") {
        await page
          .getByRole("button", { name: "Show Details", exact: true })
          .click();
        await expectFocus(page, ".headphone-details");
      }
    }
    await page
      .getByRole("button", { name: "Hide controls", exact: true })
      .click();
    await expect(page.getByLabel("Demo preset", { exact: true })).toHaveCount(
      0,
    );
    await page
      .getByRole("button", { name: "Show recording controls", exact: true })
      .click();
    await expect(page.getByLabel("Demo preset", { exact: true })).toHaveValue(
      "alternate",
    );
    await page
      .getByLabel("Component", { exact: true })
      .selectOption("release-rail");
    await expect(page.getByLabel("Demo preset", { exact: true })).toHaveCount(
      0,
    );
    await page.goto(`/components/${name}`);
    await page.setViewportSize({ width: 320, height: 900 });
    await page
      .getByLabel("Demo preset", { exact: true })
      .selectOption("alternate");
    for (const theme of ["light", "dark"]) {
      await page.evaluate((theme) => {
        document.documentElement.dataset.theme = theme;
      }, theme);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(1);
      await expect(
        page.getByLabel("Demo preset", { exact: true }),
      ).toBeVisible();
    }
  }
});
