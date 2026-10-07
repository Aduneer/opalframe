"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, EyeOff, RotateCcw } from "lucide-react";
import { Demo, type DemoName } from "./demos";
import { DemoPresetSelect } from "./demo-preset-select";
import { readDemoPreset, type DemoPreset } from "@/lib/demo-presets";

const names: DemoName[] = [
  "product-stage",
  "release-rail",
  "comparison-lens",
  "interactive-code-window",
  "expandable-dock",
  "focus-stack",
];

function RecordingCanvas({
  children,
  theme,
}: {
  children: ReactNode;
  theme: string;
}) {
  const slot = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const available = slot.current;
    const content = canvas.current;
    if (!available || !content) return;
    const fit = () => {
      if (content.offsetHeight) {
        setScale(Math.min(1, available.clientHeight / content.offsetHeight));
      }
    };
    const observer = new ResizeObserver(fit);
    observer.observe(available);
    observer.observe(content);
    const frame = requestAnimationFrame(fit);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <div className="showcase-demo-slot" ref={slot}>
      <div
        className="showcase-demo"
        ref={canvas}
        data-demo-theme={theme}
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

export function Showcase() {
  const params = useSearchParams();
  const initial = params.get("component");
  const [name, setName] = useState<DemoName>(
    names.includes(initial as DemoName)
      ? (initial as DemoName)
      : "product-stage",
  );
  const [ratio, setRatio] = useState("16/9");
  const [preset, setPreset] = useState<DemoPreset>(() =>
    readDemoPreset(
      names.includes(initial as DemoName)
        ? (initial as DemoName)
        : "product-stage",
      params.get("preset"),
    ),
  );
  const [background, setBackground] = useState("carbon");
  const [theme, setTheme] = useState("dark");
  const [reduced, setReduced] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [key, setKey] = useState(0);
  useEffect(() => {
    const show = (event: KeyboardEvent) => {
      if (event.key === "Escape") setHidden(false);
    };
    window.addEventListener("keydown", show);
    return () => window.removeEventListener("keydown", show);
  }, []);
  return (
    <main id="main" className={`showcase-shell showcase-${background}`}>
      {!hidden && (
        <div className="showcase-controls">
          <Link className="icon-button" href="/" aria-label="Back to homepage">
            <ArrowLeft size={16} />
          </Link>
          <span className="micro-label">RECORDING STUDIO</span>
          <label>
            Component
            <select
              aria-label="Component"
              value={name}
              onChange={(event) => {
                setName(event.target.value as DemoName);
                setPreset("original");
                setKey(0);
              }}
            >
              <option value="expandable-dock">Expandable Dock</option>
              <option value="product-stage">Product Stage</option>
              <option value="release-rail">Release Rail</option>
              <option value="comparison-lens">Comparison Lens</option>
              <option value="interactive-code-window">
                Interactive Code Window
              </option>
            </select>
          </label>
          <DemoPresetSelect
            name={name}
            value={preset}
            onChange={(next) => {
              setPreset(next);
              setKey(0);
            }}
          />
          <label>
            Frame
            <select
              aria-label="Frame"
              value={ratio}
              onChange={(event) => setRatio(event.target.value)}
            >
              <option value="16/9">16:9</option>
              <option value="1/1">1:1</option>
              <option value="9/16">9:16</option>
            </select>
          </label>
          <label>
            Backdrop
            <select
              aria-label="Backdrop"
              value={background}
              onChange={(event) => setBackground(event.target.value)}
            >
              <option value="carbon">Charcoal</option>
              <option value="pearl">Pearl</option>
              <option value="aero">Aero</option>
            </select>
          </label>
          <label>
            Demo theme
            <select
              aria-label="Demo theme"
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </label>
          <label className="showcase-reduced">
            <input
              type="checkbox"
              checked={reduced}
              onChange={(event) => setReduced(event.target.checked)}
            />{" "}
            Less motion
          </label>
          <button
            type="button"
            className="icon-button"
            aria-label="Restart animation"
            onClick={() => setKey(key + 1)}
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            className="button button-small"
            onClick={() => setHidden(true)}
          >
            <EyeOff size={14} /> Hide controls
          </button>
        </div>
      )}
      <div
        className={`showcase-frame ${ratio === "9/16" ? "showcase-portrait" : ""}`}
        style={{
          aspectRatio: ratio,
          width:
            ratio === "9/16"
              ? "min(450px, 90vw, 48vh)"
              : ratio === "1/1"
                ? "min(820px, 90vw, 82vh)"
                : "min(1240px, 94vw, 145vh)",
        }}
      >
        <div className="showcase-frame-top">
          <span>
            opalframe<span className="brand-dot">.</span>
          </span>
          <span>INTERFACE STUDY / 0{names.indexOf(name) + 1}</span>
        </div>
        <RecordingCanvas theme={theme}>
          <Demo
            key={`${name}-${preset}-${key}`}
            name={name}
            preset={preset}
            reducedMotion={reduced}
            autoPlay={key > 0}
          />
        </RecordingCanvas>
        <div className="showcase-frame-bottom">
          <span>MADE TO BE MADE YOUR OWN.</span>
          <span>↗</span>
        </div>
      </div>
      {!hidden && (
        <p className="showcase-hint">
          Backdrop sets the recording canvas. Demo theme sets the component.
          Hide the controls and record. Press Escape or tap the reveal button to
          return.
        </p>
      )}
      {hidden && (
        <button
          className="showcase-reveal"
          type="button"
          aria-label="Show recording controls"
          onClick={() => setHidden(false)}
        >
          Show controls
        </button>
      )}
    </main>
  );
}
