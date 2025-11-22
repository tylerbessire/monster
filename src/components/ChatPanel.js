export function renderChatPanel(companion, messages) {
  if (!companion) {
    return '';
  }

  const isSleeping = companion.status === 'sleeping';
  const isQuesting = companion.status === 'questing';

  return `
    <div class="chat-panel">
      <div class="chat-messages" id="chat-messages">
        ${(messages || []).slice(-50).map(msg => `
          <div class="message ${msg.type}">
            <div class="message-avatar">
              ${msg.type === 'user' ? '👤' : (companion.evolutionStage === 'baby' ? '🐣' : companion.evolutionStage === 'teen' ? '🦊' : '🦁')}
            </div>
            <div class="message-content">
              ${msg.text}
              ${msg.quest ? `
                <div style="margin-top: 12px; padding: 12px; background: rgba(99, 102, 241, 0.2); border-radius: 8px; border-left: 3px solid var(--primary);">
                  <div style="font-weight: 600; margin-bottom: 4px;">📚 ${msg.quest.topic}</div>
                  <div style="font-size: 12px; color: #cbd5e1;">${msg.quest.fact}</div>
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="chat-input-container">
        ${!isSleeping && !isQuesting ? `
          <form id="chat-form" class="chat-form">
            <input
              type="text"
              id="chat-input"
              class="chat-input"
              placeholder="Talk to ${companion.name}..."
              maxlength="200"
            />
            <button type="submit" class="chat-send">
              Send
            </button>
          </form>
        ` : `
          <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 13px;">
            ${isSleeping ? `💤 ${companion.name} is sleeping...` : `🗺️ ${companion.name} is on a quest...`}
          </div>
        `}
      </div>
    </div>
  `;
}
