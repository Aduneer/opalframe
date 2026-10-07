# Quiet 01 source

Quiet 01 is an original 72-second procedural ambient loop. It uses no external
tracks, samples, voices, or field recordings. The composition, source, and web
export use the repository's [MIT license](../../LICENSE).

From the repository root, with Python 3, NumPy, ffmpeg, and ffprobe installed:

```sh
python scripts/audio/render-audition.py
```

The script uses a fixed seed and generates the master, audition, measurements,
and [web FLAC](../../apps/docs/public/audio/quiet-01.flac). Production files go
into ignored `artifacts/audio/`. The listening preview uses
`artifacts/presentation/light-response-charcoal.mp4` as its background.

The site fetches the loop only after explicit sound activation and applies its
own gain fades. See the [web-asset credits](../../apps/docs/public/audio/CREDITS.md)
for attribution and license details.
