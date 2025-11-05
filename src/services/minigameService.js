/**
 * Mini-Games System - Fun games to play with your companion
 */
export class MinigameService {
  constructor() {
    this.games = {
      number_guess: {
        id: 'number_guess',
        name: 'Number Guess',
        description: 'Guess the number I\'m thinking of!',
        icon: '🔢',
        minLevel: 1,
        difficulty: 'easy'
      },
      memory: {
        id: 'memory',
        name: 'Memory Match',
        description: 'Remember the pattern!',
        icon: '🧠',
        minLevel: 3,
        difficulty: 'medium'
      },
      trivia: {
        id: 'trivia',
        name: 'Trivia Quiz',
        description: 'Test your knowledge!',
        icon: '❓',
        minLevel: 5,
        difficulty: 'medium'
      },
      reaction: {
        id: 'reaction',
        name: 'Quick Tap',
        description: 'Test your reaction time!',
        icon: '⚡',
        minLevel: 1,
        difficulty: 'easy'
      },
      word_scramble: {
        id: 'word_scramble',
        name: 'Word Scramble',
        description: 'Unscramble the word!',
        icon: '📝',
        minLevel: 7,
        difficulty: 'hard'
      }
    };
  }

  /**
   * Get available games for companion's level
   */
  getAvailableGames(companionLevel) {
    return Object.values(this.games).filter(game => companionLevel >= game.minLevel);
  }

  /**
   * Initialize a new game session
   */
  startGame(gameId, difficulty = 'normal') {
    const game = this.games[gameId];
    if (!game) return null;

    switch (gameId) {
      case 'number_guess':
        return this.startNumberGuess(difficulty);
      case 'memory':
        return this.startMemoryMatch(difficulty);
      case 'trivia':
        return this.startTrivia(difficulty);
      case 'reaction':
        return this.startReaction();
      case 'word_scramble':
        return this.startWordScramble(difficulty);
      default:
        return null;
    }
  }

  /**
   * Number Guessing Game
   */
  startNumberGuess(difficulty) {
    const ranges = {
      easy: { min: 1, max: 10, attempts: 5 },
      normal: { min: 1, max: 50, attempts: 7 },
      hard: { min: 1, max: 100, attempts: 10 }
    };

    const range = ranges[difficulty] || ranges.normal;
    const answer = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

    return {
      gameId: 'number_guess',
      state: 'playing',
      answer,
      min: range.min,
      max: range.max,
      attempts: 0,
      maxAttempts: range.attempts,
      guesses: [],
      hints: []
    };
  }

  /**
   * Process number guess
   */
  guessNumber(gameState, guess) {
    gameState.attempts += 1;
    gameState.guesses.push(guess);

    if (guess === gameState.answer) {
      gameState.state = 'won';
      gameState.score = Math.floor(1000 * (1 - gameState.attempts / gameState.maxAttempts));
      return { result: 'correct', message: '🎉 You got it!' };
    }

    if (gameState.attempts >= gameState.maxAttempts) {
      gameState.state = 'lost';
      return { result: 'game_over', message: `Game over! The answer was ${gameState.answer}` };
    }

    const hint = guess < gameState.answer ? 'Higher! ⬆️' : 'Lower! ⬇️';
    gameState.hints.push(hint);
    return { result: 'wrong', message: hint };
  }

  /**
   * Memory Match Game
   */
  startMemoryMatch(difficulty) {
    const lengths = {
      easy: 4,
      normal: 6,
      hard: 8
    };

    const length = lengths[difficulty] || lengths.normal;
    const symbols = ['🍎', '🍕', '🎮', '⭐', '💎', '🎵', '🌸', '🔥'];
    const pattern = [];

    for (let i = 0; i < length; i++) {
      pattern.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }

    return {
      gameId: 'memory',
      state: 'showing',
      pattern,
      playerInput: [],
      currentIndex: 0,
      showTime: 2000 + (length * 500),
      attempts: 0
    };
  }

  /**
   * Check memory match input
   */
  checkMemoryInput(gameState, symbol) {
    const correctSymbol = gameState.pattern[gameState.currentIndex];

    if (symbol === correctSymbol) {
      gameState.playerInput.push(symbol);
      gameState.currentIndex += 1;

      if (gameState.currentIndex >= gameState.pattern.length) {
        gameState.state = 'won';
        gameState.score = 1000 + (gameState.pattern.length * 100);
        return { result: 'complete', message: '🎉 Perfect memory!' };
      }

      return { result: 'correct', message: 'Correct! Keep going!' };
    } else {
      gameState.attempts += 1;
      if (gameState.attempts >= 3) {
        gameState.state = 'lost';
        return { result: 'game_over', message: 'Game over! Let\'s try again!' };
      }
      return { result: 'wrong', message: 'Oops! Try again!' };
    }
  }

