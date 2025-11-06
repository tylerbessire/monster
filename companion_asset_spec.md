
# Companion Creature – Original 3D Asset Spec (Technical Contract)

**Purpose**: Build an *original* electric–fire hybrid companion (no copyrighted likeness), to drop into a Three.js evolution system with GLB assets and named animations.

## 1) Deliverables
- Format: **GLB** (GLTF binary), one file per stage: `companion_baby.glb`, `companion_teen.glb`, `companion_adult.glb`
- Triangle Budget: **≤ 5,000** per stage (target 2–4k for Baby/Teen; ≤5k Adult)
- Materials: **PBR** or **Toon** (no baked lighting), single material preferred; up to 2 if necessary
- Textures (optional): BaseColor, Roughness, Metallic, Normal, Emissive (512–1k; keep atlas to 1 sheet if used)
- UVs: Non-overlapping, single UDIM
- Scale: 1 unit ≈ 1 meter; model centered at origin, Y-up, Z-forward
- Pivot: at feet/ground contact
- Naming: no copyrighted names; use `companion_*`

## 2) Animation Set (clips must be separate GLTF animations)
Required clip names (case-sensitive):
- `idle`
- `breathe`
- `blink`
- `ear_twitch` (or `fin_twitch`/`wing_twitch` depending on design)
- `tail_wag` (or `tail_flick`)
- `eat`
- `sleep`
- `play`
Optional:
- `evolve_pose_in` (hold)
- `evolve_pose_out` (hold)

Each clip: 1–3s loopable where relevant; baked at 24–30 FPS; root motion OFF.

## 3) Topology & Rig
- Clean quads preferred; support deformations at shoulders/hips/neck/tail/wings/ears
- Armature: single root; minimal bones for performance (15–35 total typical)
- Constraints okay but keep simple; apply transforms/freeze
- No shape keys required (optional for blink/mouth if desired); if used, export-friendly to GLTF

## 4) Look & Style (original)
- **Low–mid poly, cel-shaded friendly**
- **Golden + blue energy accents** (emissive map or material slot)
- **Small wings + tail flame** (stylized, not derivative)
- Distinct silhouette progression:
  - **Baby**: chubby, big eyes, tiny wings, ember tail tip
  - **Teen**: sleeker, defined tail flame, winglets, small horn/spike accents
  - **Adult**: elegant, larger wings, strong tail flame, regal crest
- Avoid any shapes/marks that resemble existing IP

## 5) File/Folder Layout
```
public/models/
  companion_baby.glb
  companion_teen.glb
  companion_adult.glb
public/textures/ (optional)
  companion_atlas.png
```

## 6) Technical QA Checklist
- Opens in Blender and three.js GLTFLoader without errors
- All animations visible under `animations[]` with names above
- No missing textures; emissive color present if specified
- Proper scale/origin; no flipped normals; tangents okay

