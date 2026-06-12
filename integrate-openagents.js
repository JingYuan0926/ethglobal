// Merge the freshly-scraped Open Agents event into the canonical data pipeline:
//   data/listings.json + data/progress.json (completed) -> regenerate data/details.json
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, 'data');
const LISTINGS = path.join(DATA, 'listings.json');
const PROGRESS = path.join(DATA, 'progress.json');
const DETAILS = path.join(DATA, 'details.json');
const OA_LISTING = path.join(DATA, 'openagents-live-listing.json');
const OA_FULL = path.join(DATA, 'openagents-details-full.json');

function writeJSON(file, obj) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
  fs.renameSync(tmp, file);
}

function main() {
  const listings = JSON.parse(fs.readFileSync(LISTINGS, 'utf8'));
  const progress = JSON.parse(fs.readFileSync(PROGRESS, 'utf8'));
  const oaListing = JSON.parse(fs.readFileSync(OA_LISTING, 'utf8'));
  const oaFull = JSON.parse(fs.readFileSync(OA_FULL, 'utf8'));

  // 1) Merge OA listings (dedupe by slug)
  const haveSlugs = new Set(listings.map(l => l.slug));
  let addedListings = 0;
  for (const l of oaListing) {
    if (!haveSlugs.has(l.slug)) {
      listings.push({
        name: l.name, slug: l.slug, description: l.description,
        event: l.event, prizeCount: l.prizeCount, prizeBadgeOrgIds: l.prizeBadgeOrgIds || [],
      });
      haveSlugs.add(l.slug);
      addedListings++;
    }
  }

  // 2) Merge OA details into progress.completed (parseDetailPage subset)
  let addedDetails = 0;
  for (const d of oaFull) {
    if (d._fail) continue;
    progress.completed[d.slug] = {
      name: d.name,
      projectDescription: d.projectDescription || '',
      howItsMade: d.howItsMade || '',
      prizes: d.prizes || [],
      githubUrl: d.githubUrl || '',
      demoUrl: d.demoUrl || '',
      teamMembers: d.teamMembers || [],
    };
    addedDetails++;
  }

  writeJSON(LISTINGS, listings);
  writeJSON(PROGRESS, progress);

  // 3) Regenerate details.json (same join as scrape-details.js generateDetails)
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
  writeJSON(DETAILS, details);

  const oaInDetails = details.filter(d => d.event === 'Open Agents');
  const oaWinners = oaInDetails.filter(d => (d.prizes || []).length > 0);
  const oaFinalists = oaInDetails.filter(d => (d.prizes || []).some(p => /finalist/i.test(p.placement || '')));
  console.log(`Listings added: ${addedListings} (total ${listings.length})`);
  console.log(`Completed details added: ${addedDetails} (total ${Object.keys(progress.completed).length})`);
  console.log(`details.json total: ${details.length}`);
  console.log(`Open Agents in details.json: ${oaInDetails.length} | winners: ${oaWinners.length} | finalists: ${oaFinalists.length}`);
}

main();
