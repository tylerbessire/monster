import * as THREE from 'three';
import { overrideToonRim } from '../shaders/toonRimMaterial.js';

export async function runEvolution({
  currentModel,
  loadNextStage,
  scene,
  cameraRig,
  particles,
  rimOptions = { rimColor: 0x88b7ff, rimStrength: 1.2 },
  onSwap = () => {}
}) {
  // glow (emissive-like via shader override)
  overrideToonRim(currentModel, { ...rimOptions, baseColor: 0xffffff });
  // fade out
  await tweenOpacity(currentModel, 1.0, 0.0, 500);
  // camera drama
  cameraRig.dollyTo(currentModel.position.clone().add(new THREE.Vector3(0, 0.15, 0.6)), 0.6);
  cameraRig.shake(0.03, 0.5);
  // swap
  const next = await loadNextStage();
  const model = next.scene || next.scenes?.[0];
  model.position.copy(currentModel.position);
  model.quaternion.copy(currentModel.quaternion);
  scene.remove(currentModel);
  scene.add(model);
  onSwap(model, next.animations || []);
  // fade in
  await tweenOpacity(model, 0.0, 1.0, 600);
  // celebrate
  particles.burst({ position: model.position.clone().add(new THREE.Vector3(0,0.7,0)), color: '#ffd54f' });
  return model;
}

function tweenOpacity(root, from, to, ms) {
  const mats = [];
  root.traverse(o => { if (o.isMesh) { o.material.transparent = true; mats.push(o.material); } });
  mats.forEach(m => m.opacity = from);
  return new Promise(res => {
    const t0 = performance.now();
    function step() {
      const t = (performance.now() - t0) / ms;
      const k = Math.min(1, t);
      const val = from + (to - from) * k;
      mats.forEach(m => m.opacity = val);
      if (k < 1) requestAnimationFrame(step);
      else res();
    }
    requestAnimationFrame(step);
  });
}
