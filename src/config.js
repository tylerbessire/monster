// AI Configuration - Using llama.cpp with local GGUF model
export const config = {
  // AI Provider: 'llamacpp' for local llama.cpp server, 'mock' for testing
  aiProvider: 'llamacpp',

  // llama.cpp server configuration
  llamacpp: {
    serverUrl: 'http://localhost:8080',
    endpoint: '/completion',
    temperature: 0.9,
    maxTokens: 150,
    topP: 0.9,
    topK: 40,
    repeatPenalty: 1.1,
    // Stop sequences to prevent the model from continuing too long
    stop: ['\n\n', 'User:', 'Human:', '\nYou:']
  },

  // Companion AI settings
  maxContextMessages: 10, // Keep last 10 messages for context
  memoryMaxSize: 50, // Store up to 50 important memories

  // Personality evolution
  personalityTraits: [
    'curious', 'playful', 'wise', 'energetic', 'calm',
    'adventurous', 'caring', 'silly', 'serious', 'creative'
  ]
};

// Recommended GGUF models for companions:
// - TinyLlama-1.1B (fast, good for simple responses)
// - Phi-2 (2.7B, great balance of speed and quality)
// - Llama-3.2-1B/3B (excellent for conversations)
// - Mistral-7B (higher quality, needs more RAM)

// To run llama.cpp server:
// ./llama-server -m path/to/model.gguf --port 8080 -c 2048 --threads 4
