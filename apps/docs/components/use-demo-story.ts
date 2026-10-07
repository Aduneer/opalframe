"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";

export type StoryStep<T extends string> = { value: T; duration: number };

function subscribe(callback: () => void) {
  const query = matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const getMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Explicit, finite homepage demonstrations. Timers exist only during playback. */
export function useDemoStory<T extends string>(
  root: RefObject<HTMLElement | null>,
  steps: readonly StoryStep<T>[],
  onStep: (value: T) => void,
  enabled = true,
) {
  const reduced = useSyncExternalStore(subscribe, getMotion, () => true);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const element = root.current;
    if (!element || !enabled) return;
    const stop = () => setPlaying(false);
    const hidden = () => {
      if (document.hidden) stop();
    };
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      if (preference.matches) stop();
    };
    const otherStory = (event: Event) => {
      if ((event as CustomEvent).detail !== element) stop();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.15) stop();
      },
      { threshold: 0.15 },
    );
    observer.observe(element);
    window.addEventListener("blur", stop);
    window.addEventListener("opalframe:story", otherStory);
    document.addEventListener("visibilitychange", hidden);
    preference.addEventListener("change", change);
    return () => {
      observer.disconnect();
      window.removeEventListener("blur", stop);
      window.removeEventListener("opalframe:story", otherStory);
      document.removeEventListener("visibilitychange", hidden);
      preference.removeEventListener("change", change);
    };
  }, [root, enabled]);

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      const next = steps[index + 1];
      if (!next) setPlaying(false);
      else {
        onStep(next.value);
        setIndex(index + 1);
      }
    }, steps[index].duration);
    return () => clearTimeout(timer);
  }, [playing, index, steps, onStep]);

  function toggle() {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (reduced || document.hidden || !steps.length) return;
    window.dispatchEvent(
      new CustomEvent("opalframe:story", { detail: root.current }),
    );
    onStep(steps[0].value);
    setIndex(0);
    setPlayed(true);
    setPlaying(true);
  }

  function interrupt(event: { target: EventTarget | null }) {
    if (!(event.target as Element).closest("[data-story-control]"))
      setPlaying(false);
  }

  return {
    playing,
    played,
    index,
    reduced,
    toggle,
    interrupt,
    stop: () => setPlaying(false),
  };
}
