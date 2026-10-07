import type { Metadata } from "next";
import { AmbientSound } from "@/components/ambient-sound";
import { assetPath } from "@/lib/site";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const socialImage = new URL(
  assetPath("/social-preview.png"),
  siteUrl,
).toString();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: { icon: assetPath("/icon.svg") },
  title: {
    default: "Opalframe — Interfaces worth a second look",
    template: "%s — Opalframe",
  },
  description:
    "Six carefully made React interactions. Explore the details, copy the source, make them yours. An open collection of interface studies.",
  openGraph: {
    title: "Opalframe — Interfaces worth a second look",
    siteName: "Opalframe",
    description: "Carefully made React components. Yours to take apart.",
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: "Opalframe — copy-paste React components with an interactive code walkthrough",
      },
    ],
  },
  twitter: { card: "summary_large_image", images: [socialImage] },
};

const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem('interface-theme')||'dark'}catch{}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <AmbientSound>{children}</AmbientSound>
      </body>
    </html>
  );
}
