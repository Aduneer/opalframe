"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Circle,
  Command,
  Layers2,
  MoreHorizontal,
  RotateCcw,
  Play,
  Pause,
  Zap,
} from "lucide-react";
import { useCallback } from "react";
import { useDemoStory } from "./use-demo-story";
import { FocusStackDemo } from "./focus-stack-demo";
import { ProductStage, type StageFeature } from "@studies/product-stage";
import { ReleaseRail, type ReleaseStep } from "@studies/release-rail";
import { ComparisonLens } from "@studies/comparison-lens";
import { DockDemo } from "./dock-demo";
import { CodeWindowDemo } from "./code-window-demo";
import type { DemoPreset } from "@/lib/demo-presets";

export type DemoName =
  | "product-stage"
  | "release-rail"
  | "comparison-lens"
  | "interactive-code-window"
  | "expandable-dock"
  | "focus-stack";

const features: StageFeature[] = [
  {
    id: "overview",
    label: "The big picture",
    description: "Give the important things room to breathe.",
    detail: "A focused overview. Everything that matters, in one frame.",
    target: ".workspace-stats",
  },
  {
    id: "insight",
    label: "A closer look",
    description: "Turn a static screenshot into a story.",
    detail: "Guide attention with a frame that follows your story.",
    target: ".workspace-chart",
  },
  {
    id: "activity",
    label: "The next move",
    description: "Connect the details to the bigger story.",
    detail: "Make the next step obvious. Without another tooltip.",
    target: ".workspace-activity",
  },
];

function subscribeMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function getMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getServerMotion() {
  return true;
}

export function ProductDemo({
  reducedMotion = false,
  className,
  value,
  onValueChange,
}: {
  reducedMotion?: boolean;
  className?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <ProductStage
      features={features}
      reducedMotion={reducedMotion}
      className={className}
      value={value}
      onValueChange={onValueChange}
    >
      <Workspace />
    </ProductStage>
  );
}

