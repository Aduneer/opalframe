"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import "./interactive-code-window.css";

export interface CodeWindowFile {
  id: string;
  name: string;
  code: string;
}

export interface CodeWindowStep {
  id: string;
  title: string;
  description: string;
  fileId: string;
  /** Inclusive, one-based source line range. Keep ranges within a file disjoint. */
  lines: [number, number];
  /** Optional CSS selector scoped to the preview. */
  target?: string;
}

export interface InteractiveCodeWindowProps {
  files: CodeWindowFile[];
  steps: CodeWindowStep[];
  preview: ReactNode | ((step: CodeWindowStep) => ReactNode);
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  renderLine?: (
    line: string,
    lineNumber: number,
    file: CodeWindowFile,
  ) => ReactNode;
  className?: string;
  label?: string;
  previewLabel?: string;
  autoPlay?: boolean;
  stepDuration?: number;
  reducedMotion?: boolean;
  focusPadding?: number;
}

function subscribeMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function getMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}
function getVisibility() {
  return !document.hidden;
}

export function InteractiveCodeWindow({
  files,
  steps,
  preview,
  value,
  defaultValue,
  onValueChange,
  renderLine,
  className = "",
  label = "Interactive code walkthrough",
  previewLabel = "Live preview",
  autoPlay = false,
  stepDuration = 1600,
  reducedMotion = false,
  focusPadding = 6,
}: InteractiveCodeWindowProps) {
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const source = useRef<HTMLDivElement>(null);
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? steps[0]?.id,
  );
  const [fileOverride, setFileOverride] = useState<string>();
  const [playing, setPlaying] = useState(autoPlay);
  const [visible, setVisible] = useState(false);
  const documentVisible = useSyncExternalStore(
    subscribeVisibility,
    getVisibility,
    () => true,
  );
  const [copyStatus, setCopyStatus] = useState("");
  const [focus, setFocus] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    radius: string;
  }>();
  const osReduced = useSyncExternalStore(
    subscribeMotion,
    getMotion,
    () => true,
  );
  const reduced = reducedMotion || osReduced;
  const active =
    steps.find((step) => step.id === (value ?? internalValue)) ?? steps[0];
  const file =
    files.find((entry) => entry.id === (fileOverride ?? active?.fileId)) ??
    files[0];
  const index = steps.indexOf(active);
  const ready = !!active && !!file;

  useEffect(() => {
    const panel = source.current;
    if (!panel) return;
    const fit = () => {
      const block = panel.querySelector<HTMLButtonElement>(
        '[aria-pressed="true"]',
      );
      if (!block) return;
      const bounds = block.getBoundingClientRect();
      const viewport = panel.getBoundingClientRect();
      const scale = viewport.height / panel.offsetHeight;
      if (!scale) return;
      if (
        bounds.height > viewport.height - 24 * scale ||
        bounds.top < viewport.top + 12 * scale
      )
        panel.scrollTop += (bounds.top - viewport.top) / scale - 12;
      else if (bounds.bottom > viewport.bottom - 12 * scale)
        panel.scrollTop += (bounds.bottom - viewport.bottom) / scale + 12;
    };
    const observer = new ResizeObserver(fit);
    observer.observe(panel);
    const frame = requestAnimationFrame(fit);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [active?.id, file?.id]);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [ready]);

  useEffect(() => {
    if (!playing || !visible || !documentVisible || !active || !ready) return;
    // Read the client preference here: the hydration snapshot is conservative.
    const skipMotion = reducedMotion || getMotion();
    const timer = window.setTimeout(
      () => {
        const next = skipMotion ? steps[steps.length - 1] : steps[index + 1];
        if (next) {
          if (value === undefined) setInternalValue(next.id);
          setFileOverride(undefined);
          onValueChange?.(next.id);
        }
        if (skipMotion || !next) setPlaying(false);
      },
      skipMotion ? 0 : Math.max(300, stepDuration),
    );
    return () => window.clearTimeout(timer);
  }, [
    playing,
    visible,
    documentVisible,
    active,
    index,
    reduced,
    reducedMotion,
    steps,
    stepDuration,
    value,
    onValueChange,
    ready,
  ]);

  useEffect(() => {
    const container = scene.current;
    if (!container || !active?.target) return;
    const element = container.querySelector(active.target);
    if (!element) return;
    const measure = () => {
      const frame = container.getBoundingClientRect();
      const target = element.getBoundingClientRect();
      if (!frame.width || !frame.height) return;
      const px = (focusPadding * frame.width) / container.offsetWidth;
      const py = (focusPadding * frame.height) / container.offsetHeight;
      setFocus({
        x: ((target.left - frame.left - px) / frame.width) * 100,
        y: ((target.top - frame.top - py) / frame.height) * 100,
        width: ((target.width + px * 2) / frame.width) * 100,
        height: ((target.height + py * 2) / frame.height) * 100,
        radius: getComputedStyle(element).borderRadius,
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(element);
    const frame = requestAnimationFrame(measure);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [active?.id, active?.target, preview, focusPadding]);

  useEffect(() => {
    if (!copyStatus) return;
    const timer = window.setTimeout(() => setCopyStatus(""), 2000);
    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  if (!active || !file) return null;
  const sourceLines = file.code.split("\n");

  function select(step: CodeWindowStep) {
    setPlaying(false);
    setFileOverride(undefined);
    if (value === undefined) setInternalValue(step.id);
    onValueChange?.(step.id);
  }
  function selectFile(entry: CodeWindowFile) {
    const step = steps.find((item) => item.fileId === entry.id);
    if (step) select(step);
    else {
      setPlaying(false);
      setFileOverride(entry.id);
    }
  }
  function navigateFiles(
    event: KeyboardEvent<HTMLButtonElement>,
    current: number,
  ) {
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % files.length;
    else if (event.key === "ArrowLeft")
      next = (current - 1 + files.length) % files.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = files.length - 1;
    else return;
    event.preventDefault();
    selectFile(files[next]);
    document.getElementById(`${uid}-file-${files[next].id}`)?.focus();
  }
  function replay() {
    const skipMotion = reducedMotion || getMotion();
    const first = skipMotion ? steps[steps.length - 1] : steps[0];
    select(first);
    setPlaying(!skipMotion);
  }

  return (
    <div
      className={`is-code-window ${className}`}
      ref={root}
      data-reduced-motion={reducedMotion || undefined}
      role="group"
      aria-label={label}
    >
      <div className="is-code-header">
        <span className="is-code-window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>{label}</span>
        <span className="is-code-header-mark" aria-hidden="true">
          ↗
        </span>
      </div>
      <div className="is-code-layout">
        <div className="is-code-editor">
          <div className="is-code-editor-bar">
            <div
              className="is-code-files"
              role="tablist"
              aria-label="Source files"
            >
              {files.map((entry, i) => (
                <button
                  type="button"
                  role="tab"
                  key={entry.id}
                  id={`${uid}-file-${entry.id}`}
                  aria-selected={entry.id === file.id}
                  aria-controls={`${uid}-source`}
                  tabIndex={entry.id === file.id ? 0 : -1}
                  onClick={() => selectFile(entry)}
                  onKeyDown={(event) => navigateFiles(event, i)}
                >
                  {entry.name}
                </button>
              ))}
            </div>
            <button
              className="is-code-copy"
              type="button"
              aria-label={`Copy ${file.name}`}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(file.code);
                  setCopyStatus("Copied");
                } catch {
                  setCopyStatus("Copy unavailable in this browser.");
                }
              }}
            >
              {copyStatus === "Copied" ? "✓" : "⧉"}
            </button>
            <span className="is-code-copy-feedback" role="status">
              {copyStatus}
            </span>
          </div>
          <div
            className="is-code-source"
            ref={source}
            id={`${uid}-source`}
            role="tabpanel"
            aria-labelledby={`${uid}-file-${file.id}`}
            tabIndex={0}
          >
            <div
              className="is-code-lines"
              style={{
                gridTemplateRows: `repeat(${sourceLines.length}, var(--code-line-height))`,
              }}
            >
              {sourceLines.map((line, i) => (
                <div
                  className="is-code-line"
                  key={i}
                  style={{ gridRow: i + 1 }}
                  data-highlighted={
                    file.id === active.fileId &&
                    i + 1 >= active.lines[0] &&
                    i + 1 <= active.lines[1]
                  }
                >
                  <span className="is-code-line-number" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <code>
                    {renderLine ? renderLine(line, i + 1, file) : line || " "}
                  </code>
                </div>
              ))}
              {steps
                .filter(
                  (step) =>
                    step.fileId === file.id &&
                    step.lines[0] <= sourceLines.length,
                )
                .map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    className="is-code-snippet"
                    style={{
                      gridRow: `${Math.max(1, step.lines[0])} / ${Math.min(sourceLines.length, step.lines[1]) + 1}`,
                    }}
                    aria-label={`Show ${step.title}`}
                    aria-pressed={step.id === active.id}
                    aria-controls={`${uid}-preview`}
                    onClick={() => select(step)}
                  >
                    <span>
                      {String(steps.indexOf(step) + 1).padStart(2, "0")}
                    </span>
                  </button>
                ))}
            </div>
          </div>
          <div className="is-code-editor-bottom">
            <span>SELECT A BLOCK ↗</span>
            <span>React + CSS</span>
          </div>
        </div>
        <div
          className="is-code-preview"
          id={`${uid}-preview`}
          role="region"
          aria-label={previewLabel}
        >
          <div className="is-code-preview-bar">
            <span>
              <i /> {previewLabel}
            </span>
            <span>localhost</span>
          </div>
          <div className="is-code-scene" ref={scene}>
            {typeof preview === "function" ? preview(active) : preview}
            {active.target && focus && (
              <div
                className="is-code-focus"
                aria-hidden="true"
                style={{
                  left: `${focus.x}%`,
                  top: `${focus.y}%`,
                  width: `${focus.width}%`,
                  height: `${focus.height}%`,
                  borderRadius: focus.radius,
                }}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="is-code-walkthrough">
        <div
          className="is-code-step-list"
          role="group"
          aria-label="Walkthrough steps"
        >
          {steps.map((step, i) => (
            <button
              key={step.id}
              type="button"
              aria-pressed={active.id === step.id}
              onClick={() => select(step)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              {step.title}
            </button>
          ))}
        </div>
        <button
          className="is-code-replay"
          type="button"
          aria-label={playing ? "Pause walkthrough" : "Replay walkthrough"}
          onClick={playing ? () => setPlaying(false) : replay}
        >
          {playing ? "Ⅱ" : "↻"}
          <span>{playing ? "Pause" : "Replay"}</span>
        </button>
      </div>
      <div className="is-code-caption" aria-live="polite" aria-atomic="true">
        <span className="is-code-caption-index">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(steps.length).padStart(2, "0")}
        </span>
        <span className="is-code-captions">
          {steps.map((step) => (
            <span
              key={step.id}
              data-active={step.id === active.id}
              aria-hidden={step.id !== active.id}
            >
              {step.description}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
