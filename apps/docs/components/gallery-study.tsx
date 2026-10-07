import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

/** Homepage framing only; the live study keeps its own portable layout. */
export function GalleryStudy({
  id,
  className,
  number,
  category,
  title,
  description,
  instruction,
  detail,
  href,
  children,
}: {
  id: string;
  className: string;
  number: string;
  category: string;
  title: string;
  description: string;
  instruction: string;
  detail: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <article
      id={id}
      className={`gallery-study ${className}`}
      aria-labelledby={`${id}-title`}
    >
      <div className="gallery-caption">
        <div>
          <span className="micro-label">
            <span className="study-number">{number}</span> / {category}
          </span>
          <h3 id={`${id}-title`}>
            <Link href={href}>
              {title} <ArrowUpRight size={20} />
            </Link>
          </h3>
          <p>{description}</p>
        </div>
        <Link
          href={href}
          className="gallery-source"
          aria-label={`Get ${title} source`}
        >
          Get source <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="gallery-demo">{children}</div>
      <div className="gallery-instruction">
        <span>
          <span className="study-cue" aria-hidden="true">
            ↗
          </span>
          {instruction}
        </span>
        <span>{detail}</span>
      </div>
    </article>
  );
}
