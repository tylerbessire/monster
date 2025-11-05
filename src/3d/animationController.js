/**
 * AnimationController - Manages animation playback, blending, and mood-based animations
 */

import * as THREE from 'three';
import gsap from 'gsap';
import { ASSET_CONFIG, MOOD_ANIMATIONS } from './config.js';

export class AnimationController {
  constructor() {
    this.mixer = null;
    this.animations = new Map(); // name -> AnimationClip
    this.actions = new Map(); // name -> AnimationAction
    this.currentAction = null;
    this.currentMood = 'happy';
    this.actionQueue = []; // Queue for one-shot actions

    // Simple breathing animation for placeholders
    this.breathingTween = null;
  }

  /**
   * Setup animation system for a model
   * @param {THREE.Group} model - The model with animations
   * @param {THREE.AnimationClip[]} clips - Animation clips (from GLTF or custom)
   */
  setup(model, clips = []) {
    // Dispose existing mixer
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = null;
    }

    this.animations.clear();
    this.actions.clear();

    // Create new mixer
    this.mixer = new THREE.AnimationMixer(model);

    // Register all animation clips
    if (clips.length > 0) {
      clips.forEach((clip) => {
        this.animations.set(clip.name, clip);
        const action = this.mixer.clipAction(clip);
        this.actions.set(clip.name, action);
      });

      console.log(`✓ Loaded ${clips.length} animations`);
    } else {
      // No real animations, setup placeholder animations
      this.setupPlaceholderAnimations(model);
    }

    // Start with idle animation
    this.playClip('idle', true);
  }

  /**
   * Setup simple procedural animations for placeholder models
   * @param {THREE.Group} model - Placeholder model
   */
  setupPlaceholderAnimations(model) {
    console.log('Setting up placeholder animations');

    // Create simple breathing animation using GSAP
    const body = model.userData.body;

    if (body) {
      this.breathingTween = gsap.to(body.scale, {
        y: 1.05,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }

    // Store model reference for custom animations
    this.placeholderModel = model;
  }

  /**
   * Play animation clip by name
   * @param {string} clipName - Animation name (e.g., 'idle', 'walk')
   * @param {boolean} loop - Whether to loop the animation
   * @param {number} fadeDuration - Crossfade duration in seconds
   */
  playClip(clipName, loop = true, fadeDuration = 0.3) {
    // Map friendly names to actual clip names
    const actualName = ASSET_CONFIG.animations[clipName] || clipName;

    const action = this.actions.get(actualName);

    if (!action) {
      // No real animation available, try placeholder animation
      this.playPlaceholderAnimation(clipName);
      return;
    }

    // Stop current action with fade
    if (this.currentAction && this.currentAction !== action) {
      this.currentAction.fadeOut(fadeDuration);
    }

    // Configure and play new action
    action.reset();
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);
    action.clampWhenFinished = !loop;
    action.fadeIn(fadeDuration);
    action.play();

    this.currentAction = action;
  }

  /**
   * Play placeholder animation (for models without real animations)
   * @param {string} animName - Animation name
   */
  playPlaceholderAnimation(animName) {
    if (!this.placeholderModel) return;

    const { leftEar, rightEar, body } = this.placeholderModel.userData;

    // Simple ear twitch animation
    if (animName === 'earTwitch' && leftEar && rightEar) {
      gsap.to(leftEar.rotation, {
        z: 0.3,
        duration: 0.2,
        yoyo: true,
        repeat: 1
      });

      gsap.to(rightEar.rotation, {
        z: -0.3,
        duration: 0.2,
        yoyo: true,
        repeat: 1
      });
    }

    // Tail wag for teen/adult
    if (animName === 'tailWag') {
      const tail = this.placeholderModel.children.find(
        child => child.geometry?.type === 'ConeGeometry'
      );

      if (tail) {
        gsap.to(tail.rotation, {
          y: 0.5,
          duration: 0.4,
          yoyo: true,
          repeat: 3,
          ease: 'sine.inOut'
        });
      }
    }

    // Play animation (bounce)
    if (animName === 'play' && body) {
      gsap.to(body.position, {
        y: 0.3,
        duration: 0.3,
        yoyo: true,
        repeat: 5,
        ease: 'power1.inOut'
      });
    }
  }

  /**
   * Set mood and play appropriate idle animations
   * @param {string} mood - Mood name (e.g., 'happy', 'tired', 'excited')
   */
  setMood(mood) {
    if (this.currentMood === mood) return;

    this.currentMood = mood;

    const animations = MOOD_ANIMATIONS[mood] || MOOD_ANIMATIONS.happy;
    const idleAnim = animations[0];

    console.log(`Setting mood: ${mood}, playing ${idleAnim}`);

    this.playClip(idleAnim, true);

    // Schedule random idle variations
    this.scheduleIdleVariations(animations);
  }

  /**
   * Schedule random idle variations
   * @param {string[]} animations - Available animations for this mood
   */
  scheduleIdleVariations(animations) {
    // Clear existing timeout
    if (this.idleVariationTimeout) {
      clearTimeout(this.idleVariationTimeout);
    }

    // Randomly play one of the mood animations after 3-8 seconds
    const delay = 3000 + Math.random() * 5000;

    this.idleVariationTimeout = setTimeout(() => {
      const randomAnim = animations[Math.floor(Math.random() * animations.length)];
      this.playAction(randomAnim);

      // Schedule next variation
      this.scheduleIdleVariations(animations);
    }, delay);
  }

  /**
   * Play a one-shot action animation
   * @param {string} actionName - Action name (e.g., 'eat', 'play')
   * @returns {Promise<void>} Resolves when action completes
   */
  playAction(actionName) {
    return new Promise((resolve) => {
      const actualName = ASSET_CONFIG.animations[actionName] || actionName;
      const action = this.actions.get(actualName);

      if (!action) {
        // Try placeholder animation
        this.playPlaceholderAnimation(actionName);

        // Simulate completion after 1 second
        setTimeout(resolve, 1000);
        return;
      }

      // Setup one-shot action
      action.reset();
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;

      // Listen for completion
      const onFinished = () => {
        this.mixer.removeEventListener('finished', onFinished);

        // Return to idle after action
        const moodAnimations = MOOD_ANIMATIONS[this.currentMood] || MOOD_ANIMATIONS.happy;
        this.playClip(moodAnimations[0], true);

        resolve();
      };

      this.mixer.addEventListener('finished', onFinished);

      // Fade out current, play action, then fade back
      if (this.currentAction) {
        this.currentAction.fadeOut(0.2);
      }

      action.fadeIn(0.2);
      action.play();
    });
  }

  /**
   * Queue multiple actions to play in sequence
   * @param {string[]} actions - Array of action names
   */
  async queueActions(actions) {
    for (const action of actions) {
      await this.playAction(action);
    }
  }

  /**
   * Update animation mixer (call every frame)
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
  }

  /**
   * Stop all animations
   */
  stopAll() {
    if (this.mixer) {
      this.mixer.stopAllAction();
    }

    if (this.breathingTween) {
      this.breathingTween.kill();
    }

    if (this.idleVariationTimeout) {
      clearTimeout(this.idleVariationTimeout);
    }
  }

  /**
   * Dispose of animation system
   */
  dispose() {
    this.stopAll();

    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = null;
    }

    this.animations.clear();
    this.actions.clear();
    this.currentAction = null;
    this.placeholderModel = null;
  }
}
