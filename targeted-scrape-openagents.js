// Gentle, targeted detail scrape: only the OA winners + projects missing from the root CSV.
// Slow spacing (3s) to avoid the 429 throttle. Resumes from openagents-details-full.json.
const fs = require('fs');
const { fetchPage } = require('./lib/fetcher');
const { parseDetailPage } = require('./lib/parser-detail');

const OUT = 'data/openagents-details-full.json';
const SPACING_MS = 3000;

function parseCSV(text){const rows=[];let row=[],field="",inQ=false;for(let i=0;i<text.length;i++){const c=text[i];if(inQ){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else inQ=false;}else field+=c;}else{if(c==='"')inQ=true;else if(c===","){row.push(field);field="";}else if(c==="\n"){row.push(field);rows.push(row);row=[];field="";}else if(c==="\r"){}else field+=c;}}if(field.length||row.length){row.push(field);rows.push(row);}return rows;}

async function main(){
  const listing = JSON.parse(fs.readFileSync('data/openagents-live-listing.json','utf8'));
  const winners = JSON.parse(fs.readFileSync('data/openagents-winners-live.json','utf8'));
  const winnerSlugs = new Set(winners.map(w=>w.slug));

  // missing = live OA slugs not present in root CSV
  const recs = parseCSV(fs.readFileSync('ethglobal-showcase.csv','utf8'));
  const h=recs[0]; const urlIdx=h.indexOf('URL');
  const slugOf=u=>(u||'').replace(/^https?:\/\/ethglobal\.com\/showcase\//,'').trim();
  const csvSlugs=new Set(recs.slice(1).map(r=>slugOf(r[urlIdx])));
  const missing = listing.filter(l=>!csvSlugs.has(l.slug)).map(l=>l.slug);

  // targets: winners first (most important), then missing
  const targetSet = new Set([...winnerSlugs, ...missing]);
  const byListing = new Map(listing.map(l=>[l.slug,l]));
  const targets = [...targetSet].filter(s=>byListing.has(s));

  // resume
  let done={};
  if(fs.existsSync(OUT)){try{JSON.parse(fs.readFileSync(OUT,'utf8')).forEach(r=>done[r.slug]=r);}catch{}}

  const todo = targets.filter(s=>!done[s] || done[s]._fail || !done[s].projectDescription);
  console.log(`Winners: ${winnerSlugs.size}, Missing: ${missing.length}, Targets: ${targets.length}, To fetch: ${todo.length}`);

  let ok=0, fail=0, fin=0, n=0;
  for(const slug of todo){
    n++;
    const l = byListing.get(slug);
    const html = await fetchPage(`https://ethglobal.com/showcase/${slug}`);
    if(!html){ done[slug]={slug,name:l.name,event:l.event,description:l.description,prizes:[],_fail:true}; fail++; }
    else {
      const d=parseDetailPage(html);
      done[slug]={slug,name:d.name||l.name,event:l.event,description:l.description,projectDescription:d.projectDescription,howItsMade:d.howItsMade,prizes:d.prizes,githubUrl:d.githubUrl,demoUrl:d.demoUrl,teamMembers:d.teamMembers};
      ok++;
      if(d.prizes.some(p=>/finalist/i.test(p.placement||''))) fin++;
    }
    if(n%10===0){ fs.writeFileSync(OUT,JSON.stringify(Object.values(done),null,2)); console.log(`[${n}/${todo.length}] ok=${ok} fail=${fail} finalists=${fin}`); }
    await new Promise(r=>setTimeout(r,SPACING_MS));
  }
  fs.writeFileSync(OUT,JSON.stringify(Object.values(done),null,2));
  console.log(`DONE. fetched ok=${ok} fail=${fail} finalists=${fin}; file has ${Object.keys(done).length} records`);
}
main().catch(e=>{console.error('FATAL',e);process.exit(1);});
