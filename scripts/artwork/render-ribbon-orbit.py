"""Render the original ribbon tumbling around a diagonal axis, without a web 3D runtime.

Blender: --background --factory-startup --threads 8 --python this-file -- [options]
Frames have alpha; export-ribbon-orbit.mjs composites them into video mattes.
"""
import argparse
import importlib.util
import math
import sys
from pathlib import Path

import bpy
from mathutils import Quaternion, Vector

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('ribbon_studio', ROOT / 'scripts/artwork/render-ribbon.py')
studio = importlib.util.module_from_spec(spec)
spec.loader.exec_module(studio)

options = argparse.ArgumentParser()
options.add_argument('--theme', choices=['charcoal', 'pearl'], default='charcoal')
options.add_argument('--preview', action='store_true')
options.add_argument('--resume', action='store_true')
options.add_argument('--device', choices=['auto', 'cpu', 'optix', 'cuda'], default='auto')
options.add_argument('--frames', type=int, default=192)
args = options.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])

scene = studio.build_scene()
scene.name = f'Opalframe — Ribbon Orbit ({args.theme})'
bpy.context.window.scene = scene
scene.render.resolution_x = 480
scene.render.resolution_y = 320
scene.render.fps = 24
scene.render.use_persistent_data = True
scene.cycles.samples = 24
# Prefer the available NVIDIA GPU; an explicit backend must not silently use CPU.
preferences = bpy.context.preferences.addons['cycles'].preferences
backends = ['OPTIX', 'CUDA'] if args.device == 'auto' else [args.device.upper()]
gpu = None
if args.device != 'cpu':
    for backend in backends:
        try:
            preferences.compute_device_type = backend
            preferences.refresh_devices()
            devices = [device for device in preferences.devices if device.type == backend]
            if devices:
                for device in preferences.devices:
                    device.use = device.type == backend
                gpu = backend
                break
        except (TypeError, RuntimeError):
            continue
if not gpu and args.device not in ['auto', 'cpu']:
    raise RuntimeError(f'Requested GPU backend is unavailable: {args.device}')
scene.cycles.device = 'GPU' if gpu else 'CPU'
print(f'ORBIT_DEVICE {gpu or "CPU"}', flush=True)
ribbon = scene.objects['Opalframe glass ribbon']
base_rotation = ribbon.rotation_euler.to_quaternion()
ribbon.rotation_mode = 'QUATERNION'
axis = Vector((1, .65, .5)).normalized()

# A diagonal revolution and a small precession return continuously to the opening pose.
def rotation_at(frame):
    angle = 2 * math.pi * frame / args.frames
    precession = Quaternion(Vector((0, 0, 1)), math.radians(12) * math.sin(angle))
    return precession @ Quaternion(axis, angle) @ base_rotation

# Reserve room for every pose; keep the camera fixed throughout the loop.
camera_inverse = scene.camera.rotation_euler.to_quaternion().inverted()
max_x = max_y = 0
for frame in range(args.frames):
    orientation = camera_inverse @ rotation_at(frame)
    for vertex in ribbon.data.vertices:
        projected = orientation @ vertex.co
        max_x = max(max_x, abs(projected.x))
        max_y = max(max_y, abs(projected.y))
scene.camera.data.ortho_scale = max(3.95, max_x * 2 / .86, max_y * 3 / .86)

world = scene.world.node_tree.nodes.get('Background')
world.inputs['Color'].default_value = (.055, .072, .105, 1) if args.theme == 'charcoal' else (.72, .78, .86, 1)
world.inputs['Strength'].default_value = .32 if args.theme == 'charcoal' else .7
output = ROOT / f'artifacts/blender/.orbit/{args.theme}'
if args.preview:
    output = output / 'preview'
output.mkdir(parents=True, exist_ok=True)
scene.frame_start, scene.frame_end = 1, args.frames
for frame in range(args.frames + 1):
    ribbon.rotation_quaternion = rotation_at(frame)
    ribbon.keyframe_insert(data_path='rotation_quaternion', frame=frame + 1)
scene.frame_set(1)
bpy.context.preferences.filepaths.save_version = 0
if not args.preview:
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / f'artifacts/blender/opalframe-ribbon-orbit-{args.theme}.blend'))
for frame in (range(0, args.frames, args.frames // 8) if args.preview else range(args.frames)):
    target = output / f'{frame:04d}.png'
    if args.resume and target.exists() and target.stat().st_size >= 12:
        with target.open('rb') as image:
            image.seek(-12, 2)
            if image.read() == b'\x00\x00\x00\x00IEND\xaeB`\x82':
                continue
    scene.frame_set(frame + 1)
    scene.render.filepath = str(target)
    bpy.ops.render.render(write_still=True, scene=scene.name)
    print(f'ORBIT_FRAME {args.theme} {frame + 1}/{args.frames}', flush=True)
