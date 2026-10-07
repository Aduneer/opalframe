import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const names = [
  "product-stage",
  "release-rail",
  "comparison-lens",
  "interactive-code-window",
  "expandable-dock",
  "focus-stack",
];
const output = path.join(root, "apps/docs/public/r");
await mkdir(output, { recursive: true });
const items = [];
for (const name of names) {
  const files = await Promise.all(
    ["tsx", "css"].map(async (extension) => ({
      path: `packages/components/${name}.${extension}`,
      type: extension === "tsx" ? "registry:ui" : "registry:file",
      target: `@ui/${name}.${extension}`,
      content: await readFile(
        path.join(root, `packages/components/${name}.${extension}`),
        "utf8",
      ),
    })),
  );
  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name,
    type: "registry:ui",
    title: name
      .split("-")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" "),
    description: `Portable ${name} interaction. React and CSS; no animation dependencies.`,
    files,
  };
  items.push(item);
  await writeFile(
    path.join(output, `${name}.json`),
    `${JSON.stringify(item, null, 2)}\n`,
  );
}
await writeFile(
  path.join(output, "registry.json"),
  `${JSON.stringify({ $schema: "https://ui.shadcn.com/schema/registry.json", name: "opalframe", homepage: process.env.NEXT_PUBLIC_SITE_URL ?? "https://aduneer.github.io/opalframe", items: items.map(({ files, ...item }) => ({ ...item, files: files.map(({ path, type, target }) => ({ path, type, target })) })) }, null, 2)}\n`,
);
console.log(`Built ${items.length} registry items with their own stylesheets.`);
