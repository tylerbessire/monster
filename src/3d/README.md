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

```javascript
// Example: Disable particles on mobile
FEATURES.enableParticles = false;

// Example: Use real models instead of placeholders
ASSET_CONFIG.models.usePlaceholders = false;
```

## Next Steps (Phase 2+)

### Priority 2: Model Pipeline
- [ ] Commission/create 3D models for baby, teen, adult stages
- [ ] Import real GLB files with baked animations
- [ ] Test model swapping at evolution thresholds

### Priority 3: Animation & Interaction
- [ ] Connect mood system to animation variations
- [ ] Add raycaster-based interactions (hover effects)
- [ ] Implement action queue for complex sequences

### Priority 4: Polish & Effects
- [ ] Full cel-shading shader with rim lighting
- [ ] Camera shake on evolution
- [ ] Sound effect integration
- [ ] Evolution preview UI

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
├── config.js              # Configuration and asset contracts
├── sceneManager.js        # Three.js core (renderer, scene, camera)
├── models.js              # Model loading and placeholder geometry
├── animationController.js # Animation playback and blending
├── evolutionController.js # Evolution logic and transitions
├── effects.js             # Particles and visual effects
├── companion3DManager.js  # Main orchestrator
└── README.md              # This file
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

**Status**: Phase 1 Complete ✅
**Last Updated**: 2025-11-05
**Next Milestone**: Commission 3D models and integrate real assets
