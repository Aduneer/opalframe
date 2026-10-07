"use client";

import { useState } from "react";
import { DockDemo } from "./dock-demo";
import { GalleryCodeDemo } from "./gallery-code-demo";
import { demoPresets, type DemoPreset } from "@/lib/demo-presets";

export function GalleryScenes({
  name,
}: {
  name: "expandable-dock" | "interactive-code-window";
}) {
  const [preset, setPreset] = useState<DemoPreset>("original");
  const [changed, setChanged] = useState(false);
  return (
    <div className="gallery-scenes">
      <div className="gallery-scene-toolbar">
        <span>Explore a different scene</span>
        <div
          role="group"
          aria-label={
            name === "expandable-dock" ? "Dock scenes" : "Code Window scenes"
          }
        >
          {demoPresets(name).map((choice) => (
            <button
              key={choice.value}
              type="button"
              aria-pressed={preset === choice.value}
              onClick={() => {
                if (preset !== choice.value) {
                  setPreset(choice.value);
                  setChanged(true);
                }
              }}
            >
              {choice.label}
            </button>
          ))}
        </div>
      </div>
      {name === "expandable-dock" ? (
        <DockDemo key={preset} preset={preset} />
      ) : (
        <GalleryCodeDemo
          key={preset}
          preset={preset}
          autoIntroduce={!changed}
        />
      )}
    </div>
  );
}
