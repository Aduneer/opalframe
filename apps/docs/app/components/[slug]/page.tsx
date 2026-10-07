import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, FileCode2 } from "lucide-react";
import { Header, Footer } from "@/components/site-shell";
import { Preview } from "@/components/preview";
import { CopyButton } from "@/components/copy-button";
import { InstallCommand } from "@/components/install-command";
import { catalog, getSource } from "@/lib/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return catalog.map((item) => ({ slug: item.name }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = catalog.find((entry) => entry.name === slug);
  return {
    title: item?.title ?? "Component not found",
    description: item?.description,
  };
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = catalog.find((entry) => entry.name === slug);
  if (!item) notFound();
  const source = await getSource(item.name);
  return (
    <>
      <Header sourceHref="#source" />
      <main id="main" className="docs-main">
        <aside className="docs-sidebar">
          <Link href="/#components" className="text-link">
            <ArrowLeft size={13} /> The collection
          </Link>
          <span className="eyebrow">COMPONENTS</span>
          <nav aria-label="Components">
            {catalog.map((entry) => (
              <Link
                key={entry.name}
                href={`/components/${entry.name}`}
                aria-current={entry.name === slug ? "page" : undefined}
              >
                {entry.title}
                <ArrowUpRight size={12} />
              </Link>
            ))}
          </nav>
          <Link
            className="sidebar-showcase"
            href={`/showcase?component=${item.name}`}
          >
            Recording mode <ArrowUpRight size={13} />
          </Link>
        </aside>
        <div className="docs-content">
          <div className="docs-heading">
            <span className="eyebrow">{item.category}</span>
            <h1>
              {item.title}
              <span>.</span>
            </h1>
            <p>{item.description}</p>
            <nav className="docs-quick-links" aria-label="On this page">
              <a href="#installation">Installation</a>
              <a href="#usage">Usage</a>
              <a href="#source">Source</a>
            </nav>
          </div>
          <Preview key={item.name} name={item.name} source={source.tsx} />
          <section className="docs-section" id="installation">
            <h2>Installation</h2>
            <p>In a project with React and shadcn configured, run:</p>
            <InstallCommand name={item.name} />
            <p className="docs-note">
              Copies the component and its stylesheet into{" "}
              <code>components/ui</code>. No additional runtime dependencies.
              Tailwind classes work through <code>className</code>.
            </p>
            <p className="docs-note">
              For manual installation, copy both files from Source below. Keep
              the CSS import alongside the component.
            </p>
          </section>
          <section className="docs-section" id="usage">
            <h2>Usage</h2>
            <div className="code-block">
              <CopyButton value={item.usage} label="Copy usage" />
              <pre tabIndex={0}>
                <code>{item.usage}</code>
              </pre>
            </div>
          </section>
          <section className="docs-section">
            <h2>Make it yours</h2>
            <p>
              Bring your own content. Adjust the accent and surfaces through
              scoped CSS variables.
            </p>
            <div className="code-block">
              <CopyButton
                value={item.customization}
                label="Copy customization"
              />
              <pre tabIndex={0}>
                <code>{item.customization}</code>
              </pre>
            </div>
          </section>
          <section className="docs-section">
            <h2>Props</h2>
            <div
              className="props-table-wrapper"
              tabIndex={0}
              role="region"
              aria-label="Component props"
            >
              <table className="props-table">
                <thead>
                  <tr>
                    <th>Prop</th>
                    <th>Type</th>
                    <th>What it does</th>
                  </tr>
                </thead>
                <tbody>
                  {item.props.map(([name, type, description]) => (
                    <tr key={name}>
                      <td>
                        <code>{name}</code>
                      </td>
                      <td>
                        <code>{type}</code>
                      </td>
                      <td>{description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="docs-section">
            <h2>Accessibility & motion</h2>
            <p>{item.accessibility}</p>
          </section>
          <section className="docs-section">
            <h2>Dependencies</h2>
            <p>
              React. That&apos;s it. Styling uses a local CSS file and supports
              your Tailwind utilities.
            </p>
          </section>
          <section className="docs-section" id="source">
            <h2>Source</h2>
            {[
              { name: `${item.name}.tsx`, source: source.tsx },
              { name: `${item.name}.css`, source: source.css },
            ].map((file) => (
              <details className="source-details" key={file.name}>
                <summary>
                  <FileCode2 size={14} />
                  {file.name}
                </summary>
                <div className="code-block">
                  <CopyButton value={file.source} label={`Copy ${file.name}`} />
                  <pre tabIndex={0}>
                    <code>{file.source}</code>
                  </pre>
                </div>
              </details>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
