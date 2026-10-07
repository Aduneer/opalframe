import type { NextConfig } from "next";
const pages = process.env.OPALFRAME_STATIC_EXPORT === "1";
const config: NextConfig = {
  devIndicators: false,
  basePath: (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, ""),
  output: pages ? "export" : undefined,
  trailingSlash: pages,
  images: { unoptimized: true },
  distDir: pages
    ? "out"
    : process.env.NODE_ENV === "development"
      ? ".next-dev"
      : ".next",
  allowedDevOrigins: ["127.0.0.1"],
};
export default config;
