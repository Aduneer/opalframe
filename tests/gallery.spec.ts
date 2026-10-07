import { test, expect } from "@playwright/test";
import { enterStudio } from "./enter-studio";

test("gallery has a clear entry and usable studies at every viewport", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  await enterStudio(page);
  const dock = page.getByRole("navigation", { name: "Studio navigation" });
  const viewport = page.viewportSize()!;
  for (const theme of ["dark", "light"]) {
    await page.evaluate((next) => {
      document.documentElement.dataset.theme = next;
    }, theme);
    await expect(
      page.locator(
        theme === "dark" ? ".signature-charcoal" : ".signature-pearl",
      ),
    ).toBeVisible();
    await expect(
      page.locator(
        theme === "dark" ? ".signature-pearl" : ".signature-charcoal",
      ),
    ).toBeHidden();
    // The introduction has a direct collection entry; native focus reaches each study.
    for (const width of isMobile
      ? [viewport.width]
      : [320, 390, 640, 768, 1000, 1440]) {
      await page.setViewportSize({
        width,
        height: width <= 640 ? 844 : viewport.height,
      });
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await expect(page.locator(".gallery-study")).toHaveCount(6);
      await expect(
        page.getByText("Copy-paste React components.", { exact: true }),
      ).toBeVisible();
      const explore = page.getByRole("link", {
        name: "Explore the collection",
      });
      const entry = (await explore.boundingBox())!;
      expect(entry.y + entry.height).toBeLessThan(page.viewportSize()!.height);
      await expect(
        page
          .getByRole("navigation", { name: "Jump to a study" })
          .getByRole("link"),
      ).toHaveCount(6);
      const notes = dock.getByRole("button", { name: "Notes", exact: true });
      // Focus can already be on Notes after the prior viewport; blur before testing its native reveal.
      await notes.evaluate((element) => (element as HTMLElement).blur());
      await notes.focus();
      await expect(page.locator(".studio-opening")).toHaveAttribute(
        "data-studio-state",
        "clear",
      );
      await expect
        .poll(
          async () =>
            (await dock.boundingBox())!.y + (await dock.boundingBox())!.height,
        )
        .toBeLessThanOrEqual(page.viewportSize()!.height);
      const bounds = await dock.boundingBox();
      expect(
        bounds!.y + bounds!.height,
        `${theme} at ${width}px`,
      ).toBeLessThanOrEqual(page.viewportSize()!.height);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(1);
      const copy = await page.locator(".gallery-intro-copy").boundingBox();
      const art = await page.locator(".signature-lens").boundingBox();
      expect(copy!.x + copy!.width).toBeLessThanOrEqual(art!.x);
      if (width > 800) {
        // Read both boxes in one frame while native focus scrolling settles.
        const pair = await page.evaluate(() => {
          const lens = document
            .querySelector(".gallery-lens")!
            .getBoundingClientRect();
          const dock = document
            .querySelector(".gallery-dock")!
            .getBoundingClientRect();
          return { lensY: lens.y, dockY: dock.y, lensX: lens.x, dockX: dock.x };
        });
        expect(pair.lensY).toBeCloseTo(pair.dockY, 0);
        expect(pair.lensX).toBeGreaterThan(pair.dockX);
      }
    }
    await dock.getByRole("button", { name: "Notes", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: /Notes from/ }),
    ).toBeVisible();
    await dock.getByRole("button", { name: "Work", exact: true }).click();
  }
  await expect(
    page.getByRole("link", { name: "Get Expandable Dock source", exact: true }),
  ).toHaveAttribute("href", "/components/expandable-dock");
});

test("comparison text stays readable and contained at narrow preview sizes", async ({
  page,
}) => {
  await page.goto("/components/comparison-lens");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.getByRole("slider").fill("100");
    const lens = page.locator(".is-lens");
    const canvas = await lens.boundingBox();
    const copy = lens.locator(".designed .poster-content");
    for (const selector of ["p", ".poster-link"]) {
      expect(
        await copy
          .locator(selector)
          .evaluate((element) =>
            parseFloat(getComputedStyle(element).fontSize),
          ),
      ).toBeGreaterThanOrEqual(12);
      const bounds = await copy.locator(selector).boundingBox();
      expect(bounds!.y + bounds!.height).toBeLessThan(
        canvas!.y + canvas!.height - 30,
      );
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(
        canvas!.x + canvas!.width,
      );
    }
    const left = await lens.locator(".is-lens-after-tag").boundingBox();
    const right = await lens.locator(".is-lens-before-tag").boundingBox();
    expect(left!.x + left!.width).toBeLessThan(right!.x);
  }
});

test("code outlines match target bounds and corners in scaled recording frames", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/showcase?component=interactive-code-window");
  for (const ratio of ["16/9", "1/1", "9/16"]) {
    await page.getByLabel("Frame", { exact: true }).selectOption(ratio);
    for (const [name, selector] of [
      ["Frame", ".note-header"],
      ["Artwork", ".note-artwork"],
      ["Details", ".note-story"],
      ["Finish", ".field-note"],
    ]) {
      await page
        .getByRole("group", { name: "Walkthrough steps", exact: true })
        .getByRole("button", { name: new RegExp(name) })
        .click();
      await expect
        .poll(async () => {
          const target = await page.locator(selector).boundingBox();
          const outline = await page.locator(".is-code-focus").boundingBox();
          if (!target || !outline) return Infinity;
          return Math.max(
            Math.abs(target.x - outline.x),
            Math.abs(target.y - outline.y),
            Math.abs(target.width - outline.width),
            Math.abs(target.height - outline.height),
          );
        })
        .toBeLessThan(1);
      const radius = await page
        .locator(selector)
        .evaluate((element) => getComputedStyle(element).borderRadius);
      await expect(page.locator(".is-code-focus")).toHaveCSS(
        "border-radius",
        radius,
      );
      if (selector === ".note-header") {
        // The focus frame must hug the header content, excluding the artwork gap.
        const outline = (await page.locator(".is-code-focus").boundingBox())!;
        const bottom = await page
          .locator(".note-header > span")
          .evaluateAll((elements) =>
            Math.max(
              ...elements.map(
                (element) => element.getBoundingClientRect().bottom,
              ),
            ),
          );
        expect(Math.abs(outline.y + outline.height - bottom)).toBeLessThan(1);
      }
    }
  }
});
