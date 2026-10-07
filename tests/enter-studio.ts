import { expect, type Page } from "@playwright/test";

/** Existing component checks enter the page through its explicit shortcut. */
export async function enterStudio(page: Page) {
  const opening = page.locator(".studio-opening");
  await expect(opening).toHaveAttribute("data-studio-state", /opening|clear/);
  if ((await opening.getAttribute("data-studio-state")) === "opening")
    await page
      .getByRole("button", { name: "Enter studio", exact: true })
      .click();
  await expect(opening).toBeHidden();
}
