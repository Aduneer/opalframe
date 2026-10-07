"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import "./product-stage.css";

export interface StageFeature {
  id: string;
  label: string;
  description: string;
  detail: string;
  /** CSS selector scoped to the preview. Measured again when its layout changes. */
  target?: string;
  /** Percentage rectangle for image previews without DOM targets. */
  focus?: { x: number; y: number; width: number; height: number };
}

export interface ProductStageProps {
  features: StageFeature[];
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  label?: string;
  reducedMotion?: boolean;
  focusPadding?: number;
}

export function ProductStage({
  features,
  children,
  value,
  defaultValue,
  onValueChange,
  className = "",
  label = "Explore the product",
  reducedMotion = false,
  focusPadding = 5,
}: ProductStageProps) {
  const uid = useId();
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? features[0]?.id,
  );
  const selected =
    features.find((feature) => feature.id === (value ?? internalValue)) ??
    features[0];
  const scene = useRef<HTMLDivElement>(null);
  const [measuredFocus, setMeasuredFocus] = useState<StageFeature["focus"]>();
  const target = selected?.target;
  useEffect(() => {
    const preview = scene.current;
    if (!preview || !target) return;
    const element = preview.querySelector(target);
    if (!element) return;
    const measure = () => {
      const frame = preview.getBoundingClientRect();
      const bounds = element.getBoundingClientRect();
      if (!frame.width || !frame.height) return;
      // Keep padding in local CSS pixels, including when a recording canvas is scaled.
      const paddingX = focusPadding * (frame.width / preview.offsetWidth);
      const paddingY = focusPadding * (frame.height / preview.offsetHeight);
      setMeasuredFocus({
        x: ((bounds.left - frame.left - paddingX) / frame.width) * 100,
        y: ((bounds.top - frame.top - paddingY) / frame.height) * 100,
        width: ((bounds.width + paddingX * 2) / frame.width) * 100,
        height: ((bounds.height + paddingY * 2) / frame.height) * 100,
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(preview);
    observer.observe(element);
    const animationFrame = requestAnimationFrame(measure);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [target, focusPadding, children]);
  if (!selected) return null;
  const focus = target ? measuredFocus : selected.focus;

  function select(id: string) {
    if (value === undefined) setInternalValue(id);
    onValueChange?.(id);
  }

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight")
      next = (index + 1) % features.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft")
      next = (index - 1 + features.length) % features.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = features.length - 1;
    else return;
    event.preventDefault();
    select(features[next].id);
    document.getElementById(`${uid}-tab-${features[next].id}`)?.focus();
  }

  return (
    <div
      className={`is-stage ${className}`}
      data-reduced-motion={reducedMotion || undefined}
    >
      <div
        className="is-stage-features"
        role="tablist"
        aria-label={label}
        aria-orientation="vertical"
      >
        {features.map((feature, index) => (
          <button
            key={feature.id}
            id={`${uid}-tab-${feature.id}`}
            role="tab"
            type="button"
            aria-selected={feature.id === selected.id}
            aria-controls={`${uid}-panel`}
            tabIndex={feature.id === selected.id ? 0 : -1}
            onClick={() => select(feature.id)}
            onKeyDown={(event) => navigate(event, index)}
          >
            <span className="is-stage-number">0{index + 1}</span>
            <span>
              <span className="is-stage-label">{feature.label}</span>
              <span className="is-stage-description">
                {feature.description}
              </span>
            </span>
            <span className="is-stage-arrow" aria-hidden="true">
              ↗
            </span>
          </button>
        ))}
        <p className="is-stage-hint">Pick a detail. See the difference.</p>
      </div>
      <div
        className="is-stage-body"
        role="tabpanel"
        id={`${uid}-panel`}
        aria-labelledby={`${uid}-tab-${selected.id}`}
        tabIndex={0}
      >
        <div className="is-stage-scene" ref={scene}>
          {children}
          {focus && (
            <div
              className="is-stage-focus"
              aria-hidden="true"
              style={{
                left: `${focus.x}%`,
                top: `${focus.y}%`,
                width: `${focus.width}%`,
                height: `${focus.height}%`,
              }}
            >
              <span />
              <span />
              <span />
              <span />
            </div>
          )}
        </div>
        <div className="is-stage-caption" aria-live="polite" aria-atomic="true">
          <span className="is-stage-caption-index">
            0{features.indexOf(selected) + 1} / 0{features.length}
          </span>
          <span className="is-stage-caption-texts">
            {features.map((feature) => (
              <span
                key={feature.id}
                data-active={feature.id === selected.id}
                aria-hidden={feature.id !== selected.id}
              >
                {feature.detail}
              </span>
            ))}
          </span>
          <span aria-hidden="true">↗</span>
        </div>
      </div>
    </div>
  );
}
