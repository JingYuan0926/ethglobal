// One-off: full detail scrape of the Open Agents (2026) event.
// Reads the pre-scraped listing, fetches every detail page, saves full records.
const fs = require('fs');
const path = require('path');
const { fetchPage } = require('./lib/fetcher');
const { parseDetailPage } = require('./lib/parser-detail');

const DATA_DIR = path.join(__dirname, 'data');
const LISTING = path.join(DATA_DIR, 'openagents-live-listing.json');
const OUT = path.join(DATA_DIR, 'openagents-details-full.json');
const DELAY_MS = 500;

async function main() {
  const listings = JSON.parse(fs.readFileSync(LISTING, 'utf8'));
  console.log(`Open Agents full detail scrape: ${listings.length} projects`);

  // Resume support: keep already-scraped slugs
  let done = {};
  if (fs.existsSync(OUT)) {
    try { JSON.parse(fs.readFileSync(OUT, 'utf8')).forEach(r => { done[r.slug] = r; }); } catch {}
  }

  let i = 0, ok = 0, fail = 0, fin = 0;
  for (const l of listings) {
    i++;
    if (done[l.slug] && !done[l.slug]._fail) continue;
    const html = await fetchPage(`https://ethglobal.com/showcase/${l.slug}`);
    if (!html) {
      done[l.slug] = { slug: l.slug, name: l.name, event: l.event, description: l.description, prizes: [], _fail: true };
      fail++;
    } else {
      const d = parseDetailPage(html);
      done[l.slug] = {
        slug: l.slug,
        name: d.name || l.name,
        event: l.event,
        description: l.description,
        projectDescription: d.projectDescription,
        howItsMade: d.howItsMade,
        prizes: d.prizes,
        githubUrl: d.githubUrl,
        demoUrl: d.demoUrl,
        teamMembers: d.teamMembers,
      };
      ok++;
      if (d.prizes.some(p => /finalist/i.test(p.placement || ''))) fin++;
    }
    if (i % 20 === 0) {
      fs.writeFileSync(OUT, JSON.stringify(Object.values(done), null, 2));
      console.log(`[${i}/${listings.length}] ok=${ok} fail=${fail} finalists=${fin}`);
    }
    await new Promise(r => setTimeout(r, DELAY_MS));
  }
  fs.writeFileSync(OUT, JSON.stringify(Object.values(done), null, 2));
  const winners = Object.values(done).filter(r => (r.prizes || []).length > 0);
  console.log(`\nDONE. total=${Object.keys(done).length} ok=${ok} fail=${fail} winners=${winners.length} finalists=${fin}`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
