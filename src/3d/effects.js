/**
 * Effects - Particle systems and visual effects for the 3D companion
 */

import * as THREE from 'three';
import { FEATURES, EVOLUTION_EFFECT } from './config.js';

/**
 * Particle system for ambient effects and evolution sequences
 */
export class ParticleSystem {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.particles = null;
    this.particleGeometry = null;
    this.particleMaterial = null;
    this.particleCount = 50;
    this.isActive = false;
  }

  /**
   * Initialize particle system
   */
  init() {
    if (!FEATURES.enableParticles) {
      console.log('Particles disabled');
      return;
    }

    // Create particle geometry
    this.particleGeometry = new THREE.BufferGeometry();

    const positions = new Float32Array(this.particleCount * 3);
    const velocities = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);

    // Initialize particle positions and properties
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;

      // Random position around origin
      positions[i3] = (Math.random() - 0.5) * 2;
      positions[i3 + 1] = Math.random() * 2;
      positions[i3 + 2] = (Math.random() - 0.5) * 2;

      // Random velocity
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = Math.random() * 0.02 + 0.01;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

      // Random size
      sizes[i] = Math.random() * 0.05 + 0.02;
    }

    this.particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    this.particleGeometry.setAttribute(
      'velocity',
      new THREE.BufferAttribute(velocities, 3)
    );

    this.particleGeometry.setAttribute(
      'size',
      new THREE.BufferAttribute(sizes, 1)
    );

    // Create sparkle texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Draw a star/sparkle
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    // Create particle material
    this.particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      map: texture,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: false,
      color: 0xffb3d9
    });

    // Create particle system
    this.particles = new THREE.Points(
      this.particleGeometry,
      this.particleMaterial
    );

    this.particles.visible = false; // Start hidden

    this.sceneManager.scene.add(this.particles);

    // Register update
    this.sceneManager.onUpdate((deltaTime) => {
      if (this.isActive) {
        this.update(deltaTime);
      }
    });

    console.log('✓ Particle system initialized');
  }

  /**
   * Start particle emission
   * @param {string} mood - Mood affects particle color/intensity
   */
  start(mood = 'happy') {
    if (!this.particles) return;

    this.isActive = true;
    this.particles.visible = true;

    // Set particle color based on mood
    const moodColors = {
      joyful: 0xffff00,   // Yellow sparkles
      happy: 0xffb3d9,    // Pink
      excited: 0xff69b4,  // Hot pink
      tired: 0x9999ff,    // Blue
      sad: 0x6666ff,      // Dark blue
      curious: 0xb3d9ff   // Light blue
    };

    this.particleMaterial.color.setHex(moodColors[mood] || 0xffb3d9);
  }

  /**
   * Stop particle emission
   */
  stop() {
    if (!this.particles) return;

    this.isActive = false;
    this.particles.visible = false;
  }

  /**
   * Update particles (called every frame)
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    if (!this.particleGeometry) return;

    const positions = this.particleGeometry.attributes.position.array;
    const velocities = this.particleGeometry.attributes.velocity.array;

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;

      // Update position based on velocity
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];

      // Reset particles that go too high
      if (positions[i3 + 1] > 3) {
        positions[i3] = (Math.random() - 0.5) * 2;
        positions[i3 + 1] = 0;
        positions[i3 + 2] = (Math.random() - 0.5) * 2;
      }
    }

    this.particleGeometry.attributes.position.needsUpdate = true;

    // Gentle rotation
    this.particles.rotation.y += deltaTime * 0.1;
  }

  /**
   * Play evolution particle burst
   * @returns {Promise<void>}
   */
  playEvolutionBurst() {
    return new Promise((resolve) => {
      if (!this.particles) {
        resolve();
        return;
      }

      // Temporarily increase particle intensity
      const originalOpacity = this.particleMaterial.opacity;
      this.particleMaterial.opacity = 1.0;
      this.particleMaterial.color.setHex(0xffffff); // White burst

      this.start();

      setTimeout(() => {
        this.particleMaterial.opacity = originalOpacity;
        this.stop();
        resolve();
      }, EVOLUTION_EFFECT.duration);
    });
  }

  /**
   * Dispose of particle system
   */
  dispose() {
    if (this.particles) {
      this.sceneManager.scene.remove(this.particles);
    }

    if (this.particleGeometry) {
      this.particleGeometry.dispose();
    }

    if (this.particleMaterial) {
      this.particleMaterial.dispose();
    }

    this.particles = null;
    this.particleGeometry = null;
    this.particleMaterial = null;
  }
}

/**
 * Floating hearts/icons effect
 */
export class FloatingIcon {
  constructor(sceneManager, icon = '❤️') {
    this.sceneManager = sceneManager;
    this.icon = icon;
    this.mesh = null;
  }

  /**
   * Create and show floating icon
   * @param {THREE.Vector3} position - Starting position
   */
  show(position) {
    // Create canvas with emoji
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.font = '100px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.icon, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);

    // Create sprite
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    });

    const sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    sprite.position.y += 1; // Above companion
    sprite.scale.set(0.5, 0.5, 1);

    this.mesh = sprite;
    this.sceneManager.scene.add(sprite);

    // Animate upward and fade out
    this.animate();
  }

  /**
   * Animate floating icon
   */
  animate() {
    const startY = this.mesh.position.y;
    const startTime = Date.now();
    const duration = 1500; // 1.5 seconds

    const update = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        this.dispose();
        return;
      }

      // Float up
      this.mesh.position.y = startY + progress * 2;

      // Fade out
      this.mesh.material.opacity = 1 - progress;

      requestAnimationFrame(update);
    };

    update();
  }

  /**
   * Dispose of floating icon
   */
  dispose() {
    if (this.mesh) {
      this.sceneManager.scene.remove(this.mesh);
      this.mesh.material.map.dispose();
      this.mesh.material.dispose();
      this.mesh = null;
    }
  }
}

/**
 * Create a floating icon at position
 * @param {Object} sceneManager - Scene manager
 * @param {string} icon - Emoji or text to display
 * @param {THREE.Vector3} position - World position
 */
export function showFloatingIcon(sceneManager, icon, position) {
  const floatingIcon = new FloatingIcon(sceneManager, icon);
  floatingIcon.show(position);
}
