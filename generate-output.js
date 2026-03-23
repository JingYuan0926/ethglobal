const fs = require('fs');
const path = require('path');
const { stringify } = require('csv-stringify/sync');

const DATA_DIR = path.join(__dirname, 'data');
const OUTPUT_DIR = path.join(__dirname, 'output');
const DETAILS_FILE = path.join(DATA_DIR, 'details.json');
const LISTINGS_FILE = path.join(DATA_DIR, 'listings.json');

function loadData() {
  if (fs.existsSync(DETAILS_FILE)) {
    console.log('Loading details.json (enriched data with prizes)...');
    return JSON.parse(fs.readFileSync(DETAILS_FILE, 'utf8'));
  }
  if (fs.existsSync(LISTINGS_FILE)) {
    console.log('Loading listings.json (basic data, no prize details)...');
    return JSON.parse(fs.readFileSync(LISTINGS_FILE, 'utf8'));
  }
  console.error('No data files found. Run scrape-listings.js first.');
  process.exit(1);
}

function formatPrize(prize) {
  let placement = '';
  if (prize.placement === 'pool') placement = 'pool';
  else if (prize.placement === 'finalist') placement = 'finalist';
  else if (prize.placement) placement = prize.placement;
  else placement = prize.prizeType;

  return `${prize.sponsor} - ${prize.trackName} (${placement})`;
}

function generateCSV(projects) {
  const maxPrizes = Math.max(0, ...projects.map(p => (p.prizes || []).length));
  console.log(`Max prizes per project: ${maxPrizes}`);

  // Build headers
  const headers = ['Project Name', 'Event', 'Description'];
  headers.push('Prize Count');
  for (let i = 1; i <= maxPrizes; i++) {
    headers.push(`Prize ${i}`);
  }
  headers.push('All Sponsors', 'GitHub', 'Demo', 'URL');

  // Build rows
  const rows = projects.map(p => {
    const prizes = p.prizes || [];
    const row = [
      p.name,
      p.event,
      (p.projectDescription || p.description || '').substring(0, 500),
      prizes.length,
    ];
    for (let i = 0; i < maxPrizes; i++) {
      row.push(i < prizes.length ? formatPrize(prizes[i]) : '');
    }
    const sponsors = [...new Set(prizes.map(pr => pr.sponsor))].join('; ');
    row.push(sponsors);
    row.push(p.githubUrl || '');
    row.push(p.demoUrl || '');
    row.push(`https://ethglobal.com/showcase/${p.slug}`);
    return row;
  });

  return stringify([headers, ...rows]);
}

