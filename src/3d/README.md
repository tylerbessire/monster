# 3D Pokémon Evolution System

This directory contains the complete 3D companion system for the AI pet project.

## Architecture

### Core Files

- **config.js** - Asset paths, animation names, evolution thresholds, and feature flags
- **sceneManager.js** - Three.js renderer, scene, camera, and lighting setup
- **models.js** - GLTF/GLB model loading with placeholder geometry fallback
- **animationController.js** - Animation playback, blending, and mood-based animations
- **evolutionController.js** - Evolution transitions and model swapping
- **effects.js** - Particle systems and visual effects
- **companion3DManager.js** - Main orchestrator that manages all 3D components

## Current Status

### ✅ Phase 1: Foundation Setup (COMPLETE)

- [x] Three.js and GSAP installed
- [x] Directory structure created
- [x] All core modules implemented
- [x] Canvas integration in CompanionView
- [x] Evolution thresholds updated (baby: 1-15, teen: 16-35, adult: 36+)
- [x] CSS styling added
- [x] WebGL detection and 2D fallback

### Features Implemented

1. **Scene Management**
   - Responsive Three.js canvas
   - Proper lighting setup (ambient, directional, rim)
   - Automatic cleanup on component unmount

2. **Model System**
   - GLTF/GLB loader with progress tracking
   - Placeholder geometry (capsule-based creatures) until real models arrive
   - Cel-shading material support
   - Model caching for performance

3. **Animation System**
   - Animation mixer with clip management
   - Crossfade blending between animations
   - Mood-based animation sets
   - Simple procedural animations for placeholders (breathing, ear twitches, tail wags)

4. **Evolution System**
   - Smooth evolution transitions
   - Glow → Fade out → Model swap → Fade in → Celebration sequence
   - Evolution thresholds: Level 16 (baby→teen), Level 36 (teen→adult)
   - Event emission for UI updates

5. **Effects**
   - Particle system with mood-based colors
   - Floating emoji icons (hearts, action icons)
   - Evolution particle burst effect

6. **Interactions**
   - Click detection with raycasting
   - Action button integration (feed, play, sleep, quest)
   - Happiness increase on companion click

## Usage

### Initialization

The 3D system automatically initializes when entering the companion view:

```javascript
// In app.js, automatically called on companion stage
init3DSystem(companionState);
```

### Playing Actions

```javascript
// Triggered from UI buttons
current3DManager.playAction('eat');    // Feed animation
current3DManager.playAction('play');   // Play animation
current3DManager.playAction('sleep');  // Sleep animation
```

### Updating Companion State

```javascript
// Called automatically when state changes
current3DManager.updateCompanion(companionState);
```

## Configuration

Edit `config.js` to configure:

- **Asset paths**: Model and texture locations
- **Evolution thresholds**: Level requirements for each stage
- **Feature flags**: Enable/disable particles, post-processing, shadows
- **Animation names**: Map friendly names to clip names
- **Mood animations**: Define which animations play for each mood
- **Shading settings**: Toon and rim lighting parameters
- **Mood colors**: Color schemes for different moods

```javascript
// Example: Disable particles on mobile
FEATURES.enableParticles = false;

// Example: Use real models instead of placeholders
ASSET_CONFIG.models.usePlaceholders = false;

// Example: Configure shading
ASSET_CONFIG.shading = {
  toon: true,
  rim: true,
  rimColor: '#88b7ff',
  rimStrength: 1.1
};

// Example: Define mood configurations
ASSET_CONFIG.moods = {
  happy:   { anim: 'tail_wag', color: '#ffd54f' },
  calm:    { anim: 'breathe',  color: '#90caf9' },
  sleepy:  { anim: 'sleep',    color: '#b39ddb' },
  playful: { anim: 'play',     color: '#ffab91' }
};
```

## Next Steps (Phase 2+)

### ✅ Phase 2: Enhanced Systems (COMPLETE)

All priority 2-4 features have been integrated:

- [x] **Toon + Rim Shader**: Custom shader material with cel-shading and rim lighting
- [x] **ParticlePool**: Efficient particle system for hearts, action effects, and evolution bursts
- [x] **CameraRig**: Smooth camera movements (dolly, shake) during interactions and evolution
- [x] **RaycasterInteractions**: Hover and click detection with cursor changes and particle bursts
- [x] **Evolution Timeline**: Enhanced evolution sequence with glow, fade, swap, celebration
- [x] **SoundManager**: Audio hooks for eat, play, and evolve actions (sound files not yet added)
- [x] **Model Pipeline**: Ready for real GLB models at `/public/models/companion_*.glb`

### New Module Integration

The following modules have been added and integrated:

1. **src/3d/shaders/toonRimMaterial.js**
   - Custom shader for toon shading with rim lighting
   - Preserves emissive colors while applying stylized rendering
   - Configurable via `ASSET_CONFIG.shading`

2. **src/3d/effects/particles.js**
   - `ParticlePool` class for efficient particle management
   - Burst effects for interactions and moods
   - Integrated with click handlers and action animations

3. **src/3d/camera/cameraRig.js**
   - `CameraRig` class for smooth camera movements
   - Dolly transitions during evolution
   - Camera shake for dramatic effects

