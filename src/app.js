import { createStore } from './store';
import { renderEggStage } from './components/EggStage';
import { renderSignupForm } from './components/SignupForm';
import { renderCompanionView } from './components/CompanionView';
import { get3DManager, dispose3DCompanion, Companion3DManager } from './3d/companion3DManager.js';

const store = createStore();
let current3DManager = null;
let currentStage = null;

export function initApp() {
  const app = document.getElementById('app');

  function render() {
    const state = store.getState();
    const previousStage = currentStage;
    currentStage = state.stage;

    app.innerHTML = `
      <div class="gameboy-screen">
        <div class="screen-inner">
          ${renderCurrentStage(state)}
        </div>
        ${state.stage === 'companion' ? renderControls() : ''}
      </div>
    `;

    attachEventListeners();

    // Handle 3D initialization/cleanup
    if (state.stage === 'companion' && previousStage !== 'companion') {
      // Initialize 3D when entering companion view
      init3DSystem(state.companion);
    } else if (previousStage === 'companion' && state.stage !== 'companion') {
      // Dispose 3D when leaving companion view
      dispose3DSystem();
    } else if (state.stage === 'companion') {
      // Update 3D if already initialized
      update3DSystem(state.companion);
    }
  }
  
  function renderCurrentStage(state) {
    switch(state.stage) {
      case 'egg':
        return renderEggStage(state);
      case 'signup':
        return renderSignupForm(state);
      case 'companion':
        return renderCompanionView(state);
      default:
        return renderEggStage(state);
    }
  }
  
  function renderControls() {
    return `
      <div class="controls">
        <button class="control-button" data-action="feed">🍖</button>
        <button class="control-button" data-action="play">🎮</button>
        <button class="control-button" data-action="sleep">😴</button>
        <button class="control-button" data-action="quest">🗺️</button>
      </div>
    `;
  }
  
  function attachEventListeners() {
    const state = store.getState();
    
    // Egg stage
    const hatchButton = document.querySelector('[data-action="hatch"]');
    if (hatchButton) {
      hatchButton.addEventListener('click', () => {
        store.setState({ stage: 'signup' });
        render();
      });
    }
    
    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      const genderButtons = document.querySelectorAll('.gender-button');
      genderButtons.forEach(button => {
        button.addEventListener('click', () => {
          genderButtons.forEach(b => b.classList.remove('selected'));
          button.classList.add('selected');
          store.setState({ selectedGender: button.dataset.gender });
        });
      });
      
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(signupForm);
        const name = formData.get('name');
        const gender = state.selectedGender || 'neutral';
        
        if (name) {
          store.setState({
            stage: 'companion',
            companion: {
              name,
              gender,
              level: 1,
              experience: 0,
              happiness: 80,
              energy: 100,
              knowledge: 50,
              status: 'awake',
              lastInteraction: Date.now(),
              memories: [],
              quests: []
            },
            messages: [
              {
                type: 'companion',
                text: `*hatches from egg* Hi! I'm ${name}! Nice to meet you! 🌟`,
                timestamp: Date.now()
              }
            ]
          });
          render();
        }
      });
    }
    
    // Companion controls
    const controlButtons = document.querySelectorAll('.control-button');
    controlButtons.forEach(button => {
      button.addEventListener('click', () => {
        handleAction(button.dataset.action);
      });
    });
    
    // Chat input
    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (message) {
          handleMessage(message);
          input.value = '';
        }
      });
    }
  }
  
  function handleAction(action) {
    const state = store.getState();
    const companion = state.companion;

    // Trigger 3D animation
    if (current3DManager && current3DManager.isInitialized) {
      current3DManager.playAction(action);
    }

    let newMessage = '';
    let statChanges = {};

    switch(action) {
      case 'feed':
        statChanges = { happiness: Math.min(100, companion.happiness + 10) };
        newMessage = `*munch munch* Thanks! That was delicious! 😋`;
        break;
      case 'play':
        statChanges = {
          happiness: Math.min(100, companion.happiness + 15),
          energy: Math.max(0, companion.energy - 10)
        };
        newMessage = `Yay! That was so much fun! Let's play again soon! 🎉`;
        break;
      case 'sleep':
        statChanges = {
          status: 'sleeping',
          energy: 100
        };
        newMessage = `*yawns* I'm getting sleepy... zzz 😴`;
        setTimeout(() => {
          const currentState = store.getState();
          store.setState({
            companion: {
              ...currentState.companion,
              status: 'awake'
            },
            messages: [
              ...currentState.messages,
              {
                type: 'companion',
                text: `*wakes up* Good morning! I feel refreshed! ✨`,
                timestamp: Date.now()
              }
            ]
          });
          render();
        }, 5000);
        break;
      case 'quest':
        statChanges = {
          status: 'questing',
          energy: Math.max(0, companion.energy - 20)
        };
        newMessage = `I'm going on an adventure! I'll be back with something interesting! 🗺️`;
        setTimeout(() => {
          completeQuest();
        }, 8000);
        break;
    }

    store.setState({
      companion: {
        ...companion,
        ...statChanges,
        lastInteraction: Date.now()
      },
      messages: [
        ...state.messages,
        {
          type: 'companion',
          text: newMessage,
          timestamp: Date.now()
        }
      ]
    });

    render();
  }
  
  function completeQuest() {
    const state = store.getState();
    const companion = state.companion;
    
    const questTopics = [
      { topic: 'Ancient Civilizations', fact: 'The ancient Egyptians used hieroglyphics as one of the earliest writing systems!' },
      { topic: 'Space Exploration', fact: 'Did you know there are more stars in the universe than grains of sand on Earth?' },
      { topic: 'Ocean Mysteries', fact: 'We\'ve explored less than 5% of Earth\'s oceans! So much to discover!' },
      { topic: 'Technology History', fact: 'The first computer bug was an actual moth found in a computer in 1947!' },
      { topic: 'Nature Wonders', fact: 'Trees can communicate with each other through underground fungal networks!' },
      { topic: 'Music Theory', fact: 'Music can actually help plants grow faster! They respond to vibrations!' },
      { topic: 'Art History', fact: 'The Mona Lisa has no eyebrows because it was fashionable to shave them in Renaissance Italy!' },
      { topic: 'Animal Behavior', fact: 'Octopuses have three hearts and blue blood! They\'re amazing creatures!' }
    ];
    
    const quest = questTopics[Math.floor(Math.random() * questTopics.length)];
    
    store.setState({
      companion: {
        ...companion,
        status: 'awake',
        knowledge: Math.min(100, companion.knowledge + 10),
        experience: companion.experience + 25,
        quests: [...companion.quests, quest]
      },
      messages: [
        ...state.messages,
        {
          type: 'companion',
          text: `I'm back! I learned something amazing!`,
          timestamp: Date.now(),
          quest: quest
        }
      ]
    });
    
    render();
  }
  
  function handleMessage(message) {
    const state = store.getState();
    
    store.setState({
      messages: [
        ...state.messages,
        {
          type: 'user',
          text: message,
          timestamp: Date.now()
        }
      ]
    });
    
    render();
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        `That's really interesting! Tell me more! 🤔`,
        `I love learning new things from you! 💡`,
        `Wow! I never thought about it that way! ✨`,
        `You're teaching me so much! Thank you! 🌟`,
        `That reminds me of something I learned on my last quest! 🗺️`,
        `I'm storing this in my memory banks! 🧠`,
        `This is going to help me on future adventures! 🚀`
      ];
      
      const currentState = store.getState();
      const companion = currentState.companion;
      
      store.setState({
        companion: {
          ...companion,
          knowledge: Math.min(100, companion.knowledge + 5),
          happiness: Math.min(100, companion.happiness + 5),
          memories: [...companion.memories, { text: message, timestamp: Date.now() }]
        },
        messages: [
          ...currentState.messages,
          {
            type: 'companion',
            text: responses[Math.floor(Math.random() * responses.length)],
            timestamp: Date.now()
          }
        ]
      });
      
      render();
    }, 1000);
  }

  // 3D System Management
  async function init3DSystem(companionState) {
    // Check WebGL availability
    if (!Companion3DManager.isWebGLAvailable()) {
      console.warn('WebGL not available, falling back to 2D');
      showFallback2D();
      return;
    }

    const canvas = document.getElementById('arlo-canvas');
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }

    try {
      // Show loading overlay
      const loadingOverlay = document.getElementById('loading-3d');
      if (loadingOverlay) loadingOverlay.style.display = 'flex';

      current3DManager = get3DManager();
      await current3DManager.init(canvas, companionState);

      // Hide loading overlay
      if (loadingOverlay) loadingOverlay.style.display = 'none';

      // Setup canvas click handler
      canvas.addEventListener('click', (event) => {
        if (current3DManager) {
          current3DManager.handleClick(event);
        }
      });

      // Listen for 3D events
      window.addEventListener('companion-clicked', () => {
        const state = store.getState();
        store.setState({
          companion: {
            ...state.companion,
            happiness: Math.min(100, state.companion.happiness + 5)
          }
        });
        render();
      });

      window.addEventListener('evolution-complete', (event) => {
        const { stage } = event.detail;
        const state = store.getState();
        store.setState({
          companion: {
            ...state.companion,
            evolutionStage: stage
          }
        });
        render();
      });

      console.log('✓ 3D system initialized');
    } catch (error) {
      console.error('Failed to initialize 3D:', error);
      showFallback2D();
    }
  }

  function update3DSystem(companionState) {
    if (current3DManager && current3DManager.isInitialized) {
      current3DManager.updateCompanion(companionState);
    }
  }

  function dispose3DSystem() {
    if (current3DManager) {
      dispose3DCompanion();
      current3DManager = null;
    }
  }

  function showFallback2D() {
    const canvas = document.getElementById('arlo-canvas');
    const fallback = document.getElementById('fallback-sprite');
    const loading = document.getElementById('loading-3d');

    if (canvas) canvas.style.display = 'none';
    if (fallback) fallback.style.display = 'flex';
    if (loading) loading.style.display = 'none';

    console.log('Using 2D fallback mode');
  }

  // Initial render
  render();
  
  // Auto-save to localStorage
  setInterval(() => {
    const state = store.getState();
    if (state.stage === 'companion') {
      localStorage.setItem('companion-save', JSON.stringify(state));
    }
  }, 5000);
  
  // Load saved state
  const savedState = localStorage.getItem('companion-save');
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      store.setState(parsed);
      render();
    } catch (e) {
      console.error('Failed to load saved state');
    }
  }
}
