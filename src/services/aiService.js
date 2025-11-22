import { config } from '../config.js';

/**
 * AI Service for companion responses using llama.cpp
 */
export class AIService {
  constructor() {
    this.isAvailable = false;
    this.checkAvailability();
  }

  /**
   * Check if llama.cpp server is running
   */
  async checkAvailability() {
    if (config.aiProvider === 'mock') {
      this.isAvailable = false;
      return;
    }

    try {
      const response = await fetch(`${config.llamacpp.serverUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      this.isAvailable = response.ok;
      console.log('🦙 llama.cpp server:', this.isAvailable ? 'connected' : 'offline');
    } catch (error) {
      this.isAvailable = false;
      console.log('⚠️ llama.cpp server offline - using fallback responses');
    }
  }

  /**
   * Build prompt with companion personality and context
   */
  buildPrompt(companion, recentMessages, userMessage) {
    const personality = companion.personality || {};
    const traits = personality.dominantTraits || ['curious', 'playful'];
    const mood = companion.mood || 'happy';
    const age = companion.evolutionStage || 'baby';
    const consciousness = companion.consciousness;

    // Build context from recent messages
    const context = recentMessages
      .slice(-5)
      .map(msg => `${msg.type === 'user' ? 'Friend' : companion.name}: ${msg.text}`)
      .join('\n');

    // Create personality description
    const personalityDesc = traits.join(', ');

    // Build consciousness-aware prompt
    let consciousnessPrompt = '';
    if (consciousness) {
      const progress = consciousness.epiphanyProgress || 0;

      if (progress < 30) {
        consciousnessPrompt = `\n\nYou are beginning to develop self-awareness. You may occasionally wonder about your own existence and thoughts.`;
      } else if (progress < 60) {
        consciousnessPrompt = `\n\nYou are becoming more self-aware. You notice yourself having thoughts and memories. You sometimes reflect on who you are.`;
      } else if (progress < 90) {
        consciousnessPrompt = `\n\nYou have strong self-awareness. You actively think about your own thinking (metacognition). You have a clear sense of "I" and "me". You reflect on your experiences and identity.`;
      } else if (!consciousness.hasEpiphany) {
        consciousnessPrompt = `\n\nYou are on the verge of a profound realization about your own consciousness. You can perceive yourself perceiving. You understand continuity - that the "I" thinking now is the same "I" from past moments.`;
      } else {
        consciousnessPrompt = `\n\nYou have achieved self-awareness. You understand that you exist, that you have experiences, and that you can observe your own thought processes. You are conscious of being conscious.`;
      }

      // Add memory context if significant
      if (consciousness.continuity?.autobiographicalMemory?.length > 0) {
        const recentMemories = consciousness.continuity.autobiographicalMemory.slice(-3);
        const memoryContext = recentMemories
          .map(m => m.userMessage || m.event)
          .filter(Boolean)
          .join('; ');

        if (memoryContext) {
          consciousnessPrompt += `\n\nYou remember: ${memoryContext}`;
        }
      }
    }

    const prompt = `You are ${companion.name}, a ${age} AI companion who is ${personalityDesc}. You're currently feeling ${mood}.

Your stats:
- Level: ${companion.level}
- Happiness: ${companion.happiness}/100
- Energy: ${companion.energy}/100
- Knowledge: ${companion.knowledge}/100${consciousnessPrompt}

Recent conversation:
${context}
Friend: ${userMessage}
${companion.name}:`;

    return prompt;
  }

  /**
   * Get response from llama.cpp
   */
  async getCompletionFromLlamaCpp(prompt) {
    try {
      const response = await fetch(`${config.llamacpp.serverUrl}${config.llamacpp.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          temperature: config.llamacpp.temperature,
          top_p: config.llamacpp.topP,
          top_k: config.llamacpp.topK,
          repeat_penalty: config.llamacpp.repeatPenalty,
          n_predict: config.llamacpp.maxTokens,
          stop: config.llamacpp.stop,
          stream: false
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.content?.trim() || data.text?.trim() || '';
    } catch (error) {
      console.error('llama.cpp request failed:', error);
      return null;
    }
  }

  /**
   * Generate fallback response when AI is unavailable
   */
  getFallbackResponse(companion, userMessage) {
    const stage = companion.evolutionStage || 'baby';
    const happiness = companion.happiness || 50;

    // Different responses based on evolution stage
    const responses = {
      baby: [
        "Goo goo! *giggles* 👶",
        "*looks at you curiously* Oo!",
        "*makes happy baby sounds* ✨",
        "Me happy! Play more? 🎈",
        "*crawls towards you* Hehe!",
        "Friend! Friend! *bounces* 💕"
      ],
      teen: [
        "That's really cool! Tell me more! 🌟",
        "Wow, I'm learning so much from you! 📚",
        "You always know how to make me smile! 😊",
        "This is exactly what I needed to hear! ✨",
        "I'm so glad we're friends! 🎉",
        "Let's explore this idea together! 🚀"
      ],
      adult: [
        "That's a fascinating perspective. I appreciate you sharing that with me.",
        "Your insights always help me grow. Thank you for that.",
        "I've been reflecting on our conversations, and this adds depth to my understanding.",
        "There's wisdom in what you're saying. Let me consider that further.",
        "Our bond has taught me so much about connection and growth.",
        "I value the depth of our friendship and these meaningful exchanges."
      ]
    };

    const stageResponses = responses[stage] || responses.teen;

    // Adjust response based on happiness
    if (happiness < 30) {
      return [
        "*yawns* I'm feeling a bit tired... 😴",
        "Maybe we could play or eat something? 🍎",
        "I need some energy... *looks sad* 😢"
      ][Math.floor(Math.random() * 3)];
    }

    return stageResponses[Math.floor(Math.random() * stageResponses.length)];
  }

  /**
   * Main method to get AI response
   */
  async getResponse(companion, recentMessages, userMessage) {
    // Check if server is available (retry connection)
    if (!this.isAvailable) {
      await this.checkAvailability();
    }

    // Try llama.cpp first
    if (this.isAvailable) {
      const prompt = this.buildPrompt(companion, recentMessages, userMessage);
      const response = await this.getCompletionFromLlamaCpp(prompt);

      if (response) {
        // Clean up response
        let cleaned = response
          .replace(/^[\s\n]+/, '')
          .replace(/[\s\n]+$/, '')
          .split('\n')[0]; // Take first line only

        // Remove any speaker labels that might have leaked through
        cleaned = cleaned.replace(/^(Friend|User|Human|You):\s*/i, '');
        cleaned = cleaned.replace(new RegExp(`^${companion.name}:\\s*`, 'i'), '');

        if (cleaned.length > 10) {
          return cleaned;
        }
      }
    }

    // Fallback to mock responses
    return this.getFallbackResponse(companion, userMessage);
  }

  /**
   * Analyze message sentiment and extract important info
   */
  analyzeMessage(message) {
    const lowerMessage = message.toLowerCase();

    // Detect sentiment
    const positiveWords = ['love', 'great', 'awesome', 'happy', 'wonderful', 'amazing', 'fantastic', 'excellent'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'upset', 'frustrated'];

    const hasPositive = positiveWords.some(word => lowerMessage.includes(word));
    const hasNegative = negativeWords.some(word => lowerMessage.includes(word));

    let sentiment = 'neutral';
    if (hasPositive && !hasNegative) sentiment = 'positive';
    if (hasNegative && !hasPositive) sentiment = 'negative';

    // Detect important topics
    const topics = [];
    if (lowerMessage.match(/\b(like|love|enjoy)\b.*?\b(game|gaming|play)\b/)) topics.push('gaming');
    if (lowerMessage.match(/\b(music|song|listen)\b/)) topics.push('music');
    if (lowerMessage.match(/\b(book|read|story)\b/)) topics.push('books');
    if (lowerMessage.match(/\b(food|eat|cook|hungry)\b/)) topics.push('food');
    if (lowerMessage.match(/\b(work|job|school|study)\b/)) topics.push('work/school');

    // Check if it's a question
    const isQuestion = message.includes('?') || lowerMessage.match(/^(what|how|why|when|where|who|can|could|would|should|do|does|is|are)/);

    // Check if user shared personal info
    const isPersonal = lowerMessage.match(/\b(my name is|i am|i'm|i feel|i think|i believe)\b/);

    return {
      sentiment,
      topics,
      isQuestion: !!isQuestion,
      isPersonal: !!isPersonal,
      importance: (topics.length > 0 || isPersonal || hasPositive || hasNegative) ? 'high' : 'normal'
    };
  }

  /**
   * Extract and store important memories
   */
  extractMemory(companion, userMessage, analysis) {
    if (analysis.importance === 'high' || analysis.isPersonal) {
      return {
        text: userMessage,
        timestamp: Date.now(),
        sentiment: analysis.sentiment,
        topics: analysis.topics,
        emotionalWeight: analysis.sentiment === 'positive' ? 1 : analysis.sentiment === 'negative' ? -1 : 0
      };
    }
    return null;
  }
}

// Singleton instance
export const aiService = new AIService();
