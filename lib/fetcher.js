const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const DEFAULT_DELAY = 600;
const MAX_RETRIES = 3;
const MAX_DELAY = 10000;

async function fetchPage(url, options = {}) {
  const { maxRetries = MAX_RETRIES, baseDelay = DEFAULT_DELAY } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (response.status === 429) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt + 1), MAX_DELAY);
        console.log(`  Rate limited (429), waiting ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }

      return await response.text();
    } catch (err) {
      if (attempt === maxRetries) {
        console.error(`  Failed after ${maxRetries + 1} attempts: ${url} - ${err.message}`);
        return null;
      }
      const delay = Math.min(baseDelay * Math.pow(2, attempt), MAX_DELAY);
      console.log(`  Retry ${attempt + 1}/${maxRetries} in ${delay}ms: ${err.message}`);
      await sleep(delay);
    }
  }
  return null;
}

async function fetchWithDelay(url, delayMs = DEFAULT_DELAY) {
  const html = await fetchPage(url);
  await sleep(delayMs);
  return html;
}

module.exports = { fetchPage, fetchWithDelay, sleep };
