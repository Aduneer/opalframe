import Link from "next/link";
import { ArrowUpRight, Check, Code2, Feather } from "lucide-react";
import { Header, Footer } from "@/components/site-shell";
import { ReleaseDemo, ComparisonDemo } from "@/components/demos";
import { FocusStackDemo } from "@/components/focus-stack-demo";
import { GalleryScenes } from "@/components/gallery-scenes";
import { GalleryProductDemo } from "@/components/gallery-product-demo";
import { InstallCommand } from "@/components/install-command";
import { SignatureLens } from "@/components/signature-lens";
import { PresentationSurface } from "@/components/presentation-surface";
import { StudioOpening } from "@/components/studio-opening";
import { GalleryStudy } from "@/components/gallery-study";
import "@/components/gallery-study.css";

export default function Home() {
  return (
    <PresentationSurface>
      <StudioOpening componentCount={6}>
        <Header />
        <main id="main" className="home-main" tabIndex={-1}>
          <section className="gallery-intro" aria-labelledby="gallery-title">
            <div className="gallery-intro-copy">
              <span className="eyebrow">
                <span className="accent-square" /> SMALL INTERACTIONS. LASTING
                IMPRESSIONS.
              </span>
              <h1 id="gallery-title">
                Interfaces worth <span>a second look.</span>
              </h1>
              <p>
                <strong>Copy-paste React components.</strong>{" "}
                <span>Your content. Your code. Yours to keep.</span>
              </p>
              <div className="gallery-intro-actions">
                <a href="#components" className="button gallery-explore">
                  Explore the collection <span aria-hidden="true">↓</span>
                </a>
                <span>React + TypeScript / MIT</span>
              </div>
            </div>
            <div className="gallery-artwork">
              <SignatureLens />
              <span className="gallery-artwork-label" aria-hidden="true">
                STUDY IN LIGHT / 001
              </span>
            </div>
          </section>
          <section
            id="components"
            className="gallery-section"
            aria-labelledby="collection-title"
          >
            <div className="gallery-heading">
              <h2 id="collection-title">
                The collection <span>06</span>
              </h2>
              <span>
                <span className="live-dot" /> LIVE PREVIEWS · GO ON, TRY THEM
              </span>
            </div>
            <nav className="gallery-index" aria-label="Jump to a study">
              <a href="#study-code">
                <span>01</span> Code Window
              </a>
              <a href="#study-dock">
                <span>02</span> Dock
              </a>
              <a href="#study-lens">
                <span>03</span> Lens
              </a>
              <a href="#study-product">
                <span>04</span> Product Stage
              </a>
              <a href="#study-release">
                <span>05</span> Release Rail
              </a>
              <a href="#study-stack">
                <span>06</span> Focus Stack
              </a>
            </nav>
            <div className="gallery-grid">
              <GalleryStudy
                id="study-code"
                className="gallery-wide"
                number="01"
                category="FROM SOURCE TO SURFACE"
                title="Interactive Code Window"
                description="Every little detail has a line of code behind it. Follow the connection."
                instruction="Select a step. Watch the detail come into focus."
                detail="REAL CODE / LIVE PREVIEW"
                href="/components/interactive-code-window"
              >
                <GalleryScenes name="interactive-code-window" />
              </GalleryStudy>
              <GalleryStudy
                id="study-dock"
                className="gallery-dock"
                number="02"
                category="A LITTLE ROOM TO MOVE"
                title="Expandable Dock"
                description="Small footprint. A whole world to explore."
                instruction="Hover to unfold. Choose a destination."
                detail="FOUR DESTINATIONS / ONE DOCK"
                href="/components/expandable-dock"
              >
                <GalleryScenes name="expandable-dock" />
              </GalleryStudy>
              <GalleryStudy
                id="study-lens"
                className="gallery-lens"
                number="03"
                category="A CHANGE IN PERSPECTIVE"
                title="Comparison Lens"
                description="The same canvas. An entirely different feeling."
                instruction="Drag the glass. See what changes."
                detail="BEFORE / AFTER"
                href="/components/comparison-lens"
              >
                <ComparisonDemo />
              </GalleryStudy>
              <GalleryStudy
                id="study-product"
                className="gallery-product"
                number="04"
                category="ATTENTION, BEAUTIFULLY DIRECTED"
                title="Product Stage"
                description="A moving frame. A clearer story. Let your interface explain itself."
                instruction="Choose a feature. Follow the frame."
                detail="THREE DETAILS / ONE STORY"
                href="/components/product-stage"
              >
                <GalleryProductDemo />
              </GalleryStudy>
              <GalleryStudy
                id="study-release"
                className="gallery-release"
                number="05"
                category="MAKE THE INVISIBLE VISIBLE"
                title="Release Rail"
                description="From a commit to a live release. Even the bumps in the road deserve a good interface."
                instruction="Replay a release. Try a failed check, then retry."
                detail="INTERACTIVE DEPLOYMENT SIMULATION"
                href="/components/release-rail"
              >
                <ReleaseDemo guided />
              </GalleryStudy>
              <GalleryStudy
                id="study-stack"
                className="gallery-stack"
                number="06"
                category="A COLLECTION WITH DIMENSION"
                title="Focus Stack"
                description="Give your work a little depth. A fanned archive that brings one image, and its story, forward."
                instruction="Choose a work. Stack the deck, then spread it open."
                detail="YOUR IMAGES / A NEW PERSPECTIVE"
                href="/components/focus-stack"
              >
                <FocusStackDemo />
              </GalleryStudy>
            </div>
          </section>
          <div className="collection-strip gallery-strip">
            <span>
              <Code2 size={14} /> Copy the code. Keep the control.
            </span>
            <span>
              <Feather size={14} /> Light on dependencies.
            </span>
            <span>
              <Check size={14} /> Built for the small details.
            </span>
            <span className="strip-end">SIX STUDIES / ALL YOURS</span>
          </div>
          <section
            className="ownership-section"
            aria-labelledby="ownership-title"
          >
            <div>
              <span className="eyebrow">NO BLACK BOXES</span>
              <h2 id="ownership-title">
                Take it.
                <br />
                <span>Make it yours.</span>
              </h2>
              <p>
                No component subscription. No runtime package.
                <br />
                Just understandable source, in your own project.
              </p>
              <Link
                href="/components/product-stage#installation"
                className="button"
              >
                Get your first component <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="install-card">
              <div className="install-card-top">
                <span>
                  <span className="live-dot" /> YOUR NEXT PROJECT
                </span>
                <Code2 size={15} />
              </div>
              <div className="install-code">
                <InstallCommand name="product-stage" />
                <span className="code-comment">
                  {"// One interaction. Two files. All yours."}
                </span>
                <pre tabIndex={0}>
                  <code>
                    <span className="syntax-purple">import</span>{" "}
                    {"{ ProductStage }"}{" "}
                    <span className="syntax-purple">from</span>
                    {"\n"}
                    <span className="syntax-sage">
                      {" "}
                      &quot;@/components/ui/product-stage&quot;
                    </span>
                    ;{"\n\n"}
                    <span className="syntax-peach">&lt;ProductStage</span>{" "}
                    features={"{yourFeatures}"}
                    <span className="syntax-peach">&gt;</span>
                    {"\n"} &lt;YourProductPreview /&gt;{"\n"}
                    <span className="syntax-peach">&lt;/ProductStage&gt;</span>
                  </code>
                </pre>
                <Link
                  href="/components/product-stage#usage"
                  className="text-link"
                >
                  View the complete example <ArrowUpRight size={13} />
                </Link>
              </div>
              <div className="install-card-bottom">
                <Check size={13} /> Yours to edit, extend, and ship.
              </div>
            </div>
          </section>
          <section className="philosophy-section" id="philosophy">
            <span className="eyebrow">A FEW THINGS WE BELIEVE</span>
            <div>
              <h3>Motion should mean something.</h3>
              <p>
                Guide attention. Show a change. Make an interaction feel right.
                Then get out of the way.
              </p>
            </div>
            <div>
              <h3>Good design travels well.</h3>
              <p>
                Different content. Smaller screens. Less motion. The details
                should hold up everywhere.
              </p>
            </div>
            <div>
              <h3>The source is the product.</h3>
              <p>
                Readable code and useful defaults. A starting point you can
                understand, and make your own.
              </p>
            </div>
          </section>
          <section className="closing-section">
            <div>
              <span className="accent-square" />
              <p>Something worth keeping around.</p>
            </div>
            <Link href="/showcase" className="text-link">
              Find your next screen recording <ArrowUpRight size={15} />
            </Link>
          </section>
        </main>
        <Footer />
      </StudioOpening>
    </PresentationSurface>
  );
}
