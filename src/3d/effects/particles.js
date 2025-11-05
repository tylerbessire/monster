import * as THREE from 'three';

export class ParticlePool {
  constructor({ max = 128 } = {}) {
    this.pool = [];
    this.alive = [];
    const geo = new THREE.PlaneGeometry(0.15, 0.15);
    const mat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 1 });
    for (let i = 0; i < max; i++) {
      const m = new THREE.Mesh(geo, mat.clone());
      m.visible = false;
      m.renderOrder = 999;
      this.pool.push(m);
    }
  }
  attachTo(scene) {
    this.scene = scene;
    this.pool.forEach(m => scene.add(m));
  }
  burst({ position = new THREE.Vector3(), color = '#ff6ea0', texture = null }) {
    const count = 10 + Math.floor(Math.random() * 10);
    for (let i = 0; i < count; i++) {
      const m = this.pool.pop();
      if (!m) break;
      m.material.color = new THREE.Color(color);
      m.material.map = texture;
      m.position.copy(position);
      m.userData = {
        t: 0,
        vel: new THREE.Vector3((Math.random()-0.5)*0.6, 1.2 + Math.random()*0.6, (Math.random()-0.5)*0.6),
        life: 0.9 + Math.random()*0.6
      };
      m.visible = true;
      this.alive.push(m);
    }
  }
  update(dt) {
    for (let i = this.alive.length - 1; i >= 0; i--) {
      const m = this.alive[i];
      m.userData.t += dt;
      const u = m.userData;
      m.position.addScaledVector(u.vel, dt);
      m.material.opacity = Math.max(0, 1 - (u.t / u.life));
      if (u.t >= u.life) {
        m.visible = false;
        this.pool.push(m);
        this.alive.splice(i, 1);
      }
    }
  }
}
