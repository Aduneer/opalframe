"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({
  value,
  label = "Copy",
  className = "",
  disabled = false,
}: {
  value: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );
  return (
    <button
      type="button"
      disabled={disabled}
      className={`copy-button ${className}`}
      aria-label={state === "copied" ? "Copied to clipboard" : label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setState("copied");
        } catch {
          setState("error");
        }
        if (timeout.current) clearTimeout(timeout.current);
        timeout.current = setTimeout(() => setState("idle"), 2200);
      }}
    >
      {state === "copied" ? <Check size={14} /> : <Copy size={14} />}
      <span aria-live="polite">
        {state === "copied"
          ? "Copied"
          : state === "error"
            ? "Select and copy"
            : label}
      </span>
    </button>
  );
}
