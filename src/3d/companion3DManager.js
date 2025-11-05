/**
 * Companion3DManager - Orchestrates the entire 3D companion system
 * Handles initialization, updates, and cleanup
 */

import { ThreeSceneManager } from './sceneManager.js';
import { EvolutionController } from './evolutionController.js';
import { ParticleSystem, showFloatingIcon } from './effects.js';
import { FEATURES, ASSET_CONFIG } from './config.js';
import { ParticlePool } from './effects/particles.js';
import { CameraRig } from './camera/cameraRig.js';
import { RaycasterInteractions } from './interactions/raycasterInteractions.js';
import { SoundManager } from './sound/soundManager.js';
import { runEvolution } from './evolution/evolutionTimeline.js';
import { ModelLoader } from './models.js';

export class Companion3DManager {
  constructor() {
    this.sceneManager = null;
    this.evolutionController = null;
    this.particleSystem = null;
    this.particlePool = null;
    this.cameraRig = null;
    this.raycaster = null;
    this.soundManager = null;
    this.modelLoader = null;
    this.isInitialized = false;
    this.currentCanvas = null;
  }

  /**
   * Initialize 3D system
   * @param {HTMLCanvasElement} canvas - Canvas element to render to
   * @param {Object} companionState - Initial companion state (level, stage, etc.)
   */
  async init(canvas, companionState) {
    if (this.isInitialized) {
      console.warn('3D Manager already initialized');
      return;
    }

    if (!FEATURES.enable3D) {
      console.log('3D features disabled');
      return;
    }

    try {
      console.log('🎮 Initializing 3D companion system...');

      this.currentCanvas = canvas;

      // Initialize scene manager
      this.sceneManager = new ThreeSceneManager();
      this.sceneManager.init(canvas);

      // Initialize particle system (old)
      this.particleSystem = new ParticleSystem(this.sceneManager);
      this.particleSystem.init();

      // Initialize new ParticlePool
      this.particlePool = new ParticlePool({ max: 256 });
      this.particlePool.attachTo(this.sceneManager.scene);

      // Initialize CameraRig
      this.cameraRig = new CameraRig(this.sceneManager.camera);

      // Initialize SoundManager
      this.soundManager = new SoundManager();
      // TODO: Load sound files when they're available
      // this.soundManager.load('eat', '/sounds/eat.mp3');
      // this.soundManager.load('play', '/sounds/play.mp3');
      // this.soundManager.load('evolve', '/sounds/evolve.mp3');

      // Initialize ModelLoader for evolution
      this.modelLoader = new ModelLoader();

      // Initialize evolution controller
      this.evolutionController = new EvolutionController(this.sceneManager);

      const stage = companionState?.evolutionStage || 'baby';
      await this.evolutionController.init(stage);

      // Initialize RaycasterInteractions
      this.raycaster = new RaycasterInteractions(
        this.sceneManager.camera,
        this.sceneManager.scene,
        canvas,
        {
          onClick: (obj, point) => {
            console.log('Companion clicked!');
            // Burst hearts at click position
            this.particlePool.burst({
              position: point || obj.position,
              color: ASSET_CONFIG.moods?.happy?.color || '#ff6ea0'
            });
            // Play reaction animation
            this.playAction('earTwitch');
            // Emit click event
            this.emitEvent('companion-clicked', {});
          },
          onHover: (obj) => {
            // Change cursor on hover
            document.body.style.cursor = obj ? 'pointer' : 'default';
          }
        }
      );

      // Register update callbacks for new systems
      this.sceneManager.onUpdate((dt) => {
        if (this.particlePool) {
          this.particlePool.update(dt);
        }
        if (this.cameraRig) {
          this.cameraRig.update(dt);
        }
      });

      // Start particle effects based on mood
      const mood = companionState?.personality?.mood || 'happy';
      if (FEATURES.enableParticles) {
        this.particleSystem.start(mood);
      }

      this.isInitialized = true;

      console.log('✓ 3D companion system ready!');
    } catch (error) {
      console.error('Failed to initialize 3D system:', error);
      // Could fallback to 2D mode here
      throw error;
    }
  }

  /**
   * Update companion state (called when state changes)
   * @param {Object} companionState - New companion state
   */
  updateCompanion(companionState) {
    if (!this.isInitialized) return;

    // Update mood
    const mood = companionState?.personality?.mood || 'happy';
    if (this.evolutionController) {
      this.evolutionController.setMood(mood);
    }

    // Update particles
    if (this.particleSystem && FEATURES.enableParticles) {
      this.particleSystem.start(mood);
    }

    // Check for evolution
    if (this.evolutionController && companionState.level) {
      const evolutionCheck = this.evolutionController.checkEvolutionReady(
        companionState.level
      );

      if (evolutionCheck.ready) {
        this.triggerEvolution(
          evolutionCheck.fromStage,
          evolutionCheck.newStage
        );
      }
    }
  }