function generateHTML(projects) {
  const maxPrizes = Math.max(0, ...projects.map(p => (p.prizes || []).length));

  // Collect unique events and sponsors for filters
  const events = [...new Set(projects.map(p => p.event))].filter(Boolean).sort();
  const sponsors = [...new Set(projects.flatMap(p =>
    (p.prizes || []).map(pr => pr.sponsor)
  ))].filter(Boolean).sort();

  const projectsJSON = JSON.stringify(projects.map(p => ({
    n: p.name,
    s: p.slug,
    e: p.event,
    d: (p.projectDescription || p.description || '').substring(0, 300),
    pc: (p.prizes || []).length,
    pr: (p.prizes || []).map(formatPrize),
    sp: [...new Set((p.prizes || []).map(pr => pr.sponsor))],
    gh: p.githubUrl || '',
    dm: p.demoUrl || '',
  })));

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ETHGlobal Showcase - Project Explorer</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; background: #f5f5f5; }
.header { background: #1a1a2e; color: white; padding: 16px 24px; position: sticky; top: 0; z-index: 100; }
.header h1 { font-size: 20px; margin-bottom: 4px; }
.header .stats { font-size: 12px; color: #aaa; }
.filters { background: white; border-bottom: 2px solid #e0e0e0; padding: 12px 24px; position: sticky; top: 56px; z-index: 99; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.filter-group { position: relative; }
.filter-btn { padding: 6px 14px; border: 1px solid #ccc; border-radius: 4px; background: white; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 4px; }
.filter-btn:hover { border-color: #888; }
.filter-btn.active { border-color: #4361ee; background: #eef; color: #4361ee; }
.dropdown { display: none; position: absolute; top: 100%; left: 0; background: white; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-height: 300px; overflow-y: auto; min-width: 250px; z-index: 200; }
.dropdown.show { display: block; }
.dropdown label { display: flex; align-items: center; padding: 6px 12px; cursor: pointer; font-size: 12px; gap: 6px; }
.dropdown label:hover { background: #f0f0f0; }
.dropdown input[type="checkbox"] { margin: 0; }
.search-input { padding: 6px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px; width: 200px; }
.toggle-label { font-size: 12px; display: flex; align-items: center; gap: 4px; cursor: pointer; }
.result-count { font-size: 12px; color: #666; margin-left: auto; }
.clear-btn { padding: 4px 10px; border: 1px solid #ddd; border-radius: 4px; background: #fafafa; cursor: pointer; font-size: 11px; color: #888; }
.clear-btn:hover { background: #fee; color: #c00; border-color: #faa; }

.table-wrap { overflow-x: auto; padding: 0 12px 40px; }
table { width: 100%; border-collapse: collapse; background: white; margin-top: 8px; font-size: 12px; }
thead { position: sticky; top: 108px; z-index: 50; }
th { background: #2d2d44; color: white; padding: 8px 6px; text-align: left; cursor: pointer; white-space: nowrap; font-size: 11px; font-weight: 600; user-select: none; border-right: 1px solid #3d3d54; }
th:hover { background: #3d3d5a; }
th .sort-arrow { margin-left: 3px; font-size: 9px; }
td { padding: 6px 6px; border-bottom: 1px solid #eee; vertical-align: top; max-width: 300px; overflow: hidden; text-overflow: ellipsis; }
tr:nth-child(even) { background: #fafbfc; }
tr:hover { background: #fffde7; }
td.name-cell { font-weight: 600; white-space: nowrap; }
td.name-cell a { color: #4361ee; text-decoration: none; }
td.name-cell a:hover { text-decoration: underline; }
td.event-cell { white-space: nowrap; }
td.desc-cell { font-size: 11px; color: #555; line-height: 1.4; }
td.prize-cell { font-size: 11px; white-space: nowrap; }
td.prize-cell.pool { color: #e67e22; }
td.prize-cell.placed { color: #27ae60; }
td.prize-cell.finalist { color: #8e44ad; }
td.link-cell a { color: #4361ee; text-decoration: none; font-size: 11px; }
td.link-cell a:hover { text-decoration: underline; }
.prize-count { display: inline-block; background: #4361ee; color: white; border-radius: 10px; padding: 1px 7px; font-size: 11px; font-weight: 600; }
.prize-count.zero { background: #ddd; color: #888; }
.no-results { text-align: center; padding: 60px; color: #888; font-size: 16px; }
</style>
</head>
<body>
<div class="header">
  <h1>ETHGlobal Showcase Explorer</h1>
  <div class="stats">Scraped ${projects.length} projects across ${events.length} events | Generated ${new Date().toLocaleDateString()}</div>
</div>

<div class="filters" id="filters">
  <div class="filter-group">
    <button class="filter-btn" onclick="toggleDropdown('event-dd')" id="event-btn">Event <span style="font-size:10px">&#9662;</span></button>
    <div class="dropdown" id="event-dd">
      ${events.map(e => `<label><input type="checkbox" value="${escHtml(e)}" onchange="applyFilters()"> ${escHtml(e)}</label>`).join('\n      ')}
    </div>
  </div>

  <div class="filter-group">
    <button class="filter-btn" onclick="toggleDropdown('sponsor-dd')" id="sponsor-btn">Sponsor <span style="font-size:10px">&#9662;</span></button>
    <div class="dropdown" id="sponsor-dd">
      ${sponsors.map(s => `<label><input type="checkbox" value="${escHtml(s)}" onchange="applyFilters()"> ${escHtml(s)}</label>`).join('\n      ')}
    </div>
  </div>

  <label class="toggle-label"><input type="checkbox" id="has-prizes" onchange="applyFilters()"> Has prizes only</label>

  <input type="text" class="search-input" id="search" placeholder="Search projects..." oninput="applyFilters()">

  <button class="clear-btn" onclick="clearFilters()">Clear filters</button>

  <span class="result-count" id="result-count"></span>
</div>

<div class="table-wrap">
  <table id="main-table">
    <thead>
      <tr>
        <th onclick="sortBy(0)" data-col="0"># <span class="sort-arrow"></span></th>
        <th onclick="sortBy(1)" data-col="1">Project <span class="sort-arrow"></span></th>
        <th onclick="sortBy(2)" data-col="2">Event <span class="sort-arrow"></span></th>
        <th onclick="sortBy(3)" data-col="3">Description <span class="sort-arrow"></span></th>
        <th onclick="sortBy(4)" data-col="4">Prizes <span class="sort-arrow"></span></th>
        ${Array.from({length: maxPrizes}, (_, i) => `<th onclick="sortBy(${5+i})" data-col="${5+i}">Prize ${i+1} <span class="sort-arrow"></span></th>`).join('\n        ')}
        <th onclick="sortBy(${5+maxPrizes})" data-col="${5+maxPrizes}">GitHub <span class="sort-arrow"></span></th>
        <th onclick="sortBy(${6+maxPrizes})" data-col="${6+maxPrizes}">Demo <span class="sort-arrow"></span></th>
      </tr>
    </thead>
    <tbody id="tbody"></tbody>
  </table>
  <div class="no-results" id="no-results" style="display:none">No projects match your filters</div>
</div>

<script>
const MAX_PRIZES = ${maxPrizes};
const DATA = ${projectsJSON};
let filtered = [...DATA];
let sortCol = -1, sortAsc = true;

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function prizeClass(text) {
  if (!text) return '';
  const t = text.toLowerCase();
  if (t.includes('(pool)')) return 'pool';
  if (t.includes('(1st)') || t.includes('(2nd)') || t.includes('(3rd)')) return 'placed';
  if (t.includes('(finalist)')) return 'finalist';
  return '';
}

function getChecked(id) {
  return [...document.querySelectorAll('#' + id + ' input:checked')].map(cb => cb.value);
}

function toggleDropdown(id) {
  document.querySelectorAll('.dropdown').forEach(dd => {
    if (dd.id !== id) dd.classList.remove('show');
  });
  document.getElementById(id).classList.toggle('show');
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.filter-group')) {
    document.querySelectorAll('.dropdown').forEach(dd => dd.classList.remove('show'));
  }
});

function applyFilters() {
  const events = getChecked('event-dd');
  const sponsors = getChecked('sponsor-dd');
  const hasPrizes = document.getElementById('has-prizes').checked;
  const search = document.getElementById('search').value.toLowerCase().trim();

  // Update button styles
  document.getElementById('event-btn').classList.toggle('active', events.length > 0);
  document.getElementById('sponsor-btn').classList.toggle('active', sponsors.length > 0);

  filtered = DATA.filter(p => {
    if (events.length && !events.includes(p.e)) return false;
    if (sponsors.length && !p.sp.some(s => sponsors.includes(s))) return false;
    if (hasPrizes && p.pc === 0) return false;
    if (search && !p.n.toLowerCase().includes(search) && !p.d.toLowerCase().includes(search)) return false;
    return true;
  });

  sortCol = -1;
  render();
}

function clearFilters() {
  document.querySelectorAll('.dropdown input').forEach(cb => cb.checked = false);
  document.getElementById('has-prizes').checked = false;
  document.getElementById('search').value = '';
  document.getElementById('event-btn').classList.remove('active');
  document.getElementById('sponsor-btn').classList.remove('active');
  filtered = [...DATA];
  sortCol = -1;
  render();
}

function sortBy(col) {
  if (sortCol === col) { sortAsc = !sortAsc; }
  else { sortCol = col; sortAsc = true; }

  filtered.sort((a, b) => {
    let va, vb;
    if (col === 0) { return 0; } // row number
    if (col === 1) { va = a.n; vb = b.n; }
    else if (col === 2) { va = a.e; vb = b.e; }
    else if (col === 3) { va = a.d; vb = b.d; }
    else if (col === 4) { va = a.pc; vb = b.pc; }
    else if (col >= 5 && col < 5 + MAX_PRIZES) { va = a.pr[col-5] || ''; vb = b.pr[col-5] || ''; }
    else if (col === 5 + MAX_PRIZES) { va = a.gh; vb = b.gh; }
    else if (col === 6 + MAX_PRIZES) { va = a.dm; vb = b.dm; }
    else { return 0; }

    if (typeof va === 'number') return sortAsc ? va - vb : vb - va;
    return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  });

  // Update arrows
  document.querySelectorAll('th .sort-arrow').forEach(el => el.textContent = '');
  const th = document.querySelector('th[data-col="' + col + '"] .sort-arrow');
  if (th) th.textContent = sortAsc ? ' \\u25B2' : ' \\u25BC';

  render();
}

function render() {
  const tbody = document.getElementById('tbody');
  const noResults = document.getElementById('no-results');

  document.getElementById('result-count').textContent = 'Showing ' + filtered.length + ' of ' + DATA.length + ' projects';

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    noResults.style.display = 'block';
    return;
  }
  noResults.style.display = 'none';

  // Render in chunks for performance
  const rows = [];
  for (let i = 0; i < filtered.length; i++) {
    const p = filtered[i];
    const url = 'https://ethglobal.com/showcase/' + p.s;
    let row = '<tr>';
    row += '<td>' + (i+1) + '</td>';
    row += '<td class="name-cell"><a href="' + url + '" target="_blank">' + escHtml(p.n) + '</a></td>';
    row += '<td class="event-cell">' + escHtml(p.e) + '</td>';
    row += '<td class="desc-cell" title="' + escHtml(p.d) + '">' + escHtml(p.d.substring(0, 120)) + (p.d.length > 120 ? '...' : '') + '</td>';
    row += '<td><span class="prize-count ' + (p.pc === 0 ? 'zero' : '') + '">' + p.pc + '</span></td>';
    for (let j = 0; j < MAX_PRIZES; j++) {
      const pr = p.pr[j] || '';
      row += '<td class="prize-cell ' + prizeClass(pr) + '">' + escHtml(pr) + '</td>';
    }
    row += '<td class="link-cell">' + (p.gh ? '<a href="' + escHtml(p.gh) + '" target="_blank">GitHub</a>' : '') + '</td>';
    row += '<td class="link-cell">' + (p.dm ? '<a href="' + escHtml(p.dm) + '" target="_blank">Demo</a>' : '') + '</td>';
    row += '</tr>';
    rows.push(row);
  }
  tbody.innerHTML = rows.join('');
}

// Initial render
render();
</script>
</body>
</html>`;
}

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function main() {
  const projects = loadData();

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Generate CSV
  console.log('Generating CSV...');
  const csv = generateCSV(projects);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'ethglobal-showcase.csv'), csv);
  console.log(`Saved ethglobal-showcase.csv (${projects.length} rows)`);

  // Generate HTML
  console.log('Generating HTML viewer...');
  const html = generateHTML(projects);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'ethglobal-showcase.html'), html);
  console.log(`Saved ethglobal-showcase.html`);

  // Stats
  const withPrizes = projects.filter(p => (p.prizes || []).length > 0).length;
  const maxP = Math.max(0, ...projects.map(p => (p.prizes || []).length));
  console.log(`\nStats:`);
  console.log(`  Total projects: ${projects.length}`);
  console.log(`  With prizes: ${withPrizes}`);
  console.log(`  Max prizes on one project: ${maxP}`);
  console.log(`  Events: ${[...new Set(projects.map(p => p.event))].length}`);
}

main();
