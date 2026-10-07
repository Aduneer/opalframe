# Opalframe ribbon studio

Original procedural geometry, materials, camera, and studio lights. No downloaded models, textures, or HDR environments. The source and exported artwork follow the repository's MIT license.

The homepage now uses an eight-second diagonal tumble of the original half-twisted ribbon, with a small secondary precession. The geometry turns in three dimensions under the studio lights, so its silhouette and reflections change together. A fixed camera reserves room for every pose. The site plays a small silent native video, combined with the accepted CSS float; no 3D runtime or JavaScript drawing loop is loaded.

```sh
# Blender 5.2 on PATH; video/poster export requires ffmpeg.
# auto prefers OptiX, then CUDA, then CPU; use --device optix to require the GPU.
blender --background --factory-startup --threads 8 --python scripts/artwork/render-ribbon-orbit.py -- --theme charcoal
blender --background --factory-startup --threads 8 --python scripts/artwork/render-ribbon-orbit.py -- --theme pearl
node scripts/artwork/export-ribbon-orbit.mjs

# Inspect eight representative GPU poses without changing the export frames.
blender --background --factory-startup --threads 8 --python scripts/artwork/render-ribbon-orbit.py -- --theme charcoal --device optix --preview

# Resume an interrupted render with the same geometry, lighting, and frame count.
blender --background --factory-startup --threads 8 --python scripts/artwork/render-ribbon-orbit.py -- --theme charcoal --resume
```

Each loop has 192 frames at 24fps, rendered at 480×320. The live site fetches only its active theme while motion is enabled and the object is in view. Native playback and the float pause together on keyboard/touch pause, off-screen, hidden-tab, and window-blur events. Reduced motion never fetches the video and uses the alpha-preserving first-frame WebP. Failed media also leaves the still visible. Native VP9 alpha WebM preserves the transparent hole and translucent edges throughout the rotation; no matte or blend mode is used. A one-time alpha probe keeps the transparent still visible if a decoder accepts the video but drops its alpha channel. The loops are approximately 1,029 KiB (Charcoal) and 901 KiB (Pearl).

The initial full passes finished on CPU during GPU discovery and were reused. An eight-pose OptiX render was then verified on the RTX 3060 Laptop GPU; the script now prefers the available GPU, and both saved orbit scenes request GPU Compute. A future full rerender uses that configuration automatically. Original still/light studies remain reproducible separately:

```sh
# Python export requires Pillow.
blender --background --factory-startup --threads 8 --python scripts/artwork/render-ribbon.py
python scripts/artwork/export-ribbon.py
```

The scripts generate scenes and original renders in ignored `artifacts/blender/`; these production files are not included in the repository. Rebuild them with the commands above. Ready-to-use web exports live in `apps/docs/public/artwork/`. Rendering runs in a separate Blender process. Scene saving uses the normal file operation: scene-library export crashed the local Blender 5.2 build and is deliberately avoided.

The live studio was authored through the running Blender bridge. After generating the still scene, open `artifacts/blender/opalframe-ribbon.blend` and select **Opalframe — Ribbon Studio**. The orbit scenes are `opalframe-ribbon-orbit-charcoal.blend` and `opalframe-ribbon-orbit-pearl.blend`. Raw orbit frames/previews live in ignored `artifacts/blender/.orbit/`. Changing geometry or materials requires regenerating both theme loops and posters, then visually reviewing the exports. Ambient motion runs only while the artwork is visible and the window is active. The pause button freezes both float and rotation; reduced motion uses the first-frame still in each theme.
