"use client";

import { CopyButton } from "./copy-button";
import type { DemoName } from "./demos";
import {
  accentChoices,
  customizationClass,
  type AccentChoice,
  finishChoices,
  type FinishChoice,
} from "@/lib/preview-customization";

export function PreviewCustomization({
  name,
  id,
  accent,
  width,
  finish,
  css,
  onAccentChange,
  onWidthChange,
  onFinishChange,
  onReset,
}: {
  name: DemoName;
  id: string;
  accent: AccentChoice;
  width: number;
  finish: FinishChoice;
  css: string;
  onAccentChange: (value: AccentChoice) => void;
  onWidthChange: (value: number) => void;
  onFinishChange: (value: FinishChoice) => void;
  onReset: () => void;
}) {
  return (
    <section
      className="preview-customization"
      id={id}
      aria-label="Live customization"
    >
      <div className="customization-controls">
        <fieldset className="customization-accents">
          <legend>Accent</legend>
          <div>
            {accentChoices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                aria-pressed={choice.id === accent}
                onClick={() => onAccentChange(choice.id)}
              >
                <span
                  className={`accent-swatch ${choice.color ? "" : "accent-original"}`}
                  style={
                    choice.color ? { background: choice.color } : undefined
                  }
                  aria-hidden="true"
                />
                {choice.label}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="customization-width">
          <label htmlFor={`${id}-width`}>
            Width <output htmlFor={`${id}-width`}>{width}%</output>
          </label>
          <input
            id={`${id}-width`}
            type="range"
            min={80}
            max={100}
            step={5}
            value={width}
            aria-valuetext={`${width} percent`}
            onChange={(event) => onWidthChange(Number(event.target.value))}
          />
        </div>
        <fieldset className="customization-accents">
          <legend>Finish</legend>
          <div>
            {finishChoices.map((choice) => (
              <button
                key={choice}
                type="button"
                aria-pressed={choice === finish}
                onClick={() => onFinishChange(choice)}
              >
                {choice}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="customization-actions">
        <p>
          Add <code>{`className="${customizationClass(name)}"`}</code> to your
          component.
        </p>
        <div>
          <button
            type="button"
            className="customization-reset"
            disabled={!css}
            onClick={onReset}
          >
            Reset styles
          </button>
          <CopyButton key={css} value={css} label="Copy CSS" disabled={!css} />
        </div>
      </div>
      {css ? (
        <details className="customization-css">
          <summary>View CSS</summary>
          <pre tabIndex={0}>
            <code>{css}</code>
          </pre>
        </details>
      ) : (
        <p className="customization-hint">Make a change to create your CSS.</p>
      )}
    </section>
  );
}
