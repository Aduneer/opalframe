import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { stat } from "node:fs/promises";
import path from "node:path";

const run = promisify(execFile);
for (const theme of ["charcoal", "pearl"]) {
  const frames = path.resolve(`artifacts/blender/.orbit/${theme}`);
  const movie = path.resolve(
    `apps/docs/public/artwork/ribbon-orbit-${theme}.webm`,
  );
  const poster = path.resolve(
    `apps/docs/public/artwork/ribbon-orbit-${theme}.webp`,
  );
  // Preserve Blender's actual alpha, including the glass and changing silhouettes.
  // Solid mattes plus blend modes cannot reproduce translucent reflections faithfully.
  await run("ffmpeg", [
    "-y",
    "-framerate",
    "24",
    "-i",
    path.join(frames, "%04d.png"),
    "-pix_fmt",
    "yuva420p",
    "-an",
    "-c:v",
    "libvpx-vp9",
    "-b:v",
    "0",
    "-crf",
    "28",
    "-deadline",
    "good",
    "-cpu-used",
    "2",
    "-row-mt",
    "1",
    "-threads",
    "4",
    "-auto-alt-ref",
    "0",
    movie,
  ]);
  await run("ffmpeg", [
    "-y",
    "-i",
    path.join(frames, "0000.png"),
    "-frames:v",
    "1",
    "-c:v",
    "libwebp",
    "-quality",
    "88",
    poster,
  ]);
  console.log(
    `Exported ${theme}: ${Math.round((await stat(movie)).size / 1024)} KB alpha loop and poster.`,
  );
}
