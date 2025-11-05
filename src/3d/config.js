/**
 * 3D System Configuration
 * Defines asset paths, animation names, feature flags, and contracts for the 3D companion system
 */

export const ASSET_CONFIG = {
  // Model paths (GLB/GLTF files)
  models: {
    baby: '/models/companion_baby.glb',
    teen: '/models/companion_teen.glb',
    adult: '/models/companion_adult.glb',

    // Fallback: Use placeholder geometries until real models are available
    usePlaceholders: false
  },

  // Shading configuration
  shading: {
    toon: true,
    rim: true,
    rimColor: '#88b7ff',
    rimStrength: 1.1
  },

  // Mood-based animations and colors
  moods: {
    happy:   { anim: 'tail_wag', color: '#ffd54f' },
    calm:    { anim: 'breathe',  color: '#90caf9' },
    sleepy:  { anim: 'sleep',    color: '#b39ddb' },
    playful: { anim: 'play',     color: '#ffab91' }
  },

  // Animation clip names (must match clips baked into GLB files)
  animations: {
    idle: 'idle',
    breathing: 'breathe',
    tailWag: 'tail_wag',
    earTwitch: 'ear_twitch',
    blink: 'blink',
    eat: 'eat',
    sleep: 'sleep',
    play: 'play',
    evolve: 'evolve',
    happy: 'idle_happy',
    tired: 'idle_sleepy'
  },

  // Texture paths
  textures: {
    baby: '/textures/baby-color.png',
    teen: '/textures/teen-color.png',
    adult: '/textures/adult-color.png'
  }
};

// Evolution thresholds (matches TODO spec)
export const EVOLUTION_CONFIG = {
  stages: {
    baby: {
      name: 'Baby',
      minLevel: 1,
      maxLevel: 15,
      scale: 1.0,
      color: 0xffb3d9 // Soft pink
    },
    teen: {
      name: 'Teen',
      minLevel: 16,
      maxLevel: 35,
      scale: 1.5,
      color: 0xff69b4 // Vibrant pink
    },
    adult: {
      name: 'Adult',
      minLevel: 36,
      maxLevel: 99,
      scale: 2.0,
      color: 0xff1493 // Deep pink with iridescent shader
    }
  }
};

// Scene configuration
export const SCENE_CONFIG = {
  camera: {
    fov: 50,
    near: 0.1,
    far: 1000,
    position: { x: 0, y: 2, z: 5 }
  },

  lights: {
    ambient: {
      color: 0xffffff,
      intensity: 0.6
    },
    directional: {
      color: 0xffffff,
      intensity: 0.8,
      position: { x: 5, y: 5, z: 5 }
    },
    rim: {
      color: 0xb3d9ff,
      intensity: 0.5,
      position: { x: -5, y: 3, z: -5 }
    }
  },

  background: 0xf5f5f5
};

// Mood-based animation sets
export const MOOD_ANIMATIONS = {
  joyful: ['happy', 'tailWag', 'play'],
  happy: ['idle', 'breathing', 'blink'],
  tired: ['tired', 'breathing', 'sleep'],
  excited: ['play', 'tailWag', 'earTwitch'],
  sad: ['idle', 'breathing'],
  angry: ['idle'],
  curious: ['idle', 'earTwitch', 'blink']
};

// Feature flags
export const FEATURES = {
  enable3D: true,              // Master toggle for 3D system
  enableParticles: true,       // Particle effects
  enablePostProcessing: false, // Bloom, etc. (heavy on mobile)
  enableShadows: false,        // Shadow rendering (performance)
  celShading: true,            // Toon/cel-shaded materials
  targetFPS: 60                // 30 or 60
};

// Performance thresholds
export const PERFORMANCE = {
  // If FPS drops below this for sustained period, reduce effects
  lowFpsThreshold: 30,

  // Maximum triangle count per model
  maxPolycount: 5000,

  // Texture resolution limits
  textureSize: {
    mobile: 512,
    desktop: 1024
  }
};

// Placeholder geometry configuration (until real models arrive)
export const PLACEHOLDER_CONFIG = {
  baby: {
    bodyRadius: 0.5,
    bodyHeight: 0.8,
    earSize: 0.3,
    color: 0xffb3d9
  },
  teen: {
    bodyRadius: 0.7,
    bodyHeight: 1.2,
    earSize: 0.4,
    color: 0xff69b4
  },
  adult: {
    bodyRadius: 0.9,
    bodyHeight: 1.5,
    earSize: 0.5,
    color: 0xff1493
  }
};

// Evolution effect configuration
export const EVOLUTION_EFFECT = {
  duration: 3000,              // 3 seconds total
  glowDuration: 1000,          // Glow phase
  fadeDuration: 500,           // Fade out/in time
  particleCount: 100,          // Sparkles during evolution
  cameraShakeIntensity: 0.1
};

// Model specifications for artist reference
export const MODEL_SPECS = {
  format: 'GLB',
  targetPolycount: 5000,
  pivotPoint: [0, 0, 0],
  scale: '1 unit = 1 meter',
  rig: 'Shared skeleton across all stages',
  requiredAnimations: [
    { name: 'idle', duration: '2s', loop: true },
    { name: 'breathe', duration: '3s', loop: true },
    { name: 'tail_wag', duration: '1.5s', loop: true },
    { name: 'ear_twitch', duration: '0.5s', loop: false },
    { name: 'blink', duration: '0.3s', loop: false },
    { name: 'eat', duration: '2s', loop: false },
    { name: 'sleep', duration: '4s', loop: true },
    { name: 'play', duration: '2s', loop: true }
  ]
};
