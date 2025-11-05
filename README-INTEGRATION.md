# Companion 3D Modules – Integration Guide

Place files as:

```
src/
  3d/
    shaders/toonRimMaterial.js
    interactions/raycasterInteractions.js
    effects/particles.js
    camera/cameraRig.js
    evolution/evolutionTimeline.js
    testHarness.js
public/
  testHarness.html
```

## 1) Toon + Rim Shader
```js
import { overrideToonRim } from './shaders/toonRimMaterial.js';
overrideToonRim(gltf.scene, { baseColor: 0xffd54f, rimColor: 0x88b7ff, rimStrength: 1.1 });
```

## 2) Raycaster Hover/Click
```js
const ray = new RaycasterInteractions(camera, scene, renderer.domElement, {
  onClick: (obj) => particles.burst({ position: obj.position, color: '#ff6ea0' }),
  onHover: (obj) => document.body.style.cursor = obj ? 'pointer' : 'default'
});
```

## 3) Evolution Timeline
```js
import { runEvolution } from './evolution/evolutionTimeline.js';
const nextModel = await runEvolution({
  currentModel: model,
  loadNextStage: async () => await loadCompanion('teen'),
  scene, cameraRig, particles,
  onSwap: (model, clips) => animController.setClips(clips)
});
```

## 4) Particles
```js
const particles = new ParticlePool({ max: 256 });
particles.attachTo(scene);
function tick(dt){ particles.update(dt); }
```

## 5) Camera Rig
```js
const cameraRig = new CameraRig(camera);
cameraRig.dollyTo(new THREE.Vector3(0,0.2,1.6), 0.8);
cameraRig.shake(0.03, 0.5);
```

### Config Snippet
```js
export const ASSET_CONFIG = {
  models: { usePlaceholders: false },
  shading: { toon: true, rim: true, rimColor: '#88b7ff', rimStrength: 1.1 },
  moods: {
    happy:   { anim: 'tail_wag', color: '#ffd54f' },
    calm:    { anim: 'breathe',  color: '#90caf9' },
    sleepy:  { anim: 'sleep',    color: '#b39ddb' },
    playful: { anim: 'play',     color: '#ffab91' }
  }
};
```

### Acceptance Checklist
- Three GLBs load (baby/teen/adult) with required animation names.
- `usePlaceholders=false` path works by only changing config.
- Hover highlights work; click triggers particle hearts.
- Evolution timeline: glow → fade → swap → fade → celebration.
- Shader override keeps emissive while applying toon+rim.
