
"""
Blender 3.6+ script: standardize animation clips and export GLB.
Usage: in Blender's Scripting tab, set OUTPUT_DIR, run script.
"""
import bpy, os

OUTPUT_DIR = "//exports"  # relative to .blend; change if needed
FILENAME   = "companion_STAGE.glb"  # replace STAGE with baby/teen/adult

# Ensure animation clips exist with required names (rename if needed)
REQUIRED = ["idle","breathe","blink","ear_twitch","tail_wag","eat","sleep","play"]

def ensure_nla_strips():
    # Optional: move actions to NLA for export; here we just assert they exist
    existing = [a.name for a in bpy.data.actions]
    missing = [n for n in REQUIRED if n not in existing]
    if missing:
        print("WARNING: Missing actions:", missing)

def export_glb():
    os.makedirs(bpy.path.abspath(OUTPUT_DIR), exist_ok=True)
    out_path = os.path.join(bpy.path.abspath(OUTPUT_DIR), FILENAME)
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format='GLB',
        export_yup=True,
        export_apply=True,
        export_skins=True,
        export_animations=True,
        export_morph=True,
        export_nla_strips=False,
        export_optimize_animation_size=True,
        export_texcoords=True,
        export_normals=True,
        export_tangents=True,
        export_materials='EXPORT',
        use_selection=False,
    )
    print("Exported:", out_path)

ensure_nla_strips()
export_glb()
