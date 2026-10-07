import { test, expect, type Page } from "@playwright/test";

async function expectFocus(page: Page, target: string) {
  await expect
    .poll(async () => {
      const window = page.locator(".is-code-window");
      const focus = await window.locator(".is-code-focus").boundingBox();
      const bounds = await window.locator(target).boundingBox();
      if (!focus || !bounds) return Infinity;
      return Math.max(
        Math.abs(focus.x - bounds.x),
        Math.abs(focus.y - bounds.y),
        Math.abs(focus.width - bounds.width),
        Math.abs(focus.height - bounds.height),
      );
    })
    .toBeLessThan(1);
}

test(
  "code blocks, file tabs, and preview targets stay synchronized",
  { tag: "@smoke" },
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/components/interactive-code-window");
    await expect(
      page.getByRole("tab", { name: "field-note.tsx" }),
    ).toHaveAttribute("aria-selected", "true");
    await page
      .getByRole("button", { name: "Show Details", exact: true })
      .click();
    await expect(
      page.locator('.is-code-step-list button[aria-pressed="true"]'),
    ).toContainText("Details");
    await expect(
      page.locator('.is-code-line[data-highlighted="true"]'),
    ).toHaveCount(5);
    await expectFocus(page, ".note-story");
    await page.getByRole("tab", { name: "field-note.tsx" }).press("End");
    await expect(page.getByRole("tab", { name: "finish.css" })).toBeFocused();
    await expect(
      page.getByRole("button", { name: "Show Finish", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".field-note")).toHaveAttribute(
      "data-finished",
      "true",
    );
    await expectFocus(page, ".field-note");
    await page.getByRole("tab", { name: "finish.css" }).press("ArrowLeft");
    await expect(
      page.getByRole("tab", { name: "field-note.tsx" }),
    ).toBeFocused();
    await expectFocus(page, ".note-header");
    expect(errors).toEqual([]);
  },
);

test("code selections reserve space at phone, tablet, and desktop sizes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/interactive-code-window");
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const window = page.locator(".is-code-window");
    const initial = await window.boundingBox();
    if (!initial) throw new Error("Missing code window");
    for (const [label, target] of [
      ["Frame", ".note-header"],
      ["Artwork", ".note-artwork"],
      ["Details", ".note-story"],
      ["Finish", ".field-note"],
    ]) {
      await page
        .getByRole("group", { name: "Walkthrough steps", exact: true })
        .getByRole("button", { name: new RegExp(label) })
        .click();
      await expectFocus(page, target);
      await expect
        .poll(async () => {
          const panel = await window.locator(".is-code-source").boundingBox();
          const block = await window
            .locator('.is-code-snippet[aria-pressed="true"]')
            .boundingBox();
          if (!panel || !block) return Infinity;
          return Math.max(
            panel.y - block.y,
            block.y + block.height - panel.y - panel.height,
          );
        })
        .toBeLessThan(1);
      const current = await window.boundingBox();
      expect(current?.width).toBeCloseTo(initial.width, 1);
      expect(current?.height).toBeCloseTo(initial.height, 1);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(1);
    }
  }
});

test("walkthrough replay completes once and manual pause holds the step", async ({
  page,
}) => {
  await page.goto("/components/interactive-code-window");
  await page.getByRole("button", { name: "Replay walkthrough" }).click();
  await expect(
    page.locator('.is-code-step-list button[aria-pressed="true"]'),
  ).toContainText("Frame");
  await page.getByRole("button", { name: "Pause walkthrough" }).click();
  await page.waitForTimeout(1800);
  await expect(
    page.locator('.is-code-step-list button[aria-pressed="true"]'),
  ).toContainText("Frame");
  await page.getByRole("button", { name: "Replay walkthrough" }).click();
  await expect(
    page.getByRole("button", { name: "Replay walkthrough" }),
  ).toBeVisible({ timeout: 12_000 });
  await expect(page.locator(".field-note")).toHaveAttribute(
    "data-finished",
    "true",
  );
});

test("off-screen walkthrough playback pauses until it is visible", async ({
  page,
}) => {
  await page.goto("/components/interactive-code-window");
  await page.getByRole("button", { name: "Replay walkthrough" }).click();
  await expect(
    page.locator('.is-code-step-list button[aria-pressed="true"]'),
  ).toContainText("Frame");
  await page
    .getByRole("heading", { name: "Source", exact: true })
    .scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
  await expect(
    page.locator('.is-code-step-list button[aria-pressed="true"]'),
  ).toContainText("Frame");
  await page.locator(".is-code-window").scrollIntoViewIfNeeded();
  await expect(
    page.locator('.is-code-step-list button[aria-pressed="true"]'),
  ).toContainText("Artwork", { timeout: 4000 });
});

test("reduced motion finishes replay immediately and removes transitions", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/interactive-code-window");
  await page.getByRole("button", { name: "Replay walkthrough" }).click();
  await expect(page.locator(".field-note")).toHaveAttribute(
    "data-finished",
    "true",
  );
  await expect(page.locator(".is-code-focus")).toHaveCSS(
    "transition-duration",
    "0s",
  );
  await expect(page.getByRole("tab", { name: "finish.css" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("copy copies the selected file as plain source", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/components/interactive-code-window");
  await page
    .getByRole("button", { name: "Copy field-note.tsx", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain('<article className="field-note">');
  await page.getByRole("tab", { name: "finish.css" }).click();
  await page
    .getByRole("button", { name: "Copy finish.css", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain("border-radius: 16px");
});
