import { formatDistanceToNow } from 'date-fns';

export function renderCompanionView(state) {
  const { companion, messages } = state;
  const isSleeping = companion.status === 'sleeping';
  const isQuesting = companion.status === 'questing';
  
  return `
    <div class="companion-view">
      <div class="companion-header">
        <div class="companion-info">
          <div class="companion-name">${companion.name}</div>
          <div class="companion-status">
            ${isSleeping ? '😴 Sleeping' : isQuesting ? '🗺️ On Quest' : '✨ Awake'} • LV ${companion.level}
          </div>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">HAPPY</div>
            <div class="stat-bar">
              <div class="stat-fill" style="width: ${companion.happiness}%"></div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">ENERGY</div>
            <div class="stat-bar">
              <div class="stat-fill" style="width: ${companion.energy}%"></div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">KNOWLEDGE</div>
            <div class="stat-bar">
              <div class="stat-fill" style="width: ${companion.knowledge}%"></div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">EXP</div>
            <div class="stat-bar">
              <div class="stat-fill" style="width: ${(companion.experience % 100)}%"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="companion-sprite">
        <div class="sprite ${isSleeping ? 'sleeping' : ''}">
          <div class="sprite-body">
            <div class="sprite-ears">
              <div class="ear"></div>
              <div class="ear"></div>
            </div>
            <div class="sprite-eyes">
              <div class="eye"></div>
              <div class="eye"></div>
            </div>
            <div class="sprite-cheeks">
              <div class="cheek"></div>
              <div class="cheek"></div>
            </div>
            <div class="sprite-mouth"></div>
            <div class="sprite-tail"></div>
          </div>
          ${isSleeping ? '<div class="sleep-indicator">zzz</div>' : ''}
        </div>
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
