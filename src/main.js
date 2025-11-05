import './style.css';
import { createStore } from './store.js';
import { renderCompanionView } from './components/CompanionView.js';
import { renderChatPanel } from './components/ChatPanel.js';
import { aiService } from './services/aiService.js';
import { personalityService } from './services/personalityService.js';
import { questService } from './services/questService.js';
import { minigameService } from './services/minigameService.js';
import { levelingService } from './services/evolutionService.js';

const store = createStore();

function ensureChatScrolled() {
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) return;
  // Keep the newest messages visible without manual scroll
  requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

// Load saved state
const savedState = localStorage.getItem('companionState');
if (savedState) {
  try {
    const parsed = JSON.parse(savedState);
    store.setState(parsed);
  } catch (e) {
    console.error('Failed to load saved state:', e);
  }
}

// Auto-save every 5 seconds
setInterval(() => {
  localStorage.setItem('companionState', JSON.stringify(store.getState()));
}, 5000);

function renderThemeSelector() {
  const themes = ['classic', 'ocean', 'sunset', 'forest', 'candy'];
  const currentTheme = store.getState().theme;

  return `
    <div class="theme-selector">
      ${themes.map(theme => `
        <button
          class="theme-button ${theme === currentTheme ? 'active' : ''}"
          data-theme="${theme}"
          aria-label="${theme} theme"
          title="${theme}"
        ></button>
      `).join('')}
    </div>
  `;
}

function renderNotifications() {
  const state = store.getState();
  const notifications = state.notifications || [];

  return `
    <div class="notifications-container">
      ${notifications.map(notif => `
        <div class="notification ${notif.type}" data-id="${notif.id}">
          <div class="notification-content">${notif.message.replace(/\n/g, '<br/>')}</div>
          <button class="notification-close" data-id="${notif.id}">×</button>
        </div>
      `).join('')}
    </div>
  `;
}

function renderEggStage() {
  const state = store.getState();
  return `
    <div class="egg-container">
      <div class="egg ${state.eggShaking ? 'shaking' : ''}">
        <div class="egg-pixel">
          <div class="crack crack-1 ${state.eggShaking ? 'visible' : ''}"></div>
          <div class="crack crack-2 ${state.eggShaking ? 'visible' : ''}"></div>
          <div class="crack crack-3 ${state.eggShaking ? 'visible' : ''}"></div>
        </div>
      </div>
      <div class="pixel-text">
        A mysterious egg...<br/>
        What could be inside?
      </div>
      <button class="hatch-button" id="hatch-btn">
        TAP TO HATCH
      </button>
    </div>
  `;
}

function renderSignupStage() {
  const state = store.getState();
  return `
    <div class="signup-form">
      <div class="pixel-text">
        Your companion is<br/>
        about to hatch!
      </div>
      <form id="signup-form">
        <div class="form-group">
          <label class="form-label">NAME YOUR COMPANION</label>
          <input
            type="text"
            class="form-input"
            id="companion-name"
            placeholder="Enter name..."
            maxlength="12"
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label">CHOOSE GENDER</label>
          <div class="gender-options">
            <button
              type="button"
              class="gender-button ${state.selectedGender === 'boy' ? 'selected' : ''}"
              data-gender="boy"
            >
              BOY
            </button>
            <button
              type="button"
              class="gender-button ${state.selectedGender === 'girl' ? 'selected' : ''}"
              data-gender="girl"
            >
              GIRL
            </button>
          </div>
        </div>
        <button type="submit" class="hatch-button">
          COMPLETE HATCH
        </button>
      </form>
    </div>
  `;
}