function Workspace() {
  const chartId = useId();
  return (
    <div className="workspace" aria-label="Example project analytics interface">
      <div className="window-bar">
        <div className="window-dots">
          <i />
          <i />
          <i />
        </div>
        <span>workspace / overview</span>
        <Command size={11} />
      </div>
      <div className="workspace-inside">
        <div className="workspace-sidebar" aria-hidden="true">
          <div className="workspace-logo">
            <Layers2 size={17} />
          </div>
          <div className="sidebar-item active">
            <Circle size={11} />
            <span>Overview</span>
          </div>
          <div className="sidebar-item">
            <Layers2 size={11} />
            <span>Projects</span>
          </div>
          <div className="sidebar-item">
            <Zap size={11} />
            <span>Activity</span>
          </div>
          <div className="sidebar-spacer" />
          <div className="sidebar-avatar">A</div>
        </div>
        <div className="workspace-main">
          <div className="workspace-heading">
            <div>
              <span className="workspace-eyebrow">YOUR WORKSPACE</span>
              <h3>Good things are taking shape.</h3>
            </div>
            <span className="workspace-period">
              Last 30 days <span>⌄</span>
            </span>
          </div>
          <div className="workspace-stats">
            {[
              {
                label: "Total revenue",
                value: "$24,680",
                change: "+18.6%",
                graph: true,
              },
              {
                label: "Active projects",
                value: "12",
                change: "+3 this month",
              },
              { label: "Team velocity", value: "94.2%", change: "+8.2%" },
            ].map((stat) => (
              <div className="workspace-stat" key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                <small>
                  {stat.change} <ArrowUpRight size={10} />
                </small>
                {stat.graph && (
                  <svg viewBox="0 0 80 35" aria-hidden="true">
                    <path
                      d="M0 29 L10 26 L19 28 L29 17 L39 20 L50 9 L61 12 L79 1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
          <div className="workspace-bottom">
            <div className="workspace-chart">
              <div className="chart-heading">
                <span>Momentum</span>
                <MoreHorizontal size={14} />
              </div>
              <div className="chart-legend">
                <i /> Revenue <span>↑ 18.6%</span>
              </div>
              <svg
                className="line-chart"
                preserveAspectRatio="none"
                viewBox="0 0 360 160"
                role="img"
                aria-label="Illustrative revenue trend rising over a month"
              >
                <defs>
                  <linearGradient id={chartId} x1="0" x2="0" y1="0" y2="1">
                    <stop
                      offset="0"
                      stopColor="var(--workspace-accent)"
                      stopOpacity=".17"
                    />
                    <stop
                      offset="1"
                      stopColor="var(--workspace-accent)"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
                {[30, 65, 100, 135].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    x2="360"
                    y1={y}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth=".5"
                    opacity=".2"
                  />
                ))}
                <path
                  d="M0 125 C20 125 20 95 40 105 S65 130 83 94 S110 99 126 81 S150 102 169 71 S198 93 215 53 S241 69 259 42 S283 63 305 22 S338 28 360 9 L360 160 L0 160Z"
                  fill={`url(#${chartId})`}
                />
                <path
                  d="M0 125 C20 125 20 95 40 105 S65 130 83 94 S110 99 126 81 S150 102 169 71 S198 93 215 53 S241 69 259 42 S283 63 305 22 S338 28 360 9"
                  stroke="var(--workspace-accent)"
                  strokeWidth="2.2"
                  fill="none"
                />
                <circle
                  cx="305"
                  cy="22"
                  r="4"
                  fill="var(--workspace-accent)"
                  stroke="var(--workspace-bg)"
                  strokeWidth="2"
                />
              </svg>
              <div className="chart-axis">
                <span>Jun 01</span>
                <span>Jun 15</span>
                <span>Jun 30</span>
              </div>
            </div>
            <div className="workspace-activity">
              <div className="chart-heading">
                <span>Latest activity</span>
                <ArrowUpRight size={12} />
              </div>
              {[
                {
                  title: "Website shipped",
                  time: "Just now",
                  initials: "EL",
                  color: "peach",
                },
                {
                  title: "Brand assets ready",
                  time: "24 minutes ago",
                  initials: "MK",
                  color: "sage",
                },
                {
                  title: "New project created",
                  time: "1 hour ago",
                  initials: "JS",
                  color: "stone",
                },
              ].map((item) => (
                <div className="activity-item" key={item.title}>
                  <span className={`activity-avatar ${item.color}`}>
                    {item.initials}
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.time}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const releaseDetails = [
  {
    title: "Source, ready.",
    description: "A clean checkout. A reproducible starting point.",
    lines: [
      "Checking out main at a1b2c3d",
      "Verified lockfile",
      "Dependencies restored",
    ],
  },
  {
    title: "Built to last.",
    description: "Production assets assembled and ready for inspection.",
    lines: [
      "Compiled successfully",
      "Routes generated: 12",
      "Assets optimized: 148 kB",
    ],
  },
  {
    title: "Every check, green.",
    description: "The little details passed the big test.",
    lines: [
      "TypeScript: no errors",
      "24 checks passed",
      "Accessibility: no violations",
    ],
  },
  {
    title: "Hello, production.",
    description: "The next version is out in the world.",
    lines: [
      "Upload complete",
      "Edge cache warmed",
      "Production alias assigned",
    ],
  },
];
const releaseLabels = ["Source", "Build", "Checks", "Deploy"];
const releaseRunningDetails = [
  {
    title: "Fetching source.",
    description: "Restoring a reproducible starting point.",
    lines: [
      "Checkout requested",
      "Resolving locked dependencies",
      "Awaiting source verification",
    ],
  },
  {
    title: "Building assets.",
    description: "Compiling assets for production.",
    lines: [
      "Starting production compilation",
      "Generating routes",
      "Optimizing assets",
    ],
  },
  {
    title: "Running checks.",
    description: "Checking types and accessibility.",
    lines: [
      "Running TypeScript checks",
      "Running component tests",
      "Checking accessibility",
    ],
  },
  {
    title: "Publishing assets.",
    description: "Previous version stays live until upload completes.",
    lines: [
      "Uploading production assets",
      "Preparing edge cache",
      "Awaiting production alias",
    ],
  },
];

const releaseStorySteps = [
  { value: "source", duration: 650 },
  { value: "build", duration: 750 },
  { value: "blocked", duration: 1500 },
  { value: "retry", duration: 950 },
  { value: "live", duration: 1350 },
] as const;

export function ReleaseDemo({
  reducedMotion = false,
  autoPlay = false,
  className,
  guided = false,
}: {
  reducedMotion?: boolean;
  autoPlay?: boolean;
  className?: string;
  guided?: boolean;
}) {
  const osReduced = useSyncExternalStore(
    subscribeMotion,
    getMotion,
    getServerMotion,
  );
  const [progress, setProgress] = useState(autoPlay ? 0 : 4);
  const [selected, setSelected] = useState(autoPlay ? "0" : "3");
  const [playing, setPlaying] = useState(autoPlay);
  const [scenario, setScenario] = useState("success");
  const [failed, setFailed] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [visible, setVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const container = useRef<HTMLDivElement>(null);
  const applyStoryStep = useCallback(
    (phase: (typeof releaseStorySteps)[number]["value"]) => {
      const next =
        phase === "source"
          ? 0
          : phase === "build"
            ? 1
            : phase === "live"
              ? 4
              : 2;
      setPlaying(false);
      setScenario("failure");
      setProgress(next);
      setSelected(next === 4 ? "3" : String(next));
      setFailed(phase === "blocked");
      setRetrying(phase === "retry");
    },
    [],
  );
  const story = useDemoStory(
    container,
    releaseStorySteps,
    applyStoryStep,
    guided,
  );
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    if (container.current) observer.observe(container.current);
    const update = () => setDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  useEffect(() => {
    if (!playing || !visible || !documentVisible) return;
    const timeout = window.setTimeout(
      () => {
        if (
          scenario === "failure" &&
          !retrying &&
          (progress === 2 || reducedMotion || osReduced)
        ) {
          setProgress(2);
          setSelected("2");
          setFailed(true);
          setPlaying(false);
        } else if (progress >= 3 || reducedMotion || osReduced) {
          setProgress(4);
          setSelected("3");
          setPlaying(false);
        } else {
          setProgress(progress + 1);
          setSelected(String(progress + 1));
        }
      },
      reducedMotion || osReduced ? 0 : 1100,
    );
    return () => window.clearTimeout(timeout);
  }, [
    playing,
    progress,
    visible,
    documentVisible,
    reducedMotion,
    osReduced,
    scenario,
    retrying,
  ]);

  function replay() {
    story.stop();
    setFailed(false);
    setRetrying(false);
    setProgress(0);
    setSelected("0");
    setPlaying(true);
  }
  const steps: ReleaseStep[] = releaseLabels.map((label, index) => {
    const isFailed = failed && index === 2;
    const queued = index > progress;
    const running = (playing || story.playing) && index === progress && !failed;
    const paused =
      guided &&
      !playing &&
      !story.playing &&
      !failed &&
      progress < 4 &&
      index === progress;
    const lines = isFailed
      ? [
          "src/checkout.tsx:42",
          "Missing required prop: currency",
          "Release blocked. Production is safe.",
        ]
      : paused
        ? [
            "Demonstration paused",
            "Production remains on v1.0.2",
            "Replay or choose a scenario",
          ]
        : queued
          ? [
              "Waiting for previous stage",
              "Production remains on v1.0.2",
              "No changes published yet",
            ]
          : running
            ? releaseRunningDetails[index].lines
            : releaseDetails[index].lines;
    return {
      id: String(index),
      label,
      status: isFailed
        ? "error"
        : index < progress
          ? "complete"
          : running
            ? "running"
            : "pending",
      duration: isFailed
        ? "Failed"
        : index < progress
          ? ["0.8s", "12.4s", "3.2s", "1.1s"][index]
          : undefined,
      detail: (
        <div className="release-detail-content">
          <div className="release-inspection">
            <span className="micro-label">
              STAGE 0{index + 1} /{" "}
              {isFailed
                ? "ACTION REQUIRED"
                : paused
                  ? "PAUSED"
                  : queued
                    ? "QUEUED"
                    : running
                      ? "IN PROGRESS"
                      : "COMPLETE"}
            </span>
            <h3>
              {isFailed
                ? "Caught before production."
                : paused
                  ? `${label} paused.`
                  : queued
                    ? `${label} is queued.`
                    : running
                      ? releaseRunningDetails[index].title
                      : releaseDetails[index].title}
            </h3>
            <p>
              {isFailed
                ? "A type error stopped this release. Fix it, then retry the checks."
                : paused
                  ? "The simulation stopped here. The production version is unchanged."
                  : queued
                    ? "This stage starts after the previous one succeeds."
                    : running
                      ? releaseRunningDetails[index].description
                      : releaseDetails[index].description}
            </p>
            <div
              className={`release-log ${isFailed ? "release-log-error" : ""}`}
            >
              {lines.map((line, i) => (
                <div key={line}>
                  <span>0{i + 1}</span>
                  <code>{line}</code>
                  {!isFailed && !queued && !running && !paused && (
                    <Check size={11} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div
            className="release-output"
            aria-label={`Production preview, version ${progress === 4 ? "1.0.3" : "1.0.2"}`}
          >
            <div className="release-output-bar">
              <span>↗ PRODUCTION</span>
              <span>v{progress === 4 ? "1.0.3" : "1.0.2"}</span>
            </div>
            <div className="release-output-page">
              <span className="release-output-wordmark">opalframe.</span>
              <strong>
                Ship something
                <br />
                worth opening.
              </strong>
              <span className="release-output-orb" aria-hidden="true" />
              <span className="release-output-link">
                Explore the collection ↗
              </span>
            </div>
            <div className="release-output-status">
              <span className="live-dot" />
              {progress === 4
                ? "New version is live"
                : "Previous version stays live"}
            </div>
          </div>
        </div>
      ),
    };
  });
  return (
    <div
      className="release-demo"
      ref={container}
      onPointerDownCapture={guided ? story.interrupt : undefined}
      onKeyDownCapture={guided ? story.interrupt : undefined}
      onFocusCapture={guided ? story.interrupt : undefined}
    >
      {guided && (
        <div className="gallery-story-toolbar" data-story-control>
          <span>A failed check. A safe recovery.</span>
          <button
            type="button"
            disabled={story.reduced}
            aria-pressed={story.playing}
            onClick={story.toggle}
          >
            {story.playing ? (
              <Pause size={13} />
            ) : story.played ? (
              <RotateCcw size={13} />
            ) : (
              <Play size={13} />
            )}
            {story.playing
              ? "Pause recovery"
              : story.played
                ? "Replay recovery"
                : "Watch recovery"}
          </button>
        </div>
      )}
      <div className="release-demo-top">
        <span>
          <span className="release-project-mark">↗</span> studio / website{" "}
          <span className="branch-pill">main</span>
        </span>
        <span className="demo-status" data-failed={failed}>
          <i />
          {failed
            ? "Blocked"
            : playing || story.playing
              ? "Deploying"
              : guided && progress < 4
                ? "Paused"
                : "Ready"}
        </span>
      </div>
      <ReleaseRail
        className={className}
        steps={steps}
        value={selected}
        onValueChange={(next) => {
          story.stop();
          setSelected(next);
        }}
        reducedMotion={reducedMotion}
      />
      <div className="release-demo-footer">
        <label className="release-scenario">
          Scenario
          <select
            aria-label="Deployment scenario"
            value={scenario}
            disabled={playing}
            onChange={(event) => {
              story.stop();
              setScenario(event.target.value);
              setFailed(false);
              setRetrying(false);
              setProgress(4);
              setSelected("3");
            }}
          >
            <option value="success">Successful release</option>
            <option value="failure">Failed check</option>
          </select>
        </label>
        <button
          type="button"
          onClick={
            failed
              ? () => {
                  story.stop();
                  setFailed(false);
                  setRetrying(true);
                  setProgress(2);
                  setSelected("2");
                  setPlaying(true);
                }
              : replay
          }
        >
          <RotateCcw size={12} />
          {failed ? "Retry checks" : "Replay deployment"}
        </button>
      </div>
    </div>
  );
}

function Poster({ designed }: { designed: boolean }) {
  return (
    <div className={`comparison-poster ${designed ? "designed" : "plain"}`}>
      <div className="poster-content">
        <span className="poster-kicker">
          EVERYDAY OBJECTS. EXTRAORDINARY CARE.
        </span>
        <h3>
          Objects,
          <br />
          with intent<span>.</span>
        </h3>
        <p>
          A small collection of things
          <br />
          you&apos;ll want to keep around.
        </p>
        <span className="poster-link">
          Explore the collection <ArrowRight size={12} />
        </span>
      </div>
      <div className="poster-sculpture" aria-hidden="true">
        <div className="sculpture-base" />
        <div className="sculpture-arch" />
        <div className="sculpture-ball" />
        <div className="sculpture-shadow" />
      </div>
      <div className="poster-bottom">
        <span>LESS, BUT CONSIDERED.</span>
        <span>01 — 06</span>
      </div>
    </div>
  );
}

export function ComparisonDemo({ className }: { className?: string }) {
  return (
    <ComparisonLens
      className={className}
      before={<Poster designed={false} />}
      after={<Poster designed />}
      beforeLabel="Original"
      afterLabel="Refined"
      defaultValue={58}
    />
  );
}

export function Demo({
  name,
  reducedMotion = false,
  autoPlay = false,
  className,
  preset = "original",
}: {
  name: DemoName;
  reducedMotion?: boolean;
  autoPlay?: boolean;
  className?: string;
  preset?: DemoPreset;
}) {
  if (name === "focus-stack")
    return (
      <FocusStackDemo reducedMotion={reducedMotion} className={className} />
    );
  if (name === "expandable-dock")
    return (
      <DockDemo
        preset={preset}
        reducedMotion={reducedMotion}
        className={className}
      />
    );
  if (name === "release-rail")
    return (
      <ReleaseDemo
        reducedMotion={reducedMotion}
        autoPlay={autoPlay}
        className={className}
      />
    );
  if (name === "interactive-code-window")
    return (
      <CodeWindowDemo
        preset={preset}
        reducedMotion={reducedMotion}
        autoPlay={autoPlay}
        className={className}
      />
    );
  if (name === "comparison-lens")
    return <ComparisonDemo className={className} />;
  return <ProductDemo reducedMotion={reducedMotion} className={className} />;
}
