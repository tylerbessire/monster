/**
 * EvolutionController - Manages evolution transitions and visual sequences
 */

import gsap from 'gsap';
import { EVOLUTION_CONFIG, EVOLUTION_EFFECT } from './config.js';
import { ModelLoader } from './models.js';
import { AnimationController } from './animationController.js';

export class EvolutionController {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.modelLoader = new ModelLoader();
    this.animationController = new AnimationController();

    this.currentStage = 'baby';
    this.currentModel = null;
    this.isEvolving = false;

    // Event callbacks
    this.onEvolutionStart = null;
    this.onEvolutionComplete = null;
  }

  /**
   * Initialize with starting stage
   * @param {string} stage - Starting stage ('baby', 'teen', 'adult')
   * @returns {Promise<void>}
   */
  async init(stage = 'baby') {
    console.log(`Initializing evolution controller with stage: ${stage}`);

    this.currentStage = stage;

    // Load and display initial model
    await this.loadAndSetupModel(stage);

    // Register update callback with scene manager
    this.sceneManager.onUpdate((deltaTime) => {
      this.animationController.update(deltaTime);
    });

    console.log('✓ Evolution controller initialized');
  }

  /**
   * Load and setup a model for a given stage
   * @param {string} stage - Stage to load
   * @returns {Promise<THREE.Group>}
   */
  async loadAndSetupModel(stage) {
    // Load model
    const model = await this.modelLoader.loadModel(stage);

    // Get animations from model (if any)
    const clips = model.animations || [];

    // Setup animations
    this.animationController.setup(model, clips);

    // Add to scene
    this.sceneManager.addModel(model);

    // Store reference
    this.currentModel = model;

    return model;
  }

  /**
   * Check if evolution is ready for current level
   * @param {number} level - Current companion level
   * @returns {Object} { ready: boolean, newStage: string|null }
   */
  checkEvolutionReady(level) {
    const currentConfig = EVOLUTION_CONFIG.stages[this.currentStage];

    // Check if level exceeds current stage's max level
    if (level > currentConfig.maxLevel) {
      // Find new stage
      for (const [stageName, config] of Object.entries(EVOLUTION_CONFIG.stages)) {
        if (level >= config.minLevel && level <= config.maxLevel) {
          if (stageName !== this.currentStage) {
            return {
              ready: true,
              newStage: stageName,
              fromStage: this.currentStage
            };
          }
        }
      }
    }

    return { ready: false, newStage: null };
  }

  /**
   * Play evolution sequence
   * @param {string} fromStage - Current stage
   * @param {string} toStage - Target stage
   * @returns {Promise<void>}
   */
  async playEvolutionSequence(fromStage, toStage) {
    if (this.isEvolving) {
      console.warn('Evolution already in progress');
      return;
    }

    console.log(`🌟 Starting evolution: ${fromStage} → ${toStage}`);

    this.isEvolving = true;

    // Emit evolution start event
    if (this.onEvolutionStart) {
      this.onEvolutionStart(fromStage, toStage);
    }

    try {
      // Step 1: Glow effect
      await this.playGlowEffect();

      // Step 2: Fade out current model
      await this.fadeOutModel(this.currentModel);

      // Step 3: Load and setup new model
      const newModel = await this.loadAndSetupModel(toStage);

      // Start hidden
      newModel.visible = false;

      // Step 4: Swap model
      this.sceneManager.removeModel(this.currentModel);
      this.sceneManager.addModel(newModel);
      this.currentModel = newModel;
      this.currentStage = toStage;

      // Step 5: Fade in new model
      await this.fadeInModel(newModel);

      // Step 6: Celebration effect
      await this.playCelebrationEffect();

      console.log(`✓ Evolution complete: ${toStage}`);

      // Emit evolution complete event
      if (this.onEvolutionComplete) {
        this.onEvolutionComplete(toStage);
      }
    } catch (error) {
      console.error('Evolution sequence failed:', error);
    } finally {
      this.isEvolving = false;
    }
  }

  /**
   * Play glow effect
   * @returns {Promise<void>}
   */
  playGlowEffect() {
    return new Promise((resolve) => {
      console.log('Playing glow effect');

      if (!this.currentModel) {
        resolve();
        return;
      }

      // Pulse scale effect
      const timeline = gsap.timeline({
        onComplete: resolve
      });

      timeline.to(this.currentModel.scale, {
        x: 1.1,
        y: 1.1,
        z: 1.1,
        duration: EVOLUTION_EFFECT.glowDuration / 1000 / 2,
        ease: 'sine.inOut'
      });

      timeline.to(this.currentModel.scale, {
        x: 1.0,
        y: 1.0,
        z: 1.0,
        duration: EVOLUTION_EFFECT.glowDuration / 1000 / 2,
        ease: 'sine.inOut'
      });
    });
  }

  /**
   * Fade out model
   * @param {THREE.Group} model - Model to fade out
   * @returns {Promise<void>}
   */
  fadeOutModel(model) {
    return new Promise((resolve) => {
      console.log('Fading out model');

      if (!model) {
        resolve();
        return;
      }

      // Fade opacity and scale down
      const timeline = gsap.timeline({
        onComplete: resolve
      });

      // Traverse and fade materials
      model.traverse((child) => {
        if (child.isMesh && child.material) {
          const material = child.material;

          // Enable transparency
          material.transparent = true;

          timeline.to(material, {
            opacity: 0,
            duration: EVOLUTION_EFFECT.fadeDuration / 1000,
            ease: 'power2.in'
          }, 0);
        }
      });

      // Scale down
      timeline.to(model.scale, {
        x: 0.1,
        y: 0.1,
        z: 0.1,
        duration: EVOLUTION_EFFECT.fadeDuration / 1000,
        ease: 'back.in'
      }, 0);
    });
  }

  /**
   * Fade in model
   * @param {THREE.Group} model - Model to fade in
   * @returns {Promise<void>}
   */
  fadeInModel(model) {
    return new Promise((resolve) => {
      console.log('Fading in model');

      if (!model) {
        resolve();
        return;
      }

      // Start small and invisible
      model.scale.set(0.1, 0.1, 0.1);
      model.visible = true;

      // Setup materials for fade
      const materials = [];
      model.traverse((child) => {
        if (child.isMesh && child.material) {
          const material = child.material;
          material.transparent = true;
          material.opacity = 0;
          materials.push(material);
        }
      });

      const timeline = gsap.timeline({
        onComplete: () => {
          // Reset transparency after fade in
          materials.forEach(mat => {
            mat.transparent = false;
            mat.opacity = 1;
          });
          resolve();
        }
      });

      // Fade in opacity
      materials.forEach(material => {
        timeline.to(material, {
          opacity: 1,
          duration: EVOLUTION_EFFECT.fadeDuration / 1000,
          ease: 'power2.out'
        }, 0);
      });

      // Scale up with bounce
      timeline.to(model.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: EVOLUTION_EFFECT.fadeDuration / 1000,
        ease: 'back.out'
      }, 0);
    });
  }

  /**
   * Play celebration effect
   * @returns {Promise<void>}
   */
  playCelebrationEffect() {
    return new Promise((resolve) => {
      console.log('Playing celebration effect');

      if (!this.currentModel) {
        resolve();
        return;
      }

      // Bounce animation
      const timeline = gsap.timeline({
        onComplete: resolve
      });

      // Bounce twice
      timeline.to(this.currentModel.position, {
        y: 0.5,
        duration: 0.3,
        ease: 'power2.out'
      });

      timeline.to(this.currentModel.position, {
        y: 0,
        duration: 0.3,
        ease: 'bounce.out'
      });

      timeline.to(this.currentModel.position, {
        y: 0.3,
        duration: 0.2,
        ease: 'power2.out'
      });

      timeline.to(this.currentModel.position, {
        y: 0,
        duration: 0.2,
        ease: 'bounce.out'
      });
    });
  }

  /**
   * Set mood for current companion
   * @param {string} mood - Mood name
   */
  setMood(mood) {
    this.animationController.setMood(mood);
  }

  /**
   * Play action animation
   * @param {string} action - Action name
   * @returns {Promise<void>}
   */
  async playAction(action) {
    return this.animationController.playAction(action);
  }

  /**
   * Get current stage
   * @returns {string}
   */
  getCurrentStage() {
    return this.currentStage;
  }

  /**
   * Get current model
   * @returns {THREE.Group}
   */
  getCurrentModel() {
    return this.currentModel;
  }

  /**
   * Dispose of evolution controller
   */
  dispose() {
    this.animationController.dispose();
    this.modelLoader.clearCache();
    this.currentModel = null;
  }
}
