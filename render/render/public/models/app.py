import bpy
import os

# === Setup Paths ===
input_glb = r"/uploads_files_6392619_Hoodie.glb"  # <-- Replace with your file path
output_dir = r"/output"     # <-- Folder to save images

# === Reset Scene ===
bpy.ops.wm.read_factory_settings(use_empty=True)

# === Import the GLB ===
bpy.ops.import_scene.gltf(filepath=input_glb)

# === Create White Material ===
mat = bpy.data.materials.new(name="WhiteMaterial")
mat.use_nodes = True
bsdf = mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (1, 1, 1, 1)
bsdf.inputs["Roughness"].default_value = 0.7

for obj in bpy.data.objects:
    if obj.type == 'MESH':
        if len(obj.data.materials):
            obj.data.materials[0] = mat
        else:
            obj.data.materials.append(mat)

# === Setup Camera ===
bpy.ops.object.camera_add(location=(0, -3, 1.5))
camera = bpy.context.object
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 2.5
bpy.context.scene.camera = camera

# === Setup Lighting ===
bpy.ops.object.light_add(type='AREA', location=(0, -2, 2))
light = bpy.context.object
light.data.energy = 3000

# === Set Render Settings ===
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.render.image_settings.file_format = 'PNG'
scene.render.film_transparent = True
scene.render.resolution_x = 2048
scene.render.resolution_y = 2048
scene.render.resolution_percentage = 100

# === Define Camera Angles ===
views = {
    "Front": (0, -3, 1.5, (90, 0, 0)),
    "Back":  (0, 3, 1.5, (90, 0, 180)),
    "Left":  (-3, 0, 1.5, (90, 0, 90)),
    "Right": (3, 0, 1.5, (90, 0, -90)),
}

# === Render Each View ===
for name, (x, y, z, rot) in views.items():
    camera.location = (x, y, z)
    camera.rotation_euler = [r * 3.14159 / 180 for r in rot]
    output_path = os.path.join(output_dir, f"Hoodie_{name}.png")
    scene.render.filepath = output_path
    bpy.ops.render.render(write_still=True)
    print(f"Rendered: {output_path}")

print("✅ All hoodie views rendered successfully.")
