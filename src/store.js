import { personalityService } from './services/personalityService.js';
import { evolutionService, levelingService } from './services/evolutionService.js';
import { achievementService } from './services/achievementService.js';

export function createStore() {
  let state = {
    stage: 'egg', // egg, signup, companion
    eggShaking: false,
    selectedGender: null,
    companion: null,
    messages: [],
    currentTime: Date.now(),
    theme: 'classic', // classic, ocean, sunset, forest, candy
    currentMinigame: null, // Active minigame state
    showAchievements: false, // Achievement panel visibility
    showMinigames: false, // Minigame selection panel
    notifications: [] // Notification queue
  };

  const listeners = new Set();

  const store = {
    getState: () => state,

    setState: (newState) => {
      state = { ...state, ...newState };
      listeners.forEach(listener => listener(state));
    },

    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    // Add XP and check for level up
    addXP: (amount, reason = '') => {
      const companion = state.companion;
      if (!companion) return;

      const result = levelingService.addExperience(companion, amount, reason);

      if (result.leveledUp) {
        const bonus = levelingService.getLevelUpBonus(companion, result.levelsGained);

        // Update companion with new level and stats
        const updatedCompanion = {
          ...companion,
          level: result.newLevel,
          experience: result.newXP,
          happiness: Math.min(100, companion.happiness + bonus.happiness),
          energy: Math.min(100, companion.energy + bonus.energy),
          knowledge: Math.min(100, companion.knowledge + bonus.knowledge)
        };

        // Check for evolution
        const evolutionCheck = evolutionService.checkEvolution(updatedCompanion);

        if (evolutionCheck.shouldEvolve) {
          const evolved = evolutionService.evolveCompanion(
            updatedCompanion,
            evolutionCheck.toStage
          );

          store.addNotification({
            type: 'evolution',
            message: evolutionCheck.message
          });

          // Check achievement for evolution
          const { achievements, newlyUnlocked } = achievementService.checkAchievements(
            evolved,
            'evolve',
            1
          );
          evolved.achievements = achievements;

          if (newlyUnlocked.length > 0) {
            store.showNewAchievements(newlyUnlocked);
          }

          state.companion = evolved;
        } else {
          state.companion = updatedCompanion;
        }

        store.addNotification({
          type: 'levelup',
          message: `🎉 Level Up! ${companion.name} is now level ${result.newLevel}!`
        });
      } else {
        state.companion = {
          ...companion,
          experience: result.newXP
        };
      }

      store.setState({ companion: state.companion });
    },

    // Update personality based on interaction
    updatePersonality: (interactionType, sentiment = 'neutral') => {
      const companion = state.companion;
      if (!companion) return;

      const personality = personalityService.updatePersonality(
        companion,
        interactionType,
        sentiment
      );

      store.setState({
        companion: {
          ...companion,
          personality,
          mood: personality.mood
        }
      });
    },

    // Check and unlock achievements
    checkAchievements: (action, value = 1) => {
      const companion = state.companion;
      if (!companion) return;

      const { achievements, newlyUnlocked } = achievementService.checkAchievements(
        companion,
        action,
        value
      );

      store.setState({
        companion: {
          ...companion,
          achievements
        }
      });

      // Show new achievements
      if (newlyUnlocked.length > 0) {
        store.showNewAchievements(newlyUnlocked);

        // Add XP rewards
        const totalXP = newlyUnlocked.reduce((sum, a) => sum + a.xpReward, 0);
        if (totalXP > 0) {
          store.addXP(totalXP, 'Achievement rewards');
        }
      }
    },

    // Show achievement notifications
    showNewAchievements: (achievements) => {
      achievements.forEach(achievement => {
        store.addNotification({
          type: 'achievement',
          message: `🏆 Achievement Unlocked!\n${achievement.icon} ${achievement.name}\n${achievement.description}`
        });
      });
    },

    // Add notification to queue
    addNotification: (notification) => {
      const notifications = state.notifications || [];
      notifications.push({
        ...notification,
        id: Date.now() + Math.random(),
        timestamp: Date.now()
      });
      store.setState({ notifications });

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        store.dismissNotification(notification.id);
      }, 5000);
    },

    // Dismiss notification
    dismissNotification: (id) => {
      const notifications = (state.notifications || []).filter(n => n.id !== id);
      store.setState({ notifications });
    }
  };

  return store;
}
