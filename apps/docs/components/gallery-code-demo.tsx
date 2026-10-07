"use client";

import { useEffect, useRef, useState } from "react";
import { CodeWindowDemo } from "./code-window-demo";
import type { DemoPreset } from "@/lib/demo-presets";

/** One introduction after the opening, unless the visitor takes control first. */
export function GalleryCodeDemo({
  preset = "original",
  autoIntroduce = true,
}: {
  preset?: DemoPreset;
  autoIntroduce?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const element = root.current;
    if (!element || started || !autoIntroduce) return;
    const opening = element
      .closest(".studio-experience")
      ?.querySelector<HTMLElement>(".studio-opening");
    const motion = matchMedia("(prefers-reduced-motion: no-preference)");
    let visible = false;
    function start() {
      if (
        visible &&
        !touched.current &&
        !document.hidden &&
        motion.matches &&
        opening?.dataset.studioState === "clear"
      )
        setStarted(true);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.2;
        start();
      },
      { threshold: 0.2 },
    );
    observer.observe(element);
    const openingObserver = new MutationObserver(start);
    if (opening)
      openingObserver.observe(opening, {
        attributes: true,
        attributeFilter: ["data-studio-state"],
      });
    document.addEventListener("visibilitychange", start);
    motion.addEventListener("change", start);
    return () => {
      observer.disconnect();
      openingObserver.disconnect();
      document.removeEventListener("visibilitychange", start);
      motion.removeEventListener("change", start);
    };
  }, [started, autoIntroduce]);

  return (
    <div
      className="gallery-code-demo"
      ref={root}
      onPointerDownCapture={() => (touched.current = true)}
      onKeyDownCapture={() => (touched.current = true)}
      onFocusCapture={() => (touched.current = true)}
    >
      <CodeWindowDemo
        key={started ? "walkthrough" : "still"}
        autoPlay={started}
        preset={preset}
      />
    </div>
  );
}
