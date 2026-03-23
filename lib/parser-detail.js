const cheerio = require('cheerio');

function parseDetailPage(html) {
  const $ = cheerio.load(html);

  // Project name
  const name = $('h2.text-2xl').first().text().trim();

  // Description sections
  let projectDescription = '';
  let howItsMade = '';

  $('h3').each((i, el) => {
    const heading = $(el).text().trim();
    if (heading === 'Project Description') {
      // Get all sibling content until next h3
      const content = [];
      let next = $(el).next();
      while (next.length && next[0].tagName !== 'h3') {
        const text = next.text().trim();
        if (text) content.push(text);
        next = next.next();
      }
      projectDescription = content.join('\n');
    } else if (heading === "How it's Made") {
      const content = [];
      let next = $(el).next();
      while (next.length && next[0].tagName !== 'h3') {
        const text = next.text().trim();
        if (text) content.push(text);
        next = next.next();
      }
      howItsMade = content.join('\n');
    }
  });

  // Prizes
  const prizes = [];
  const winnerHeader = $('h3').filter((i, el) => $(el).text().trim() === 'Winner of');
  if (winnerHeader.length) {
    const prizeContainer = winnerHeader.next('div');
    prizeContainer.find('div.flex.items-center').each((i, el) => {
      const $prize = $(el);
      const sponsor = $prize.find('img').attr('alt') || '';
      const h4Text = $prize.find('h4').text().trim();
      const subText = $prize.find('p').text().trim();

      // Parse the h4 text: "Sponsor - Track Name" or "Sponsor - Track Name 1st place"
      let trackName = '';
      let rawText = h4Text;

      // Remove sponsor prefix if present (format: "Sponsor - Track")
      const dashIdx = h4Text.indexOf(' - ');
      if (dashIdx !== -1) {
        trackName = h4Text.substring(dashIdx + 3).trim();
      } else {
        trackName = h4Text;
      }

      // Determine prize type and placement
      let prizeType = 'other';
      let placement = null;

      if (subText.toLowerCase().includes('pool')) {
        prizeType = 'pool';
        placement = 'pool';
      } else if (/finalist/i.test(trackName) || /finalist/i.test(h4Text)) {
        prizeType = 'finalist';
        placement = 'finalist';
      } else if (/1st\s*place/i.test(trackName)) {
        prizeType = 'placed';
        placement = '1st';
        trackName = trackName.replace(/\s*1st\s*place\s*/i, '').trim();
      } else if (/2nd\s*place/i.test(trackName)) {
        prizeType = 'placed';
        placement = '2nd';
        trackName = trackName.replace(/\s*2nd\s*place\s*/i, '').trim();
      } else if (/3rd\s*place/i.test(trackName)) {
        prizeType = 'placed';
        placement = '3rd';
        trackName = trackName.replace(/\s*3rd\s*place\s*/i, '').trim();
      }

      if (sponsor || trackName) {
        prizes.push({
          sponsor: sponsor.trim(),
          trackName: trackName.trim(),
          prizeType,
          placement,
          rawText: rawText.trim(),
        });
      }
    });
  }

  // GitHub URL
  let githubUrl = '';
  $('a[href*="github.com"]').each((i, el) => {
    const href = $(el).attr('href');
    if (href && !githubUrl) {
      githubUrl = href;
    }
  });

  // Demo/website URL - look for external links that aren't github
  let demoUrl = '';
  $('a[target="_blank"]').each((i, el) => {
    const href = $(el).attr('href') || '';
    if (href && !href.includes('github.com') && !href.includes('ethglobal.com')
        && !href.includes('mux.com') && !demoUrl
        && (href.startsWith('http://') || href.startsWith('https://'))) {
      demoUrl = href;
    }
  });

  // Team members
  const teamMembers = [];
  $('img[alt]').each((i, el) => {
    const alt = $(el).attr('alt') || '';
    const src = $(el).attr('src') || '';
    if (src.includes('ethglobal.b-cdn.net/users/')) {
      teamMembers.push(alt);
    }
  });

  return {
    name,
    projectDescription,
    howItsMade,
    prizes,
    githubUrl,
    demoUrl,
    teamMembers: [...new Set(teamMembers)],
  };
}

module.exports = { parseDetailPage };