4. **src/3d/interactions/raycasterInteractions.js**
   - `RaycasterInteractions` class for hover/click detection
   - Automatic cursor style changes
   - Integrated with particle bursts on click

5. **src/3d/evolution/evolutionTimeline.js**
   - `runEvolution` function for enhanced evolution sequences
   - Glow → Fade out → Swap → Fade in → Celebration
   - Camera movements and particle effects

6. **src/3d/sound/soundManager.js**
   - `SoundManager` class for audio playback
   - Ready for sound files (eat, play, evolve)
   - Volume control per sound

### Priority 5: Real Assets & Polish
- [ ] Add real 3D models (GLB files) to `/public/models/`
- [ ] Add sound effects to `/public/sounds/`
- [ ] Test with real models and animations
- [ ] Fine-tune shader parameters for each stage
- [ ] Performance optimization if needed

## Asset Requirements

When real 3D models are ready, they should follow these specs:

- **Format**: GLB (GLTF binary)
- **Polycount**: < 5,000 triangles per model
- **Scale**: 1 unit = 1 meter
- **Pivot**: Origin (0, 0, 0) at base
- **Rig**: Shared skeleton across all stages

### Required Animations

All animations should be baked into the GLB files:

- `idle` (loop, 2s)
- `breathe` (loop, 3s)
- `tail_wag` (loop, 1.5s)
- `ear_twitch` (one-shot, 0.5s)
- `blink` (one-shot, 0.3s)
- `eat` (one-shot, 2s)
- `sleep` (loop, 4s)
- `play` (loop, 2s)

See `config.js` MODEL_SPECS for complete requirements.

## Troubleshooting

### WebGL Not Available
- System automatically falls back to 2D CSS sprite
- Check browser WebGL support: https://get.webgl.org

### Models Not Loading
- Ensure GLB files are in `/public/models/` directory
- Check browser console for 404 errors
- Verify `ASSET_CONFIG.models.usePlaceholders` is set to `false`

### Low Performance
- Reduce `FEATURES.targetFPS` to 30
- Disable `FEATURES.enablePostProcessing`
- Disable `FEATURES.enableShadows`
- Reduce texture sizes in config

## File Structure

```
src/3d/
├── config.js                           # Configuration and asset contracts
├── sceneManager.js                     # Three.js core (renderer, scene, camera)
├── models.js                           # Model loading and placeholder geometry
├── animationController.js              # Animation playback and blending
├── evolutionController.js              # Evolution logic and transitions
├── effects.js                          # Particles and visual effects (legacy)
├── companion3DManager.js               # Main orchestrator
├── shaders/
│   └── toonRimMaterial.js             # Custom toon + rim shader
├── effects/
│   └── particles.js                   # New particle pool system
├── camera/
│   └── cameraRig.js                   # Camera movement controller
├── interactions/
│   └── raycasterInteractions.js       # Hover/click detection
├── evolution/
│   └── evolutionTimeline.js           # Enhanced evolution sequence
├── sound/
│   └── soundManager.js                # Audio playback manager
└── README.md                          # This file
```

## Events

The 3D system emits custom events:

- `companion-clicked` - When user clicks the 3D model
- `evolution-complete` - When evolution animation finishes

Listen for these in your app code:

```javascript
window.addEventListener('companion-clicked', () => {
  // Handle companion interaction
});

window.addEventListener('evolution-complete', (event) => {
  const { stage } = event.detail;
  // Update companion state
});
```

## Testing Evolution

To test evolution at different levels, use browser console:

```javascript
// Force level change to trigger evolution
store.setState({
  companion: {
    ...store.getState().companion,
    level: 16 // Baby → Teen
  }
});

// Or level 36 for Teen → Adult
```

---

**Status**: Phase 2 Complete ✅ (Enhanced Systems Integrated)
**Last Updated**: 2025-11-05
**Next Milestone**: Add real 3D models (GLB files) and sound effects

### Integration Summary

The following enhancements have been successfully integrated:

✅ **Config Updates**
- Model paths updated to `companion_baby/teen/adult.glb`
- `usePlaceholders` set to `false` (ready for real models)
- Added shading configuration (toon + rim lighting)
- Added mood-based animation and color mappings

✅ **Shader System**
- Toon + rim shader applied to all loaded models
- Preserves emissive materials while adding stylized rendering
- Configurable rim color and strength

✅ **Particle System**
- New ParticlePool for efficient particle management
- Heart particles on companion click
- Action-specific particle colors (eat, play, sleep, quest)
- Evolution celebration particles

✅ **Camera System**
- CameraRig with smooth dolly movements
- Camera shake during evolution
- Update loop integrated with scene manager

✅ **Interaction System**
- Raycaster hover detection with cursor changes
- Click detection with particle bursts
- Integrated with companion click events

✅ **Evolution System**
- Enhanced timeline: glow → fade → swap → fade → celebrate
- Uses new runEvolution function
- Camera movements during evolution
- Sound hooks (ready for audio files)
- Fallback to old system if new one fails

✅ **Audio System**
- SoundManager initialized and ready
- Hooks in playAction for eat/play sounds
- Hook in triggerEvolution for evolve sound
- Waiting for sound files to be added
