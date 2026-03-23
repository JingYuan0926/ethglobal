const fs = require('fs');
const path = require('path');
const { fetchWithDelay } = require('./lib/fetcher');
const { parseListingPage, hasProjects } = require('./lib/parser-listing');

const BASE_URL = 'https://ethglobal.com/showcase';
const DATA_DIR = path.join(__dirname, 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'listings.json');

// Recent events (2024-2026)
const EVENTS = [
  'hackmoney2026',
  'buenosaires',
  'ethonline2025',
  'newdelhi',
  'newyork2025',
  'unite',
  'cannes',
  'prague',
  'taipei',
  'agents',
  'bangkok',
  'sanfrancisco2024',
];

async function scrapeEvent(eventSlug) {
  const projects = [];
  let page = 1;

  while (true) {
    const url = `${BASE_URL}?events=${eventSlug}&page=${page}`;
    process.stdout.write(`  Page ${page}...`);

    const html = await fetchWithDelay(url, 500);
    if (!html || !hasProjects(html)) {
      console.log(' no more projects');
      break;
    }

    const pageProjects = parseListingPage(html);
    if (pageProjects.length === 0) {
      console.log(' empty page');
      break;
    }

    projects.push(...pageProjects);
    console.log(` ${pageProjects.length} projects (total: ${projects.length})`);
    page++;
  }

  return projects;
}

async function main() {
  console.log('ETHGlobal Showcase Listing Scraper');
  console.log('==================================\n');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const allProjects = [];
  const seen = new Set();

  for (const event of EVENTS) {
    console.log(`\nScraping event: ${event}`);
    const projects = await scrapeEvent(event);

    // Deduplicate by slug
    for (const p of projects) {
      if (!seen.has(p.slug)) {
        seen.add(p.slug);
        allProjects.push(p);
      }
    }

    console.log(`  => ${projects.length} projects from ${event} (${allProjects.length} total unique)`);
  }

  // Save results
  const tmp = OUTPUT_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(allProjects, null, 2));
  fs.renameSync(tmp, OUTPUT_FILE);

  console.log(`\nDone! Saved ${allProjects.length} projects to ${OUTPUT_FILE}`);

  // Stats
  const withPrizes = allProjects.filter(p => p.prizeCount > 0).length;
  console.log(`Projects with prizes: ${withPrizes} (${Math.round(withPrizes/allProjects.length*100)}%)`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
