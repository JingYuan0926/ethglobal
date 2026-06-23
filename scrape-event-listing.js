// Generic: scrape a full ETHGlobal showcase event listing by slug.
// Usage: node scrape-event-listing.js <eventSlug>  -> data/<slug>-live-listing.json
const fs = require('fs');
const { fetchWithDelay } = require('./lib/fetcher');
const { parseListingPage, hasProjects } = require('./lib/parser-listing');

const slug = process.argv[2];
if (!slug) { console.error('Usage: node scrape-event-listing.js <eventSlug>'); process.exit(1); }
const OUT = `data/${slug}-live-listing.json`;
const SPACING_MS = 800;

(async () => {
  const all = []; let page = 1;
  while (true) {
    const url = `https://ethglobal.com/showcase?events=${slug}&page=${page}`;
    const html = await fetchWithDelay(url, SPACING_MS);
    if (!html || !hasProjects(html)) break;
    const pj = parseListingPage(html);
    if (!pj.length) break;
    all.push(...pj);
    process.stdout.write(`p${page}:${pj.length} `);
    page++;
    if (page > 60) break;
  }
  // dedupe by slug (pagination overlaps)
  const seen = new Set(); const uniq = [];
  for (const p of all) { if (!seen.has(p.slug)) { seen.add(p.slug); uniq.push(p); } }
  fs.writeFileSync(OUT, JSON.stringify(uniq, null, 2));
  const evs = {}; uniq.forEach(p => evs[p.event] = (evs[p.event] || 0) + 1);
  const withBadges = uniq.filter(p => p.prizeCount > 0);
  const freq = {}; uniq.forEach(p => (p.prizeBadgeOrgIds || []).forEach(o => freq[o] = (freq[o] || 0) + 1));
  const finalists = uniq.filter(p => (p.prizeBadgeOrgIds || []).includes('xdat5'));
  console.log(`\nTOTAL entries:${all.length} distinct:${uniq.length}`);
  console.log('Event labels:', JSON.stringify(evs));
  console.log('With prize badges:', withBadges.length);
  console.log('Badge org-id freq:', JSON.stringify(freq));
  console.log(`xdat5 finalist badges: ${finalists.length}`);
  finalists.forEach(f => console.log('  FINALIST-BADGE: ' + f.name + ' (' + f.slug + ')'));
  console.log('Saved ' + OUT);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
