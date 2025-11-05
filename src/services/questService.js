/**
 * Enhanced Quest System with real-world data
 */
export class QuestService {
  constructor() {
    this.questTypes = {
      knowledge: {
        name: 'Knowledge Quest',
        icon: '📚',
        duration: 8000,
        xpReward: 25,
        knowledgeGain: 15
      },
      exploration: {
        name: 'Exploration Quest',
        icon: '🗺️',
        duration: 10000,
        xpReward: 30,
        knowledgeGain: 10
      },
      adventure: {
        name: 'Adventure Quest',
        icon: '⚔️',
        duration: 12000,
        xpReward: 40,
        knowledgeGain: 8
      },
      wisdom: {
        name: 'Wisdom Quest',
        icon: '🧙',
        duration: 15000,
        xpReward: 50,
        knowledgeGain: 20
      }
    };

    // Rich database of quest topics and facts
    this.questDatabase = {
      space: {
        topic: 'Space Exploration',
        facts: [
          'A day on Venus is longer than its year! Venus takes 243 Earth days to rotate once, but only 225 Earth days to orbit the Sun.',
          'Neutron stars are so dense that a teaspoon of their material would weigh about 6 billion tons on Earth!',
          'The footprints left by Apollo astronauts on the Moon will likely last for millions of years since there\'s no wind to erode them.',
          'Jupiter\'s Great Red Spot is a massive storm that has been raging for at least 400 years and is larger than Earth!',
          'If you could drive to space at 60 mph, it would only take about an hour to reach the boundary of space (100 km).',
          'Saturn\'s moon Titan has liquid methane lakes and rivers, making it the only place besides Earth with stable liquid on its surface.'
        ],
        difficulty: 'medium'
      },
      ocean: {
        topic: 'Ocean Mysteries',
        facts: [
          'The ocean produces more than 50% of the world\'s oxygen through phytoplankton photosynthesis!',
          'The Mariana Trench is so deep (36,000 feet) that if Mount Everest were placed inside it, there would still be over a mile of water above it.',
          'Giant squids have eyes the size of dinner plates - the largest eyes in the animal kingdom!',
          'The ocean contains nearly 20 million tons of gold, but it\'s extremely diluted and expensive to extract.',
          'Some deep-sea creatures create their own light through bioluminescence, illuminating the dark ocean depths.',
          'The blue whale, the largest animal ever known, can weigh as much as 200 tons - that\'s about 33 elephants!'
        ],
        difficulty: 'medium'
      },
      history: {
        topic: 'Ancient History',
        facts: [
          'The Great Pyramid of Giza was the tallest man-made structure for over 3,800 years!',
          'Ancient Egyptians invented toothpaste, breath mints, and an early form of bowling.',
          'The Library of Alexandria was said to hold over 700,000 scrolls at its peak, representing much of the ancient world\'s knowledge.',
          'Vikings actually reached North America about 500 years before Columbus, establishing a settlement in Newfoundland.',
          'The ancient city of Petra in Jordan was carved directly into rose-colored sandstone cliffs over 2,000 years ago.',
          'Ancient Romans used urine as mouthwash because the ammonia it contains acts as a cleaning agent!'
        ],
        difficulty: 'hard'
      },
      nature: {
        topic: 'Nature Wonders',
        facts: [
          'Trees can communicate with each other through an underground network of fungi called the "Wood Wide Web"!',
          'A single tree can absorb as much carbon in a year as a car produces driving 26,000 miles.',
          'Honey never spoils - archaeologists have found 3,000-year-old honey in Egyptian tombs that\'s still perfectly edible!',
          'Bamboo is the fastest-growing plant on Earth, capable of growing up to 3 feet in just 24 hours!',
          'An octopus has three hearts, nine brains, and blue blood. Each arm has its own "mini-brain"!',
          'Crows are so intelligent they can recognize human faces, use tools, and even hold "funerals" for their dead.'
        ],
        difficulty: 'easy'
      },
      technology: {
        topic: 'Technology History',
        facts: [
          'The first computer bug was an actual moth found trapped in a Harvard Mark II computer in 1947!',
          'The first 1GB hard drive, released in 1980, weighed over 500 pounds and cost $40,000!',
          'More computing power went into a single Game Boy than the computers that sent Apollo 11 to the Moon.',
          'The first webcam was created at Cambridge University to monitor a coffee pot, so people would know when it was full!',
          'CAPTCHA tests generate data that helps digitize books. By solving CAPTCHAs, you\'re helping preserve old texts!',
          'The first photograph ever taken required an 8-hour exposure time. Today, cameras can capture images in microseconds!'
        ],
        difficulty: 'medium'
      },
      science: {
        topic: 'Scientific Discoveries',
        facts: [
          'Bananas are radioactive because they contain potassium-40, a naturally radioactive isotope!',
          'If you could fold a piece of paper 42 times, it would be thick enough to reach the Moon.',
          'Humans share about 60% of their DNA with bananas and about 90% with cats!',
          'A bolt of lightning is five times hotter than the surface of the Sun, reaching temperatures of 30,000°C!',
          'Your stomach acid is strong enough to dissolve metal, but your stomach lining regenerates completely every 3-4 days.',
          'There are more stars in the universe than grains of sand on all of Earth\'s beaches combined!'
        ],
        difficulty: 'medium'
      },
      art: {
        topic: 'Art & Culture',
        facts: [
          'The Mona Lisa has no eyebrows because it was fashionable in Renaissance Italy to shave them off!',
          'Van Gogh only sold one painting during his lifetime, but his works now sell for hundreds of millions of dollars.',
          'The oldest known musical instrument is a 40,000-year-old flute made from a vulture\'s wing bone.',
          'Shakespeare invented over 1,700 words that we still use today, including "assassination" and "lonely".',
          'The world\'s oldest sculpture, the Venus of Hohle Fels, is over 40,000 years old and was carved from mammoth ivory.',
          'Music can actually help plants grow faster! Studies show plants grow better when exposed to certain types of music.'
        ],
        difficulty: 'easy'
      },
      animals: {
        topic: 'Animal Behavior',
        facts: [
          'Elephants are the only animals that can\'t jump, but they\'re excellent swimmers and can use their trunks as snorkels!',
          'Dolphins have names for each other and call out to specific individuals using unique whistle patterns.',
          'A group of flamingos is called a "flamboyance," which perfectly describes their fabulous pink appearance!',
          'Penguins propose to their mates with a pebble. If accepted, the pair uses it to build their nest together.',
          'Otters hold hands while sleeping to keep from drifting apart. They also have a favorite rock for breaking open shells!',
          'Cows have best friends and become stressed when separated from them. They can also produce different moos for different situations!'
        ],
        difficulty: 'easy'
      }
    };
  }

