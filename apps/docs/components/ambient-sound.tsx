"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";
import { Volume2, VolumeX } from "lucide-react";
import { AmbientAudio } from "@/lib/ambient-audio";

const SoundContext = createContext<AmbientAudio | null>(null);

export function AmbientSound({ children }: { children: React.ReactNode }) {
  const [audio] = useState(() => new AmbientAudio());
  const pathname = usePathname();
  useEffect(() => audio.connect(), [audio]);
  useEffect(() => {
    audio.setRecording(pathname.replace(/\/$/, "") === "/showcase");
  }, [audio, pathname]);
  return (
    <SoundContext.Provider value={audio}>{children}</SoundContext.Provider>
  );
}

export function SoundToggle() {
  const audio = useContext(SoundContext)!;
  const state = useSyncExternalStore(
    audio.subscribe,
    audio.getSnapshot,
    audio.getServerSnapshot,
  );
  const enabled = state !== "off" && state !== "error";
  const label = {
    off: "Sound off",
    loading: "Sound loading",
    on: "Sound on",
    paused: "Sound paused",
    error: "Sound unavailable — retry",
  }[state];
  return (
    <button
      type="button"
      className="sound-toggle"
      aria-label={label}
      aria-pressed={enabled}
      title={label}
      onClick={audio.toggle}
    >
      {enabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
      <span>
        {state === "loading" ? "Sound…" : `Sound ${enabled ? "on" : "off"}`}
      </span>
      <span className="sr-only" role="status">
        {state === "error" ? "Sound unavailable. You can try again." : ""}
      </span>
    </button>
  );
}
