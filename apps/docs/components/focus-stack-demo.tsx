"use client";

import { FocusStack, type FocusStackItem } from "@studies/focus-stack";
import { assetPath } from "@/lib/site";
import "./focus-stack-demo.css";

const items: FocusStackItem[] = [
  {
    id: "orbit",
    title: "Soft Orbit",
    image: assetPath("/artwork/stack/soft-orbit.svg"),
    alt: "Two interlocking silver and glass loops suspended above a pale blue surface.",
    description:
      "A form study in silver, glass, and the space between. Select another work to bring it into focus.",
  },
  {
    id: "water",
    title: "Still Water",
    image: assetPath("/artwork/stack/still-water.svg"),
    alt: "A translucent glass sphere floating above fine elliptical water ripples.",
    description:
      "A material study in changing light. Clear edges, soft reflections, and a moment of stillness.",
  },
  {
    id: "air",
    title: "Open Air",
    image: assetPath("/artwork/stack/open-air.svg"),
    alt: "Nested translucent architectural cubes drawn in porcelain and ice blue.",
    description:
      "A spatial study with room to breathe. Layers of light reveal the structure inside.",
  },
];

export function FocusStackDemo({
  reducedMotion = false,
  className,
}: {
  reducedMotion?: boolean;
  className?: string;
}) {
  return (
    <div className="focus-stack-demo">
      <FocusStack
        items={items}
        label="Studio archive"
        defaultExpanded
        reducedMotion={reducedMotion}
        className={className}
      />
    </div>
  );
}
