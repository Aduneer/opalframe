"use client";

import { useId, useState, type ReactNode } from "react";
import "./release-rail.css";

export interface ReleaseStep {
  id: string;
  label: string;
  status: "pending" | "running" | "complete" | "error";
  duration?: string;
  detail: ReactNode;
}

export interface ReleaseRailProps {
  steps: ReleaseStep[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  label?: string;
  reducedMotion?: boolean;
}

export function ReleaseRail({
  steps,
  value,
  defaultValue,
  onValueChange,
  className = "",
  label = "Deployment stages",
  reducedMotion = false,
}: ReleaseRailProps) {
  const uid = useId();
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? steps[0]?.id,
  );
  const selected =
    steps.find((step) => step.id === (value ?? internalValue)) ?? steps[0];
  if (!selected) return null;
  return (
    <div
      className={`is-rail ${className}`}
      data-reduced-motion={reducedMotion || undefined}
    >
      <ol className="is-rail-steps" aria-label={label}>
        {steps.map((step, index) => (
          <li key={step.id} data-status={step.status}>
            <button
              type="button"
              aria-pressed={selected.id === step.id}
              aria-controls={`${uid}-detail-${step.id}`}
              onClick={() => {
                if (value === undefined) setInternalValue(step.id);
                onValueChange?.(step.id);
              }}
            >
              <span className="is-rail-node" aria-hidden="true">
                {step.status === "complete"
                  ? "✓"
                  : step.status === "error"
                    ? "!"
                    : String(index + 1).padStart(2, "0")}
              </span>
              <span className="is-rail-label">{step.label}</span>
              <span className="is-rail-duration">
                {step.duration ??
                  (step.status === "pending"
                    ? "Queued"
                    : step.status === "running"
                      ? "In progress"
                      : step.status === "error"
                        ? "Failed"
                        : "Done")}
              </span>
              <span className="is-rail-sr">{step.status}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="is-rail-detail">
        {steps.map((step) => (
          <div
            key={step.id}
            className="is-rail-panel"
            id={`${uid}-detail-${step.id}`}
            role="region"
            aria-label={`${step.label} details`}
            data-active={step.id === selected.id}
            aria-hidden={step.id !== selected.id}
            inert={step.id !== selected.id}
          >
            {step.detail}
          </div>
        ))}
      </div>
      <p className="is-rail-sr" role="status">
        {steps.filter((step) => step.status === "complete").length} of{" "}
        {steps.length} stages complete.{" "}
        {steps
          .filter(
            (step) => step.status === "running" || step.status === "error",
          )
          .map(
            (step) =>
              `${step.label} ${step.status === "error" ? "failed" : "in progress"}.`,
          )
          .join(" ")}
      </p>
    </div>
  );
}
