# Contributing to Opalframe

Start with a useful interaction and one compelling demo. Explain the website it improves and the detail that makes it worth keeping. Small fixes to existing studies, docs, keyboard behavior, or mobile layouts are welcome too.

## Local setup

Use Node.js 22 (also selected by `.nvmrc` and CI) and npm. From the repository root:

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). For browser checks:

```sh
npx playwright install chromium
npm test
```

Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use an existing Chromium installation. Screenshots need a running site; MP4/GIF recording also needs `ffmpeg` and `ffprobe`.

## Adding an interface study

1. Discuss the use case in a component request before a large implementation. Explain the interaction and share a sketch or recording where useful.
2. Add `packages/components/your-component.tsx` and its scoped `.css`. Keep demo content out of reusable source; do not import the docs app or add a runtime dependency without a concrete need.
3. Expose useful TypeScript props and `className`. Handle keyboard access, narrow layouts, different content, and reduced motion. Preserve native links/actions and stable preview dimensions.
4. Add a polished demo, catalog entry, and recording support under `apps/docs/`. Include installation, usage, props, customization, accessibility notes, dependencies, and both source files.
5. Register the component in `scripts/build-registry.mjs`, then run `npm run registry`. Edit source, not generated JSON.
6. Verify the official shadcn installation into a separate consumer project when the component or install flow changes. Include realistic content and controlled-state usage where relevant.
7. Capture light/dark and mobile previews, plus a short clip that makes the interaction clear. Record the source and license of any new assets.

Before proposing it, ask: Does it look good when motion stops? Can it improve a real website? Is the source understandable? Does it solve an interaction that is worth implementing carefully?

## Validation and pull requests

Run checks appropriate to the change. Documentation-only edits need formatting and link/path review. Behavior changes need focused browser checks; shared behavior and release changes may need the broader suite.

```sh
npm run registry
npm run typecheck
npm run lint
npm run format:check
npm run build
npm test
```

Test one browser file with `npx playwright test tests/gallery.spec.ts`, or a named case with `--grep`. For routing, public assets, or installation URLs, also run `npm run build:pages` and `npm run test:pages`; GitHub Pages serves a static export under the repository path. [DEPLOYMENT.md](DEPLOYMENT.md) explains that setup.

Keep changes focused. Describe the problem and resulting behavior, show a preview where useful, and state what you actually verified. Do not promise compatibility, adoption, or performance you have not checked. The component sources currently require only React; keep that portability.

Do not commit local configuration, agent instructions, working notes, build directories, browser reports, or raw render/recording intermediates. Keep finished review assets and authored scene files. The public [roadmap](ROADMAP.md) describes the collection's direction. Contributions are provided under the repository's [MIT license](LICENSE); third-party assets retain their own terms and must include credits.