function render() {
  const state = store.getState();
  const app = document.querySelector('#app');

  let content = '';

  if (state.stage === 'egg') {
    content = renderEggStage();
  } else if (state.stage === 'signup') {
    content = renderSignupStage();
  } else if (state.stage === 'companion') {
    content = renderCompanionView(state);
  }

  const gameboyMarkup = `
    <div class="gameboy-screen" data-theme="${state.theme}">
      ${renderThemeSelector()}
      <div class="screen-inner">
        ${content}
      </div>
      ${state.stage === 'companion' ? `
        <div class="controls">
          <button class="control-button" id="feed-btn" title="Feed (${personalityService.getMoodEmoji('happy')} +10, ⚡ +15)">🍎</button>
          <button class="control-button" id="play-btn" title="Play (${personalityService.getMoodEmoji('joyful')} +15, 💡 XP +${levelingService.getActivityXP('play')})">🎮</button>
          <button class="control-button" id="quest-btn" title="Quest (🧠 +10-20, 💡 XP +${levelingService.getActivityXP('quest')})">🗺️</button>
          <button class="control-button" id="minigame-btn" title="Mini-Games">🎯</button>
          <button class="control-button" id="achievements-btn" title="Achievements">🏆</button>
        </div>
      ` : ''}
    </div>
  `;

  const layoutMarkup = state.stage === 'companion'
    ? `<div class="app-layout">${gameboyMarkup}${renderChatPanel(state)}</div>`
    : `<div class="single-layout">${gameboyMarkup}</div>`;

  app.innerHTML = `
    ${renderNotifications()}
    ${layoutMarkup}
  `;

  attachEventListeners();

  if (state.stage === 'companion') {
    ensureChatScrolled();
  }
}

function attachEventListeners() {
  const state = store.getState();

  // Theme selector
  document.querySelectorAll('.theme-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      store.setState({ theme });
    });
  });

  // Notification close buttons
  document.querySelectorAll('.notification-close').forEach(btn => {
    btn.addEventListener('click', () => {
      store.dismissNotification(Number(btn.dataset.id));
    });
  });

  if (state.stage === 'egg') {
    const hatchBtn = document.querySelector('#hatch-btn');
    hatchBtn?.addEventListener('click', () => {
      store.setState({ eggShaking: true });
      setTimeout(() => {
        store.setState({ stage: 'signup', eggShaking: false });
      }, 2000);
    });
  }

  if (state.stage === 'signup') {
    document.querySelectorAll('.gender-button').forEach(btn => {
      btn.addEventListener('click', () => {
        store.setState({ selectedGender: btn.dataset.gender });
      });
    });

    const form = document.querySelector('#signup-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.querySelector('#companion-name').value;
      const gender = state.selectedGender;

      if (!gender) {
        alert('Please choose a gender!');
        return;
      }

      const companion = {
        name,
        gender,
        level: 1,
        experience: 0,
        happiness: 80,
        energy: 100,
        knowledge: 10,
        status: 'awake',
        bornAt: Date.now(),
        evolutionStage: 'baby',
        personality: personalityService.initializePersonality(),
        mood: 'happy',
        achievements: {
          unlocked: [],
          progress: {
            chats: 0,
            feeds: 0,
            plays: 0,
            quests: 0,
            minigamesPlayed: 0,
            minigamesWon: 0,
            daysPlayed: 1,
            lastPlayDate: new Date().toDateString()
          }
        },
        memories: [],
        questHistory: []
      };

      store.setState({
        stage: 'companion',
        companion,
        messages: [{
          type: 'companion',
          text: `*hatches from egg* Goo goo! ${personalityService.getMoodEmoji('joyful')}`,
          timestamp: Date.now()
        }]
      });
    });
  }

  if (state.stage === 'companion') {
    setupCompanionListeners();
  }
}

