import { personalityService } from '../services/personalityService.js';
import { levelingService } from '../services/evolutionService.js';
import { renderConsciousnessPanel, renderInnerMonologue, renderEpiphanyModal } from './ConsciousnessPanel.js';
import { renderChatPanel } from './ChatPanel.js';

export function renderCompanionView(state) {
  const { companion, messages, currentInnerMonologue } = state;
  const isSleeping = companion.status === 'sleeping';
  const isQuesting = companion.status === 'questing';
  const stage = companion.evolutionStage || 'baby';
  const personality = companion.personality;
  const mood = personality?.mood || 'happy';
  const moodEmoji = personalityService.getMoodEmoji(mood);

  // Calculate XP progress for current level
  const xpNeeded = levelingService.getXPForLevel(companion.level);
  const xpProgress = Math.floor((companion.experience / xpNeeded) * 100);

  // Get personality description
  const personalityDesc = personality
    ? personality.dominantTraits.slice(0, 2).join(', ')
    : 'curious';

  return `
    <div class="companion-container">
      <!-- Left Section: 3D View + Stats + Consciousness -->
      <div class="companion-3d-section">
        <!-- 3D Canvas -->
        <div style="flex: 1; position: relative; min-height: 400px;">
          <canvas id="arlo-canvas" style="width: 100%; height: 100%;"></canvas>
          <div class="loading-overlay" id="loading-3d" style="display: none;">
            <div class="loading-spinner"></div>
          </div>
          <!-- Fallback 2D Sprite -->
          <div class="companion-sprite fallback-2d" id="fallback-sprite" style="display: none;">
            <div class="sprite ${stage} ${isSleeping ? 'sleeping' : ''} ${isQuesting ? 'questing' : ''}">
              <div style="font-size: 100px; text-align: center;">
                ${stage === 'baby' ? '🐣' : stage === 'teen' ? '🦊' : '🦁'}
              </div>
              ${isSleeping ? '<div style="font-size: 40px; text-align: center;">💤</div>' : ''}
              ${isQuesting ? '<div style="font-size: 40px; text-align: center;">🗺️</div>' : ''}
            </div>
          </div>
        </div>

        <!-- Companion Info Badge -->
        <div style="
          margin-top: 20px;
          text-align: center;
          padding: 16px;
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
        ">
          <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">
            ${companion.name}
          </div>
          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">
            ${moodEmoji} ${mood} • ${stage} • Level ${companion.level}
          </div>
          <div style="font-size: 11px; color: #64748b; font-style: italic;">
            ${personalityDesc}
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-container">
          <div class="stat-card">
            <div class="stat-label">Happiness</div>
            <div class="stat-value">${companion.happiness}<span style="font-size: 14px; color: #94a3b8;">/100</span></div>
            <div class="stat-bar-container">
              <div class="stat-bar" style="width: ${companion.happiness}%"></div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Energy</div>
            <div class="stat-value">${companion.energy}<span style="font-size: 14px; color: #94a3b8;">/100</span></div>
            <div class="stat-bar-container">
              <div class="stat-bar" style="width: ${companion.energy}%"></div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Knowledge</div>
            <div class="stat-value">${companion.knowledge}<span style="font-size: 14px; color: #94a3b8;">/100</span></div>
            <div class="stat-bar-container">
              <div class="stat-bar" style="width: ${companion.knowledge}%"></div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Experience</div>
            <div class="stat-value" style="font-size: 14px;">${companion.experience}<span style="font-size: 11px; color: #94a3b8;">/${xpNeeded}</span></div>
            <div class="stat-bar-container">
              <div class="stat-bar" style="width: ${xpProgress}%; background: linear-gradient(90deg, #fbbf24, #f59e0b);"></div>
            </div>
          </div>
        </div>

        <!-- Consciousness Panel -->
        ${companion.consciousness ? renderConsciousnessPanel(companion) : ''}

        <!-- Inner Monologue -->
        ${currentInnerMonologue ? renderInnerMonologue(currentInnerMonologue) : ''}
      </div>

      <!-- Right Section: Chat Panel -->
      ${renderChatPanel(companion, messages)}
    </div>

    <!-- Epiphany Modal (if achieved) -->
    ${companion.consciousness?.hasEpiphany && !state.epiphanyDismissed ? renderEpiphanyModal(companion) : ''}
  `;
}
