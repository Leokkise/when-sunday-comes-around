"""Render approved character drawings into the game's shot and walking atlases."""
from pathlib import Path
import json
import subprocess
import shutil
import bpy

root = Path(__file__).resolve().parents[2]
source = root / 'art-source/basketball'
output = root / '.cache/basketball'
subprocess.run(['node', 'scripts/basketball/prepare-frames.mjs'], cwd=root, check=True)
poses = json.loads((output / 'poses.json').read_text())
bpy.ops.wm.read_factory_settings(use_empty=True)
shot = bpy.context.scene
shot.name = 'Basketball shot'
walk = bpy.data.scenes.new('Basketball walk')


def build_scene(scene, drawings, ticks, fps):
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = poses['width']
    scene.render.resolution_y = poses['height']
    scene.render.film_transparent = True
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.fps = fps
    scene.frame_end = ticks[-1] + 4
    scene.view_settings.view_transform = 'Standard'
    camera_data = bpy.data.cameras.new(scene.name + ' Camera')
    camera = bpy.data.objects.new(camera_data.name, camera_data)
    scene.collection.objects.link(camera)
    camera.location.z = 5
    camera_data.type = 'ORTHO'
    camera_data.ortho_scale = 1
    scene.camera = camera
    for pose, tick in zip(drawings, ticks):
        name = pose['name']
        mesh = bpy.data.meshes.new(name)
        mesh.from_pydata([(-1/3, -.5, 0), (1/3, -.5, 0), (1/3, .5, 0), (-1/3, .5, 0)],
                         [], [(0, 1, 2, 3)])
        uv = mesh.uv_layers.new()
        for loop, point in zip(uv.data, [(0, 0), (1, 0), (1, 1), (0, 1)]):
            loop.uv = point
        obj = bpy.data.objects.new(name, mesh)
        scene.collection.objects.link(obj)
        material = bpy.data.materials.new(name)
        material.use_nodes = True
        nodes = material.node_tree.nodes
        nodes.clear()
        texture = nodes.new('ShaderNodeTexImage')
        texture.image = bpy.data.images.load(str(output / f'source-{name}.png'))
        texture.image.pack()
        emission = nodes.new('ShaderNodeEmission')
        transparent = nodes.new('ShaderNodeBsdfTransparent')
        mix = nodes.new('ShaderNodeMixShader')
        surface = nodes.new('ShaderNodeOutputMaterial')
        links = material.node_tree.links
        links.new(texture.outputs['Color'], emission.inputs['Color'])
        links.new(texture.outputs['Alpha'], mix.inputs[0])
        links.new(transparent.outputs[0], mix.inputs[1])
        links.new(emission.outputs[0], mix.inputs[2])
        links.new(mix.outputs[0], surface.inputs['Surface'])
        mesh.materials.append(material)
        for frame in ticks:
            obj.hide_render = obj.hide_viewport = frame != tick
            obj.keyframe_insert('hide_render', frame=frame)
            obj.keyframe_insert('hide_viewport', frame=frame)
        scene.timeline_markers.new(name, frame=tick)
    scene.frame_set(1)


shot_ticks = [1, 9, 19, 26, 32, 49]
walk_ticks = list(range(1, 30, 4))
build_scene(shot, poses['shot'], shot_ticks, 120)
build_scene(walk, poses['walk'], walk_ticks, 60)
for scene, label, ticks in [(shot, 'shot', shot_ticks), (walk, 'walk', walk_ticks)]:
    bpy.context.window.scene = scene
    for index, tick in enumerate(ticks):
        scene.frame_set(tick)
        scene.render.filepath = str(output / f'{label}-{index}.png')
        bpy.ops.render.render(write_still=True)
subprocess.run(['node', 'scripts/basketball/export-sprites.mjs',
                json.dumps({'shot': shot_ticks, 'walk': walk_ticks, 'keys': shot_ticks})],
               cwd=root, check=True)
# Render files are reproducible intermediates, never retained as source copies.
if output.resolve() == (root / '.cache/basketball').resolve():
    shutil.rmtree(output)
