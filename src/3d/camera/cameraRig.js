import * as THREE from 'three';

export class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.basePos = camera.position.clone();
    this.shakeT = 0;
  }
  dollyTo(targetPos, duration = 0.8) {
    this.start = performance.now() / 1000;
    this.duration = duration;
    this.from = this.camera.position.clone();
    this.to = targetPos.clone();
    this.dollyActive = true;
  }
  shake(intensity = 0.02, time = 0.4) {
    this.shakeT = time;
    this.shakeI = intensity;
  }
  update(dt) {
    if (this.dollyActive) {
      const t = (performance.now() / 1000 - this.start) / this.duration;
      const k = Math.min(1, t);
      this.camera.position.lerpVectors(this.from, this.to, k);
      if (k >= 1) this.dollyActive = false;
    }
    if (this.shakeT > 0) {
      this.shakeT -= dt;
      this.camera.position.x += (Math.random()-0.5) * this.shakeI;
      this.camera.position.y += (Math.random()-0.5) * this.shakeI;
    }
  }
}
