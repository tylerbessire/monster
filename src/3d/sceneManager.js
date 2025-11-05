/**
 * ThreeSceneManager - Core Three.js renderer, scene, and camera management
 */

import * as THREE from 'three';
import { SCENE_CONFIG, FEATURES } from './config.js';

export class ThreeSceneManager {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.canvas = null;
    this.animationFrameId = null;
    this.clock = new THREE.Clock();
    this.resizeObserver = null;

    // Callback hooks
    this.onUpdateCallbacks = [];

    // Active model reference
    this.currentModel = null;
  }

  /**
   * Initialize the Three.js scene
   * @param {HTMLCanvasElement} canvasElement - The canvas to render to
   */
  init(canvasElement) {
    if (!canvasElement) {
      throw new Error('Canvas element required for ThreeSceneManager.init()');
    }

    this.canvas = canvasElement;

    // Check WebGL support
    if (!this.isWebGLAvailable()) {
      throw new Error('WebGL not supported');
    }

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(SCENE_CONFIG.background);

    // Create camera
    const aspect = canvasElement.clientWidth / canvasElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(
      SCENE_CONFIG.camera.fov,
      aspect,
      SCENE_CONFIG.camera.near,
      SCENE_CONFIG.camera.far
    );

    const camPos = SCENE_CONFIG.camera.position;
    this.camera.position.set(camPos.x, camPos.y, camPos.z);
    this.camera.lookAt(0, 1, 0); // Look at companion center

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(canvasElement.clientWidth, canvasElement.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (FEATURES.enableShadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // Setup lighting
    this.setupLights();

    // Setup resize handling
    this.setupResizeObserver();

    // Start animation loop
    this.start();

    console.log('✓ Three.js scene initialized');
  }

  /**
   * Setup scene lighting
   */
  setupLights() {
    const { ambient, directional, rim } = SCENE_CONFIG.lights;

    // Ambient light (soft fill)
    const ambientLight = new THREE.AmbientLight(
      ambient.color,
      ambient.intensity
    );
    this.scene.add(ambientLight);

    // Directional light (key light for cel-shading)
    const dirLight = new THREE.DirectionalLight(
      directional.color,
      directional.intensity
    );
    const dirPos = directional.position;
    dirLight.position.set(dirPos.x, dirPos.y, dirPos.z);

    if (FEATURES.enableShadows) {
      dirLight.castShadow = true;
      dirLight.shadow.camera.near = 0.1;
      dirLight.shadow.camera.far = 50;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
    }

    this.scene.add(dirLight);

    // Rim light (backlight for depth)
    const rimLight = new THREE.DirectionalLight(
      rim.color,
      rim.intensity
    );
    const rimPos = rim.position;
    rimLight.position.set(rimPos.x, rimPos.y, rimPos.z);
    this.scene.add(rimLight);
  }

  /**
   * Setup responsive canvas resizing
   */
  setupResizeObserver() {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.resize(width, height);
      }
    });

    this.resizeObserver.observe(this.canvas);
  }

  /**
   * Handle canvas resize
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width, height) {
    if (!this.camera || !this.renderer) return;

    const aspect = width / height;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  /**
   * Start animation loop
   */
  start() {
    if (this.animationFrameId) return; // Already running

    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);

      const deltaTime = this.clock.getDelta();
      this.update(deltaTime);
      this.render();
    };

    animate();
  }

  /**
   * Stop animation loop
   */
  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Update scene (called every frame)
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    // Call all registered update callbacks
    for (const callback of this.onUpdateCallbacks) {
      callback(deltaTime);
    }
  }

  /**
   * Render the scene
   */
  render() {
    if (!this.renderer || !this.scene || !this.camera) return;
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Register an update callback
   * @param {Function} callback - Function to call each frame with deltaTime
   */
  onUpdate(callback) {
    this.onUpdateCallbacks.push(callback);
  }

  /**
   * Remove an update callback
   * @param {Function} callback - The callback to remove
   */
  offUpdate(callback) {
    const index = this.onUpdateCallbacks.indexOf(callback);
    if (index > -1) {
      this.onUpdateCallbacks.splice(index, 1);
    }
  }

  /**
   * Add model to scene
   * @param {THREE.Object3D} model - Model to add
   */
  addModel(model) {
    if (this.currentModel) {
      this.removeModel(this.currentModel);
    }

    this.scene.add(model);
    this.currentModel = model;
  }

  /**
   * Remove model from scene
   * @param {THREE.Object3D} model - Model to remove
   */
  removeModel(model) {
    if (model) {
      this.scene.remove(model);
      if (model === this.currentModel) {
        this.currentModel = null;
      }
    }
  }

  /**
   * Check if WebGL is available
   */
  isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  }

  /**
   * Get raycaster for click detection
   * @param {number} x - Mouse X in normalized coords (-1 to 1)
   * @param {number} y - Mouse Y in normalized coords (-1 to 1)
   */
  raycast(x, y) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(x, y);

    raycaster.setFromCamera(mouse, this.camera);

    if (this.currentModel) {
      return raycaster.intersectObject(this.currentModel, true);
    }

    return [];
  }

  /**
   * Cleanup and dispose of resources
   */
  dispose() {
    console.log('Disposing Three.js scene...');

    // Stop animation loop
    this.stop();

    // Disconnect resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Dispose of scene objects
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    // Clear references
    this.scene = null;
    this.camera = null;
    this.canvas = null;
    this.currentModel = null;
    this.onUpdateCallbacks = [];

    console.log('✓ Three.js scene disposed');
  }
}
