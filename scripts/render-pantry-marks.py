"""Render the hand-inked success and retry marks in an isolated Blender scene."""
from pathlib import Path
import math
import bpy
out=Path(__file__).resolve().parents[1]/'assets'/'pantry'
s=bpy.context.scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()
s.render.engine='CYCLES'
s.cycles.samples=4
s.view_settings.view_transform='Standard'
s.render.film_transparent=True
s.render.resolution_x=s.render.resolution_y=96
s.render.resolution_percentage=100
s.render.image_settings.file_format='WEBP'
s.render.image_settings.color_mode='RGBA'
s.render.image_settings.quality=96
bpy.ops.object.camera_add(location=(0,0,4))
s.camera=bpy.context.object
s.camera.data.type='ORTHO'
s.camera.data.ortho_scale=2.35
def cutout(name,points,rgb,z):
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata([(x,y,z) for x,y in points],[],[tuple(range(len(points)))])
    obj=bpy.data.objects.new(name,mesh)
    s.collection.objects.link(obj)
    mat=bpy.data.materials.new(name)
    mat.use_nodes=True
    e=mat.node_tree.nodes.new('ShaderNodeEmission')
    e.inputs[0].default_value=(*rgb,1)
    mat.node_tree.links.new(e.outputs[0],next(n for n in mat.node_tree.nodes if n.type=='OUTPUT_MATERIAL').inputs[0])
    mesh.materials.append(mat)
    return obj
for name,points,color in [
    ('right-mark',[(0,1),(.20,.24),(.85,0),(.23,-.18),(0,-1),(-.2,-.20),(-.86,0),(-.19,.22)],(1,.66,.22)),
    ('retry-mark',[(-.8,.48),(-.50,.79),(.02,-.03),(.32,.29),(.8,-.54),(.54,-.73),(.26,-.17),(-.10,-.45)],(.81,.37,.19))]:
    border=cutout(name+' ink',points,(.24,.14,.07),0)
    fill=cutout(name+' color',[(.81*x,.81*y) for x,y in points],color,.02)
    s.render.filepath=str(out/(name+'.webp'))
    bpy.ops.render.render(write_still=True)
    border.hide_render=fill.hide_render=True
