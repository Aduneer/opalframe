# Site presentation

Current launch captures of the accepted six-study gallery. These effects belong to the site; they are not included in copied components. Recordings are silent.

| Scene                                  | Charcoal                                                                | Pearl                                                             |
| -------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Native scrolling studio opening        | [MP4](studio-opening-charcoal.mp4) · [GIF](studio-opening-charcoal.gif) | [MP4](studio-opening-pearl.mp4) · [GIF](studio-opening-pearl.gif) |
| Floating, rotating alpha-glass artwork | [MP4](light-response-charcoal.mp4) · [GIF](light-response-charcoal.gif) | [MP4](light-response-pearl.mp4) · [GIF](light-response-pearl.gif) |

Each recording is eight seconds with a same-name PNG poster. The opening recordings use actual mouse-wheel input through the native runway. Artwork clips show the current transparent VP9 loop, CSS float, and bounded pointer light.

The export trims loading frames by matching the captured scene to its poster,
then fits the complete presentation action into eight seconds. Playback timing
is normalized for the clip; the live opening remains driven by native scrolling.

Desktop/mobile stills in both themes use `opening-`, `opening-mid-`, and `opening-clear-` prefixes. `desktop-`/`mobile-` show the reduced-motion composition. Docs, installation reading, lower-gallery Focus Stack, studio backdrops, and Field Notes outline detail have dedicated stills.

The presentation exporter requires ffmpeg and ffprobe on PATH. Run `npm run capture:presentation` for stills and `npm run record:presentation` for these four sets, with the local site running. `npm run record:launch` also refreshes the component recordings.

[Component clips](../clips/README.md) · [Artwork source](../../scripts/artwork/README.md) · [Credits](../../ASSET-CREDITS.md)
