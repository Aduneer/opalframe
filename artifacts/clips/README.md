# Component recordings

Captured from the current browser demos with Playwright and ffmpeg. Every set contains a silent eight-second MP4, a looping GIF, and a PNG poster. All example identities, products, trips, and releases are fictional.

| Study / example                     | Frame | Watch                                             | GIF                                               | Poster                                            |
| ----------------------------------- | ----- | ------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| Comparison Lens                     | 16:9  | [MP4](comparison-lens-16x9.mp4)                   | [GIF](comparison-lens-16x9.gif)                   | [PNG](comparison-lens-16x9.png)                   |
| Expandable Dock                     | 16:9  | [MP4](expandable-dock-16x9.mp4)                   | [GIF](expandable-dock-16x9.gif)                   | [PNG](expandable-dock-16x9.png)                   |
| Expandable Dock                     | 1:1   | [MP4](expandable-dock-1x1.mp4)                    | [GIF](expandable-dock-1x1.gif)                    | [PNG](expandable-dock-1x1.png)                    |
| Expandable Dock                     | 9:16  | [MP4](expandable-dock-9x16.mp4)                   | [GIF](expandable-dock-9x16.gif)                   | [PNG](expandable-dock-9x16.png)                   |
| Expandable Dock — Alternate         | 16:9  | [MP4](expandable-dock-alternate-16x9.mp4)         | [GIF](expandable-dock-alternate-16x9.gif)         | [PNG](expandable-dock-alternate-16x9.png)         |
| Expandable Dock — Alternate         | 9:16  | [MP4](expandable-dock-alternate-9x16.mp4)         | [GIF](expandable-dock-alternate-9x16.gif)         | [PNG](expandable-dock-alternate-9x16.png)         |
| Focus Stack                         | 16:9  | [MP4](focus-stack-16x9.mp4)                       | [GIF](focus-stack-16x9.gif)                       | [PNG](focus-stack-16x9.png)                       |
| Focus Stack                         | 1:1   | [MP4](focus-stack-1x1.mp4)                        | [GIF](focus-stack-1x1.gif)                        | [PNG](focus-stack-1x1.png)                        |
| Focus Stack                         | 9:16  | [MP4](focus-stack-9x16.mp4)                       | [GIF](focus-stack-9x16.gif)                       | [PNG](focus-stack-9x16.png)                       |
| Interactive Code Window             | 16:9  | [MP4](interactive-code-window-16x9.mp4)           | [GIF](interactive-code-window-16x9.gif)           | [PNG](interactive-code-window-16x9.png)           |
| Interactive Code Window             | 1:1   | [MP4](interactive-code-window-1x1.mp4)            | [GIF](interactive-code-window-1x1.gif)            | [PNG](interactive-code-window-1x1.png)            |
| Interactive Code Window             | 9:16  | [MP4](interactive-code-window-9x16.mp4)           | [GIF](interactive-code-window-9x16.gif)           | [PNG](interactive-code-window-9x16.png)           |
| Interactive Code Window — Alternate | 16:9  | [MP4](interactive-code-window-alternate-16x9.mp4) | [GIF](interactive-code-window-alternate-16x9.gif) | [PNG](interactive-code-window-alternate-16x9.png) |
| Interactive Code Window — Alternate | 9:16  | [MP4](interactive-code-window-alternate-9x16.mp4) | [GIF](interactive-code-window-alternate-9x16.gif) | [PNG](interactive-code-window-alternate-9x16.png) |
| Product Stage                       | 16:9  | [MP4](product-stage-16x9.mp4)                     | [GIF](product-stage-16x9.gif)                     | [PNG](product-stage-16x9.png)                     |
| Release Rail                        | 16:9  | [MP4](release-rail-16x9.mp4)                      | [GIF](release-rail-16x9.gif)                      | [PNG](release-rail-16x9.png)                      |

The reusable components support all three showcase ratios. This launch package includes all six landscape studies, square/portrait Code Window, Dock, and Focus Stack, and landscape/portrait alternate Dock and Code Window examples.

With the local site running, reproduce all sets using `npm run record:launch`. Individual exports use `npm run record -- --component focus-stack --ratio 9/16`; add `--preset alternate` for the alternate Dock or Code Window. Set `PREVIEW_URL` and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when needed. ffmpeg is required.

[Site opening and artwork recordings](../presentation/README.md) · [License and credits](../../ASSET-CREDITS.md)
