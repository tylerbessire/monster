import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const llamaBinary = path.resolve(__dirname, '../llama.cpp/build/bin/llama-server');
const modelFile = path.resolve(
  __dirname,
  '../llama.cpp/models/Phi-3-mini-4k-instruct.Q4_K_M.gguf'
);

const port = process.env.LLAMA_PORT ?? '8080';
const contextSize = process.env.LLAMA_CONTEXT ?? '2048';
const threadCount = process.env.LLAMA_THREADS ?? '4';

async function ensureFileExists(filePath, friendlyName) {
  try {
    await access(filePath);
  } catch (error) {
    console.error(`❌ Missing ${friendlyName}: ${filePath}`);
    console.error('Ensure you have built llama.cpp and placed the GGUF model in the models folder.');
    process.exit(1);
  }
}

async function main() {
  await ensureFileExists(llamaBinary, 'llama.cpp server binary');
  await ensureFileExists(modelFile, 'GGUF model file');

  const args = ['-m', modelFile, '--port', port, '-c', contextSize, '--threads', threadCount];

  console.log('🚀 Starting llama.cpp server with:');
  console.log(`   binary: ${llamaBinary}`);
  console.log(`   model:  ${modelFile}`);
  console.log(`   port:   ${port}`);
  console.log(`   ctx:    ${contextSize}`);
  console.log(`   threads:${threadCount}`);

  const child = spawn(llamaBinary, args, { stdio: 'inherit' });

  const shutdown = (signal) => {
    console.log(`\nReceived ${signal}. Shutting down llama.cpp server...`);
    child.kill('SIGINT');
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  child.on('exit', (code) => {
    if (code === 0) {
      console.log('✅ llama.cpp server stopped cleanly.');
    } else {
      console.error(`⚠️ llama.cpp server exited with code ${code}`);
    }
    process.exit(code ?? 0);
  });
}

await main();
