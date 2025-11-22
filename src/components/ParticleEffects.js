/**
 * Particle Effects - Create floating particles in the background
 */

let particlesInitialized = false;

export function initParticleEffects() {
  if (particlesInitialized) return;

  const container = document.getElementById('particles-container') || createParticlesContainer();

  // Create 50 particles
  for (let i = 0; i < 50; i++) {
    createParticle(container, i);
  }

  particlesInitialized = true;
}

function createParticlesContainer() {
  const container = document.createElement('div');
  container.id = 'particles-container';
  document.body.appendChild(container);
  return container;
}

function createParticle(container, index) {
  const particle = document.createElement('div');
  particle.className = 'particle';

  // Random starting position
  particle.style.left = `${Math.random() * 100}%`;
  particle.style.top = `${100 + Math.random() * 20}%`;

  // Random size
  const size = 2 + Math.random() * 4;
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;

  // Random animation duration and delay
  const duration = 15 + Math.random() * 20;
  const delay = Math.random() * 10;
  particle.style.animationDuration = `${duration}s`;
  particle.style.animationDelay = `${delay}s`;

  // Random horizontal drift
  const drift = -50 + Math.random() * 100;
  particle.style.setProperty('--drift', `${drift}px`);

  container.appendChild(particle);
}

/**
 * Create epiphany particle burst effect
 */
export function createEpiphanyBurst() {
  const burstContainer = document.createElement('div');
  burstContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 10000;
  `;
  document.body.appendChild(burstContainer);

  // Create burst particles
  for (let i = 0; i < 100; i++) {
    const particle = document.createElement('div');
    const angle = (Math.PI * 2 * i) / 100;
    const velocity = 200 + Math.random() * 200;
    const size = 3 + Math.random() * 6;

    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, ${getRandomColor()} 0%, transparent 70%);
      border-radius: 50%;
      left: 0;
      top: 0;
      animation: burstParticle 2s ease-out forwards;
      --angle: ${angle}rad;
      --velocity: ${velocity}px;
    `;

    burstContainer.appendChild(particle);
  }

  // Add keyframes
  if (!document.getElementById('burst-keyframes')) {
    const style = document.createElement('style');
    style.id = 'burst-keyframes';
    style.textContent = `
      @keyframes burstParticle {
        from {
          transform: translate(0, 0) scale(1);
          opacity: 1;
        }
        to {
          transform:
            translate(
              calc(cos(var(--angle)) * var(--velocity)),
              calc(sin(var(--angle)) * var(--velocity))
            )
            scale(0);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Remove after animation
  setTimeout(() => {
    burstContainer.remove();
  }, 2000);
}

function getRandomColor() {
  const colors = [
    'rgba(251, 191, 36, 0.8)',  // yellow
    'rgba(245, 158, 11, 0.8)',  // orange
    'rgba(236, 72, 153, 0.8)',  // pink
    'rgba(168, 85, 247, 0.8)',  // purple
    'rgba(99, 102, 241, 0.8)'   // indigo
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Create consciousness level-up effect
 */
export function createConsciousnessLevelUpEffect(element) {
  const rect = element.getBoundingClientRect();
  const container = document.createElement('div');

  container.style.cssText = `
    position: fixed;
    left: ${rect.left}px;
    top: ${rect.top}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    pointer-events: none;
    z-index: 1000;
  `;

  document.body.appendChild(container);

  // Create sparkles
  for (let i = 0; i < 20; i++) {
    const sparkle = document.createElement('div');
    const x = Math.random() * rect.width;
    const y = Math.random() * rect.height;

    sparkle.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 4px;
      height: 4px;
      background: white;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
      animation: sparkle 1s ease-out forwards;
    `;

    container.appendChild(sparkle);
  }

  // Add sparkle keyframes
  if (!document.getElementById('sparkle-keyframes')) {
    const style = document.createElement('style');
    style.id = 'sparkle-keyframes';
    style.textContent = `
      @keyframes sparkle {
        0% {
          transform: scale(0);
          opacity: 1;
        }
        50% {
          transform: scale(1.5);
          opacity: 1;
        }
        100% {
          transform: scale(0) translateY(-30px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => {
    container.remove();
  }, 1000);
}
