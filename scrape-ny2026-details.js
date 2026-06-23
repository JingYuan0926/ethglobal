// Gentle detail scrape of NY2026 winners (prizeCount>0) + the 10 image finalists.
const fs = require('fs');
const { fetchPage } = require('./lib/fetcher');
const { parseDetailPage } = require('./lib/parser-detail');

const OUT = 'data/newyork2026-details.json';
const SPACING_MS = 2500;
const FINALIST_SLUGS = [
  'canary-kh3h7','accrue-racfy','void-tactics-ag25f','lynx-ta08o','distro-h393v',
  'unsu-o1e71','proof-of-scan-trx38','the-wallet-shift-pqdxy','immunity-eg56a','cumulant-xfzya'
];

(async () => {
  const list = JSON.parse(fs.readFileSync('data/newyork2026-live-listing.json','utf8'));
  const bySlug = new Map(list.map(l => [l.slug, l]));
  const finSet = new Set(FINALIST_SLUGS);
  const targets = list.filter(l => l.prizeCount > 0 || finSet.has(l.slug)).map(l => l.slug);

  let done = {};
  if (fs.existsSync(OUT)) { try { JSON.parse(fs.readFileSync(OUT,'utf8')).forEach(r => done[r.slug] = r); } catch {} }
  const todo = targets.filter(s => !done[s] || done[s]._fail || !done[s].projectDescription);
  console.log(`Targets: ${targets.length} (winners+finalists), to fetch: ${todo.length}`);

  let ok=0, fail=0, n=0;
  for (const slug of todo) {
    n++;
    const l = bySlug.get(slug);
    const html = await fetchPage(`https://ethglobal.com/showcase/${slug}`);
    if (!html) { done[slug] = { slug, name: l.name, event: l.event, description: l.description, prizes: [], _fail: true }; fail++; }
    else {
      const d = parseDetailPage(html);
      done[slug] = { slug, name: d.name || l.name, event: l.event, description: l.description,
        projectDescription: d.projectDescription, howItsMade: d.howItsMade, prizes: d.prizes,
        githubUrl: d.githubUrl, demoUrl: d.demoUrl, teamMembers: d.teamMembers };
      ok++;
    }
    if (n % 10 === 0) { fs.writeFileSync(OUT, JSON.stringify(Object.values(done), null, 2)); console.log(`[${n}/${todo.length}] ok=${ok} fail=${fail}`); }
    await new Promise(r => setTimeout(r, SPACING_MS));
  }
  fs.writeFileSync(OUT, JSON.stringify(Object.values(done), null, 2));
  const winners = Object.values(done).filter(r => (r.prizes||[]).length > 0);
  console.log(`DONE. ok=${ok} fail=${fail}; file has ${Object.keys(done).length} records; winners w/ prizes=${winners.length}`);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
