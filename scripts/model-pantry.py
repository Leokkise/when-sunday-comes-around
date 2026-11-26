"""Run with Blender --background --factory-startup --python scripts/model-pantry.py."""
from pathlib import Path
from math import sin, cos, pi, sqrt, radians
import bpy
import numpy as np

root = Path(__file__).resolve().parents[1]
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

def painted(name):
    image = bpy.data.images.load(str(root / 'art-source' / 'pantry-textures' / (name + '.webp')))
    material = bpy.data.materials.new('Pencil on paper - ' + name)
    material.use_nodes = True
    shader = next(n for n in material.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    shader.inputs['Roughness'].default_value = 1
    tex = material.node_tree.nodes.new('ShaderNodeTexImage')
    tex.image = image
    material.node_tree.links.new(tex.outputs['Color'], shader.inputs['Base Color'])
    material.node_tree.links.new(tex.outputs['Alpha'], shader.inputs['Alpha'])
    return material, image

def mesh(name, vertices, faces, uvs, material):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.update()
    layer = data.uv_layers.new()
    for loop in data.loops:
        layer.data[loop.index].uv = uvs[loop.vertex_index]
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    data.materials.append(material)
    return obj

# Dimensions are approximate centimetres for a serving or one illustrated item.
def silhouette(pixels,w,h,tile,width,depth):
    def occupied(x,y):
        return pixels[(min(h-1,y)*w+tile*384+min(383,x))*4+3] > .45
    step = 3
    cells = {(x,y) for x in range(0,384-step,step) for y in range(0,h-step,step)
             if occupied(x+step//2,y+step//2)}
    xmin=min(x for x,y in cells); xmax=max(x for x,y in cells)+step
    ymin=min(y for x,y in cells)
    unit=width/(xmax-xmin)
    verts=[]; faces=[]; uv=[]; indices={}
    # Measure inward distance on the silhouette, rounding the front and back.
    rings={}; inner=cells.copy(); level=0
    while inner:
        edge={p for p in inner if any((p[0]+dx,p[1]+dy) not in inner for dx,dy in [(step,0),(-step,0),(0,step),(0,-step)])}
        for p in edge: rings[p]=level
        inner-=edge
        level+=1
    def vert(x,y,side):
        key=(x,y,side)
        if key not in indices:
            r=min(rings.get((x+dx,y+dy),0) for dx in [-step,0] for dy in [-step,0])
            bulge=sqrt(min(1,r/max(1,level-1)))
            indices[key]=len(verts)
            verts.append(((x-(xmin+xmax)/2)*unit,side*depth*(.012+.488*bulge),(y-ymin)*unit))
            uv.append(((tile*384+x)/w,y/h))
        return indices[key]
    for x,y in sorted(cells):
        corners=[(x,y),(x+step,y),(x+step,y+step),(x,y+step)]
        a=[vert(*p,-1) for p in corners]; b=[vert(*p,1) for p in corners]
        faces.extend([a,b[::-1]])
        for i,adj in enumerate([(0,-step),(step,0),(0,step),(-step,0)]):
            if (x+adj[0],y+adj[1]) not in cells:
                j=(i+1)%4
                faces.append([a[j],a[i],b[i],b[j]])
    return verts,faces,uv

# Kenney Food Kit (CC0), https://kenney.nl/assets/food-kit.
# Measure each reference along its principal axes so its authoring pose is irrelevant.
def axes_and_span(points):
    centered=points-points.mean(axis=0)
    _,axes=np.linalg.eigh(centered.T @ centered)
    return axes,np.ptp(centered @ axes,axis=0)

reference={}
for source in (root/'art-source'/'food-kit').glob('*.obj'):
    points=np.array([line.split()[1:4] for line in source.read_text().splitlines()
                     if line.startswith('v ')],dtype=float)
    _,span=axes_and_span(points)
    reference[source.stem]=span/span[-1]

def adapt_proportions(verts,source):
    points=np.asarray(verts)
    center=points.mean(axis=0)
    axes,span=axes_and_span(points)
    # Preserve the painted silhouette while giving each object its reference thickness.
    ratios=np.clip(reference[source]*span[-1]/span,.72,1.70)
    return (((points-center) @ axes)*(1+.72*(ratios-1))) @ axes.T + center

for name,width,depth in [('rice',15,11),('pandesal',13,7),('eggs',9,4.5),('fish',19,4),
                         ('apple',8.5,7),('carrot',15,4),('candy',8,3),('chips',13,5)]:
    if name=='carrot':
        mat=bpy.data.materials.new('Carrot pigment')
        mat.use_nodes=True
        ink=mat.node_tree.nodes.new('ShaderNodeVertexColor')
        ink.layer_name='Pigment'
        mat.node_tree.links.new(ink.outputs[0],next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED').inputs['Base Color'])
        for variant in range(3):
            points=[];faces=[];tones=[]
            for j in range(2):
                q=(variant+j)%3
                length=[11.8,10.6,12.5][q]; thick=[1.6,1.75,1.43][q]
                shade=[(.90,.33,.09),(.94,.48,.14),(.83,.23,.085)][q]
                def point(along,across,height,col):
                    angle=radians(42+j*4)
                    x=along*cos(angle)-across*sin(angle)+(j-.5)*4.3
                    y=along*sin(angle)+across*cos(angle)-(j-.5)*2.8
                    pitch=-1.08
                    points.append((x,y*cos(pitch)+height*sin(pitch),-y*sin(pitch)+height*cos(pitch)))
                    tones.append(col)
                for k in range(30):
                    t=k/29
                    radius=thick*(.025+.975*t**.72)*min(1,((1-t)/.105)**.5)
                    for h in range(32):
                        a=2*pi*h/32
                        groove=.84 if k in [9,18,23] and sin(a+k)>.60 else 1
                        point((t-.6)*length,radius*cos(a)+.18*(1-t)**2,radius*(1+sin(a)),tuple(c*groove for c in shade))
                        n=len(points)-1
                        if k:faces.append((n-h+(h+1)%32-32,n-32,n,n-h+(h+1)%32))
                for branch in range(5):
                    spread=(branch-2)*.55
                    def herb(t,offset,h):
                        point(.39*length+t*(3.4+.35*(branch%2)),spread*t+offset,thick+.45*t+h,(.19,.33+.025*branch,.09))
                    n=len(points)
                    for t in (0,1):herb(t,-.06,0);herb(t,.06,0)
                    faces.append((n,n+1,n+3,n+2))
                    for t in (.32,.53,.72,.89):
                        for side in (-1,1):
                            n=len(points)
                            for dt,off,h in [(0,0,0),(.06,.23,.12),(.22,.55,.18),(.13,.14,.07)]:
                                herb(t+dt,side*off,h)
                            faces.append((n,n+1,n+2,n+3))
            obj=mesh(name if variant==0 else name+'_v'+str(variant+1),points,faces,[(0,0)]*len(points),mat)
            layer=obj.data.color_attributes.new(name='Pigment',type='FLOAT_COLOR',domain='POINT')
            for entry,tone in zip(layer.data,tones):entry.color=(*tone,1)
            for f in obj.data.polygons:f.use_smooth=True
        continue
    if name=='apple':
        mat=bpy.data.materials.new('Apple skin and leaf')
        mat.use_nodes=True
        nodes=mat.node_tree.nodes
        color=nodes.new('ShaderNodeVertexColor')
        color.layer_name='Pigment'
        mat.node_tree.links.new(color.outputs['Color'],next(n for n in nodes if n.type=='BSDF_PRINCIPLED').inputs['Base Color'])
        for variant in range(3):
            points=[];faces=[];tones=[]
            for j in range(2):
                cx=(-4.3,4.0)[j]; size=(1,.83)[j]
                pigment=[(.64,.17,.12),(.52,.61,.21),(.86,.53,.16)][(variant+j)%3]
                for row in range(25):
                    t=pi*row/24
                    for col in range(49):
                        a=2*pi*col/48
                        radius=3.95*sin(t)*(1+.12*cos(t))*(1+.025*cos(5*a))
                        z=3.52+3.6*cos(t)-1.00*max(0,cos(t))**12+.45*max(0,-cos(t))**12
                        points.append((cx+size*radius*cos(a),j+size*radius*sin(a),size*z))
                        tones.append(tuple(v*(.91+.09*sin(3*a+t)) for v in pigment))
                        n=len(points)-1
                        if row and col:faces.append((n-50,n-1,n,n-49))
                start=len(points)
                for k in range(2):
                    for h in range(8):
                        a=h*pi/4
                        points.append((cx+size*(.18*cos(a)+.28*k),j+size*.18*sin(a),size*(6+1.43*k)))
                        tones.append((.20,.11,.055))
                for h in range(8):faces.append((start+h,start+(h+1)%8,start+8+(h+1)%8,start+8+h))
                n=len(points)
                for x,y,z in [(0,0,7.1),(.87,-.38,7.28),(2.1,0,7.85),(.85,.51,7.52),(.97,0,7.53)]:
                    points.append((cx+x*size,j+y*size,z*size));tones.append((.22,.34,.14))
                for h in range(4):faces.append((n+h,n+(h+1)%4,n+4))
            fruit=mesh(name if variant==0 else name+'_v'+str(variant+1),points,faces,[(0,0)]*len(points),mat)
            layer=fruit.data.color_attributes.new(name='Pigment',type='FLOAT_COLOR',domain='POINT')
            for entry,tone in zip(layer.data,tones):entry.color=(*tone,1)
            for f in fruit.data.polygons:f.use_smooth=True
        continue
    if name=='eggs':
        shell,_=painted('egg-shell')
        for variant in range(3):
            verts=[];faces=[];uv=[]
            for j in range(2):
                start=len(verts)
                lean=radians(-53 if j==0 else 62)
                body=[]
                for row in range(25):
                    t=pi*row/24
                    radius=(3.18*reference["egg"][1])*sin(t)*(1-.18*cos(t))
                    for col in range(41):
                        a=2*pi*col/40
                        x=radius*cos(a); z=3.18*cos(t)
                        body.append((x*cos(lean)+z*sin(lean),radius*sin(a),z*cos(lean)-x*sin(lean)))
                        uv.append((((variant+j)%3+.02+.96*col/40)/3,row/24))
                        n=start+row*41+col
                        if row and col: faces.append((n-42,n-1,n,n-41))
                floor=min(z for x,y,z in body)
                verts.extend((x+(j-.5)*5.8,y+(j-.5)*1.6,z-floor) for x,y,z in body)
            egg=mesh('eggs' if variant==0 else 'eggs_v'+str(variant+1),verts,faces,uv,shell)
            for face in egg.data.polygons: face.use_smooth=True
        continue
    mat,img = painted(name)
    w,h = img.size
    pixels = list(img.pixels[:])
    # One pickup can contain several pieces. Bake the arrangement into one rigid mesh.
    # Coordinates are centimetres in the pickup's illustrated front view.
    bundles = {
        'rice':[(-4,0,0,-3),(4,1,0,4),(0,3,3,0)],
        'pandesal':[(-4,0,0,-3),(4,1,0,4),(0,3,3,0)],
        'eggs':[(-3,0,0,-8),(3,1,0,8),(0,3,2,0)],
        'fish':[(-.6,0,0,-3),(1.4,.8,4.4,4),(-1,1.4,7,-6)],
        'apple':[(-3.65,1,0,-5),(3.65,-1,0,6),(0,4,1,-8)],
        'carrot':[(-3.0,0,0,-8),(.1,.9,1.1,1),(3.5,-.5,.3,8)],
        'candy':[(-3.6,0,0,-9),(3.8,0,1.4,11),(0,1,4.9,-3)],
        'chips':[(-1.6,.8,1.7,-9),(2.3,-1.5,0,8),(0,2.4,3,2)],
    }
    individual=name in ('rice','eggs','pandesal')
    pieces=[(0,0,0,0)] if individual else bundles[name]
    for variant in range(3):
        points=[]; polys=[]; coords=[]
        layouts=[]
        for i,(dx,dy,dz,degrees) in enumerate(pieces[:2]):
            tile=(variant+i)%(w//384)
            size=[1.0,.75,.88][i]
            verts,faces,uv=silhouette(pixels,w,h,tile,width*size,depth*size)
            source={"rice":"bowl-cereal","pandesal":"bread","candy":"candy-bar-wrapper","chips":"bag"}.get(name,name)
            if name != "fish":
                verts=adapt_proportions(verts,source)
            angle=radians(degrees)
            pitch={'fish':-.78,'carrot':-1.08,'candy':-1.1,'chips':-.77}.get(name,0)
            yaw=radians(7 if i else -5)
            ground=[]
            for x,y,z in verts:
                yy=y*cos(pitch)-z*sin(pitch)
                zz=y*sin(pitch)+z*cos(pitch)
                ground.append((x*cos(yaw)-yy*sin(yaw),x*sin(yaw)+yy*cos(yaw),zz))
            if name=='carrot':
                # Lay diagonal roots along a common axis before spacing their widths.
                theta=radians(43)
                ground=[(x*cos(theta)-y*sin(theta),x*sin(theta)+y*cos(theta),z) for x,y,z in ground]
            layouts.append((ground,faces,uv))
        # Separate the footprints on the table, then transform back to the prop's local axes.
        axis=1 if name=='candy' else 0
        widths=[max(p[axis] for p in g)-min(p[axis] for p in g) for g,_,_ in layouts]
        cursor=-(sum(widths)+.85*(len(widths)-1))/2
        for i,(ground,faces,uv) in enumerate(layouts):
            shift=cursor-min(p[axis] for p in ground)
            bottom=min(p[2] for p in ground)
            offset=len(points)
            for x,y,z in ground:
                x+=shift if axis==0 else 0
                y+=shift if axis==1 else 0
                if name=='carrot':
                    x,y=x*cos(theta)+y*sin(theta),-x*sin(theta)+y*cos(theta)
                z-=bottom
                points.append((1.22*x,1.22*(y*cos(pitch)+z*sin(pitch)),1.22*(-y*sin(pitch)+z*cos(pitch))))
            polys.extend(tuple(offset+j for j in face) for face in faces)
            coords.extend(uv)
            cursor+=widths[i]+.85
        item=mesh(name if variant==0 else name+"_v"+str(variant+1),points,polys,coords,mat)
        bpy.context.view_layer.objects.active=item
        simplify=item.modifiers.new('Preserve silhouette','DECIMATE')
        simplify.ratio=.19
        bpy.ops.object.modifier_apply(modifier=simplify.name)

# Shallow painted lunch trays with a low front rail and a taller backboard.
# Individual box faces get a paper texture and pencil-dark edge strips.
mat, _ = painted('tray-paper')
verts=[]; faces=[]; uv=[]; tints=[]
def panel(x,y,z,w,d,h,tint):
    corners=[(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),
             (-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]
    coords=[(x+a*w/2,y+b*d/2,z+c*h/2) for a,b,c in corners]
    for face in [(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]:
        j=len(verts)
        verts.extend((coords[i][0]*(1-.007*coords[i][1]),coords[i][1],coords[i][2]) for i in face)
        uv.extend([(0,0),(1,0),(1,1),(0,1)])
        faces.append((j,j+1,j+2,j+3))
        tints.extend([tint]*4)
panel(0,0,.4,26,25,.8,(.92,.88,.78))
panel(0,12,4.1,26,1,8.2,(.79,.77,.69))
panel(0,-12,1.8,26,1,3.6,(.72,.68,.60))
for x in [-12.5,12.5]:
    panel(x,0,2.55,1,24,5.1,(.82,.79,.72))
    panel(x,0,5.15,1.02,24,.10,(.27,.22,.17))
for y,z in [(-12,3.65),(12,8.25)]:
    panel(0,y,z,26,1.02,.10,(.29,.24,.18))
tray=mesh('basket',verts,faces,uv,mat)
colors=tray.data.color_attributes.new(name='Pencil shading',type='FLOAT_COLOR',domain='POINT')
for value,tint in zip(colors.data,tints): value.color=(*tint,1)
for obj in bpy.context.selected_objects: obj.select_set(False)
# Editable art masters sit side by side in the source.
for i,obj in enumerate(bpy.context.scene.objects):
    obj.location.x=i*36
bpy.ops.file.pack_all()
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(root/'art-source'/'pantry-props.blend'))

