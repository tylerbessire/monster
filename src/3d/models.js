/**
 * ModelLoader - Handles GLTF/GLB loading and placeholder geometry creation
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ASSET_CONFIG, PLACEHOLDER_CONFIG, FEATURES } from './config.js';

export class ModelLoader {
  constructor() {
    this.loader = new GLTFLoader();
    this.cache = new Map(); // Cache loaded models
    this.loadingProgress = new Map(); // Track loading progress per model
  }

  /**
   * Load a single model by stage
   * @param {string} stage - 'baby', 'teen', or 'adult'
   * @returns {Promise<THREE.Group>} Loaded model
   */
  async loadModel(stage) {
    // Check cache first
    if (this.cache.has(stage)) {
      console.log(`✓ Using cached model for stage: ${stage}`);
      return this.cache.get(stage).clone();
    }

    // If using placeholders, create placeholder geometry
    if (ASSET_CONFIG.models.usePlaceholders) {
      console.log(`Creating placeholder model for stage: ${stage}`);
      const model = this.createPlaceholderModel(stage);
      this.cache.set(stage, model);
      return model.clone();
    }

    // Load real model from GLB file
    const path = ASSET_CONFIG.models[stage];
    if (!path) {
      throw new Error(`No model path defined for stage: ${stage}`);
    }

    try {
      console.log(`Loading model: ${path}`);
      const gltf = await this.loadGLTF(path, (progress) => {
        this.loadingProgress.set(stage, progress);
      });

      const model = gltf.scene;

      // Process loaded model
      this.processModel(model, stage);

      // Cache the model
      this.cache.set(stage, model);

      console.log(`✓ Model loaded: ${stage}`);
      return model.clone();
    } catch (error) {
      console.error(`Failed to load model ${stage}:`, error);
      // Fallback to placeholder
      console.log(`Falling back to placeholder for ${stage}`);
      const model = this.createPlaceholderModel(stage);
      this.cache.set(stage, model);
      return model.clone();
    }
  }

  /**
   * Load GLTF file
   * @param {string} path - Path to GLTF/GLB file
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<GLTF>}
   */
  loadGLTF(path, onProgress) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => resolve(gltf),
        (xhr) => {
          const progress = xhr.loaded / xhr.total;
          if (onProgress) onProgress(progress);
        },
        (error) => reject(error)
      );
    });
  }

  /**
   * Load all models in parallel
   * @returns {Promise<Map<string, THREE.Group>>} Map of stage -> model
   */
  async loadAllModels() {
    const stages = ['baby', 'teen', 'adult'];

    console.log('Loading all companion models...');

    const promises = stages.map(stage => this.loadModel(stage));
    const models = await Promise.all(promises);

    const modelMap = new Map();
    stages.forEach((stage, i) => {
      modelMap.set(stage, models[i]);
    });

    console.log('✓ All models loaded');
    return modelMap;
  }

  /**
   * Get loading progress for a stage
   * @param {string} stage - Stage name
   * @returns {number} Progress from 0 to 1
   */
  getProgress(stage) {
    return this.loadingProgress.get(stage) || 0;
  }

  /**
   * Get overall loading progress
   * @returns {number} Average progress from 0 to 1
   */
  getTotalProgress() {
    if (this.loadingProgress.size === 0) return 0;

    let total = 0;
    for (const progress of this.loadingProgress.values()) {
      total += progress;
    }

    return total / this.loadingProgress.size;
  }

  /**
   * Process loaded model (setup materials, shadows, etc.)
   * @param {THREE.Object3D} model - The loaded model
   * @param {string} stage - Stage name
   */
  processModel(model, stage) {
    model.traverse((child) => {
      if (child.isMesh) {
        // Enable shadows if feature is on
        if (FEATURES.enableShadows) {
          child.castShadow = true;
          child.receiveShadow = true;
        }

        // Apply cel-shading material if enabled
        if (FEATURES.celShading && child.material) {
          this.applyCelShadingMaterial(child.material);
        }
      }
    });

    // Center the model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    // Position model on ground
    model.position.y = -box.min.y;
  }

  /**
   * Apply cel-shading to material
   * @param {THREE.Material} material - Material to modify
   */
  applyCelShadingMaterial(material) {
    // Convert to MeshToonMaterial if it's basic/lambert/phong
    if (material.isMeshBasicMaterial ||
        material.isMeshLambertMaterial ||
        material.isMeshPhongMaterial) {

      const toonMaterial = new THREE.MeshToonMaterial({
        color: material.color,
        map: material.map,
        gradientMap: this.createToonGradient()
      });

      // Copy material reference back
      Object.assign(material, toonMaterial);
    }
  }

  /**
   * Create toon gradient texture for cel-shading
   * @returns {THREE.DataTexture}
   */
  createToonGradient() {
    // Create a simple 2-tone gradient for cel-shading
    const colors = new Uint8Array([
      255, 255, 255,  // Light
      100, 100, 100   // Shadow
    ]);

    const gradientMap = new THREE.DataTexture(
      colors,
      2,
      1,
      THREE.RGBFormat
    );
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.generateMipmaps = false;

    return gradientMap;
  }

  /**
   * Create placeholder model (simple geometry until real models arrive)
   * @param {string} stage - 'baby', 'teen', or 'adult'
   * @returns {THREE.Group}
   */
  createPlaceholderModel(stage) {
    const config = PLACEHOLDER_CONFIG[stage];
    const group = new THREE.Group();
    group.name = `placeholder-${stage}`;

    // Create toon material
    const material = new THREE.MeshToonMaterial({
      color: config.color,
      gradientMap: FEATURES.celShading ? this.createToonGradient() : null
    });

    // Body (capsule shape)
    const bodyGeometry = new THREE.CapsuleGeometry(
      config.bodyRadius,
      config.bodyHeight,
      8,
      16
    );
    const body = new THREE.Mesh(bodyGeometry, material);
    body.position.y = config.bodyHeight / 2;

    if (FEATURES.enableShadows) {
      body.castShadow = true;
      body.receiveShadow = true;
    }

    group.add(body);

    // Ears (spheres)
    const earGeometry = new THREE.SphereGeometry(config.earSize, 16, 16);

    const leftEar = new THREE.Mesh(earGeometry, material);
    leftEar.position.set(
      -config.bodyRadius * 0.6,
      config.bodyHeight + config.earSize,
      0
    );
    leftEar.scale.y = 1.5;

    const rightEar = new THREE.Mesh(earGeometry, material.clone());
    rightEar.position.set(
      config.bodyRadius * 0.6,
      config.bodyHeight + config.earSize,
      0
    );
    rightEar.scale.y = 1.5;

    if (FEATURES.enableShadows) {
      leftEar.castShadow = true;
      rightEar.castShadow = true;
    }

    group.add(leftEar);
    group.add(rightEar);

    // Eyes (simple spheres)
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(
      -config.bodyRadius * 0.3,
      config.bodyHeight * 0.8,
      config.bodyRadius * 0.9
    );

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(
      config.bodyRadius * 0.3,
      config.bodyHeight * 0.8,
      config.bodyRadius * 0.9
    );

    group.add(leftEye);
    group.add(rightEye);

    // Add tail for teen/adult
    if (stage !== 'baby') {
      const tailGeometry = new THREE.ConeGeometry(
        config.bodyRadius * 0.3,
        config.bodyHeight * 0.5,
        8
      );
      const tail = new THREE.Mesh(tailGeometry, material);
      tail.position.set(0, config.bodyHeight * 0.3, -config.bodyRadius);
      tail.rotation.x = Math.PI / 2;

      if (FEATURES.enableShadows) {
        tail.castShadow = true;
      }

      group.add(tail);
    }

    // Store references for animation
    group.userData = {
      stage,
      body,
      leftEar,
      rightEar,
      leftEye,
      rightEye
    };

    return group;
  }

  /**
   * Get cached model
   * @param {string} stage - Stage name
   * @returns {THREE.Group|null}
   */
  getCachedModel(stage) {
    return this.cache.has(stage) ? this.cache.get(stage).clone() : null;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.loadingProgress.clear();
  }
}
