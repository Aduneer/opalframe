"use client";

import { useId } from "react";
import {
  InteractiveCodeWindow,
  type CodeWindowFile,
  type CodeWindowStep,
} from "@studies/interactive-code-window";
import {
  productFiles,
  productSteps,
  productPreview,
} from "./product-code-demo";
import type { DemoPreset } from "@/lib/demo-presets";

const files: CodeWindowFile[] = [
  {
    id: "component",
    name: "field-note.tsx",
    code: `<article className="field-note">
  <header className="note-header">
    <span>FIELD NOTES / 004</span>
    <span>↗</span>
  </header>

  <div className="note-artwork">
    <GlassStudy />
    <span>STUDY IN STILLNESS</span>
  </div>

  <div className="note-story">
    <p>Design / 4 min read</p>
    <h2>Somewhere in between.</h2>
    <span>Small observations. Better ideas.</span>
  </div>
</article>`,
  },
  {
    id: "style",
    name: "finish.css",
    code: `.field-note {
  background: rgb(255 255 255 / .72);
  border: 1px solid rgb(255 255 255 / .9);
  border-radius: 16px;
  box-shadow: 0 18px 40px #34577918;
}

.note-artwork {
  background: #d7e8f9;
}`,
  },
];

const steps: CodeWindowStep[] = [
  {
    id: "frame",
    title: "Frame",
    description:
      "Start with a little structure. Give the important things room.",
    fileId: "component",
    lines: [1, 5],
    target: ".note-header",
  },
  {
    id: "artwork",
    title: "Artwork",
    description: "One small study. A little light, a little dimension.",
    fileId: "component",
    lines: [7, 10],
    target: ".note-artwork",
  },
  {
    id: "details",
    title: "Details",
    description: "Let the type do the talking. Keep the rest quiet.",
    fileId: "component",
    lines: [12, 16],
    target: ".note-story",
  },
  {
    id: "finish",
    title: "Finish",
    description: "A softer surface. Same structure, a different feeling.",
    fileId: "style",
    lines: [1, 10],
    target: ".field-note",
  },
];

function renderLine(line: string) {
  // Lightweight demo coloring. The portable component accepts any line renderer.
  return line
    .split(
      /("[^"]*"|#[\da-fA-F]+|\bclassName\b|<\/?[\w.-]+|\b(?:background|border|border-radius|box-shadow)\b)/g,
    )
    .map((part, i) => (
      <span
        key={i}
        className={
          part.startsWith('"') || part.startsWith("#")
            ? "code-demo-token-string"
            : part.startsWith("<")
              ? "code-demo-token-tag"
              : ""
        }
      >
        {part}
      </span>
    ));
}

function FieldNote({ finished }: { finished: boolean }) {
  const uid = useId().replace(/:/g, "");
  return (
    <article
      className="field-note"
      data-finished={finished}
      aria-label="Field Notes sample card"
    >
      <header className="note-header">
        <span>FIELD NOTES / 004</span>
        <span aria-hidden="true">↗</span>
      </header>
      <div className="note-artwork">
        <svg viewBox="0 0 260 145" fill="none" aria-hidden="true">
          <defs>
            <linearGradient
              id={`${uid}-metal`}
              x1="80"
              y1="25"
              x2="180"
              y2="130"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#ffffff" />
              <stop offset=".25" stopColor="#c0d6ec" />
              <stop offset=".46" stopColor="#7090b3" />
              <stop offset=".6" stopColor="#f4f9ff" />
              <stop offset="1" stopColor="#a1bfdd" />
            </linearGradient>
            <linearGradient
              id={`${uid}-glass`}
              x1="82"
              y1="5"
              x2="177"
              y2="132"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#ffffff" stopOpacity=".9" />
              <stop offset=".45" stopColor="#c5dfff" stopOpacity=".25" />
              <stop offset="1" stopColor="#426c99" stopOpacity=".65" />
            </linearGradient>
          </defs>
          <ellipse
            cx="130"
            cy="126"
            rx="56"
            ry="7"
            fill="#46709b"
            opacity=".12"
          />
          <ellipse
            cx="130"
            cy="71"
            rx="58"
            ry="25"
            transform="rotate(-42 130 71)"
            stroke={`url(#${uid}-metal)`}
            strokeWidth="16"
          />
          <ellipse
            cx="130"
            cy="71"
            rx="58"
            ry="25"
            transform="rotate(42 130 71)"
            stroke={`url(#${uid}-glass)`}
            strokeWidth="16"
          />
          <ellipse
            cx="130"
            cy="71"
            rx="58"
            ry="25"
            transform="rotate(42 130 71)"
            stroke="#ffffff"
            strokeOpacity=".75"
          />
          <path
            d="M98 34c25-10 56 4 74 25"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            opacity=".75"
          />
        </svg>
        <span>STUDY IN STILLNESS</span>
      </div>
      <div className="note-story">
        <p>
          Design <span> / </span> 4 min read
        </p>
        <h2>
          Somewhere
          <br />
          in between<span>.</span>
        </h2>
        <span>Small observations. Better ideas.</span>
      </div>
    </article>
  );
}

function preview(step: CodeWindowStep) {
  return <FieldNote finished={step.id === "finish"} />;
}

export function CodeWindowDemo({
  reducedMotion = false,
  autoPlay = false,
  className,
  preset = "original",
}: {
  reducedMotion?: boolean;
  autoPlay?: boolean;
  className?: string;
  preset?: DemoPreset;
}) {
  return (
    <InteractiveCodeWindow
      className={className}
      files={preset === "alternate" ? productFiles : files}
      steps={preset === "alternate" ? productSteps : steps}
      preview={preset === "alternate" ? productPreview : preview}
      defaultValue={autoPlay ? "frame" : "artwork"}
      label={
        preset === "alternate"
          ? "A product story, line by line."
          : "A little code. A little character."
      }
      previewLabel="The result"
      renderLine={renderLine}
      focusPadding={0}
      reducedMotion={reducedMotion}
      autoPlay={autoPlay}
    />
  );
}
