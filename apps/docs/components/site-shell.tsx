"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowUpRight, Moon, Sun } from "lucide-react";
import { SoundToggle } from "@/components/ambient-sound";

function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}
function getTheme() {
  return document.documentElement.dataset.theme === "light";
}
function getServerTheme() {
  return false;
}
export function ThemeToggle() {
  const light = useSyncExternalStore(subscribeTheme, getTheme, getServerTheme);
  return (
    <button
      type="button"
      className="icon-button"
      aria-label={`Switch to ${light ? "dark" : "light"} mode`}
      onClick={() => {
        const next = !light;
        document.documentElement.dataset.theme = next ? "light" : "dark";
        try {
          localStorage.setItem("interface-theme", next ? "light" : "dark");
        } catch {
          /* Theme still works when storage is unavailable. */
        }
      }}
    >
      {light ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}

export function Header({
  sourceHref = "/components/interactive-code-window#installation",
}: {
  sourceHref?: string;
}) {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Opalframe home">
        <span className="brand-mark" aria-hidden="true">
          o<span>↗</span>
        </span>
        <span>
          opalframe<span className="brand-dot">.</span>
        </span>
        <span className="brand-note">INTERFACE STUDIES</span>
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/#components">Components</Link>
        <Link href="/showcase">
          Showcase <ArrowUpRight size={12} />
        </Link>
      </nav>
      <div className="header-actions">
        <SoundToggle />
        <ThemeToggle />
        <Link
          className="button button-small"
          href={sourceHref}
          aria-label="Get the source"
        >
          <span className="source-label-full">Get the source</span>
          <span className="source-label-short">Source</span>
          <ArrowUpRight size={13} />
        </Link>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <Link href="/" className="footer-wordmark">
        opalframe.
      </Link>
      <p>Made to be made your own.</p>
      <a className="text-link" href="https://github.com/Aduneer/opalframe">
        View on GitHub <ArrowUpRight size={12} aria-hidden="true" />
      </a>
    </footer>
  );
}
