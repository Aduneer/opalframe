import { spawnSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const repository = process.env.GITHUB_REPOSITORY;
const [owner, name] = repository?.split("/") ?? [];
const inferredPath =
  owner && name
    ? name.toLowerCase() === `${owner}.github.io`.toLowerCase()
      ? ""
      : `/${name}`
    : "/opalframe";
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? inferredPath).replace(
  /\/$/,
  "",
);
if (
  basePath &&
  (!/^\/[\w.-]+$/.test(basePath) || ["/.", "/.."].includes(basePath))
) {
  throw new Error(
    "NEXT_PUBLIC_BASE_PATH must be empty or one repository path, e.g. /opalframe",
  );
}
const site = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (owner
    ? `https://${owner.toLowerCase()}.github.io${basePath}`
    : `http://localhost:3001${basePath}`)
).replace(/\/$/, "");
const url = new URL(site);
if (
  !["http:", "https:"].includes(url.protocol) ||
  url.pathname.replace(/\/$/, "") !== basePath ||
  url.search ||
  url.hash
) {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL must include the matching repository path, without a query or fragment",
  );
}
const env = {
  ...process.env,
  OPALFRAME_STATIC_EXPORT: "1",
  NEXT_PUBLIC_BASE_PATH: basePath,
  NEXT_PUBLIC_SITE_URL: site,
};
console.log(
  `Building static Pages site: ${site}/ (base path: ${basePath || "/"})`,
);
for (const [args, cwd] of [
  [["scripts/build-registry.mjs"], root],
  [
    [`${root}node_modules/next/dist/bin/next`, "build", "--webpack"],
    `${root}apps/docs`,
  ],
]) {
  const result = spawnSync(process.execPath, args, {
    cwd,
    env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
await writeFile(new URL("../apps/docs/out/.nojekyll", import.meta.url), "");
await writeFile(
  new URL("../apps/docs/.pages-build.json", import.meta.url),
  JSON.stringify({ basePath, site }),
);
console.log("Pages files are ready in apps/docs/out/.");
