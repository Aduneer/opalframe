"""Original Opalframe ribbon, built and lit in Blender. No external assets.

Render: blender --background --factory-startup --python scripts/artwork/render-ribbon.py
The same build_scene() can run through Blender's local MCP bridge.
"""
import bpy
import math
import sys
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]

def build_scene():
    scene = bpy.data.scenes.new("Opalframe — Ribbon Studio")
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 96
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 10
    scene.cycles.transmission_bounces = 8
    scene.cycles.film_transparent_glass = True
    scene.render.resolution_x = 960
    scene.render.resolution_y = 640
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.view_settings.view_transform = 'AgX'
    scene.world = bpy.data.worlds.new("Opalframe studio environment")
    scene.world.use_nodes = True

    # A closed, half-twisted ribbon with a rounded elliptical section.
    # The half-turn seam joins opposite section vertices without a crease.
    verts, faces = [], []
    segments, section = 256, 32
    for i in range(segments):
        u = 2 * math.pi * i / segments
        center = Vector((1.30 * math.cos(u), math.sin(u), .10 * math.sin(2*u)))
        radial = Vector((math.cos(u), math.sin(u), 0))
        upright = Vector((0, 0, 1))
        twist = u / 2 + .22 * math.sin(u)
        wide = radial * math.cos(twist) + upright * math.sin(twist)
        narrow = upright * math.cos(twist) - radial * math.sin(twist)
        width = .21 + .035 * math.cos(2*u)
        for j in range(section):
            v = 2 * math.pi * j / section
            point = center + wide * (width * math.cos(v)) + narrow * (.065 * math.sin(v))
            verts.append(tuple(point))
    for i in range(segments):
        for j in range(section):
            shift = section // 2 if i == segments - 1 else 0
            nxt = (i + 1) % segments
            faces.append((i*section+j, i*section+(j+1)%section,
                          nxt*section+(j+1+shift)%section, nxt*section+(j+shift)%section))
    mesh = bpy.data.meshes.new("Continuous rounded ribbon")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    ribbon = bpy.data.objects.new("Opalframe glass ribbon", mesh)
    scene.collection.objects.link(ribbon)
    ribbon.rotation_euler = (math.radians(12), math.radians(-16), math.radians(8))
    for poly in mesh.polygons:
        poly.use_smooth = True
    material = bpy.data.materials.new("Ice glass with a silver edge")
    material.use_nodes = True
    shader = material.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (.62, .82, 1.0, 1)
    shader.inputs['Metallic'].default_value = .08
    shader.inputs['Roughness'].default_value = .065
    shader.inputs['IOR'].default_value = 1.46
    shader.inputs['Transmission Weight'].default_value = .92
    shader.inputs['Coat Weight'].default_value = .35
    shader.inputs['Coat Roughness'].default_value = .08
    mesh.materials.append(material)

    camera_data = bpy.data.cameras.new("Ribbon portrait camera")
    camera = bpy.data.objects.new("Ribbon portrait camera", camera_data)
    scene.collection.objects.link(camera)
    camera.location = (3.5, -6.0, 4.5)
    camera.rotation_euler = (Vector((0,0,0)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
    camera_data.type = 'ORTHO'
    camera_data.ortho_scale = 3.95
    scene.camera = camera

    def softbox(name, position, energy, size, color, size_y=None):
        data = bpy.data.lights.new(name, 'AREA')
        data.energy, data.color = energy, color
        data.shape = 'RECTANGLE'
        data.size, data.size_y = size, size_y or size
        obj = bpy.data.objects.new(name, data)
        scene.collection.objects.link(obj)
        obj.location = position
        obj.rotation_euler = (-obj.location).to_track_quat('-Z', 'Y').to_euler()
        return obj

    softbox("Porcelain key", (-3,-4,5), 350, 4.0, (1, .97, .93), 2.5)
    softbox("Ice edge", (3,2,3), 500, 3.0, (.74,.87,1), .7)
    softbox("Long white reflection", (-4,1,1), 350, 3.5, (.96,.99,1), .3)
    softbox("Quiet silver fill", (2,-2,-2), 60, 2.5, (.88,.92,1), 1.0)
    return scene

def render(scene):
    output = ROOT / 'artifacts/blender'
    output.mkdir(parents=True, exist_ok=True)
    bpy.context.window.scene = scene
    bg = scene.world.node_tree.nodes.get('Background')
    lights = {obj.name: obj for obj in scene.objects if obj.type == 'LIGHT'}
    original_positions = {name: obj.location.copy() for name, obj in lights.items()}
    reflected_positions = {
        'Porcelain key': (-4, -2, 5),
        'Ice edge': (-3, 2, 3),
        'Long white reflection': (1, -5, 2),
    }
    for theme, color, strength in [
        ('charcoal', (.055,.072,.105,1), .32),
        ('pearl', (.72,.78,.86,1), .7),
    ]:
        bg.inputs['Color'].default_value = color
        bg.inputs['Strength'].default_value = strength
        for variant in ['', '-reflection']:
            if not variant and '--reflections-only' in sys.argv:
                continue
            for name, light in lights.items():
                light.location = reflected_positions.get(name, original_positions[name]) if variant else original_positions[name]
                light.rotation_euler = (-light.location).to_track_quat('-Z', 'Y').to_euler()
            scene.render.filepath = str(output / f'ribbon-{theme}{variant}.png')
            bpy.ops.render.render(write_still=True, scene=scene.name)
    for name, light in lights.items():
        light.location = original_positions[name]
        light.rotation_euler = (-light.location).to_track_quat('-Z', 'Y').to_euler()
    # Save from the background process using the normal file path, not library export.
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(output / 'opalframe-ribbon.blend'))

if __name__ == '__main__':
    scene = build_scene()
    render(scene)
