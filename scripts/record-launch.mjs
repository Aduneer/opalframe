import { spawn } from "node:child_process";

// Six landscape studies; Code Window, Dock, and Stack in square/portrait;
// two alternate scenes in landscape/portrait; both-theme opening and artwork.
const jobs = [["--component", "all", "--ratio", "16/9"]];
for (const component of [
  "interactive-code-window",
  "expandable-dock",
  "focus-stack",
])
  for (const ratio of ["1/1", "9/16"])
    jobs.push(["--component", component, "--ratio", ratio]);
for (const component of ["interactive-code-window", "expandable-dock"])
  for (const ratio of ["16/9", "9/16"])
    jobs.push([
      "--component",
      component,
      "--preset",
      "alternate",
      "--ratio",
      ratio,
    ]);

async function run(script, args = []) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], {
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${script} exited ${code}`)),
    );
  });
}
for (const args of jobs) await run("scripts/record.mjs", args);
await run("scripts/record-presentation.mjs");
console.log(
  "Launch recordings refreshed: 16 component sets and four presentation sets.",
);