  /**
   * Generate a quest based on companion level and interests
   */
  generateQuest(companion) {
    const level = companion.level || 1;
    const stage = companion.evolutionStage || 'baby';

    // Determine quest type based on level and stage
    let questType = 'knowledge';
    if (stage === 'adult' || level >= 10) {
      questType = 'wisdom';
    } else if (stage === 'teen' || level >= 5) {
      questType = 'adventure';
    } else if (level >= 3) {
      questType = 'exploration';
    }

    const questInfo = this.questTypes[questType];

    // Select random topic (could be weighted by companion's personality)
    const topics = Object.keys(this.questDatabase);
    const topicKey = topics[Math.floor(Math.random() * topics.length)];
    const topicData = this.questDatabase[topicKey];

    // Select random fact from topic
    const fact = topicData.facts[Math.floor(Math.random() * topicData.facts.length)];

    return {
      id: `quest_${Date.now()}`,
      type: questType,
      topic: topicData.topic,
      topicKey: topicKey,
      fact: fact,
      difficulty: topicData.difficulty,
      duration: questInfo.duration,
      xpReward: questInfo.xpReward,
      knowledgeGain: questInfo.knowledgeGain,
      startTime: Date.now(),
      status: 'active'
    };
  }

  /**
   * Complete a quest and return rewards
   */
  completeQuest(quest, companion) {
    const rewards = {
      xp: quest.xpReward,
      knowledge: quest.knowledgeGain,
      happiness: 5
    };

    // Bonus rewards for matching difficulty with stage
    const stage = companion.evolutionStage || 'baby';
    if ((quest.difficulty === 'hard' && stage === 'adult') ||
        (quest.difficulty === 'medium' && stage === 'teen')) {
      rewards.xp = Math.floor(rewards.xp * 1.5);
      rewards.knowledge = Math.floor(rewards.knowledge * 1.3);
    }

    quest.status = 'completed';
    quest.completedTime = Date.now();

    return {
      quest,
      rewards,
      message: this.getCompletionMessage(companion, quest)
    };
  }

  /**
   * Get quest completion message
   */
  getCompletionMessage(companion, quest) {
    const stage = companion.evolutionStage || 'baby';

    const messages = {
      baby: [
        "I'm back! Look what I learned! 🌟",
        "*bounces excitedly* I found something cool!",
        "Friend! Friend! I discovered something! ✨"
      ],
      teen: [
        "That quest was amazing! Check out what I discovered!",
        "You won't believe what I found out there!",
        "I learned something incredible on my adventure!"
      ],
      adult: [
        "I've returned from my journey with valuable knowledge.",
        "The quest has yielded fascinating insights.",
        "My travels have enriched my understanding of the world."
      ]
    };

    const stageMessages = messages[stage] || messages.teen;
    return stageMessages[Math.floor(Math.random() * stageMessages.length)];
  }

  /**
   * Get companion's quest report
   */
  getQuestReport(quest) {
    return {
      topic: quest.topic,
      fact: quest.fact,
      duration: Math.floor((quest.completedTime - quest.startTime) / 1000),
      difficulty: quest.difficulty
    };
  }

  /**
   * Get recommended quest topics based on companion personality
   */
  getRecommendedTopics(companion) {
    const personality = companion.personality;
    if (!personality) return Object.keys(this.questDatabase);

    const recommendations = {
      curious: ['science', 'space', 'technology'],
      adventurous: ['exploration', 'history', 'nature'],
      wise: ['history', 'science', 'philosophy'],
      creative: ['art', 'music', 'culture'],
      playful: ['animals', 'nature', 'fun_facts']
    };

    const traits = personality.dominantTraits || ['curious'];
    const topics = new Set();

    for (const trait of traits) {
      const recs = recommendations[trait] || [];
      recs.forEach(topic => topics.add(topic));
    }

    return Array.from(topics);
  }
}

export const questService = new QuestService();
