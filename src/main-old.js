import './style.css';
import { createStore } from './store.js';
import { renderCompanionView } from './components/CompanionView.js';

const store = createStore();

// Load saved state
const savedState = localStorage.getItem('companionState');
if (savedState) {
  const parsed = JSON.parse(savedState);
  store.setState(parsed);
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
        ></button>
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
  
  app.innerHTML = `
    <div class="gameboy-screen" data-theme="${state.theme}">
      ${renderThemeSelector()}
      <div class="screen-inner">
        ${content}
      </div>
      ${state.stage === 'companion' ? `
        <div class="controls">
          <button class="control-button" id="feed-btn" title="Feed">🍎</button>
          <button class="control-button" id="play-btn" title="Play">🎮</button>
          <button class="control-button" id="quest-btn" title="Quest">🗺️</button>
          <button class="control-button" id="sleep-btn" title="Sleep">😴</button>
        </div>
      ` : ''}
    </div>
  `;
  
  attachEventListeners();
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
        bornAt: Date.now()
      };
      
      store.setState({ 
        stage: 'companion', 
        companion,
        messages: [{
          type: 'companion',
          text: `Hi! I'm ${name}! Let's be friends! 💖`,
          timestamp: Date.now()
        }]
      });
    });
  }
  
  if (state.stage === 'companion') {
    const chatForm = document.querySelector('#chat-form');
    chatForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.querySelector('#chat-input');
      const text = input.value.trim();
      
      if (!text) return;
      
      const newMessages = [
        ...state.messages,
        { type: 'user', text, timestamp: Date.now() }
      ];
      
      // Simple AI response
      setTimeout(() => {
        const responses = [
          "That's so cool! Tell me more! 🌟",
          "I love learning new things! 📚",
          "You're the best friend ever! 💕",
          "Wow, that's amazing! ✨",
          "I'm so happy we're friends! 🎉"
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        store.setState({
          messages: [
            ...store.getState().messages,
            { type: 'companion', text: response, timestamp: Date.now() }
          ],
          companion: {
            ...store.getState().companion,
            happiness: Math.min(100, store.getState().companion.happiness + 5),
            experience: store.getState().companion.experience + 2
          }
        });
      }, 1000);
      
      store.setState({ messages: newMessages });
      input.value = '';
    });
    
    // Control buttons
    document.querySelector('#feed-btn')?.addEventListener('click', () => {
      const companion = state.companion;
      store.setState({
        companion: {
          ...companion,
          happiness: Math.min(100, companion.happiness + 10),
          energy: Math.min(100, companion.energy + 15)
        },
        messages: [
          ...state.messages,
          { type: 'companion', text: 'Yummy! Thank you! 🍎✨', timestamp: Date.now() }
        ]
      });
    });
    
    document.querySelector('#play-btn')?.addEventListener('click', () => {
      const companion = state.companion;
      store.setState({
        companion: {
          ...companion,
          happiness: Math.min(100, companion.happiness + 15),
          energy: Math.max(0, companion.energy - 10),
          experience: companion.experience + 5
        },
        messages: [
          ...state.messages,
          { type: 'companion', text: 'That was so fun! 🎮💫', timestamp: Date.now() }
        ]
      });
    });
    
    document.querySelector('#quest-btn')?.addEventListener('click', () => {
      const topics = ['Space', 'Ocean', 'History', 'Science', 'Art', 'Music', 'Nature', 'Technology'];
      const topic = topics[Math.floor(Math.random() * topics.length)];
      
      store.setState({
        companion: {
          ...state.companion,
          status: 'questing'
        },
        messages: [
          ...state.messages,
          { type: 'companion', text: `Going on a quest to learn about ${topic}! Be back soon! 🗺️✨`, timestamp: Date.now() }
        ]
      });
      
      setTimeout(() => {
        const facts = [
          'Did you know stars are giant balls of hot gas?',
          'The ocean covers 71% of Earth!',
          'Ancient pyramids were built without modern tools!',
          'Light travels at 299,792 km per second!',
          'Music can change your mood instantly!',
          'Trees communicate through underground networks!'
        ];
        
        const fact = facts[Math.floor(Math.random() * facts.length)];
        
        store.setState({
          companion: {
            ...store.getState().companion,
            status: 'awake',
            knowledge: Math.min(100, store.getState().companion.knowledge + 10),
            experience: store.getState().companion.experience + 15
          },
          messages: [
            ...store.getState().messages,
            { 
              type: 'companion', 
              text: "I'm back from my quest! I learned something amazing!",
              quest: { topic, fact },
              timestamp: Date.now() 
            }
          ]
        });
      }, 5000);
    });
    
    document.querySelector('#sleep-btn')?.addEventListener('click', () => {
      store.setState({
        companion: {
          ...state.companion,
          status: 'sleeping'
        },
        messages: [
          ...state.messages,
          { type: 'companion', text: 'Goodnight! 😴💤', timestamp: Date.now() }
        ]
      });
      
      setTimeout(() => {
        store.setState({
          companion: {
            ...store.getState().companion,
            status: 'awake',
            energy: 100
          },
          messages: [
            ...store.getState().messages,
            { type: 'companion', text: 'Good morning! I feel refreshed! ✨', timestamp: Date.now() }
          ]
        });
      }, 8000);
    });
  }
}

store.subscribe(render);
render();
