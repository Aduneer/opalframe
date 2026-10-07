# Quiet 01 — sound audition

One original 72-second composition for Opalframe: slowly blended open chords, soft stereo air, and distant shimmer. No vocals or beat. The user accepted Quiet 01 and authorized site playback on 2026-10-04.

The repository includes the [web loop](../../apps/docs/public/audio/quiet-01.flac),
[measurements](quiet-01-analysis.json), and the procedural source. Production
masters, AAC auditions, and the listening-preview video stay local and are
ignored by Git. The reproduction command below regenerates them.

The original 72-second, 44.1 kHz stereo master has no entrance/exit fades.
Periodic synthesis and circular diffusion preserve the loop boundary. It targets
−29 LUFS with a −12 dBTP ceiling; listening volume depends on the playback device.
The site applies its own start/stop fades.

## Site playback

The shared header has a **Sound off / Sound on** toggle, shown as an icon on narrow screens with the same accessible name. A root-layout [controller](../../apps/docs/lib/ambient-audio.ts) keeps one player across homepage/docs navigation. It creates its AudioContext and fetches the [16-bit stereo FLAC web export](../../apps/docs/public/audio/quiet-01.flac) only after activation. This lossless export is about 2.3 MiB; credits and the license are also [included alongside it](../../apps/docs/public/audio/CREDITS.md).

Web Audio decodes the file once and loops the buffer, avoiding compressed-media playback gaps. Native gain automation gives a 1.2-second entrance and a 120ms mute fade without a JavaScript animation loop. Sound pauses in hidden tabs and recording mode, then resumes from its position on return. Muting stops playback and suspends the audio context. A fresh page opens silently; no saved preference starts playback. Failed loading or playback returns an off state with an accessible retry message. Sound stays independent of theme, reduced motion, and the **Pause artwork** control.

## Source and credits

Authored procedurally for Opalframe with Codex; source, composition, and audio exports are covered by the repository's [MIT license](../../LICENSE), copyright 2026 Opalframe contributors. No external tracks, samples, voices, or recordings are used. The homepage footage is the existing original Opalframe presentation capture. Preserve the license when redistributing.

Reproduce from the repository root with Python 3, NumPy, and ffmpeg on PATH:

```sh
python scripts/audio/render-audition.py
```

The [source](../../scripts/audio/render-audition.py) uses a fixed seed and synthesizes the loop directly; temporary PCM files are removed automatically. It regenerates the listening assets, measurements, and smaller web export. The preview requires `artifacts/presentation/light-response-charcoal.mp4`. The original master/audition files remain outside the docs public directory. No runtime dependency or component registry change is needed.
