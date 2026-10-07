import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  { settings: { next: { rootDir: "apps/docs" } } },
  {
    files: ["packages/components/**/*.tsx"],
    rules: { "@next/next/no-img-element": "off" },
  },
  globalIgnores([
    "**/.next*/**",
    "**/out/**",
    "**/next-env.d.ts",
    "apps/docs/public/r/**",
    "test-results/**",
    "playwright-report/**",
  ]),
]);
