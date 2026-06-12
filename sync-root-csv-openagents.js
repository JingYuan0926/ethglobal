// Upsert the fresh Open Agents data into the root (gitignored) ethglobal-showcase.csv.
//  - existing OA rows: re-sync prize columns (Prize Count, Prize 1..N, All Sponsors)
//  - missing OA projects: append new rows
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');

const CSV = 'ethglobal-showcase.csv';
const OA_FULL = 'data/openagents-details-full.json';

function parseCSV(text){const rows=[];let row=[],field="",inQ=false;for(let i=0;i<text.length;i++){const c=text[i];if(inQ){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else inQ=false;}else field+=c;}else{if(c==='"')inQ=true;else if(c===","){row.push(field);field="";}else if(c==="\n"){row.push(field);rows.push(row);row=[];field="";}else if(c==="\r"){}else field+=c;}}if(field.length||row.length){row.push(field);rows.push(row);}return rows;}

function formatPrize(p){
  let placement='';
  if(p.placement==='pool')placement='pool';
  else if(p.placement==='finalist')placement='finalist';
  else if(p.placement)placement=p.placement;
  else placement=p.prizeType;
  return `${p.sponsor} - ${p.trackName} (${placement})`;
}

function main(){
  const recs = parseCSV(fs.readFileSync(CSV,'utf8'));
  const h = recs[0]; const idx={}; h.forEach((x,i)=>idx[x]=i);
  const NCOL = h.length; // 20
  const PRIZE_COLS = h.filter(x=>/^Prize \d+$/.test(x)).length; // 12
  const slugOf = u => (u||'').replace(/^https?:\/\/ethglobal\.com\/showcase\//,'').trim();

  const oa = JSON.parse(fs.readFileSync(OA_FULL,'utf8')).filter(r=>!r._fail);
  const bySlug = new Map(oa.map(r=>[r.slug,r]));

  // index existing rows by slug
  const rowBySlug = new Map();
  for(let r=1;r<recs.length;r++) rowBySlug.set(slugOf(recs[r][idx.URL]), recs[r]);

  function applyPrizes(row, rec){
    const prizes = rec.prizes||[];
    row[idx['Prize Count']] = String(prizes.length);
    for(let i=0;i<PRIZE_COLS;i++) row[idx['Prize '+(i+1)]] = i<prizes.length ? formatPrize(prizes[i]) : '';
    row[idx['All Sponsors']] = [...new Set(prizes.map(p=>p.sponsor))].join('; ');
  }

  let updated=0, added=0, changed=0;
  for(const [slug, rec] of bySlug){
    if(rowBySlug.has(slug)){
      const row = rowBySlug.get(slug);
      const before = row.slice();
      applyPrizes(row, rec);
      updated++;
      if(before.join('')!==row.join('')) changed++;
    } else {
      // new row, 20 fields in header order
      const row = new Array(NCOL).fill('');
      row[idx['Project Name']] = rec.name||'';
      row[idx['Event']] = rec.event||'Open Agents';
      row[idx['Description']] = (rec.projectDescription||rec.description||'').substring(0,500);
      row[idx['GitHub']] = rec.githubUrl||'';
      row[idx['Demo']] = rec.demoUrl||'';
      row[idx['URL']] = 'https://ethglobal.com/showcase/'+slug;
      applyPrizes(row, rec);
      recs.push(row);
      added++;
    }
  }

  // integrity: every row 20 fields
  const bad = recs.filter(r=>r.length!==NCOL).length;
  if(bad){console.error('ABORT: '+bad+' rows have wrong field count');process.exit(1);}

  fs.writeFileSync(CSV, stringify(recs,{quoted_empty:false}));
  const oaRows = recs.slice(1).filter(r=>r[idx['Event']]==='Open Agents');
  const winners = oaRows.filter(r=>parseInt(r[idx['Prize Count']]||'0')>0);
  const finalists = oaRows.filter(r=>/finalist/i.test(r[idx['Prize 1']]||''));
  console.log(`OA matched/updated: ${updated} (rows changed: ${changed}), appended: ${added}`);
  console.log(`Root CSV now: rows=${recs.length}, OA rows=${oaRows.length}, OA winners=${winners.length}, OA finalists=${finalists.length}`);
}
main();
