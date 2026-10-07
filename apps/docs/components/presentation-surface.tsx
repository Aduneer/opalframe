"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useGlassFeedback } from "./use-glass-feedback";

/** Bounded light response, outside every demo's layout and measurement system. */
export function PresentationSurface({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useGlassFeedback(root);

  useEffect(() => {
    const surface = root.current;
    if (!surface) return;
    const preference = matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const motion = matchMedia("(prefers-reduced-motion: no-preference)");
    const lens = surface.querySelector<HTMLElement>(".signature-lens");
    const study = surface.querySelector<HTMLElement>(".signature-study");
    const videos = Array.from(
      surface.querySelectorAll<HTMLVideoElement>(".signature-motion"),
    );
    let inView = false;
    let windowFocused = true;
    let disposed = false;
    function syncAmbient() {
      if (!lens || disposed) return;
      const running =
        motion.matches &&
        inView &&
        windowFocused &&
        !document.hidden &&
        study?.dataset.ambientPaused !== "true";
      if (running) lens.dataset.ambientRunning = "true";
      else lens.removeAttribute("data-ambient-running");
      const theme =
        document.documentElement.dataset.theme === "light"
          ? "pearl"
          : "charcoal";
      let ready = false;
      for (const video of videos) {
        if (
          video.hasAttribute("src") &&
          video.getAttribute("src") !== video.dataset.src
        ) {
          video.pause();
          video.removeAttribute("src");
          video.load();
          delete video.dataset.alphaReady;
          delete video.dataset.motionFailed;
        }
        const selected =
          video.dataset.motionTheme === theme &&
          motion.matches &&
          !video.error &&
          video.dataset.motionFailed !== "true";
        // Load only the selected, visible theme after motion preferences are known.
        if (selected && running && !video.hasAttribute("src"))
          video.src = video.dataset.src!;
        const showing =
          selected &&
          video.dataset.alphaReady === "true" &&
          video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
        if (showing) {
          video.dataset.active = "true";
          ready = true;
        } else video.removeAttribute("data-active");
        if (selected && running) {
          if (video.paused)
            void video.play().catch((error: DOMException) => {
              // Pausing during a pending play deliberately rejects with AbortError.
              if (disposed || error.name === "AbortError") return;
              video.dataset.motionFailed = "true";
              syncAmbient();
            });
        } else video.pause();
      }
      if (ready) lens.setAttribute("data-rotation-ready", "true");
      else lens.removeAttribute("data-rotation-ready");
    }

    function verifyAlpha(event: Event) {
      const video = event.currentTarget as HTMLVideoElement;
      if (
        video.dataset.alphaReady === "true" ||
        video.dataset.motionFailed === "true"
      ) {
        syncAmbient();
        return;
      }
      // Some decoders accept WebM but discard its alpha. Keep the transparent still
      // in that case rather than displaying an opaque rectangle. Probe once per load.
      try {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const context = canvas.getContext("2d");
        context?.drawImage(video, 0, 0, 1, 1, 0, 0, 1, 1);
        if (context?.getImageData(0, 0, 1, 1).data[3] === 0)
          video.dataset.alphaReady = "true";
        else video.dataset.motionFailed = "true";
      } catch {
        video.dataset.motionFailed = "true";
      }
      syncAmbient();
    }
    const targets = Array.from(
      surface.querySelectorAll<HTMLElement>(".gallery-intro, .gallery-demo"),
    );
    let frame = 0;
    let active: HTMLElement | null = null;
    let pending: { target: HTMLElement; x: number; y: number } | null = null;

    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      pending = null;
      if (active) {
        active.removeAttribute("data-light-active");
        active.style.removeProperty("--light-x");
        active.style.removeProperty("--light-y");
        active.style.removeProperty("--lens-shift-x");
        active.style.removeProperty("--lens-shift-y");
        active.style.removeProperty("--lens-turn");
        active = null;
      }
    }

    function paint() {
      frame = 0;
      if (!pending || !preference.matches || document.hidden) {
        reset();
        return;
      }
      const { target, x, y } = pending;
      pending = null;
      if (active !== target) reset();
      const bounds = target.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const nx = Math.max(0, Math.min(1, (x - bounds.left) / bounds.width));
      const ny = Math.max(0, Math.min(1, (y - bounds.top) / bounds.height));
      active = target;
      target.dataset.lightActive = "true";
      target.style.setProperty("--light-x", `${nx * 100}%`);
      target.style.setProperty("--light-y", `${ny * 100}%`);
      target.style.setProperty("--lens-shift-x", `${(nx - 0.5) * 2}px`);
      target.style.setProperty("--lens-shift-y", `${(ny - 0.5) * 0.8}px`);
      target.style.setProperty("--lens-turn", `${(nx - 0.5) * 0.7}deg`);
    }

    function move(event: PointerEvent) {
      if (
        !preference.matches ||
        document.hidden ||
        event.pointerType !== "mouse" ||
        event.buttons
      ) {
        reset();
        return;
      }
      const target = targets.find((item) =>
        item.contains(event.target as Node),
      );
      if (!target) {
        reset();
        return;
      }
      pending = { target, x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(paint);
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === lens) {
          inView = entry.isIntersecting;
          syncAmbient();
        }
      }
      if (
        entries.some(
          (entry) => entry.target === active && !entry.isIntersecting,
        )
      )
        reset();
    });
    targets.forEach((target) => observer.observe(target));
    if (lens) observer.observe(lens);
    videos.forEach((video) => {
      video.addEventListener("loadeddata", verifyAlpha);
      video.addEventListener("error", syncAmbient);
    });
    const themeObserver = new MutationObserver(syncAmbient);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const pauseObserver = new MutationObserver(syncAmbient);
    if (study)
      pauseObserver.observe(study, {
        attributes: true,
        attributeFilter: ["data-ambient-paused"],
      });
    function visibility() {
      reset();
      syncAmbient();
    }
    function blur() {
      windowFocused = false;
      visibility();
    }
    function focus() {
      windowFocused = true;
      syncAmbient();
    }
    surface.addEventListener("pointermove", move, { passive: true });
    surface.addEventListener("pointerleave", reset);
    surface.addEventListener("pointerdown", reset, { passive: true });
    preference.addEventListener("change", reset);
    motion.addEventListener("change", visibility);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("blur", blur);
    window.addEventListener("focus", focus);
    window.addEventListener("scroll", reset, { passive: true });
    return () => {
      disposed = true;
      reset();
      observer.disconnect();
      pauseObserver.disconnect();
      themeObserver.disconnect();
      lens?.removeAttribute("data-rotation-ready");
      videos.forEach((video) => {
        video.pause();
        video.removeEventListener("loadeddata", verifyAlpha);
        video.removeEventListener("error", syncAmbient);
      });
      lens?.removeAttribute("data-ambient-running");
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerleave", reset);
      surface.removeEventListener("pointerdown", reset);
      preference.removeEventListener("change", reset);
      motion.removeEventListener("change", visibility);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", focus);
      window.removeEventListener("scroll", reset);
    };
  }, []);

  return (
    <div className="home-presentation" ref={root}>
      {children}
    </div>
  );
}