function setupCompanionListeners() {
  const state = store.getState();

  // Chat form
  const chatForm = document.querySelector('#chat-form');
  chatForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.querySelector('#chat-input');
    const text = input.value.trim();

    if (!text) return;

    // Add user message
    const newMessages = [
      ...state.messages,
      { type: 'user', text, timestamp: Date.now() }
    ];

    store.setState({ messages: newMessages });
    input.value = '';

    // Analyze message for personality/memory
    const analysis = aiService.analyzeMessage(text);

    // Extract memory if important
    const memory = aiService.extractMemory(state.companion, text, analysis);
    if (memory) {
      const updatedCompanion = {
        ...store.getState().companion,
        memories: [...(store.getState().companion.memories || []), memory].slice(-50)
      };
      store.setState({ companion: updatedCompanion });
    }

    // Get AI response
    const response = await aiService.getResponse(
      store.getState().companion,
      store.getState().messages.slice(-10),
      text
    );

    // Update personality and stats
    store.updatePersonality('chat', analysis.sentiment);

    setTimeout(() => {
      const currentState = store.getState();
      store.setState({
        messages: [
          ...currentState.messages,
          { type: 'companion', text: response, timestamp: Date.now() }
        ]
      });

      // Update stats and check achievements
      const companion = currentState.companion;
      store.setState({
        companion: {
          ...companion,
          happiness: Math.min(100, companion.happiness + (analysis.sentiment === 'positive' ? 5 : 2)),
          knowledge: Math.min(100, companion.knowledge + 1)
        }
      });

      // Add XP and check achievements
      store.addXP(levelingService.getActivityXP('chat'), 'Chatting');
      store.checkAchievements('chat', 1);
    }, 1000);
  });

  // Feed button
  document.querySelector('#feed-btn')?.addEventListener('click', () => {
    const companion = state.companion;
    if (companion.energy >= 95) {
      store.addNotification({
        type: 'info',
        message: `${companion.name} is already full! 🍎`
      });
      return;
    }

    store.updatePersonality('feed');

    store.setState({
      companion: {
        ...companion,
        happiness: Math.min(100, companion.happiness + 10),
        energy: Math.min(100, companion.energy + 15)
      },
      messages: [
        ...state.messages,
        { type: 'companion', text: '*munch munch* Yummy! Thank you! 🍎✨', timestamp: Date.now() }
      ]
    });

    store.addXP(levelingService.getActivityXP('feed'), 'Feeding');
    store.checkAchievements('feed', 1);
  });

  // Play button
  document.querySelector('#play-btn')?.addEventListener('click', () => {
    const companion = state.companion;
    if (companion.energy < 10) {
      store.addNotification({
        type: 'warning',
        message: `${companion.name} is too tired to play! Let them rest 😴`
      });
      return;
    }

    store.updatePersonality('play');

    store.setState({
      companion: {
        ...companion,
        happiness: Math.min(100, companion.happiness + 15),
        energy: Math.max(0, companion.energy - 10)
      },
      messages: [
        ...state.messages,
        { type: 'companion', text: 'Yay! That was so fun! Let\'s play more! 🎮💫', timestamp: Date.now() }
      ]
    });

    store.addXP(levelingService.getActivityXP('play'), 'Playing');
    store.checkAchievements('play', 1);
  });

  // Quest button
  document.querySelector('#quest-btn')?.addEventListener('click', () => {
    const companion = state.companion;
    if (companion.status === 'questing') {
      store.addNotification({
        type: 'info',
        message: `${companion.name} is already on a quest!`
      });
      return;
    }

    if (companion.energy < 20) {
      store.addNotification({
        type: 'warning',
        message: `${companion.name} needs more energy for a quest!`
      });
      return;
    }

    const quest = questService.generateQuest(companion);

    store.updatePersonality('quest');

    store.setState({
      companion: {
        ...companion,
        status: 'questing',
        energy: Math.max(0, companion.energy - 20),
        currentQuest: quest
      },
      messages: [
        ...state.messages,
        {
          type: 'companion',
          text: `I'm going on a ${quest.type} quest to learn about ${quest.topic}! Be back soon! 🗺️✨`,
          timestamp: Date.now()
        }
      ]
    });

    // Complete quest after duration
    setTimeout(() => {
      completeQuest(quest);
    }, quest.duration);
  });

  // Minigame button
  document.querySelector('#minigame-btn')?.addEventListener('click', () => {
    store.setState({ showMinigames: !state.showMinigames });
  });

  // Achievements button
  document.querySelector('#achievements-btn')?.addEventListener('click', () => {
    store.setState({ showAchievements: !state.showAchievements });
  });
}

function completeQuest(quest) {
  const currentState = store.getState();
  const companion = currentState.companion;

  const result = questService.completeQuest(quest, companion);

  store.setState({
    companion: {
      ...companion,
      status: 'awake',
      knowledge: Math.min(100, companion.knowledge + result.rewards.knowledge),
      happiness: Math.min(100, companion.happiness + result.rewards.happiness),
      currentQuest: null,
      questHistory: [...(companion.questHistory || []), result.quest].slice(-20)
    },
    messages: [
      ...currentState.messages,
      {
        type: 'companion',
        text: result.message,
        quest: questService.getQuestReport(result.quest),
        timestamp: Date.now()
      }
    ]
  });

  store.addXP(result.rewards.xp, `Completed ${quest.type} quest`);
  store.checkAchievements('quest', 1);
}

store.subscribe(render);
render();

// Check llama.cpp connection status on startup
setTimeout(() => {
  aiService.checkAvailability();
}, 1000);
