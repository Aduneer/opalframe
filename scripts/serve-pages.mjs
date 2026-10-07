import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Local preview only: plain static files, with no Next server or SPA fallback.
const root = path.resolve(
  fileURLToPath(new URL("../apps/docs/out/", import.meta.url)),
);
const build = JSON.parse(
  await readFile(
    new URL("../apps/docs/.pages-build.json", import.meta.url),
    "utf8",
  ),
);
const basePath = build.basePath;
const port = Number(process.env.PAGES_PREVIEW_PORT ?? 3001);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".txt": "text/plain",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".flac": "audio/flac",
};
await stat(path.join(root, "index.html"));
createServer(async (request, response) => {
  try {
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405).end();
      return;
    }
    const url = new URL(request.url, "http://localhost");
    const pathname = decodeURIComponent(url.pathname);
    if (basePath && pathname === basePath) {
      response.writeHead(301, { Location: `${basePath}/${url.search}` }).end();
      return;
    }
    if (!pathname.startsWith(`${basePath}/`)) throw new Error("Outside mount");
    const relative = pathname.slice(basePath.length);
    const file = path.resolve(
      root,
      `.${relative}`,
      relative.endsWith("/") ? "index.html" : "",
    );
    if (!file.startsWith(`${root}${path.sep}`))
      throw new Error("Outside output");
    const info = await stat(file);
    if (!info.isFile()) {
      response.writeHead(301, { Location: `${pathname}/${url.search}` }).end();
      return;
    }
    const headers = {
      "Content-Type": mime[path.extname(file)] ?? "application/octet-stream",
      "Accept-Ranges": "bytes",
    };
    const range = /^bytes=(\d+)-(\d*)$/.exec(request.headers.range ?? "");
    const start = range ? Number(range[1]) : 0;
    const end =
      range && range[2]
        ? Math.min(Number(range[2]), info.size - 1)
        : info.size - 1;
    if (start > end || start >= info.size) {
      response
        .writeHead(416, { "Content-Range": `bytes */${info.size}` })
        .end();
      return;
    }
    headers["Content-Length"] = end - start + 1;
    if (range) headers["Content-Range"] = `bytes ${start}-${end}/${info.size}`;
    response.writeHead(range ? 206 : 200, headers);
    if (request.method === "HEAD") response.end();
    else createReadStream(file, { start, end }).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/html" });
    response.end(await readFile(path.join(root, "404.html")));
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Static Pages preview: http://127.0.0.1:${port}${basePath}/`);
});
