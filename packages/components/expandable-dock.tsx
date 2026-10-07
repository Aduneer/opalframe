"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import "./expandable-dock.css";

export interface DockItem {
  id: string;
  label: string;
  icon: ReactNode;
  /** Omit href for an in-page action. Links retain native browser navigation. */
  href?: string;
  disabled?: boolean;
}

export interface ExpandableDockProps {
  items: DockItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  label?: string;
  className?: string;
  reducedMotion?: boolean;
}

/** Navigation with transient label expansion and a persistent current destination. */
export function ExpandableDock({
  items,
  value,
  defaultValue,
  onValueChange,
  label = "Main navigation",
  className = "",
  reducedMotion = false,
}: ExpandableDockProps) {
  const [internal, setInternal] = useState(defaultValue);
  const selected =
    items.find((item) => item.id === (value ?? internal) && !item.disabled) ??
    items.find((item) => !item.disabled);
  const [hovered, setHovered] = useState<string>();
  const [focused, setFocused] = useState<string>();
  const expanded = hovered ?? focused ?? selected?.id;
  const track = useRef<HTMLDivElement>(null);
  const controls = useRef(
    new Map<string, HTMLAnchorElement | HTMLButtonElement>(),
  );
  const [marker, setMarker] = useState<{ left: number; width: number }>();
  const selectedId = selected?.id;

  useEffect(() => {
    const element = track.current;
    const current = selectedId && controls.current.get(selectedId);
    if (!element || !current) return;
    const measure = () => {
      const next = { left: current.offsetLeft, width: current.offsetWidth };
      setMarker((previous) =>
        previous?.left === next.left && previous.width === next.width
          ? previous
          : next,
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    // Expansion can move the current item without resizing it.
    for (const control of controls.current.values()) observer.observe(control);
    const frame = requestAnimationFrame(measure);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [selectedId, items]);

  function select(item: DockItem) {
    if (value === undefined) setInternal(item.id);
    onValueChange?.(item.id);
  }

  function navigate(event: KeyboardEvent, id: string) {
    const available = items.filter((item) => !item.disabled);
    const index = available.findIndex((item) => item.id === id);
    let next: number;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = (index + 1) % available.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (index - 1 + available.length) % available.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = available.length - 1;
    else return;
    event.preventDefault();
    controls.current.get(available[next].id)?.focus();
  }

  if (!items.length) return null;
  return (
    <nav
      className={`is-dock ${className}`}
      aria-label={label}
      data-reduced-motion={reducedMotion || undefined}
    >
      <div
        className="is-dock-track"
        ref={track}
        onPointerLeave={() => setHovered(undefined)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setFocused(undefined);
        }}
      >
        {marker && selected && (
          <span
            className="is-dock-marker"
            aria-hidden="true"
            style={{ left: marker.left, width: marker.width }}
          />
        )}
        {items.map((item) => {
          const active = item.id === selectedId;
          const attributes = {
            className: "is-dock-item",
            "aria-label": item.label,
            "data-expanded": item.id === expanded,
            "data-active": active,
            "data-disabled": item.disabled || undefined,
            onFocus: () => {
              setHovered(undefined);
              setFocused(item.id);
            },
            onPointerEnter: (event: PointerEvent) => {
              if (event.pointerType !== "touch" && !item.disabled)
                setHovered(item.id);
            },
            onKeyDown: (event: KeyboardEvent) => navigate(event, item.id),
            onClick: (event: MouseEvent) => {
              // Opening a link in another tab should not change this page's destination.
              if (
                item.href &&
                (event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey)
              )
                return;
              select(item);
            },
            ref: (node: HTMLAnchorElement | HTMLButtonElement | null) => {
              if (node) controls.current.set(item.id, node);
              else controls.current.delete(item.id);
            },
          };
          const content = (
            <>
              <span className="is-dock-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="is-dock-label" aria-hidden="true">
                <span>{item.label}</span>
              </span>
            </>
          );
          // Disabled destinations are buttons, so there is no navigable disabled link.
          return item.href && !item.disabled ? (
            <a
              key={item.id}
              {...attributes}
              href={item.href}
              aria-current={active ? "page" : undefined}
            >
              {content}
            </a>
          ) : (
            <button
              key={item.id}
              {...attributes}
              type="button"
              disabled={item.disabled}
              aria-pressed={active}
            >
              {content}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
