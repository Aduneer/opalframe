"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => value * value * (3 - 2 * value);

/** The page stays at its opening composition throughout a native scroll runway. */
export function StudioOpening({
  children,
  componentCount = 5,
}: {
  children: ReactNode;
  componentCount?: number;
}) {
  const scene = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const experience = scene.current!;
    const content = page.current!;
    const opening = root.current!;
    const motion = matchMedia("(prefers-reduced-motion: no-preference)");
    let enabled = motion.matches && !location.hash;
    let frame = 0;
    let lastProgress = -1;
    let distance = 0;
    const runway = experience.querySelector<HTMLElement>(".studio-runway")!;

    function paint() {
      frame = 0;
      if (document.hidden) return;
      const progress = enabled ? clamp(scrollY / Math.max(1, distance)) : 1;
      if (progress === lastProgress) return;
      lastProgress = progress;
      const aperture = smooth(clamp((progress - 0.16) / 0.68));
      const revealed = aperture >= 1;
      const rim = smooth(clamp((progress - 0.42) / 0.58));
      const copy = 1 - smooth(clamp((progress - 0.08) / 0.36));
      const values: Record<string, string> = {
        progress: String(progress),
        haze: String(1 - smooth(progress)),
        blur: `${32 * (1 - smooth(progress))}px`,
        copy: String(copy),
        "copy-blur": `${(1 - copy) * 8}px`,
        "rim-opacity": String(1 - smooth(clamp((progress - 0.78) / 0.22))),
        "rim-open": String(rim),
        "aperture-width": `${aperture * 108}%`,
        "aperture-height": `${aperture * 108}%`,
        "edge-opacity": String(Math.sin(aperture * Math.PI) * 0.65),
        yaw: `${Math.sin(progress * Math.PI) * -2}deg`,
        pitch: `${Math.sin(progress * Math.PI) * 1.5}deg`,
      };
      for (const [name, value] of Object.entries(values))
        opening.style.setProperty(`--studio-${name}`, value);
      opening.dataset.studioState = progress >= 1 ? "clear" : "opening";
      opening.dataset.studioInteractive = String(revealed);
      opening.dataset.stage =
        progress < 0.16 ? "arrival" : progress < 0.78 ? "clearing" : "open";
      opening.dataset.copyVisible = String(copy > 0.01);
      opening.setAttribute("aria-hidden", String(revealed));
      opening.inert = revealed;
      // Once the panes leave, the remaining rim animation cannot block the page.
      content.inert = !revealed;
    }

    function schedule() {
      if (!frame && !document.hidden) frame = requestAnimationFrame(paint);
    }

    function measure() {
      distance = enabled ? runway.getBoundingClientRect().height : 0;
      lastProgress = -1;
      schedule();
    }

    function bypass() {
      if (!enabled) return;
      const nextScroll = Math.max(0, scrollY - distance);
      enabled = false;
      experience.removeAttribute("data-studio-enabled");
      cancelAnimationFrame(frame);
      paint();
      // Removing the runway keeps the visible page at the same content position.
      window.scrollTo({ top: nextScroll, behavior: "instant" });
    }

    function enter() {
      bypass();
      content
        .querySelector<HTMLElement>("#main")
        ?.focus({ preventScroll: true });
    }

    function preference() {
      if (!motion.matches) bypass();
    }

    function anchor() {
      if (!location.hash) return;
      bypass();
      anchorTarget(location.hash)?.scrollIntoView({
        behavior: motion.matches ? "smooth" : "instant",
      });
    }

    function anchorTarget(hash: string) {
      try {
        return document.getElementById(decodeURIComponent(hash.slice(1)));
      } catch {
        return null;
      }
    }

    function navigate(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = (event.target as Element).closest<HTMLAnchorElement>(
        "a[href]",
      );
      if (
        !link ||
        link.hasAttribute("download") ||
        (link.target && link.target !== "_self")
      )
        return;
      const url = new URL(link.href, location.href);
      if (
        url.origin !== location.origin ||
        url.pathname !== location.pathname ||
        url.search !== location.search ||
        !url.hash
      )
        return;
      const target = anchorTarget(url.hash);
      if (!target) return;
      // Remove the sticky runway before the browser computes the anchor position.
      event.preventDefault();
      bypass();
      if (url.hash !== location.hash) history.pushState(null, "", url.href);
      target.scrollIntoView({
        behavior: motion.matches ? "smooth" : "instant",
      });
    }

    function visibility() {
      cancelAnimationFrame(frame);
      frame = 0;
      if (!document.hidden) measure();
    }

    if (enabled) experience.dataset.studioEnabled = "true";
    distance = enabled ? runway.getBoundingClientRect().height : 0;
    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("pageshow", measure);
    window.addEventListener("hashchange", anchor);
    content.addEventListener("click", navigate, true);
    motion.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    const shortcut = opening.querySelector("button")!;
    shortcut.addEventListener("click", enter);

    return () => {
      cancelAnimationFrame(frame);
      content.inert = false;
      experience.removeAttribute("data-studio-enabled");
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pageshow", measure);
      window.removeEventListener("hashchange", anchor);
      content.removeEventListener("click", navigate, true);
      motion.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", visibility);
      shortcut.removeEventListener("click", enter);
    };
  }, []);

  return (
    <div className="studio-experience" ref={scene}>
      <div className="studio-page" ref={page}>
        {children}
      </div>
      <div className="studio-runway" aria-hidden="true" />
      <div className="studio-opening" ref={root} aria-hidden="true">
        <div className="studio-window">
          <div className="studio-window-glass" aria-hidden="true">
            <i className="studio-pane-north" />
            <i className="studio-pane-south" />
            <i className="studio-pane-west" />
            <i className="studio-pane-east" />
          </div>
          <div className="studio-window-reflection" aria-hidden="true" />
          <div className="studio-aperture-edge" aria-hidden="true" />
          <div className="studio-window-chrome">
            <span className="studio-window-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span aria-hidden="true">OPALFRAME / STUDIO</span>
            <button type="button" className="studio-enter">
              Enter studio <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="studio-window-copy">
            <span className="studio-opening-eyebrow">
              A WINDOW INTO THE COLLECTION
            </span>
            <h2>
              opalframe<span>.</span>
            </h2>
            <p>{componentCount} copy-paste React components.</p>
          </div>
          <div className="studio-window-sill">
            <span className="studio-window-edition">
              FIRST EDITION / {String(componentCount).padStart(2, "0")} STUDIES
            </span>
            <div className="studio-scroll-prompt">
              <span>
                Scroll to clear the glass <ArrowDown size={12} />
              </span>
              <span className="studio-scroll-track" aria-hidden="true">
                <span />
              </span>
              <span className="studio-scroll-stages" aria-hidden="true">
                <span>01 / APPROACH</span>
                <span>02 / THROUGH THE GLASS</span>
                <span>03 / OPEN</span>
              </span>
            </div>
            <span className="studio-window-material" aria-hidden="true">
              GLASS / 001
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
