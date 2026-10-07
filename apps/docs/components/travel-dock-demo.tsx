"use client";

import { useId, useState } from "react";
import {
  ArrowUpRight,
  Backpack,
  BookOpen,
  Compass,
  Mail,
  Check,
} from "lucide-react";
import { ExpandableDock, type DockItem } from "@studies/expandable-dock";

const destinations: DockItem[] = [
  { id: "route", label: "Route", icon: <Compass /> },
  { id: "journal", label: "Journal", icon: <BookOpen /> },
  { id: "kit", label: "Kit", icon: <Backpack /> },
  { id: "postcard", label: "Postcard", icon: <Mail /> },
];

function CoastMap() {
  return (
    <div className="travel-map" aria-hidden="true">
      <svg viewBox="0 0 260 280" fill="none">
        <path
          className="travel-map-land"
          d="M0 0h164l-16 37 18 27-28 34 11 22-27 38 18 24-37 36 2 26-33 36H0Z"
        />
        {[0, 16, 32].map((offset) => (
          <path
            key={offset}
            className="travel-map-contour"
            transform={`translate(${offset} 0)`}
            d="M32-15c74 38-8 78 44 118s-7 89 18 115-12 44-30 77"
          />
        ))}
        <path
          className="travel-map-route"
          d="M65 215c-18-50 53-49 29-94S135 88 126 48"
        />
        {[
          [65, 215],
          [94, 121],
          [126, 48],
        ].map(([x, y]) => (
          <g key={y}>
            <circle cx={x} cy={y} r="7" fill="var(--bg)" />
            <circle cx={x} cy={y} r="3" fill="var(--accent)" />
          </g>
        ))}
        <path
          d="M220 38v-14m-4 5 4-5 4 5"
          stroke="var(--muted)"
          strokeWidth="1"
        />
        <text x="216" y="18" className="travel-map-label">
          N
        </text>
        <text x="163" y="138" className="travel-map-label">
          THE COAST
        </text>
      </svg>
      <span>
        03 STOPS <span>86 KM / ON FOOT</span>
      </span>
    </div>
  );
}

/** The same portable dock, with a journey and a different set of destinations. */
export function TravelDockDemo({
  reducedMotion = false,
  className = "",
}: {
  reducedMotion?: boolean;
  className?: string;
}) {
  const [selected, setSelected] = useState("route");
  const uid = useId();
  const pages = [
    {
      id: "route",
      className: "dock-work",
      content: (
        <>
          <div className="dock-demo-copy">
            <span className="dock-demo-eyebrow">NO RUSH. NO SHORTCUTS.</span>
            <h3 id={`${uid}-route`}>
              Take the
              <br />
              <em>long way home.</em>
            </h3>
            <p>
              Three villages. One coastal path.
              <br />A few things worth slowing down for.
            </p>
            <span className="dock-demo-project">
              DAY 08 / THE NORTHERN COAST <ArrowUpRight size={14} />
            </span>
          </div>
          <CoastMap />
        </>
      ),
    },
    {
      id: "journal",
      className: "dock-notes",
      content: (
        <>
          <span className="dock-demo-eyebrow">A FEW PAGES FROM THE ROAD</span>
          <h3 id={`${uid}-journal`}>
            Collected
            <br />
            <em>along the way.</em>
          </h3>
          <div className="dock-note-list">
            {[
              ["08", "The light before the ferry", "COAST / 4 MIN"],
              ["06", "A table by the window", "VILLAGE / 3 MIN"],
              ["05", "When the road ran out", "TRAIL / 5 MIN"],
            ].map(([day, title, meta]) => (
              <div key={day}>
                <span>{day}</span>
                <strong>{title}</strong>
                <small>{meta}</small>
                <ArrowUpRight size={14} />
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "kit",
      className: "dock-about",
      content: (
        <>
          <div className="dock-demo-copy">
            <span className="dock-demo-eyebrow">
              MAKE ROOM FOR THE UNEXPECTED
            </span>
            <h3 id={`${uid}-kit`}>
              Pack less.
              <br />
              <em>Notice more.</em>
            </h3>
            <p>
              A weatherproof layer, a well-worn notebook, and shoes that know
              the way.
            </p>
            <span className="dock-demo-project">ONE BAG / PLENTY OF ROOM</span>
          </div>
          <div className="travel-kit">
            <span className="dock-demo-eyebrow">THE SHORT LIST</span>
            <strong>
              03<span>essentials</span>
            </strong>
            {["A light shell", "A paper notebook", "Walking shoes"].map(
              (item) => (
                <span key={item}>
                  <Check size={13} />
                  {item}
                </span>
              ),
            )}
          </div>
        </>
      ),
    },
    {
      id: "postcard",
      className: "dock-contact",
      content: (
        <>
          <span className="dock-demo-eyebrow">
            SOME THINGS ARE BETTER SHARED
          </span>
          <h3 id={`${uid}-postcard`}>
            A little note
            <br />
            <em>from the north.</em>
          </h3>
          <p>
            A place you remember. A route worth taking.
            <br />
            Send a thought for the next journey.
          </p>
          <a href="mailto:postcards@example.com">
            Send a postcard <ArrowUpRight size={20} />
          </a>
          <span className="dock-demo-example">
            A fictional journey, a real navigation component.
          </span>
        </>
      ),
    },
  ];
  return (
    <div
      className="dock-demo travel-dock-demo"
      data-reduced-motion={reducedMotion || undefined}
    >
      <header className="dock-demo-header">
        <span className="dock-demo-monogram">
          n<span>↗</span>
        </span>
        <span>
          NORTHBOUND
          <br />
          <span>A SLOW TRAVEL JOURNAL</span>
        </span>
        <span className="dock-demo-availability">
          <i /> Day 08 / On the coast
        </span>
      </header>
      <div className="dock-demo-pages">
        {pages.map(({ id, className: pageClass, content }) => (
          <section
            key={id}
            className={`dock-demo-page ${pageClass}`}
            aria-labelledby={`${uid}-${id}`}
            aria-hidden={selected !== id}
            inert={selected !== id}
            data-active={selected === id}
          >
            {content}
          </section>
        ))}
      </div>
      <footer className="dock-demo-footer">
        <span>TAKE THE SCENIC ROUTE.</span>
        <ExpandableDock
          items={destinations}
          value={selected}
          onValueChange={setSelected}
          label="Travel navigation"
          reducedMotion={reducedMotion}
          className={`studio-dock ${className}`}
        />
        <span>08 / 12</span>
      </footer>
    </div>
  );
}
