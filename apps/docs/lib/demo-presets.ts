import type { DemoName } from "@/components/demos";

export type DemoPreset = "original" | "alternate";

export function demoPresets(name: DemoName) {
  if (name === "expandable-dock")
    return [
      { value: "original" as const, label: "Studio" },
      { value: "alternate" as const, label: "Travel journal" },
    ];
  if (name === "interactive-code-window")
    return [
      { value: "original" as const, label: "Field Notes" },
      { value: "alternate" as const, label: "Product detail" },
    ];
  return [];
}

export function readDemoPreset(
  name: DemoName,
  value: string | null,
): DemoPreset {
  return value === "alternate" && demoPresets(name).length
    ? "alternate"
    : "original";
}
