const cheerio = require('cheerio');

function parseListingPage(html) {
  const $ = cheerio.load(html);
  const projects = [];

  $('a[href^="/showcase/"]').each((i, el) => {
    const $card = $(el);
    const href = $card.attr('href');
    const slug = href.replace('/showcase/', '');

    const name = $card.find('h2').text().trim();
    const description = $card.find('p').first().text().trim();

    // Event name from the badge div
    const event = $card.find('div.inline-flex').text().trim();

    // Prize badges - count and extract org IDs from image URLs
    const prizeBadges = [];
    $card.find('img[alt="prize"]').each((j, img) => {
      const src = $(img).attr('src') || '';
      const match = src.match(/organizations\/([^/]+)\//);
      if (match) {
        prizeBadges.push(match[1]);
      }
    });

    if (name && slug) {
      projects.push({
        name,
        slug,
        description,
        event,
        prizeCount: prizeBadges.length,
        prizeBadgeOrgIds: prizeBadges,
      });
    }
  });

  return projects;
}

function hasProjects(html) {
  return !html.includes('No projects found');
}

module.exports = { parseListingPage, hasProjects };
