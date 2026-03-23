const fs = require('fs');
const path = require('path');
const { fetchWithDelay } = require('./lib/fetcher');
const { parseDetailPage } = require('./lib/parser-detail');
const { loadProgress, saveProgress, markCompleted, markFailed } = require('./lib/progress');

const BASE_URL = 'https://ethglobal.com/showcase';
const DATA_DIR = path.join(__dirname, 'data');
const LISTINGS_FILE = path.join(DATA_DIR, 'listings.json');
const DETAILS_FILE = path.join(DATA_DIR, 'details.json');

const SAVE_INTERVAL = 10; // Save progress every N projects
const DELAY_MS = 600;

async function main() {
  console.log('ETHGlobal Detail Page Scraper');
  console.log('============================\n');

  if (!fs.existsSync(LISTINGS_FILE)) {
    console.error('listings.json not found. Run scrape-listings.js first.');
    process.exit(1);
  }

  const listings = JSON.parse(fs.readFileSync(LISTINGS_FILE, 'utf8'));
  console.log(`Loaded ${listings.length} projects from listings.json`);

  const progress = loadProgress();
  const completedCount = Object.keys(progress.completed).length;
  console.log(`Already scraped: ${completedCount}, Failed: ${progress.failed.length}`);

  // Filter to projects not yet scraped
  const toScrape = listings.filter(p => !progress.completed[p.slug]);
  console.log(`Remaining to scrape: ${toScrape.length}\n`);

  if (toScrape.length === 0) {
    console.log('All projects already scraped! Generating details.json...');
    generateDetails(listings, progress);
    return;
  }

  // Handle Ctrl+C gracefully
  let interrupted = false;
  process.on('SIGINT', () => {
    console.log('\n\nInterrupted! Saving progress...');
    saveProgress(progress);
    interrupted = true;
  });

  let scraped = 0;
  for (const project of toScrape) {
    if (interrupted) break;

    scraped++;
    const pct = Math.round((completedCount + scraped) / listings.length * 100);
    process.stdout.write(`[${pct}%] ${scraped}/${toScrape.length} ${project.name}...`);

    const url = `${BASE_URL}/${project.slug}`;
    const html = await fetchWithDelay(url, DELAY_MS);

    if (!html) {
      console.log(' FAILED');
      markFailed(progress, project.slug);
    } else {
      try {
        const detail = parseDetailPage(html);
        markCompleted(progress, project.slug, detail);
        const prizeStr = detail.prizes.length > 0
          ? ` (${detail.prizes.length} prizes)`
          : '';
        console.log(` OK${prizeStr}`);
      } catch (err) {
        console.log(` PARSE ERROR: ${err.message}`);
        markFailed(progress, project.slug);
      }
    }

    // Periodic save
    if (scraped % SAVE_INTERVAL === 0) {
      saveProgress(progress);
    }
  }

  // Final save
  saveProgress(progress);
  console.log(`\nScraping complete! Scraped: ${scraped}, Failed: ${progress.failed.length}`);

  // Generate combined details file
  generateDetails(listings, progress);
}

function generateDetails(listings, progress) {
  const details = listings.map(listing => {
    const detail = progress.completed[listing.slug];
    if (detail) {
      return {
        ...listing,
        projectDescription: detail.projectDescription || '',
        howItsMade: detail.howItsMade || '',
        prizes: detail.prizes || [],
        githubUrl: detail.githubUrl || '',
        demoUrl: detail.demoUrl || '',
        teamMembers: detail.teamMembers || [],
        scraped: true,
      };
    }
    return { ...listing, prizes: [], scraped: false };
  });

  const tmp = DETAILS_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(details, null, 2));
  fs.renameSync(tmp, DETAILS_FILE);

  const withPrizes = details.filter(d => d.prizes && d.prizes.length > 0).length;
  console.log(`\nSaved ${details.length} projects to details.json`);
  console.log(`Projects with prizes: ${withPrizes}`);
  console.log(`Max prizes on one project: ${Math.max(...details.map(d => (d.prizes || []).length))}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
