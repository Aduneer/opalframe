"use client";

import type { DemoName } from "./demos";
import { demoPresets, type DemoPreset } from "@/lib/demo-presets";

export function DemoPresetSelect({
  name,
  value,
  onChange,
}: {
  name: DemoName;
  value: DemoPreset;
  onChange: (value: DemoPreset) => void;
}) {
  const choices = demoPresets(name);
  if (!choices.length) return null;
  return (
    <label className="demo-preset-field">
      Example
      <select
        aria-label="Demo preset"
        value={value}
        onChange={(event) => onChange(event.target.value as DemoPreset)}
      >
        {choices.map((choice) => (
          <option key={choice.value} value={choice.value}>
            {choice.label}
          </option>
        ))}
      </select>
    </label>
  );
}
