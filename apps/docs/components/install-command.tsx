"use client";
import { useSyncExternalStore } from "react";
import { CopyButton } from "./copy-button";
import { basePath } from "@/lib/site";

function subscribeOrigin() {
  return () => {};
}
function getOrigin() {
  return `${window.location.origin}${basePath}`;
}
function getServerOrigin() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ?? `http://localhost:3000${basePath}`
  ).replace(/\/$/, "");
}
export function InstallCommand({ name }: { name: string }) {
  const origin = useSyncExternalStore(
    subscribeOrigin,
    getOrigin,
    getServerOrigin,
  );
  const command = `npx shadcn@latest add ${origin}/r/${name}.json`;
  return (
    <div className="command-block">
      <code>{command}</code>
      <CopyButton value={command} label="Copy command" />
    </div>
  );
}
