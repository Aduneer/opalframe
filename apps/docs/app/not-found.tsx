import Link from "next/link";
import { Header, Footer } from "@/components/site-shell";
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="not-found">
        <span className="eyebrow">404 / OUTSIDE THE FRAME</span>
        <h1>
          Nothing here.
          <br />
          Plenty to explore.
        </h1>
        <Link className="button" href="/#components">
          Back to the collection ↗
        </Link>
      </main>
      <Footer />
    </>
  );
}
