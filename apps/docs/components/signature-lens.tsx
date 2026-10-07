"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useState } from "react";
import { assetPath } from "@/lib/site";

/** Original Blender rotation loop, with a static first frame and pausable atmosphere. */
export function SignatureLens() {
  const [paused, setPaused] = useState(false);
  return (
    <div className="signature-study" data-ambient-paused={paused}>
      <div className="signature-lens" aria-hidden="true">
        <div className="signature-float">
          <Image
            className="signature-art signature-charcoal"
            src={assetPath("/artwork/ribbon-orbit-charcoal.webp")}
            alt=""
            width={720}
            height={480}
            loading="eager"
            unoptimized
            draggable={false}
          />
          <Image
            className="signature-art signature-pearl"
            src={assetPath("/artwork/ribbon-orbit-pearl.webp")}
            alt=""
            width={720}
            height={480}
            loading="eager"
            unoptimized
            draggable={false}
          />
          {(["charcoal", "pearl"] as const).map((theme) => (
            <video
              key={theme}
              className="signature-motion"
              data-motion-theme={theme}
              data-src={assetPath(`/artwork/ribbon-orbit-${theme}.webm`)}
              width={480}
              height={320}
              preload="none"
              muted
              loop
              playsInline
              disablePictureInPicture
              disableRemotePlayback
              tabIndex={-1}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
      <button
        type="button"
        className="ambient-toggle"
        aria-pressed={paused}
        aria-label={paused ? "Resume artwork" : "Pause artwork"}
        title={paused ? "Resume artwork" : "Pause artwork"}
        onClick={() => setPaused(!paused)}
      >
        {paused ? (
          <Play size={12} aria-hidden="true" />
        ) : (
          <Pause size={12} aria-hidden="true" />
        )}
        <span>{paused ? "Resume artwork" : "Pause artwork"}</span>
      </button>
    </div>
  );
}
