/**
 * Achievement System - Unlock achievements through gameplay
 */
export class AchievementService {
  constructor() {
    this.achievements = {
      // Friendship achievements
      first_chat: {
        id: 'first_chat',
        name: 'First Words',
        description: 'Have your first conversation',
        category: 'friendship',
        icon: '💬',
        xpReward: 10,
        unlocked: false
      },
      chat_10: {
        id: 'chat_10',
        name: 'Chatty Friend',
        description: 'Send 10 messages',
        category: 'friendship',
        icon: '💭',
        xpReward: 25,
        unlocked: false
      },
      chat_100: {
        id: 'chat_100',
        name: 'Best Friends Forever',
        description: 'Send 100 messages',
        category: 'friendship',
        icon: '💕',
        xpReward: 100,
        unlocked: false
      },

      // Care achievements
      first_feed: {
        id: 'first_feed',
        name: 'First Meal',
        description: 'Feed your companion for the first time',
        category: 'care',
        icon: '🍎',
        xpReward: 10,
        unlocked: false
      },
      feed_50: {
        id: 'feed_50',
        name: 'Master Chef',
        description: 'Feed your companion 50 times',
        category: 'care',
        icon: '👨‍🍳',
        xpReward: 75,
        unlocked: false
      },
      max_happiness: {
        id: 'max_happiness',
        name: 'Pure Joy',
        description: 'Reach 100 happiness',
        category: 'care',
        icon: '😄',
        xpReward: 50,
        unlocked: false
      },

      // Adventure achievements
      first_quest: {
        id: 'first_quest',
        name: 'First Adventure',
        description: 'Complete your first quest',
        category: 'adventure',
        icon: '🗺️',
        xpReward: 15,
        unlocked: false
      },
      quest_10: {
        id: 'quest_10',
        name: 'Explorer',
        description: 'Complete 10 quests',
        category: 'adventure',
        icon: '🧭',
        xpReward: 50,
        unlocked: false
      },
      quest_50: {
        id: 'quest_50',
        name: 'Master Adventurer',
        description: 'Complete 50 quests',
        category: 'adventure',
        icon: '🏆',
        xpReward: 150,
        unlocked: false
      },
      max_knowledge: {
        id: 'max_knowledge',
        name: 'Wisdom Achieved',
        description: 'Reach 100 knowledge',
        category: 'adventure',
        icon: '🧠',
        xpReward: 100,
        unlocked: false
      },

      // Evolution achievements
      evolve_teen: {
        id: 'evolve_teen',
        name: 'Growing Up',
        description: 'Evolve to teen stage',
        category: 'evolution',
        icon: '🌱',
        xpReward: 100,
        unlocked: false
      },
      evolve_adult: {
        id: 'evolve_adult',
        name: 'Fully Grown',
        description: 'Evolve to adult stage',
        category: 'evolution',
        icon: '🌳',
        xpReward: 200,
        unlocked: false
      },
      level_10: {
        id: 'level_10',
        name: 'Rising Star',
        description: 'Reach level 10',
        category: 'evolution',
        icon: '⭐',
        xpReward: 150,
        unlocked: false
      },

      // Game achievements
      minigame_first: {
        id: 'minigame_first',
        name: 'Game Time',
        description: 'Play your first mini-game',
        category: 'games',
        icon: '🎮',
        xpReward: 15,
        unlocked: false
      },
      minigame_win_10: {
        id: 'minigame_win_10',
        name: 'Champion',
        description: 'Win 10 mini-games',
        category: 'games',
        icon: '🏅',
        xpReward: 75,
        unlocked: false
      },

      // Special achievements
      night_owl: {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Play between midnight and 4 AM',
        category: 'special',
        icon: '🦉',
        xpReward: 25,
        unlocked: false
      },
      early_bird: {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Play between 5 AM and 7 AM',
        category: 'special',
        icon: '🐦',
        xpReward: 25,
        unlocked: false
      },
      week_streak: {
        id: 'week_streak',
        name: 'Dedicated Friend',
        description: 'Play for 7 days in a row',
        category: 'special',
        icon: '🔥',
        xpReward: 200,
        unlocked: false
      }
    };
  }

  /**
   * Initialize achievement tracking for companion
   */
  initializeAchievements() {
    return {
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
      },
      lastChecked: Date.now()
    };
  }

  /**
   * Check and unlock achievements
   */
  checkAchievements(companion, action, value = 1) {
    const achievements = companion.achievements || this.initializeAchievements();
    const progress = achievements.progress;
    const newlyUnlocked = [];

    // Update progress
    switch (action) {
      case 'chat':
        progress.chats += value;
        break;
      case 'feed':
        progress.feeds += value;
        break;
      case 'play':
        progress.plays += value;
        break;
      case 'quest':
        progress.quests += value;
        break;
      case 'minigame_play':
        progress.minigamesPlayed += value;
        break;
      case 'minigame_win':
        progress.minigamesWon += value;
        break;
    }

    // Check day streak
    const today = new Date().toDateString();
    if (progress.lastPlayDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (progress.lastPlayDate === yesterday) {
        progress.daysPlayed += 1;
      } else {
        progress.daysPlayed = 1; // Reset streak
      }
      progress.lastPlayDate = today;
    }

    // Check time-based achievements
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 4) {
      if (!achievements.unlocked.includes('night_owl')) {
        newlyUnlocked.push('night_owl');
      }
    }
    if (hour >= 5 && hour < 7) {
      if (!achievements.unlocked.includes('early_bird')) {
        newlyUnlocked.push('early_bird');
      }
    }

    // Check achievement conditions
    const checks = [
      ['first_chat', progress.chats >= 1],
      ['chat_10', progress.chats >= 10],
      ['chat_100', progress.chats >= 100],
      ['first_feed', progress.feeds >= 1],
      ['feed_50', progress.feeds >= 50],
      ['first_quest', progress.quests >= 1],
      ['quest_10', progress.quests >= 10],
      ['quest_50', progress.quests >= 50],
      ['minigame_first', progress.minigamesPlayed >= 1],
      ['minigame_win_10', progress.minigamesWon >= 10],
      ['max_happiness', companion.happiness >= 100],
      ['max_knowledge', companion.knowledge >= 100],
      ['evolve_teen', companion.evolutionStage === 'teen'],
      ['evolve_adult', companion.evolutionStage === 'adult'],
      ['level_10', companion.level >= 10],
      ['week_streak', progress.daysPlayed >= 7]
    ];

    for (const [id, condition] of checks) {
      if (condition && !achievements.unlocked.includes(id)) {
        newlyUnlocked.push(id);
      }
    }

    // Add newly unlocked achievements
    achievements.unlocked.push(...newlyUnlocked);

    return {
      achievements,
      newlyUnlocked: newlyUnlocked.map(id => this.achievements[id])
    };
  }

  /**
   * Get achievement details
   */
  getAchievement(id) {
    return this.achievements[id];
  }

  /**
   * Get all achievements by category
   */
  getAchievementsByCategory() {
    const categories = {};
    for (const [id, achievement] of Object.entries(this.achievements)) {
      const cat = achievement.category;
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(achievement);
    }
    return categories;
  }

  /**
   * Get completion percentage
   */
  getCompletionPercentage(companion) {
    const achievements = companion.achievements || this.initializeAchievements();
    const total = Object.keys(this.achievements).length;
    const unlocked = achievements.unlocked.length;
    return Math.floor((unlocked / total) * 100);
  }
}

export const achievementService = new AchievementService();
