import process from 'node:process';

const port = process.env.LLAMA_PORT ?? '8080';
const baseUrl = process.env.LLAMA_URL ?? `http://localhost:${port}`;
const healthUrl = `${baseUrl.replace(/\/$/, '')}/health`;
const timeoutMs = Number(process.env.LLAMA_TIMEOUT ?? 5000);

function withTimeout(signal, ms) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  signal?.addEventListener('abort', () => controller.abort());
  return { signal: controller.signal, clear: () => clearTimeout(timeoutId) };
}

async function main() {
  console.log(`🔍 Checking llama.cpp server at ${healthUrl} (timeout ${timeoutMs}ms)`);

  const { signal, clear } = withTimeout(null, timeoutMs);

  try {
    const response = await fetch(healthUrl, { signal });
    clear();

    if (!response.ok) {
      console.error(`⚠️ llama.cpp health check responded with status ${response.status}`);
      process.exit(1);
    }

    const body = await response.text();
    console.log('✅ llama.cpp server reachable!');
    if (body) {
      console.log(`   health response: ${body}`);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`⏱️ Health check timed out after ${timeoutMs}ms.`);
    } else {
      console.error('❌ Failed to reach llama.cpp server.');
      console.error(error.message);
    }
    process.exit(1);
  }
}

await main();
