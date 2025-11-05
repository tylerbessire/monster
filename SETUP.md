# AI Companion Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server + llama.cpp**
   ```bash
   npm run dev
   ```

   This starts both the Vite dev server and the local llama.cpp server (if built and the model exists).

3. **Optional: Check server health**
   ```bash
   npm run check:llama
   ```
   Use this once the dev servers are up to confirm the llama.cpp endpoint is reachable.

---

## Using llama.cpp for Local AI (Recommended)

For intelligent, contextual responses from your companion, set up llama.cpp with a local GGUF model.

### Step 1: Install llama.cpp

#### macOS/Linux:
```bash
# Clone llama.cpp
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp

# Configure & build (Release)
cmake -B build
cmake --build build --config Release
```

#### Windows:
```bash
# Use pre-built binaries from releases:
# https://github.com/ggerganov/llama.cpp/releases

# Or build with CMake:
cmake -B build
cmake --build build --config Release
```

### Step 2: Download a GGUF Model

Choose a model based on your system:

#### Small & Fast (1-3GB RAM)
- **TinyLlama 1.1B** - Great for simple conversations
  ```bash
  wget https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf
  ```

- **Phi-2 2.7B** - Excellent balance of speed and quality
  ```bash
  wget https://huggingface.co/TheBloke/phi-2-GGUF/resolve/main/phi-2.Q4_K_M.gguf
  ```

#### Medium (4-8GB RAM)
- **Llama-3.2 3B** - High quality conversations
  ```bash
  wget https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf
  ```

#### Large (16GB+ RAM)
- **Mistral 7B** - Professional quality
  ```bash
  wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf
  ```

### Step 3: Run llama.cpp Server

```bash
npm run dev:llama
```

This uses `scripts/start-llama.js` to launch `llama.cpp/build/bin/llama-server` with reasonable defaults. You can override the port, context size, or thread count via environment variables (`LLAMA_PORT`, `LLAMA_CONTEXT`, `LLAMA_THREADS`).

To launch both the llama.cpp server and Vite UI together:

```bash
npm run dev
```

### Step 4: Verify Connection

1. Use the automated health check:
   ```bash
   npm run check:llama
   ```
2. Open your browser and go to `http://localhost:5173` (Vite dev server)
3. Look for console message: `🦙 llama.cpp server: connected`
4. If you see `⚠️ llama.cpp server offline`, check that:
   - llama.cpp server is running on port 8080 (`npm run dev:llama`)
   - No firewall blocking localhost connections

---

## Configuration

### Edit AI Settings

Open `src/config.js`:

```javascript
export const config = {
  // Change to 'mock' to use fallback responses (no AI server needed)
  aiProvider: 'llamacpp',

  llamacpp: {
    serverUrl: 'http://localhost:8080',  // Change if using different port
    temperature: 0.9,    // Higher = more creative (0.1 - 1.0)
    maxTokens: 150,      // Max response length
    // ...
  }
};
```

### Fallback Mode

Don't have llama.cpp set up? No problem! The app works with fallback responses:

```javascript
// In src/config.js
aiProvider: 'mock'  // Uses pre-written responses
```

---

## Features

### ✨ Enhanced AI Features

- **Contextual Memory**: Companion remembers important conversations
- **Personality System**: Unique traits develop based on interactions
- **Sentiment Analysis**: Companion responds to your emotions
- **Evolution Stages**: Baby → Teen → Adult (appearance & intelligence change)

### 🎮 Game Features

- **Leveling System**: Earn XP and level up (1-99)
- **Achievement System**: 20+ achievements to unlock
- **Mini-Games**: Number Guess, Memory Match, Trivia, Word Scramble
- **Enhanced Quests**: 50+ real facts across 8 topics
- **Stat Tracking**: Happiness, Energy, Knowledge

### 🎨 Customization

- **5 Themes**: Classic, Ocean, Sunset, Forest, Candy
- **Personality Development**: 10 trait types
- **Mood System**: Dynamic emotional states

---

## Performance Tips

### For Slow Systems

1. **Use smaller models** (TinyLlama or Phi-2)
2. **Reduce context size**: `-c 1024` in llama-server
3. **Fewer threads**: `--threads 2`
4. **Quantized models**: Use Q4_K_M or Q5_K_M versions

### For Fast Systems

1. **Use larger models** (Mistral 7B or Llama-3.2 3B)
2. **Increase context**: `-c 4096`
3. **More threads**: `--threads 8`
4. **GPU acceleration**: Use Metal/CUDA builds

---

## Troubleshooting

### "llama.cpp server offline"

1. Check server is running: `curl http://localhost:8080/health`
2. Verify port 8080 is free: `lsof -i :8080` (Unix) or `netstat -ano | findstr :8080` (Windows)
3. Check firewall settings
4. Try restarting llama-server

### Slow Responses

1. Use smaller model (TinyLlama or Phi-2)
2. Reduce `maxTokens` in config.js
3. Use fewer threads if system is thermal throttling
4. Check CPU/RAM usage

### Model Download Issues

Use alternative mirrors:
- Hugging Face CLI: `pip install huggingface-hub[cli]`
- Then: `huggingface-cli download TheBloke/phi-2-GGUF phi-2.Q4_K_M.gguf`

---

## Development

### File Structure

```
src/
├── config.js                    # AI configuration
├── main.js                      # Main application
├── store.js                     # State management
├── components/
│   ├── CompanionView.js        # Main companion UI
│   ├── EggStage.js             # Egg hatching
│   └── SignupForm.js           # Name/gender selection
└── services/
    ├── aiService.js            # AI integration
    ├── personalityService.js   # Personality system
    ├── evolutionService.js     # Leveling & evolution
    ├── achievementService.js   # Achievements
    ├── minigameService.js      # Mini-games
    └── questService.js         # Quest system
```

### Adding Custom Responses

Edit `src/services/aiService.js` → `getFallbackResponse()` to customize mock responses.

### Adding New Quests

Edit `src/services/questService.js` → `questDatabase` to add topics and facts.

### Adding Achievements

Edit `src/services/achievementService.js` → `achievements` object.

---

## Credits

- Built with Vite, Zustand, and vanilla JavaScript
- AI powered by llama.cpp
- 8-bit aesthetic inspired by Tamagotchi and Game Boy

---

## Need Help?

- Check llama.cpp docs: https://github.com/ggerganov/llama.cpp
- Model recommendations: https://huggingface.co/models?library=gguf
- Open an issue if you encounter problems

Enjoy your AI companion! 🐾✨
