import { Suspense } from "react";
import { Showcase } from "@/components/showcase";
export const metadata = { title: "Recording studio" };
export default function ShowcasePage() {
  return (
    <Suspense fallback={<main id="main" className="showcase-shell" />}>
      <Showcase />
    </Suspense>
  );
}
