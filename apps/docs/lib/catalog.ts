import type { DemoName } from "@/components/demos";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const catalog: {
  name: DemoName;
  title: string;
  category: string;
  description: string;
  usage: string;
  props: [string, string, string][];
  accessibility: string;
  customization: string;
}[] = [
  {
    name: "interactive-code-window",
    title: "Interactive Code Window",
    category: "CODE & CRAFT",
    description:
      "Connect the code to the thing it makes. Select a block, follow the detail, or replay the whole story.",
    usage: `import { InteractiveCodeWindow } from "@/components/ui/interactive-code-window";

export default function Example() {
  return (
    <InteractiveCodeWindow
      files={[{
        id: "card", name: "card.tsx",
        code: '<h2 className="title">Made with care.</h2>',
      }]}
      steps={[{
        id: "title", title: "Typography", fileId: "card",
        lines: [1, 1], target: ".title",
        description: "Give the headline room to breathe.",
      }]}
      preview={<h2 className="title">Made with care.</h2>}
    />
  );
}`,
    props: [
      [
        "files",
        "CodeWindowFile[]",
        "Files with unique id, display name, and plain source code. Source is displayed, never executed.",
      ],
      [
        "steps",
        "CodeWindowStep[]",
        "Unique id, title, description, fileId, inclusive one-based lines, and optional preview target selector. Keep line ranges disjoint within a file.",
      ],
      [
        "preview",
        "ReactNode | (step) => ReactNode",
        "Your rendered interface. The render function can respond to the selected step.",
      ],
      [
        "value / defaultValue",
        "string",
        "Controlled or initial selected step ID.",
      ],
      [
        "onValueChange",
        "(id: string) => void",
        "Called on selection and playback. Update value in controlled mode.",
      ],
      [
        "renderLine",
        "(line, number, file) => ReactNode",
        "Optional syntax renderer. Plain source is the default; no highlighting dependency required.",
      ],
      [
        "autoPlay / stepDuration",
        "boolean / number",
        "Start a single walkthrough on visibility; defaults false. Duration per step in milliseconds, default 1600, minimum 300.",
      ],
      [
        "reducedMotion",
        "boolean",
        "Disable transitions and finish replay immediately; also respects the OS preference.",
      ],
      [
        "focusPadding",
        "number",
        "Local CSS pixels around a measured target, default 6.",
      ],
      [
        "label / previewLabel",
        "string",
        "Window and preview accessible labels.",
      ],
      [
        "className",
        "string",
        "Root customization. Colors and line height use scoped CSS variables.",
      ],
    ],
    accessibility:
      "File tabs support Arrow Left/Right, Home, and End. Code blocks and walkthrough steps are native buttons with a pressed state. The source panel scrolls with a keyboard; captions announce politely. Target outlines are decorative. Replay stops after one sequence, pauses off-screen or in hidden tabs, and finishes immediately with reduced motion. Copy uses the browser clipboard API and reports unavailable access. Source strings are never evaluated; provide your own rendered preview.",
    customization: `<InteractiveCodeWindow
  files={yourFiles}
  steps={yourSteps}
  preview={(step) => <YourPreview selected={step.id} />}
  className="your-code-window"
  stepDuration={2000}
/>

.your-code-window {
  --code-accent: #a6cfff;
  --code-preview-background: #e6effa;
  --code-preview-accent: #315f9e;
  --code-line-height: 24px;
}`,
  },
  {
    name: "expandable-dock",
    title: "Expandable Dock",
    category: "NAVIGATION",
    description:
      "A compact dock with a little room to move. Labels open on hover or focus; the current destination keeps its place.",
    usage: `"use client";

import { useState } from "react";
import { ExpandableDock } from "@/components/ui/expandable-dock";

export default function Example() {
  const [section, setSection] = useState("work");
  return (
    <>
      <ExpandableDock
        items={[
          { id: "work", label: "Work", icon: <span>W</span> },
          { id: "about", label: "About", icon: <span>A</span> },
          { id: "contact", label: "Contact", icon: <span>C</span> },
        ]}
        value={section}
        onValueChange={setSection}
      />
      <p>Selected section: {section}</p>
    </>
  );
}`,
    props: [
      [
        "items",
        "DockItem[]",
        "Unique id, accessible label, your icon, optional href, and optional disabled flag. Use a short collection of destinations; four to six fits most mobile screens.",
      ],
      [
        "value / defaultValue",
        "string",
        "Controlled or initial current destination ID. Defaults to the first enabled item. For route navigation, derive value from the current route.",
      ],
      [
        "onValueChange",
        "(id: string) => void",
        "Called when a destination is activated. Hover and focus never change selection. Update value for controlled actions.",
      ],
      [
        "label",
        "string",
        "Accessible navigation name; defaults to Main navigation.",
      ],
      [
        "reducedMotion",
        "boolean",
        "Disable transitions, in addition to the OS preference.",
      ],
      [
        "className",
        "string",
        "Root customization. Width, colors, and depth can be changed in your stylesheet.",
      ],
    ],
    accessibility:
      "Destinations with href render native links and retain modifier-click behavior; current links use aria-current. Actions render buttons with a pressed state. Every enabled item remains in the Tab order. Arrow keys move focus without activating; Home and End reach the first and last enabled item. Disabled destinations are non-interactive buttons. Icons and visual labels are decorative; each control has its full accessible name even if its label is clipped. Touch activates in one tap. OS reduced motion and the preview toggle disable all dock transitions. No timers or animation loops run in the component. Use unique IDs and concise labels; provide sufficient width for at least 44 pixels per item.",
    customization: `const [section, setSection] = useState("work");

<ExpandableDock
  items={yourDestinations}
  value={section}
  onValueChange={setSection}
  label="Portfolio sections"
  className="your-dock"
/>

.your-dock {
  max-width: 420px;
  --dock-surface: #f4f6f8;
  --dock-text: #1b2027;
  --dock-muted: #596573;
  --dock-border: #d6dde4;
  --dock-selected: #e1e9f1;
  --dock-accent: #315f9e;
}`,
  },
  {
    name: "product-stage",
    title: "Product Stage",
    category: "PRODUCT STORIES",
    description:
      "Turn your product into the main attraction. A focus frame, synchronized captions, and a story visitors can explore.",
    usage: `import { ProductStage } from "@/components/ui/product-stage";

export default function Example() {
  return (
    <ProductStage features={[
      {
        id: "overview", label: "Overview",
        description: "The big picture.", detail: "See your workspace at a glance.",
        target: "[data-stage-target=overview]",
      },
      {
        id: "activity", label: "Activity",
        description: "What changed.", detail: "Follow the latest updates.",
        target: "[data-stage-target=activity]",
      },
    ]}>
      <div style={{ padding: 32 }}>
        <h2 data-stage-target="overview">Your workspace</h2>
        <p data-stage-target="activity">Three updates today.</p>
      </div>
    </ProductStage>
  );
}`,
    props: [
      [
        "features",
        "StageFeature[]",
        "Feature labels and captions. Use target (a scoped CSS selector) for live content, or focus (percentages) for an image.",
      ],
      ["children", "ReactNode", "Your preview, screenshot, or interface."],
      [
        "focusPadding",
        "number",
        "Pixels around a measured target. Defaults to 5.",
      ],
      [
        "value / defaultValue",
        "string",
        "Controlled or initial selected feature ID.",
      ],
      [
        "onValueChange",
        "(id: string) => void",
        "Called when a visitor selects a feature.",
      ],
      [
        "reducedMotion",
        "boolean",
        "Disable transitions in addition to the OS preference.",
      ],
      ["label / className", "string", "Tablist label and root customization."],
    ],
    accessibility:
      "Arrow keys move between tabs; Home and End select the first and last. The panel names its selected tab. Captions announce politely. The focus rectangle is decorative. OS reduced motion disables transitions.",
    customization: `<ProductStage\n  className="my-product-stage"\n  features={features}\n  defaultValue="overview"\n>\n  <YourProductPreview />\n</ProductStage>\n\n/* Your stylesheet */\n.my-product-stage {\n  --stage-accent: #a6cfff;\n  --stage-selected: #1e2029;\n  --stage-text: #f2f3f8;\n  --stage-muted: #aeb4c4;\n  --stage-border: #3d4354;\n}`,
  },
  {
    name: "release-rail",
    title: "Release Rail",
    category: "DEVELOPER PRODUCTS",
    description:
      "Show what shipped, what failed, and what is still live. Inspect each stage, block a bad release, and retry the checks.",
    usage: `import { ReleaseRail } from "@/components/ui/release-rail";

export default function Example() {
  return (
    <ReleaseRail steps={[
      {
        id: "build", label: "Build", status: "complete",
        duration: "12s", detail: <p>Build successful.</p>,
      },
      {
        id: "deploy", label: "Deploy", status: "running",
        detail: <p>Uploading assets...</p>,
      },
    ]} />
  );
}`,
    props: [
      [
        "steps",
        "ReleaseStep[]",
        "Stages with pending, running, complete, or error status.",
      ],
      [
        "value / defaultValue",
        "string",
        "Controlled or initial inspected stage ID.",
      ],
      [
        "onValueChange",
        "(id: string) => void",
        "Called when a stage is inspected.",
      ],
      ["label", "string", "Accessible label for the stage list."],
      ["reducedMotion", "boolean", "Disable visual transitions."],
      ["className", "string", "Root customization."],
    ],
    accessibility:
      "Details reserve space for the largest panel, so inspecting stages does not shift the page. Inactive panels are hidden and inert. Every stage is a native button with a pressed state. Status uses text as well as color; progress announces through a status region. No timers or automatic animation run inside the component.",
    customization: `<ReleaseRail steps={liveDeploymentSteps} className="my-release" />\n\n.my-release {\n  --rail-accent: #a6cfff;\n  --rail-surface: #1e2029;\n  --rail-text: #f2f3f8;\n  --rail-muted: #aeb4c4;\n  --rail-border: #3d4354;\n}`,
  },
  {
    name: "comparison-lens",
    title: "Comparison Lens",
    category: "BEFORE & AFTER",
    description:
      "A little perspective changes everything. Two aligned layers, one tactile handle, and a difference you can feel.",
    usage: `import { ComparisonLens } from "@/components/ui/comparison-lens";

export default function Example() {
  return (
    <ComparisonLens
      before={<div style={{ padding: 32 }}>The starting point.</div>}
      after={<div style={{ padding: 32 }}>A little more considered.</div>}
      beforeLabel="Original"
      afterLabel="Refined"
      defaultValue={58}
    />
  );
}`,
    props: [
      [
        "before / after",
        "ReactNode",
        "Visual layers occupying the same coordinate system.",
      ],
      [
        "beforeLabel / afterLabel",
        "string",
        "Visible labels and accessible comparison descriptions.",
      ],
      [
        "value / defaultValue",
        "number (0–100)",
        "Percentage of the after layer revealed.",
      ],
      [
        "onValueChange",
        "(value: number) => void",
        "Called when the range changes.",
      ],
      [
        "className / style",
        "string / CSSProperties",
        "Root customization and aspect ratio.",
      ],
    ],
    accessibility:
      "The full canvas is a native range input: use arrows, Home, End, touch, or drag. Screen readers receive descriptive values. Layers are visual-only and must not contain interactive controls; provide an adjacent text explanation for meaningful differences. No animation is necessary.",
    customization: `<ComparisonLens\n  before={<Original />}\n  after={<Refined />}\n  className="my-comparison"\n  style={{ aspectRatio: "4 / 3" }}\n/>\n\n.my-comparison { --lens-accent: #a6cfff; }`,
  },

  {
    name: "focus-stack",
    title: "Focus Stack",
    category: "IMAGE & CONTENT",
    description:
      "A tactile image deck. Spread the collection, bring a work forward, and keep its story in focus.",
    usage: `import { FocusStack } from "@/components/ui/focus-stack";

export default function Example() {
  return (
    <FocusStack
      label="Selected projects"
      defaultExpanded
      items={[
        { id: "identity", title: "Studio identity", image: "/images/identity.jpg",
          alt: "A silver identity system on pale blue stationery.",
          description: "An identity shaped by light and material.", href: "/work/identity" },
        { id: "space", title: "A quiet space", image: "/images/space.jpg",
          alt: "A bright architectural interior with glass partitions.",
          description: "A place with room to breathe.", href: "/work/space" },
        { id: "object", title: "Small objects", image: "/images/object.jpg",
          alt: "A porcelain object casting a soft shadow.",
          description: "A study in everyday details.", href: "/work/object" },
      ]}
    />
  );
}`,
    props: [
      [
        "items",
        "FocusStackItem[]",
        "Unique id, title, image URL, descriptive alt, and optional description/href. Supply your own images and their rights. Empty collections render nothing.",
      ],
      [
        "value / defaultValue",
        "string",
        "Controlled or initial selected image ID. A removed or unknown selection falls back to the first item.",
      ],
      [
        "onValueChange",
        "(id: string) => void",
        "Called when a different image is selected. Update value in controlled mode.",
      ],
      [
        "defaultExpanded",
        "boolean",
        "Start with a fanned overview; defaults false. Visitors can stack or spread the deck.",
      ],
      [
        "aspectRatio",
        "number",
        "Image width divided by height, default 4/5. Images use object-fit cover.",
      ],
      [
        "label",
        "string",
        "Visible and accessible collection name; default Image collection.",
      ],
      [
        "className / reducedMotion",
        "string / boolean",
        "Scoped customization and a static selection transition. The OS motion preference is respected too.",
      ],
    ],
    accessibility:
      "Image selection uses native tabs with Arrow Left/Right, Home, and End. The selected image has a described panel; captions announce politely. Exposed back cards are pointer/touch selectors, with keyboard equivalents in the tabs. Project links remain native. Caption descriptions reserve the largest text footprint. No autoplay, drag interception, animation loop, or focus changes occur during pointer selection. Reduced motion removes transitions.",
    customization: `<FocusStack items={yourProjects} className="your-stack" aspectRatio={4 / 5} />

.your-stack {
  --stack-accent: #a6cfff;
  --stack-surface: #1e2530;
  --stack-selected: #293449;
  --stack-text: #f2f5fa;
  --stack-muted: #aebdcc;
  --stack-line: #3f4f64;
}`,
  },
];

export async function getSource(name: DemoName) {
  const file = await readFile(
    path.join(process.cwd(), `public/r/${name}.json`),
    "utf8",
  );
  const item = JSON.parse(file) as { files: { content: string }[] };
  return { tsx: item.files[0].content, css: item.files[1].content };
}
