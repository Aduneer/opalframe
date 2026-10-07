import type { DemoName } from "@/components/demos";

export const accentChoices = [
  { id: "original", label: "Original", color: null },
  { id: "ice", label: "Ice", color: "#5a91df" },
  { id: "sea-glass", label: "Sea glass", color: "#468f82" },
  { id: "silver", label: "Silver", color: "#7c8798" },
] as const;

export type AccentChoice = (typeof accentChoices)[number]["id"];

export const finishChoices = ["Original", "Soft", "Square"] as const;
export type FinishChoice = (typeof finishChoices)[number];

export const previewAppearance: Record<
  DemoName,
  {
    root: string;
    accents: string[];
    maxWidth?: number;
    shapes: { suffix: string; soft: number }[];
  }
> = {
  "focus-stack": {
    root: "is-focus-stack",
    accents: ["--stack-accent"],
    shapes: [
      { suffix: " .is-focus-stack-card", soft: 24 },
      { suffix: " .is-focus-stack-card img", soft: 20 },
      { suffix: " .is-focus-stack-tabs button", soft: 14 },
    ],
  },
  "interactive-code-window": {
    root: "is-code-window",
    accents: ["--code-accent", "--code-preview-accent"],
    shapes: [{ suffix: "", soft: 20 }],
  },
  "expandable-dock": {
    root: "is-dock",
    accents: ["--dock-accent"],
    shapes: [
      { suffix: "", soft: 28 },
      { suffix: " .is-dock-marker", soft: 22 },
      { suffix: " .is-dock-item", soft: 22 },
    ],
  },
  "product-stage": {
    root: "is-stage",
    accents: ["--stage-accent"],
    shapes: [
      { suffix: " .is-stage-features button", soft: 16 },
      { suffix: " .is-stage-caption", soft: 16 },
    ],
  },
  "release-rail": {
    root: "is-rail",
    accents: ["--rail-accent"],
    shapes: [{ suffix: " .is-rail-panel", soft: 16 }],
  },
  "comparison-lens": {
    root: "is-lens",
    accents: ["--lens-accent"],
    maxWidth: 650,
    shapes: [
      { suffix: "", soft: 24 },
      { suffix: " .is-lens-divider span", soft: 20 },
    ],
  },
};

export function customizationClass(name: DemoName) {
  return `my-${name}`;
}

export function customizationCss(
  name: DemoName,
  accent: AccentChoice,
  width: number,
  finish: FinishChoice = "Original",
) {
  const appearance = previewAppearance[name];
  const color = accentChoices.find((choice) => choice.id === accent)?.color;
  const rules = color
    ? appearance.accents.map((property) => `  ${property}: ${color};`)
    : [];
  const selector = `.${appearance.root}.${customizationClass(name)}`;
  const blocks: string[] = [];
  const block = (suffix: string, declarations: string[]) =>
    `${selector}${suffix} {\n${declarations.map((rule) => `  ${rule}`).join("\n")}\n}`;
  if (color) {
    if (name === "focus-stack") {
      rules.push(
        `  --stack-surface: color-mix(in srgb, ${color} 18%, var(--surface, #181d25));`,
        `  --stack-selected: color-mix(in srgb, ${color} 28%, var(--surface, #181d25));`,
        `  --stack-line: color-mix(in srgb, ${color} 42%, var(--line, #343d4a));`,
      );
    } else if (name === "interactive-code-window") {
      rules.push(
        `  --code-surface: color-mix(in srgb, ${color} 18%, var(--surface, #18181b));`,
        `  --code-editor: color-mix(in srgb, ${color} 10%, var(--bg, #101012));`,
        `  --code-preview-background: color-mix(in srgb, ${color} 20%, #dbe8f8);`,
        `  --code-border: color-mix(in srgb, ${color} 40%, var(--line, #34343b));`,
      );
    } else if (name === "expandable-dock") {
      rules.push(
        `  --dock-surface: color-mix(in srgb, ${color} 20%, var(--surface, #18181b));`,
        `  --dock-selected: color-mix(in srgb, ${color} 35%, var(--surface, #18181b));`,
        `  --dock-border: color-mix(in srgb, ${color} 55%, var(--line, #34343b));`,
      );
      blocks.push(
        block(' .is-dock-item[data-active="true"]', [
          `color: color-mix(in srgb, ${color} 35%, var(--dock-text));`,
        ]),
      );
    } else if (name === "product-stage") {
      rules.push(
        `  --stage-selected: color-mix(in srgb, ${color} 24%, var(--surface, #18181b));`,
        `  --stage-border: color-mix(in srgb, ${color} 45%, var(--line, #343439));`,
      );
      blocks.push(
        block(" .is-stage-caption", [
          `background: color-mix(in srgb, ${color} 14%, var(--surface, #18181b));`,
          "border-radius: 8px;",
          "padding: 16px 12px;",
        ]),
      );
    } else if (name === "comparison-lens") {
      rules.push(
        `  --lens-handle: ${color};`,
        "  --lens-handle-ink: #ffffff;",
        `  border-color: ${color};`,
      );
      blocks.push(
        block(" .is-lens-tag", [
          `background: color-mix(in srgb, ${color} 30%, #15151a);`,
        ]),
      );
    }
  }
  if (width !== 100) {
    // Leave room for the dock's four native touch targets at narrow widths.
    const value =
      name === "expandable-dock" ? `max(${width}%, 220px)` : `${width}%`;
    rules.push(`  width: ${value};`, "  margin-inline: auto;");
    if (appearance.maxWidth) {
      rules.push(
        `  max-width: ${Math.round((appearance.maxWidth * width) / 100)}px;`,
      );
    }
  }
  if (finish !== "Original") {
    for (const shape of appearance.shapes) {
      const value = finish === "Soft" ? shape.soft : 0;
      if (!shape.suffix) rules.push(`  border-radius: ${value}px;`);
      else blocks.push(block(shape.suffix, [`border-radius: ${value}px;`]));
    }
  }
  if (rules.length) blocks.unshift(`${selector} {\n${rules.join("\n")}\n}`);
  return blocks.join("\n\n");
}
