import { config } from '../config.js';

/**
 * Personality System - Companions develop unique personalities based on interactions
 */
export class PersonalityService {
  /**
   * Initialize personality for a new companion
   */
  initializePersonality(companion) {
    return {
      dominantTraits: ['curious', 'playful'], // Start with baby traits
      traitScores: {
        curious: 10,
        playful: 10,
        wise: 0,
        energetic: 8,
        calm: 5,
        adventurous: 5,
        caring: 7,
        silly: 8,
        serious: 0,
        creative: 5
      },
      mood: 'happy',
      moodHistory: [],
      interactionCount: 0
    };
  }

  /**
   * Update personality based on interaction
   */
  updatePersonality(companion, interactionType, sentiment) {
    const personality = companion.personality || this.initializePersonality(companion);
    const traits = { ...personality.traitScores };

    // Update traits based on interaction type
    switch (interactionType) {
      case 'feed':
        traits.caring += 1;
        traits.calm += 1;
        break;
      case 'play':
        traits.playful += 2;
        traits.energetic += 2;
        traits.silly += 1;
        break;
      case 'quest':
        traits.adventurous += 2;
        traits.curious += 2;
        traits.wise += 1;
        break;
      case 'chat':
        traits.curious += 1;
        if (sentiment === 'positive') {
          traits.playful += 1;
          traits.caring += 1;
        } else if (sentiment === 'negative') {
          traits.caring += 2;
          traits.calm += 1;
        }
        break;
      case 'learn':
        traits.wise += 2;
        traits.curious += 1;
        traits.serious += 1;
        break;
      case 'create':
        traits.creative += 2;
        traits.playful += 1;
        break;
    }

    // Evolution affects personality development
    const stage = companion.evolutionStage || 'baby';
    if (stage === 'teen') {
      // Teens develop more complex traits
      traits.curious += 1;
      traits.adventurous += 1;
    } else if (stage === 'adult') {
      // Adults become more balanced and wise
      traits.wise += 1;
      traits.calm += 1;
    }

    // Calculate dominant traits (top 3)
    const sortedTraits = Object.entries(traits)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([trait]) => trait);

    // Update mood based on happiness and energy
    const mood = this.calculateMood(companion);

    personality.traitScores = traits;
    personality.dominantTraits = sortedTraits;
    personality.mood = mood;
    personality.interactionCount += 1;

    // Record mood history
    personality.moodHistory.push({
      mood,
      timestamp: Date.now()
    });

    // Keep only last 20 mood entries
    if (personality.moodHistory.length > 20) {
      personality.moodHistory = personality.moodHistory.slice(-20);
    }

    return personality;
  }

  /**
   * Calculate current mood based on stats
   */
  calculateMood(companion) {
    const h = companion.happiness || 50;
    const e = companion.energy || 50;
    const k = companion.knowledge || 50;

    if (h > 80 && e > 70) return 'joyful';
    if (h > 60 && e > 50) return 'happy';
    if (h > 40 && e > 40) return 'content';
    if (h < 30) return 'sad';
    if (e < 20) return 'tired';
    if (k > 80 && h > 50) return 'enlightened';
    if (e > 80 && h > 60) return 'excited';
    return 'neutral';
  }

  /**
   * Get personality description
   */
  getPersonalityDescription(companion) {
    const personality = companion.personality;
    if (!personality) return 'still developing their personality';

    const traits = personality.dominantTraits.join(', ');
    const mood = personality.mood;

    return `${traits} and feeling ${mood}`;
  }

  /**
   * Get mood emoji
   */
  getMoodEmoji(mood) {
    const emojis = {
      joyful: '😄',
      happy: '😊',
      content: '🙂',
      neutral: '😐',
      sad: '😢',
      tired: '😴',
      enlightened: '🧠✨',
      excited: '🤩'
    };
    return emojis[mood] || '🙂';
  }
}

export const personalityService = new PersonalityService();