  /**
   * Trivia Game
   */
  startTrivia(difficulty) {
    const questions = {
      easy: [
        { q: 'What color is the sky?', a: ['blue', 'sky blue', 'light blue'], hint: 'Look up!' },
        { q: 'How many legs does a spider have?', a: ['8', 'eight'], hint: 'More than 4!' },
        { q: 'What sound does a dog make?', a: ['woof', 'bark', 'arf'], hint: 'Woof woof!' }
      ],
      normal: [
        { q: 'What is the capital of France?', a: ['paris'], hint: 'City of lights' },
        { q: 'How many planets are in our solar system?', a: ['8', 'eight'], hint: 'Mercury to Neptune' },
        { q: 'What is H2O?', a: ['water'], hint: 'You drink it every day' }
      ],
      hard: [
        { q: 'What year did World War II end?', a: ['1945'], hint: 'Mid-1940s' },
        { q: 'What is the speed of light in km/s?', a: ['299792', '300000'], hint: 'About 300,000' },
        { q: 'Who painted the Mona Lisa?', a: ['leonardo da vinci', 'da vinci', 'leonardo'], hint: 'Renaissance genius' }
      ]
    };

    const pool = questions[difficulty] || questions.normal;
    const question = pool[Math.floor(Math.random() * pool.length)];

    return {
      gameId: 'trivia',
      state: 'playing',
      question: question.q,
      answers: question.a,
      hint: question.hint,
      attempts: 0,
      maxAttempts: 3
    };
  }

  /**
   * Check trivia answer
   */
  checkTriviaAnswer(gameState, answer) {
    gameState.attempts += 1;
    const normalized = answer.toLowerCase().trim();

    if (gameState.answers.some(a => normalized.includes(a) || a.includes(normalized))) {
      gameState.state = 'won';
      gameState.score = 500;
      return { result: 'correct', message: '🎉 Correct!' };
    }

    if (gameState.attempts >= gameState.maxAttempts) {
      gameState.state = 'lost';
      return {
        result: 'game_over',
        message: `The answer was: ${gameState.answers[0]}`
      };
    }

    return {
      result: 'wrong',
      message: gameState.attempts === 2 ? `Hint: ${gameState.hint}` : 'Try again!'
    };
  }

  /**
   * Word Scramble Game
   */
  startWordScramble(difficulty) {
    const words = {
      easy: ['cat', 'dog', 'sun', 'moon', 'star', 'tree', 'fish', 'bird'],
      normal: ['happy', 'friend', 'garden', 'music', 'dragon', 'castle', 'wizard'],
      hard: ['adventure', 'companion', 'knowledge', 'evolution', 'personality', 'achievement']
    };

    const pool = words[difficulty] || words.normal;
    const word = pool[Math.floor(Math.random() * pool.length)];
    const scrambled = this.scrambleWord(word);

    return {
      gameId: 'word_scramble',
      state: 'playing',
      word: word,
      scrambled: scrambled,
      attempts: 0,
      maxAttempts: 3
    };
  }

  /**
   * Scramble a word
   */
  scrambleWord(word) {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Make sure it's actually scrambled
    const scrambled = arr.join('');
    return scrambled === word ? this.scrambleWord(word) : scrambled;
  }

  /**
   * Check word scramble answer
   */
  checkScrambleAnswer(gameState, answer) {
    gameState.attempts += 1;
    const normalized = answer.toLowerCase().trim();

    if (normalized === gameState.word) {
      gameState.state = 'won';
      gameState.score = 750;
      return { result: 'correct', message: '🎉 You unscrambled it!' };
    }

    if (gameState.attempts >= gameState.maxAttempts) {
      gameState.state = 'lost';
      return { result: 'game_over', message: `The word was: ${gameState.word}` };
    }

    return { result: 'wrong', message: 'Not quite! Try again!' };
  }

  /**
   * Get reward for winning
   */
  getGameReward(gameState, companion) {
    const baseRewards = {
      number_guess: { xp: 20, happiness: 10 },
      memory: { xp: 30, happiness: 15 },
      trivia: { xp: 25, happiness: 12 },
      reaction: { xp: 15, happiness: 10 },
      word_scramble: { xp: 35, happiness: 15 }
    };

    const reward = baseRewards[gameState.gameId] || { xp: 20, happiness: 10 };

    // Bonus for evolution stage
    const stageMultiplier = {
      baby: 1.0,
      teen: 1.2,
      adult: 1.5
    };

    const mult = stageMultiplier[companion.evolutionStage] || 1.0;

    return {
      xp: Math.floor(reward.xp * mult),
      happiness: Math.floor(reward.happiness * mult),
      knowledge: 5
    };
  }
}

export const minigameService = new MinigameService();
