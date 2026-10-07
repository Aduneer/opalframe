"use client";

import { useId, useState, type ReactNode, type CSSProperties } from "react";
import "./comparison-lens.css";

export interface ComparisonLensProps {
  before: ReactNode;
  after: ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  className?: string;
  style?: CSSProperties;
}

/** Both layers share one coordinate system. The native range handles touch and keyboard input. */
export function ComparisonLens({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
  value,
  defaultValue = 50,
  onValueChange,
  className = "",
  style,
}: ComparisonLensProps) {
  const uid = useId();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const position = Math.min(100, Math.max(0, value ?? internalValue));
  return (
    <div
      className={`is-lens ${className}`}
      style={{ ...style, "--lens-position": `${position}%` } as CSSProperties}
    >
      <div className="is-lens-layer" aria-hidden="true">
        {before}
      </div>
      <div className="is-lens-layer is-lens-after" aria-hidden="true">
        {after}
      </div>
      <span className="is-lens-tag is-lens-before-tag" aria-hidden="true">
        {beforeLabel}
      </span>
      <span className="is-lens-tag is-lens-after-tag" aria-hidden="true">
        {afterLabel}
      </span>
      <div className="is-lens-divider" aria-hidden="true">
        <span>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <path
              d="m8 8-4 4 4 4m8-8 4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
      <label className="is-lens-sr" htmlFor={uid}>
        Compare {beforeLabel} and {afterLabel}
      </label>
      <input
        id={uid}
        className="is-lens-input"
        type="range"
        min={0}
        max={100}
        step={1}
        value={position}
        aria-valuetext={`${position}% ${afterLabel}, ${100 - position}% ${beforeLabel}`}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (value === undefined) setInternalValue(next);
          onValueChange?.(next);
        }}
      />
    </div>
  );
}
