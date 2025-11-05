export function renderChatPanel(state) {
  const { companion, messages } = state;
  if (!companion) {
    return '';
  }

  const isSleeping = companion.status === 'sleeping';
  const isQuesting = companion.status === 'questing';
  const statusClass = !isSleeping && !isQuesting ? 'active' : 'inactive';

  return `
    <aside class="chat-sidebar" data-theme="${state.theme}">
      <div class="chat-header">
        <div class="chat-title">Chat with ${companion.name}</div>
        <div class="chat-status ${statusClass}">
          ${isSleeping ? '😴 Resting' : isQuesting ? '🗺️ On a quest' : '💬 Ready'}
        </div>
      </div>
      <div class="chat-container">
        <div class="chat-messages">
          ${messages.slice(-20).map(msg => `
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
      </div>
      <div class="chat-footer">
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
        ` : `
          <div class="chat-disabled">
            ${isSleeping ? `${companion.name} is sleeping. Try again soon!` : `${companion.name} is exploring. Wait for the quest to finish!`}
          </div>
        `}
      </div>
    </aside>
  `;
}
