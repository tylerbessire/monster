/**
 * Evolution System - Companions grow through stages based on level
 */
export class EvolutionService {
  constructor() {
    this.stages = {
      baby: {
        name: 'Baby',
        minLevel: 1,
        maxLevel: 15,
        description: 'A cute baby companion, full of wonder',
        sprite: 'baby',
        statsMultiplier: 1.0,
        unlocks: ['basic chat', 'feed', 'play']
      },
      teen: {
        name: 'Teen',
        minLevel: 16,
        maxLevel: 35,
        description: 'An energetic teen, eager to learn',
        sprite: 'teen',
        statsMultiplier: 1.3,
        unlocks: ['quests', 'mini-games', 'deeper conversations']
      },
      adult: {
        name: 'Adult',
        minLevel: 36,
        maxLevel: 99,
        description: 'A wise adult companion, your true friend',
        sprite: 'adult',
        statsMultiplier: 1.6,
        unlocks: ['advanced quests', 'teaching', 'all features']
      }
    };
  }

  /**
   * Get evolution stage based on level
   */
  getStageByLevel(level) {
    if (level >= 36) return 'adult';
    if (level >= 16) return 'teen';
    return 'baby';
  }

  /**
   * Get stage info
   */
  getStageInfo(stage) {
    return this.stages[stage] || this.stages.baby;
  }

  /**
   * Check if companion should evolve
   */
  checkEvolution(companion) {
    const currentStage = companion.evolutionStage || 'baby';
    const newStage = this.getStageByLevel(companion.level);

    if (currentStage !== newStage) {
      return {
        shouldEvolve: true,
        fromStage: currentStage,
        toStage: newStage,
        message: this.getEvolutionMessage(companion.name, currentStage, newStage)
      };
    }

    return { shouldEvolve: false };
  }

  /**
   * Get evolution message
   */
  getEvolutionMessage(name, fromStage, toStage) {
    const messages = {
      'baby-teen': `✨🌟 ${name} is evolving! 🌟✨\n\nYour baby companion has grown into a curious teen! They're ready for new adventures and deeper conversations!`,
      'teen-adult': `✨🌟 ${name} is evolving! 🌟✨\n\nYour teen companion has matured into a wise adult! Your bond has grown stronger, and they're ready to be your lifelong friend!`
    };

    return messages[`${fromStage}-${toStage}`] || `${name} is evolving!`;
  }

  /**
   * Apply evolution
   */
  evolveCompanion(companion, toStage) {
    const stageInfo = this.getStageInfo(toStage);

    // Boost stats on evolution
    return {
      ...companion,
      evolutionStage: toStage,
      happiness: Math.min(100, companion.happiness + 20),
      energy: Math.min(100, companion.energy + 20),
      knowledge: Math.min(100, companion.knowledge + 10),
      evolutionHistory: [
        ...(companion.evolutionHistory || []),
        {
          stage: toStage,
          level: companion.level,
          timestamp: Date.now()
        }
      ]
    };
  }
}

/**
 * Leveling System - XP and level progression
 */
export class LevelingService {
  /**
   * Calculate XP needed for next level
   */
  getXPForLevel(level) {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  /**
   * Get total XP needed to reach a level
   */
  getTotalXPForLevel(level) {
    let total = 0;
    for (let i = 1; i < level; i++) {
      total += this.getXPForLevel(i);
    }
    return total;
  }

  /**
   * Add experience and check for level up
   */
  addExperience(companion, xpGain, reason = '') {
    const currentXP = companion.experience || 0;
    const currentLevel = companion.level || 1;
    const newXP = currentXP + xpGain;

    let level = currentLevel;
    let xp = newXP;
    let leveledUp = false;
    let levelsGained = 0;

    // Check for level ups (can level up multiple times)
    while (xp >= this.getXPForLevel(level)) {
      xp -= this.getXPForLevel(level);
      level++;
      leveledUp = true;
      levelsGained++;
    }

    const result = {
      leveledUp,
      levelsGained,
      newLevel: level,
      newXP: xp,
      xpGained: xpGain,
      reason
    };

    return result;
  }

  /**
   * Get XP for different activities
   */
  getActivityXP(activity) {
    const xpValues = {
      chat: 5,
      feed: 3,
      play: 8,
      quest: 25,
      learn: 15,
      achievement: 50,
      minigame_win: 20,
      minigame_play: 10
    };

    return xpValues[activity] || 5;
  }

  /**
   * Calculate stat increases on level up
   */
  getLevelUpBonus(companion, levelsGained) {
    const stage = companion.evolutionStage || 'baby';
    const baseBonus = {
      happiness: 5 * levelsGained,
      energy: 10 * levelsGained,
      knowledge: 3 * levelsGained
    };

    // Stage multipliers
    const multipliers = {
      baby: 1.0,
      teen: 1.2,
      adult: 1.5
    };

    const mult = multipliers[stage] || 1.0;

    return {
      happiness: Math.floor(baseBonus.happiness * mult),
      energy: Math.floor(baseBonus.energy * mult),
      knowledge: Math.floor(baseBonus.knowledge * mult)
    };
  }
}

export const evolutionService = new EvolutionService();
export const levelingService = new LevelingService();
