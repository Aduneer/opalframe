# First edition — 2026-10-07

Opalframe is a collection of six React interactions distributed as source you
copy into your own project. Each study includes TypeScript props, scoped CSS,
an interactive example, usage and accessibility notes, and a shadcn registry item.
React is the only component runtime dependency.

- **Interactive Code Window:** select a code block and follow its measured target
  in a live preview; switch files, copy source, or replay the walkthrough once.
- **Expandable Dock:** reveal labels on hover or focus while a measured marker
  tracks the selected destination. Supply your own icons, links, or actions.
- **Comparison Lens:** inspect aligned before/after layers through a native range
  input with pointer, touch, and keyboard control.
- **Product Stage:** guide attention through feature tabs, measured preview
  targets, and synchronized captions.
- **Release Rail:** inspect externally supplied release stages, failures, and
  recovery. The included example is a simulation.
- **Focus Stack:** spread an image collection, bring a selected work forward,
  and keep its caption space stable. Supply your own images and project links.

The gallery offers Pearl/Charcoal themes, live customization with copyable CSS,
Studio/Travel journal and Field Notes/Product detail examples, and finite
Product Stage/Release Rail stories. Its scrolling glass opening, original
Blender artwork, optional Quiet 01 sound, and pointer feedback belong to the
site. Copied components do not include those presentation effects or assets.
Sound is silent until activation; motion respects reduced-motion preferences.

The recording studio supports landscape, square, and portrait frames with an
independent backdrop and demo theme. [The clip index](artifacts/clips/README.md)
links the browser recordings; [presentation assets](artifacts/presentation/README.md)
show the opening and artwork in both themes.

Source and original art/music are MIT licensed. [Asset credits](ASSET-CREDITS.md)
retain the Lucide/Feather notices for demo icons. Avery Studio, Northbound, Halo,
and the example activity are fictional content.

## Try it

Explore the [live collection](https://aduneer.github.io/opalframe/) or get the
[source on GitHub](https://github.com/Aduneer/opalframe). Install a study from your
own React project with shadcn configured:

```sh
npx shadcn@latest add https://aduneer.github.io/opalframe/r/focus-stack.json
```

This edition is distributed as copied source, with no npm runtime package.
[Deployment notes](DEPLOYMENT.md) record the publication and verification.
