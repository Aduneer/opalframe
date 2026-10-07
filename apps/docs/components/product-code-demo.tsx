"use client";

import { useId } from "react";
import type {
  CodeWindowFile,
  CodeWindowStep,
} from "@studies/interactive-code-window";

export const productFiles: CodeWindowFile[] = [
  {
    id: "component",
    name: "product-detail.tsx",
    code: `<article className="headphone-card">
  <header className="headphone-header">
    <span>HALO / 01</span>
    <span>STUDIO SERIES</span>
  </header>

  <div className="headphone-artwork">
    <HeadphoneStudy />
    <span>SILVER / SOFT TOUCH</span>
  </div>

  <div className="headphone-details">
    <p>Over-ear / Wireless</p>
    <h2>Quiet, by design.</h2>
    <span>Less noise. More music.</span>
    <div><span>40h battery</span><strong>$189</strong></div>
  </div>
</article>`,
  },
  {
    id: "style",
    name: "product-finish.css",
    code: `.headphone-card {
  background: rgb(255 255 255 / .8);
  border: 1px solid #aac6e4;
  border-radius: 16px;
  box-shadow: 0 18px 40px #34577918;
}

.headphone-artwork {
  background: #dbe9f8;
  border-radius: 8px;
}`,
  },
];

export const productSteps: CodeWindowStep[] = [
  {
    id: "frame",
    title: "Frame",
    description:
      "A name and a series. A clear beginning for the product story.",
    fileId: "component",
    lines: [1, 5],
    target: ".headphone-header",
  },
  {
    id: "artwork",
    title: "Artwork",
    description: "Let the object lead. Silver, soft edges, and a little depth.",
    fileId: "component",
    lines: [7, 10],
    target: ".headphone-artwork",
  },
  {
    id: "details",
    title: "Details",
    description:
      "What it is, what it offers, and what it costs. All in one glance.",
    fileId: "component",
    lines: [12, 17],
    target: ".headphone-details",
  },
  {
    id: "finish",
    title: "Finish",
    description:
      "A glass surface around the product. Light without losing definition.",
    fileId: "style",
    lines: [1, 11],
    target: ".headphone-card",
  },
];

function HeadphoneStudy() {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 220 150" fill="none" aria-hidden="true">
      <defs>
        <linearGradient
          id={`${uid}-silver`}
          x1="55"
          y1="25"
          x2="166"
          y2="120"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ffffff" />
          <stop offset=".32" stopColor="#c9d8e7" />
          <stop offset=".54" stopColor="#8096ac" />
          <stop offset=".75" stopColor="#eaf3fc" />
          <stop offset="1" stopColor="#9ab0c6" />
        </linearGradient>
        <linearGradient
          id={`${uid}-cushion`}
          x1="47"
          y1="77"
          x2="80"
          y2="128"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#869bae" />
          <stop offset="1" stopColor="#43596e" />
        </linearGradient>
      </defs>
      <ellipse cx="110" cy="137" rx="60" ry="7" fill="#718ba5" opacity=".16" />
      <path
        d="M58 91V64c0-60 104-60 104 0v27"
        stroke={`url(#${uid}-silver)`}
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M59 72V64c0-55 102-55 102 0v8"
        stroke="#f8fbff"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="50"
        y="73"
        width="31"
        height="56"
        rx="15"
        fill={`url(#${uid}-cushion)`}
      />
      <rect
        x="139"
        y="73"
        width="31"
        height="56"
        rx="15"
        fill={`url(#${uid}-cushion)`}
      />
      <rect
        x="43"
        y="71"
        width="28"
        height="56"
        rx="13"
        fill={`url(#${uid}-silver)`}
        stroke="#e7f0f9"
      />
      <rect
        x="149"
        y="71"
        width="28"
        height="56"
        rx="13"
        fill={`url(#${uid}-silver)`}
        stroke="#e7f0f9"
      />
      <path
        d="M51 83v30m106-30v30"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity=".7"
      />
      <circle cx="163" cy="113" r="2" fill="#d4eaff" />
    </svg>
  );
}

function ProductDetail({ finished }: { finished: boolean }) {
  return (
    <article
      className="headphone-card"
      data-finished={finished}
      aria-label="Halo headphones sample product"
    >
      <header className="headphone-header">
        <span>HALO / 01</span>
        <span>STUDIO SERIES</span>
      </header>
      <div className="headphone-artwork">
        <HeadphoneStudy />
        <span>SILVER / SOFT TOUCH</span>
      </div>
      <div className="headphone-details">
        <p>Over-ear / Wireless</p>
        <h2>
          Quiet,
          <br />
          by design<span>.</span>
        </h2>
        <span>Less noise. More music.</span>
        <div>
          <span>40h battery</span>
          <strong>$189</strong>
        </div>
      </div>
    </article>
  );
}

export function productPreview(step: CodeWindowStep) {
  return <ProductDetail finished={step.id === "finish"} />;
}
