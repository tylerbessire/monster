import { personalityService } from '../services/personalityService.js';
import { levelingService } from '../services/evolutionService.js';

export function renderCompanionView(state) {
  const { companion, messages } = state;
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
    <div class="companion-view">
      <div class="companion-header">
        <div class="companion-info">
          <div class="companion-name">${companion.name}</div>
          <div class="companion-status">
            ${moodEmoji} ${mood} • ${stage} • LV ${companion.level}
          </div>
          <div class="companion-personality">${personalityDesc}</div>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">HAPPY</div>
            <div class="stat-bar">
              <div class="stat-fill happy" style="width: ${companion.happiness}%"></div>
            </div>
            <div class="stat-value">${companion.happiness}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">ENERGY</div>
            <div class="stat-bar">
              <div class="stat-fill energy" style="width: ${companion.energy}%"></div>
            </div>
            <div class="stat-value">${companion.energy}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">KNOWLEDGE</div>
            <div class="stat-bar">
              <div class="stat-fill knowledge" style="width: ${companion.knowledge}%"></div>
            </div>
            <div class="stat-value">${companion.knowledge}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">EXP</div>
            <div class="stat-bar">
              <div class="stat-fill exp" style="width: ${xpProgress}%"></div>
            </div>
            <div class="stat-value">${companion.experience}/${xpNeeded}</div>
          </div>
        </div>
      </div>
      
      <div class="companion-sprite">
        <div class="sprite ${stage} ${isSleeping ? 'sleeping' : ''} ${isQuesting ? 'questing' : ''}">
          <div class="sprite-body">
            <div class="sprite-ears">
              <div class="ear"></div>
              <div class="ear"></div>
            </div>
            <div class="sprite-eyes">
              <div class="eye ${isSleeping ? 'closed' : ''}"></div>
              <div class="eye ${isSleeping ? 'closed' : ''}"></div>
            </div>
            <div class="sprite-cheeks">
              <div class="cheek"></div>
              <div class="cheek"></div>
            </div>
            <div class="sprite-mouth"></div>
            ${stage !== 'baby' ? '<div class="sprite-tail"></div>' : ''}
          </div>
          ${isSleeping ? '<div class="sleep-indicator">zzz</div>' : ''}
          ${isQuesting ? '<div class="quest-indicator">🗺️</div>' : ''}
        </div>
        <div class="stage-badge">${stage}</div>
      </div>
      
      <div class="chat-container">
        ${messages.slice(-5).map(msg => `
          <div class="message-bubble ${msg.type}">
            ${msg.text}
            ${msg.quest ? `
              <div class="quest-report">
                <div class="quest-title">📚 ${msg.quest.topic}</div>
                <div class="quest-content">${msg.quest.fact}</div>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
      
      ${!isSleeping && !isQuesting ? `
        <form id="chat-form" class="input-container">
          <input 
            type="text" 
            id="chat-input"
            class="chat-input" 
            placeholder="Talk to ${companion.name}..."
            maxlength="100"
          />
          <button type="submit" class="send-button">SEND</button>
        </form>
      ` : ''}
    </div>
  `;
}
