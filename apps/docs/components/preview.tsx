"use client";

import { useId, useState } from "react";
import {
  ChevronDown,
  CirclePause,
  Code2,
  Expand,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { Demo, type DemoName } from "./demos";
import { CopyButton } from "./copy-button";
import { PreviewCustomization } from "./preview-customization";
import { DemoPresetSelect } from "./demo-preset-select";
import { demoPresets, type DemoPreset } from "@/lib/demo-presets";
import {
  customizationClass,
  customizationCss,
  type AccentChoice,
  type FinishChoice,
} from "@/lib/preview-customization";

export function Preview({
  name,
  source,
  featured = false,
}: {
  name: DemoName;
  source: string;
  featured?: boolean;
}) {
  const [code, setCode] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [key, setKey] = useState(0);
  const [customizing, setCustomizing] = useState(false);
  const [accent, setAccent] = useState<AccentChoice>("original");
  const [width, setWidth] = useState(100);
  const [finish, setFinish] = useState<FinishChoice>("Original");
  const [preset, setPreset] = useState<DemoPreset>("original");
  const customizationId = useId();
  const css = customizationCss(name, accent, width, finish);
  return (
    <div className={`preview ${featured ? "preview-featured" : ""}`}>
      <div className="preview-toolbar">
        <div className="preview-tabs">
          <button
            type="button"
            aria-pressed={!code}
            onClick={() => setCode(false)}
          >
            <span className="live-dot" /> Preview
          </button>
          <button
            type="button"
            aria-pressed={code}
            onClick={() => setCode(true)}
          >
            <Code2 size={13} /> Code
          </button>
        </div>
        <div className="preview-tools">
          <button
            className="icon-button"
            type="button"
            title="Simulate reduced motion"
            aria-label="Simulate reduced motion"
            aria-pressed={reduced}
            onClick={() => setReduced(!reduced)}
          >
            <CirclePause size={13} />
          </button>
          <button
            className="icon-button"
            type="button"
            title="Restart preview"
            aria-label="Restart preview"
            onClick={() => setKey(key + 1)}
          >
            <RotateCcw size={13} />
          </button>
          <Link
            className="icon-button"
            aria-label="Open recording mode"
            href={`/showcase?component=${name}&preset=${preset}`}
          >
            <Expand size={13} />
          </Link>
        </div>
      </div>
      {!code && (
        <>
          {demoPresets(name).length > 0 && (
            <div className="preview-example-bar">
              <DemoPresetSelect
                name={name}
                value={preset}
                onChange={(next) => {
                  setPreset(next);
                  setKey(0);
                }}
              />
              <span>Same component. Different content.</span>
            </div>
          )}
          <button
            className="customization-toggle"
            type="button"
            aria-expanded={customizing}
            aria-controls={customizationId}
            onClick={() => setCustomizing(!customizing)}
          >
            <span>
              <SlidersHorizontal size={13} /> Customize
            </span>
            <span className="customization-toggle-note">
              {css ? "Edited" : "Accent · Finish"}
              <ChevronDown size={13} />
            </span>
          </button>
          <div hidden={!customizing}>
            <PreviewCustomization
              name={name}
              id={customizationId}
              accent={accent}
              width={width}
              finish={finish}
              css={css}
              onAccentChange={setAccent}
              onWidthChange={setWidth}
              onFinishChange={setFinish}
              onReset={() => {
                setAccent("original");
                setWidth(100);
                setFinish("Original");
              }}
            />
          </div>
        </>
      )}
      {css && <style>{css}</style>}
      {code ? (
        <div className="source-preview">
          <div className="source-heading">
            <span>{name}.tsx</span>
            <CopyButton value={source} label="Copy source" />
          </div>
          <pre tabIndex={0}>
            <code>{source}</code>
          </pre>
        </div>
      ) : (
        <div className="preview-canvas">
          <Demo
            name={name}
            reducedMotion={reduced}
            key={`${key}-${preset}`}
            preset={preset}
            autoPlay={key > 0}
            className={customizationClass(name)}
          />
        </div>
      )}
      <div className="preview-bottom">
        <span>{reduced ? "REDUCED MOTION" : "REACT + TYPESCRIPT + CSS"}</span>
        <span>YOUR CONTENT. YOUR CODE.</span>
      </div>
    </div>
  );
}