  /**
   * Trigger evolution sequence
   * @param {string} fromStage - Current stage
   * @param {string} toStage - New stage
   * @returns {Promise<void>}
   */
  async triggerEvolution(fromStage, toStage) {
    if (!this.evolutionController) return;

    console.log(`🌟 Evolution triggered: ${fromStage} → ${toStage}`);

    // Play evolution sound
    if (this.soundManager) {
      this.soundManager.play('evolve', 0.8);
    }

    try {
      // Use the new runEvolution timeline
      const currentModel = this.evolutionController.getCurrentModel();

      const newModel = await runEvolution({
        currentModel,
        loadNextStage: async () => {
          // Load the next stage model using modelLoader
          const gltf = await this.modelLoader.loadGLTF(
            ASSET_CONFIG.models[toStage],
            (progress) => console.log(`Loading ${toStage}: ${Math.round(progress * 100)}%`)
          );
          return gltf;
        },
        scene: this.sceneManager.scene,
        cameraRig: this.cameraRig,
        particles: this.particlePool,
        rimOptions: {
          rimColor: parseInt((ASSET_CONFIG.shading.rimColor || '#88b7ff').replace('#', '0x'), 16),
          rimStrength: ASSET_CONFIG.shading.rimStrength || 1.1
        },
        onSwap: (model, clips) => {
          // Update animation controller with new model and clips
          this.evolutionController.animationController.setup(model, clips);
          this.evolutionController.currentModel = model;
          this.evolutionController.currentStage = toStage;
        }
      });

      console.log('✓ Evolution complete:', toStage);
    } catch (error) {
      console.error('Evolution failed, falling back to old method:', error);
      // Fallback to old evolution sequence if new one fails
      await this.evolutionController.playEvolutionSequence(fromStage, toStage);
    }

    // Emit event for UI update
    this.emitEvent('evolution-complete', { stage: toStage });
  }

  /**
   * Play action animation
   * @param {string} action - Action name ('eat', 'play', etc.)
   * @returns {Promise<void>}
   */
  async playAction(action) {
    if (!this.evolutionController) return;

    console.log(`Playing action: ${action}`);

    // Play sound for action if available
    if (this.soundManager) {
      this.soundManager.play(action, 0.6);
    }

    await this.evolutionController.playAction(action);

    // Show floating icon based on action
    const actionIcons = {
      eat: '🍖',
      play: '🎮',
      sleep: '😴',
      quest: '🗺️'
    };

    const icon = actionIcons[action];
    if (icon && this.evolutionController.getCurrentModel()) {
      const model = this.evolutionController.getCurrentModel();
      showFloatingIcon(this.sceneManager, icon, model.position);

      // Burst particles at action location
      if (this.particlePool) {
        const moodColors = {
          eat: '#ffab91',
          play: '#ffd54f',
          sleep: '#b39ddb',
          quest: '#90caf9'
        };
        this.particlePool.burst({
          position: model.position.clone(),
          color: moodColors[action] || '#ffffff'
        });
      }
    }
  }

  /**
   * Handle canvas click (for interaction)
   * @param {MouseEvent} event - Click event
   */
  handleClick(event) {
    if (!this.sceneManager || !this.currentCanvas) return;

    const rect = this.currentCanvas.getBoundingClientRect();

    // Convert to normalized device coordinates
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const intersects = this.sceneManager.raycast(x, y);

    if (intersects.length > 0) {
      console.log('Companion clicked!');

      // Play reaction
      this.playAction('earTwitch');

      // Show heart
      if (this.evolutionController.getCurrentModel()) {
        const model = this.evolutionController.getCurrentModel();
        showFloatingIcon(this.sceneManager, '❤️', model.position);
      }

      // Emit click event for game logic
      this.emitEvent('companion-clicked', {});
    }
  }

  /**
   * Emit custom event
   * @param {string} eventName - Event name
   * @param {Object} detail - Event detail
   */
  emitEvent(eventName, detail) {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
  }

  /**
   * Check if 3D is available
   * @returns {boolean}
   */
  static isWebGLAvailable() {
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
   * Cleanup and dispose
   */
  dispose() {
    if (!this.isInitialized) return;

    console.log('Disposing 3D companion system...');

    // Dispose raycaster interactions
    if (this.raycaster) {
      this.raycaster.dispose();
      this.raycaster = null;
    }

    if (this.particleSystem) {
      this.particleSystem.dispose();
      this.particleSystem = null;
    }

    if (this.evolutionController) {
      this.evolutionController.dispose();
      this.evolutionController = null;
    }

    if (this.sceneManager) {
      this.sceneManager.dispose();
      this.sceneManager = null;
    }

    // Clear new module references
    this.particlePool = null;
    this.cameraRig = null;
    this.soundManager = null;
    this.currentCanvas = null;
    this.isInitialized = false;

    console.log('✓ 3D system disposed');
  }
}

// Global instance
let globalManager = null;

/**
 * Get or create global 3D manager
 * @returns {Companion3DManager}
 */
export function get3DManager() {
  if (!globalManager) {
    globalManager = new Companion3DManager();
  }
  return globalManager;
}

/**
 * Initialize 3D system (convenience function)
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} companionState - Companion state
 */
export async function init3DCompanion(canvas, companionState) {
  const manager = get3DManager();
  await manager.init(canvas, companionState);
  return manager;
}

/**
 * Dispose 3D system (convenience function)
 */
export function dispose3DCompanion() {
  if (globalManager) {
    globalManager.dispose();
    globalManager = null;
  }
}
