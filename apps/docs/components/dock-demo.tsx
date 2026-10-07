"use client";

import { useId, useState } from "react";
import {
  ArrowUpRight,
  Aperture,
  BookOpen,
  Fingerprint,
  Send,
} from "lucide-react";
import { ExpandableDock, type DockItem } from "@studies/expandable-dock";
import { TravelDockDemo } from "./travel-dock-demo";
import type { DemoPreset } from "@/lib/demo-presets";

const destinations: DockItem[] = [
  { id: "work", label: "Work", icon: <Aperture /> },
  { id: "notes", label: "Notes", icon: <BookOpen /> },
  { id: "about", label: "About", icon: <Fingerprint /> },
  { id: "contact", label: "Contact", icon: <Send /> },
];

/** A portfolio is example content; the dock only owns navigation behavior. */
export function DockDemo({
  preset = "original",
  ...props
}: {
  preset?: DemoPreset;
  reducedMotion?: boolean;
  className?: string;
}) {
  return preset === "alternate" ? (
    <TravelDockDemo {...props} />
  ) : (
    <StudioDockDemo {...props} />
  );
}

function StudioDockDemo({
  reducedMotion = false,
  className = "",
}: {
  reducedMotion?: boolean;
  className?: string;
}) {
  const [selected, setSelected] = useState("work");
  const uid = useId();
  return (
    <div className="dock-demo" data-reduced-motion={reducedMotion || undefined}>
      <header className="dock-demo-header">
        <span className="dock-demo-monogram">
          a<span>↗</span>
        </span>
        <span>
          AVERY STUDIO
          <br />
          <span>FICTIONAL PORTFOLIO</span>
        </span>
        <span className="dock-demo-availability">
          <i /> Open for a good project
        </span>
      </header>
      <div className="dock-demo-pages">
        <section
          className="dock-demo-page dock-work"
          aria-labelledby={`${uid}-work`}
          aria-hidden={selected !== "work"}
          inert={selected !== "work"}
          data-active={selected === "work"}
        >
          <div className="dock-demo-copy">
            <span className="dock-demo-eyebrow">INDEPENDENT BY DESIGN</span>
            <h3 id={`${uid}-work`}>
              A different
              <br />
              kind of <em>ordinary.</em>
            </h3>
            <p>
              Digital things with a human touch.
              <br />
              Made carefully. Made to last.
            </p>
            <span className="dock-demo-project">
              01 / FORM & FEEL <ArrowUpRight size={14} />
            </span>
          </div>
          <div className="dock-demo-art" aria-hidden="true">
            <div className="dock-art-disc" />
            <div className="dock-art-orbit" />
            <div className="dock-art-dot" />
            <span>FORM STUDY / 001</span>
          </div>
        </section>
        <section
          className="dock-demo-page dock-notes"
          aria-labelledby={`${uid}-notes`}
          aria-hidden={selected !== "notes"}
          inert={selected !== "notes"}
          data-active={selected === "notes"}
        >
          <span className="dock-demo-eyebrow">THINKING OUT LOUD</span>
          <h3 id={`${uid}-notes`}>
            Notes from
            <br />
            <em>the margins.</em>
          </h3>
          <div className="dock-note-list">
            {[
              ["01", "The details do the talking", "CRAFT / 4 MIN"],
              ["02", "Leave a little room", "PROCESS / 3 MIN"],
              ["03", "Make it feel like something", "INTERACTION / 6 MIN"],
            ].map(([number, title, meta]) => (
              <div key={number}>
                <span>{number}</span>
                <strong>{title}</strong>
                <small>{meta}</small>
                <ArrowUpRight size={14} />
              </div>
            ))}
          </div>
        </section>
        <section
          className="dock-demo-page dock-about"
          aria-labelledby={`${uid}-about`}
          aria-hidden={selected !== "about"}
          inert={selected !== "about"}
          data-active={selected === "about"}
        >
          <div className="dock-demo-copy">
            <span className="dock-demo-eyebrow">A FICTIONAL DESIGNER</span>
            <h3 id={`${uid}-about`}>
              Small studio.
              <br />
              <em>Wide curiosity.</em>
            </h3>
            <p>
              Meet Avery, the fictional designer and developer in this sample
              portfolio. The studio explores how digital things look, work, and
              feel.
            </p>
            <span className="dock-demo-project">
              BASED SOMEWHERE / WORKING EVERYWHERE
            </span>
          </div>
          <div className="dock-about-mark" aria-hidden="true">
            a<span>↗</span>
            <small>
              ONE PAIR OF HANDS.
              <br />A LOT OF POSSIBILITIES.
            </small>
          </div>
        </section>
        <section
          className="dock-demo-page dock-contact"
          aria-labelledby={`${uid}-contact`}
          aria-hidden={selected !== "contact"}
          inert={selected !== "contact"}
          data-active={selected === "contact"}
        >
          <span className="dock-demo-eyebrow">
            GOOD WORK STARTS WITH A CONVERSATION
          </span>
          <h3 id={`${uid}-contact`}>
            Have something
            <br />
            <em>in mind?</em>
          </h3>
          <p>
            A new idea. An unfinished thing.
            <br />A detail you can’t stop thinking about.
          </p>
          <a href="mailto:hello@example.com">
            Let’s make it happen <ArrowUpRight size={20} />
          </a>
          <span className="dock-demo-example">
            A fictional studio, a real navigation component.
          </span>
        </section>
      </div>
      <footer className="dock-demo-footer">
        <span>LESS, BUT WITH FEELING.</span>
        <ExpandableDock
          items={destinations}
          value={selected}
          onValueChange={setSelected}
          label="Studio navigation"
          reducedMotion={reducedMotion}
          className={`studio-dock ${className}`}
        />
        <span>© 2026</span>
      </footer>
    </div>
  );
}
