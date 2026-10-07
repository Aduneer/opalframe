# GitHub Pages publication

The public repository is [Aduneer/opalframe](https://github.com/Aduneer/opalframe),
with the live demo at [aduneer.github.io/opalframe](https://aduneer.github.io/opalframe/).
Opalframe uses a GitHub Pages project site; no custom domain is required. The
workflow follows the [official Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages),
using a [Next.js static export](https://nextjs.org/docs/app/guides/static-exports).

## Publishing updates

1. Review the staged diff and ignored files before committing. Local notes,
   credentials, build caches, Blender scenes/renders, and audio production
   masters must stay excluded. Keep web assets, finished demo clips, the lockfile,
   and generated registry files.
2. Push the reviewed change to `main`. Both **Checks** and **GitHub Pages** run
   automatically. Pages uses **GitHub Actions** as its source in repository settings.
3. Wait for both workflows to succeed. Pages runs a static build, source checks,
   and desktop/mobile static smoke tests before deploying `apps/docs/out/`.
4. Verify the live routes and a fresh installation from the public registry before
   announcing a change. A manual **GitHub Pages** run can redeploy the selected branch.

The default **Checks** workflow runs nine focused desktop browser tests plus
six desktop/mobile Pages checks. The full 114-test browser suite is opt-in via
**Actions → Checks → Run workflow → Full browser suite**, or `npm test` locally.
Build, typecheck, lint, and formatting remain required. Superseded Checks runs
on the same branch are canceled automatically.

The build script derives the owner/repository from `GITHUB_REPOSITORY`, sets the site URL and base path, and handles both project sites and repositories named `OWNER.github.io`. Project builds prefix public artwork, audio, icons, and install commands with the repository path. Metadata uses the complete site URL. The six component routes are generated at build time.

No Next.js server, custom CLI, runtime component package, account, or database is needed. The gallery interactions, docs source display, theme, recording mode, and opt-in sound work in the static site. Use GitHub's repository settings for description/topics/social preview when presentation assets change.

Suggested repository description: **Six copy-paste React interactions. TypeScript,
scoped CSS, live previews, and a shadcn registry. MIT licensed.**

Suggested topics: `react`, `typescript`, `ui-components`, `css`, `shadcn-registry`,
`accessibility`, `interaction-design`, `frutiger-aero`, `liquid-glass`.
The first-edition notes are [RELEASE-NOTES.md](RELEASE-NOTES.md).

## Preview the project-path export locally

```sh
npm ci
npm run build:pages
npm run preview:pages
```

Without a GitHub environment, this defaults to [localhost:3001/opalframe/](http://localhost:3001/opalframe/). The preview is a plain static file server, with no Next.js routing fallback. The export uses trailing directory URLs and includes `.nojekyll` and `404.html`.

Run `npm run test:pages` after the build. The tests read the build's base path, start the static preview if needed, and exercise direct docs loads, artwork/audio URLs, installation commands, client navigation, and recording mode on desktop/mobile.

You can override the public build values in your shell or CI; `.env.example` records only public example values and is not automatically loaded by the Pages build script:

```sh
GITHUB_REPOSITORY=Aduneer/opalframe npm run build:pages
```

For a root site, use an empty base path and a root site URL. Changing a base path requires rebuilding; Next.js inlines it into client bundles. [Next.js base-path documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath) explains the behavior.

`npm run dev` and the standard `npm run build` continue to serve the normal root-path Next.js site. Static builds export to `apps/docs/out/`. The generated `.pages-build.json` is local preview metadata and is ignored by Git. Rebuild in standard mode before using `npm start` after a static export.

## Local preparation — 2026-10-06

All six studies are included in the README, registry, docs, and recording studio.
The launch package contains 16 component recording sets and four both-theme
presentation sets, each with an eight-second silent MP4, GIF, and poster. Current
screenshots/social imagery and the fictional-demo credits are refreshed. The
[component](artifacts/clips/README.md) and [presentation](artifacts/presentation/README.md)
indexes link the exact exports.

The full browser run passed 113 checks; after correcting one older scroll-position
assumption, its desktop/mobile checks passed too. The six static Pages checks also
passed across the full run and focused follow-ups. Standard/static production
builds, a clean Node 22.23.3 lockfile install/static build, typecheck, lint, and
formatting passed. The official shadcn CLI installed all six items from the local
static project-path registry; twelve copied files matched source and all six docs
examples plus the README example type-checked in the consumer project.

These are the pre-publication local results. Live verification is recorded below.

## First publication — 2026-10-07

The public repository was created and the signed initial commit pushed. GitHub
Pages built and deployed successfully. Live Chromium checks passed at 1440px and
390px for the opening, theme changes, silent initial audio, explicit audio
activation, six directly loaded docs routes and installation commands, narrow
layout, and Focus Stack in the recording studio. Reduced-motion entry, social
metadata, the icon, and both alpha-video assets also passed.

The official shadcn CLI installed all six components from the public registry
into a fresh consumer folder. All twelve files match the repository source.
The six exact documentation examples and README example type-check against
those installed files.

The proposed upload was reviewed for credential patterns, local home paths,
private media metadata, ignored-file links, and oversized files. No matches
requiring removal were found. Blender production files, audio masters/auditions,
local agent/planning notes, credentials, and build/raw outputs are excluded.
This review is evidence of the checks performed, not a guarantee that automated
scanning detects every possible secret.

## Before announcing

- Confirm the README's demo, repository, and registry links use the real public URLs.
- Open the homepage, all six docs routes directly, and recording mode on the deployed site. Check light/dark themes, narrow layouts, keyboard navigation, reduced motion, and silent initial sound state.
- Install all six registry items into a fresh React project with the official shadcn CLI. Check the twelve copied source files, imports, and custom usage.
- Confirm the public social preview and icon load. Use the current `apps/docs/public/social-preview.png` for the repository's social preview.
- Review the final Git diff and ignored files. Keep the lockfile, component source, generated registry, web assets, and finished preview assets. Blender scenes/renders and audio production masters stay local. Omit local env files, build caches, browser reports, and raw intermediates.
- Check the actual GitHub workflow results. Local builds do not establish successful GitHub deployment.

The deployment workflow publishes only after its build/check job passes. For a bad publication, revert the change and rerun the workflow to build the prior source. Tags and GitHub releases are separate actions; this preparation does not create either.

## Dependency status — 2026-10-06

Next.js and its lint configuration were updated to 16.3.8 during the release preparation. `npm audit --omit=dev` reports zero findings. The audit was refreshed on 2026-10-06: production dependencies have zero findings. The full audit reports five high-severity entries in a single lint-only chain: `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces`.

The underlying [braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) has no patched release at this check. It concerns deeply nested glob patterns; this project's lint step uses repository-controlled patterns, and this chain is not a browser dependency in the static site. Track the upstream fix and rerun the audit before publication. The audit's suggested forced downgrade of the Next lint configuration was not applied.
