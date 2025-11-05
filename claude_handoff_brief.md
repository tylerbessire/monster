
# Claude Handoff – 3D Companion Evolution (Implementation Brief)

**Goal**: Integrate original GLB models for three evolution stages and upgrade animation/effects pipeline.

## Inputs for Claude
- File paths:
  - `/public/models/companion_baby.glb`
  - `/public/models/companion_teen.glb`
  - `/public/models/companion_adult.glb`
- Animation clip names present in each GLB:
  - idle, breathe, blink, ear_twitch, tail_wag, eat, sleep, play
- Config flags:
  - `ASSET_CONFIG.models.usePlaceholders = false`
  - Shader: `ASSET_CONFIG.shading = { toon: true, rim: true, emissive: '#88b7ff' }`
- Mood map (example):
  ```js
  export const MOODS = {
    happy:   { anim: 'tail_wag', color: '#ffd54f' },
    calm:    { anim: 'breathe',  color: '#90caf9' },
    sleepy:  { anim: 'sleep',    color: '#b39ddb' },
    playful: { anim: 'play',     color: '#ffab91' },
  };
  ```

## Tasks for Claude
1. **Model Loader**: swap placeholder importer with `loadCompanion(stage)` (see snippet).
2. **Animation Controller V2**: fade-blend between mood and action clips; add `update(dt)` hook in render loop.
3. **Evolution Sequence**:
   - timeline: glow → fade out → model swap → fade in → celebration particles
   - camera: slight push-in + shake
   - sound: SFX hooks (eat/play/evolve).
4. **Raycaster Interactions**: hover highlight + click → `happy` bump (hearts).
5. **Toon Shader + Rim Lighting**: implement material override with uniforms for rim intensity; preserve emissive.
6. **Config/Docs**: update `src/3d/README.md` with model specs and testing steps.

## Acceptance
- All three stages render; animations play with names above.
- Mood/actions trigger correct clips and particle colors.
- `usePlaceholders=false` path works without code changes beyond config.
