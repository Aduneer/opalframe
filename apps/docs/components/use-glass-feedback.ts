"use client";

import { useEffect, type RefObject } from "react";

/** One short, decorative response per activation; native controls keep ownership. */
export function useGlassFeedback(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const surface = root.current;
    if (!surface) return;
    const motion = matchMedia("(prefers-reduced-motion: no-preference)");
    let focused = true;
    let ripple: HTMLSpanElement | null = null;
    let activeFrame: HTMLElement | null = null;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    function clear() {
      if (timeout) clearTimeout(timeout);
      timeout = undefined;
      ripple?.removeEventListener("animationend", clear);
      ripple?.remove();
      ripple = null;
      activeFrame = null;
    }

    function show(target: EventTarget | null, x?: number, y?: number) {
      clear();
      if (
        !motion.matches ||
        document.hidden ||
        !focused ||
        !(target instanceof Element)
      )
        return;
      const frame = target.closest<HTMLElement>(".gallery-demo");
      if (!frame || !surface!.contains(frame)) return;
      const bounds = frame.getBoundingClientRect();
      const source =
        target.closest("button, a, input, select, summary") ?? target;
      const control = source.getBoundingClientRect();
      const localX = Math.max(
        0,
        Math.min(bounds.width, (x ?? control.x + control.width / 2) - bounds.x),
      );
      const localY = Math.max(
        0,
        Math.min(
          bounds.height,
          (y ?? control.y + control.height / 2) - bounds.y,
        ),
      );
      ripple = document.createElement("span");
      ripple.className = "glass-feedback";
      ripple.setAttribute("aria-hidden", "true");
      ripple.style.left = `${localX}px`;
      ripple.style.top = `${localY}px`;
      ripple.addEventListener("animationend", clear, { once: true });
      activeFrame = frame;
      frame.append(ripple);
      timeout = setTimeout(clear, 850);
    }

    function press(event: PointerEvent) {
      if (event.isPrimary && event.button === 0)
        show(event.target, event.clientX, event.clientY);
    }
    function activate(event: MouseEvent) {
      // Keyboard activation has no pointer coordinates; mouse/touch already responded.
      if (event.detail === 0) show(event.target);
    }
    function leave(event: PointerEvent) {
      // Touch pointers leave on release; let the tap response finish its fade.
      if (event.pointerType !== "touch") clear();
    }
    function blur() {
      focused = false;
      clear();
    }
    function focus() {
      focused = true;
    }

    const observer = new IntersectionObserver((entries) => {
      if (
        entries.some(
          (entry) => entry.target === activeFrame && !entry.isIntersecting,
        )
      )
        clear();
    });
    surface
      .querySelectorAll(".gallery-demo")
      .forEach((frame) => observer.observe(frame));
    surface.addEventListener("pointerdown", press, { passive: true });
    surface.addEventListener("click", activate);
    surface.addEventListener("pointerleave", leave);
    surface.addEventListener("pointercancel", clear);
    motion.addEventListener("change", clear);
    document.addEventListener("visibilitychange", clear);
    window.addEventListener("blur", blur);
    window.addEventListener("focus", focus);
    window.addEventListener("scroll", clear, { passive: true });
    return () => {
      clear();
      observer.disconnect();
      surface.removeEventListener("pointerdown", press);
      surface.removeEventListener("click", activate);
      surface.removeEventListener("pointerleave", leave);
      surface.removeEventListener("pointercancel", clear);
      motion.removeEventListener("change", clear);
      document.removeEventListener("visibilitychange", clear);
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", focus);
      window.removeEventListener("scroll", clear);
    };
  }, [root]);
}
