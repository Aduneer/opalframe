"use client";

import { useId, useState, type CSSProperties, type KeyboardEvent } from "react";
import "./focus-stack.css";

export interface FocusStackItem {
  id: string;
  title: string;
  image: string;
  alt: string;
  description?: string;
  href?: string;
}

export interface FocusStackProps {
  items: FocusStackItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  defaultExpanded?: boolean;
  /** Image width divided by height; defaults to 4/5. */
  aspectRatio?: number;
  label?: string;
  className?: string;
  reducedMotion?: boolean;
}

/** A fanned image collection, with selection and captions outside the artwork. */
export function FocusStack({
  items,
  value,
  defaultValue,
  onValueChange,
  defaultExpanded = false,
  aspectRatio = 4 / 5,
  label = "Image collection",
  className = "",
  reducedMotion = false,
}: FocusStackProps) {
  const uid = useId();
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const selected =
    items.find((item) => item.id === (value ?? internal)) ?? items[0];
  if (!selected) return null;
  const index = items.indexOf(selected);
  const ratio =
    Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 4 / 5;

  function select(id: string) {
    if (id === selected.id) return;
    if (value === undefined) setInternal(id);
    onValueChange?.(id);
  }

  function navigate(event: KeyboardEvent<HTMLButtonElement>, current: number) {
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % items.length;
    else if (event.key === "ArrowLeft")
      next = (current - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else return;
    event.preventDefault();
    select(items[next].id);
    document.getElementById(`${uid}-tab-${items[next].id}`)?.focus();
  }

  return (
    <section
      className={`is-focus-stack ${className}`}
      aria-label={label}
      data-expanded={expanded}
      data-reduced-motion={reducedMotion || undefined}
      style={
        {
          "--stack-ratio": ratio,
          "--stack-spread-steps": Math.max(
            2,
            Math.min(4, Math.floor(items.length / 2) * 2),
          ),
        } as CSSProperties
      }
    >
      <div className="is-focus-stack-heading">
        <span>
          {label}{" "}
          <span>
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(items.length).padStart(2, "0")}
          </span>
        </span>
        {items.length > 1 && (
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={`${uid}-panel`}
            onClick={() => setExpanded(!expanded)}
          >
            <span aria-hidden="true">{expanded ? "↙" : "↗"}</span>{" "}
            {expanded ? "Stack the deck" : "Spread the deck"}
          </button>
        )}
      </div>
      <div
        className="is-focus-stack-stage"
        id={`${uid}-panel`}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${selected.id}`}
        tabIndex={0}
      >
        {items.map((item, itemIndex) => {
          let offset = itemIndex - index;
          if (offset > items.length / 2) offset -= items.length;
          if (offset < -items.length / 2) offset += items.length;
          const distance = Math.abs(offset);
          return (
            <button
              className="is-focus-stack-card"
              type="button"
              key={item.id}
              tabIndex={-1}
              aria-label={`Show ${item.title}`}
              aria-pressed={item.id === selected.id}
              aria-describedby={
                item.id === selected.id ? `${uid}-image-description` : undefined
              }
              hidden={distance > 2}
              onClick={() => select(item.id)}
              style={
                {
                  "--stack-offset": offset,
                  "--stack-distance": distance,
                  zIndex: items.length - distance,
                } as CSSProperties
              }
            >
              {/* Image text is described by the selected panel; back cards are visual selectors. */}
              <img
                src={item.image}
                alt=""
                loading={item.id === selected.id ? "eager" : "lazy"}
                draggable={false}
              />
              <span className="is-focus-stack-card-label" aria-hidden="true">
                {item.title} <span>↗</span>
              </span>
            </button>
          );
        })}
        <span className="is-focus-stack-sr" id={`${uid}-image-description`}>
          {selected.alt}
        </span>
      </div>
      <div
        className="is-focus-stack-tabs"
        role="tablist"
        aria-label="Choose an image"
      >
        {items.map((item, itemIndex) => (
          <button
            type="button"
            role="tab"
            key={item.id}
            id={`${uid}-tab-${item.id}`}
            aria-selected={selected.id === item.id}
            aria-controls={`${uid}-panel`}
            tabIndex={selected.id === item.id ? 0 : -1}
            onClick={() => select(item.id)}
            onKeyDown={(event) => navigate(event, itemIndex)}
          >
            <span>{String(itemIndex + 1).padStart(2, "0")}</span> {item.title}
          </button>
        ))}
      </div>
      <div
        className="is-focus-stack-caption"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="is-focus-stack-descriptions">
          {items.map((item) => (
            <p
              key={item.id}
              data-active={item.id === selected.id}
              aria-hidden={item.id !== selected.id}
            >
              {item.description}
            </p>
          ))}
        </div>
        <div className="is-focus-stack-link">
          {selected.href && (
            <a href={selected.href}>
              View project <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
