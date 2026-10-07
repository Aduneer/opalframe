"use client";

import { useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { ProductDemo } from "./demos";
import { useDemoStory } from "./use-demo-story";

const steps = [
  { value: "overview", duration: 1800 },
  { value: "insight", duration: 1800 },
  { value: "activity", duration: 1800 },
] as const;

export function GalleryProductDemo() {
  const root = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("overview");
  const story = useDemoStory(root, steps, setValue);
  return (
    <div
      className="gallery-guided-demo"
      ref={root}
      onPointerDownCapture={story.interrupt}
      onKeyDownCapture={story.interrupt}
      onFocusCapture={story.interrupt}
    >
      <div className="gallery-story-toolbar" data-story-control>
        <span>Three details. One moving frame.</span>
        <button
          type="button"
          onClick={story.toggle}
          disabled={story.reduced}
          aria-pressed={story.playing}
        >
          {story.playing ? (
            <Pause size={13} />
          ) : story.played ? (
            <RotateCcw size={13} />
          ) : (
            <Play size={13} />
          )}
          {story.playing
            ? "Pause story"
            : story.played
              ? "Replay story"
              : "Watch the story"}
        </button>
      </div>
      <ProductDemo
        value={value}
        onValueChange={(next) => {
          story.stop();
          setValue(next);
        }}
      />
    </div>
  );
}
