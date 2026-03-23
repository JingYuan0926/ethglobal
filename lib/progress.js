const fs = require('fs');
const path = require('path');

const PROGRESS_FILE = path.join(__dirname, '..', 'data', 'progress.json');

function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    }
  } catch (e) {
    console.warn('Could not load progress file, starting fresh');
  }
  return { completed: {}, failed: [], lastUpdated: null };
}

function saveProgress(progress) {
  progress.lastUpdated = new Date().toISOString();
  const tmp = PROGRESS_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(progress, null, 2));
  fs.renameSync(tmp, PROGRESS_FILE);
}

function markCompleted(progress, slug, detailData) {
  progress.completed[slug] = detailData;
  // Remove from failed if it was there
  progress.failed = progress.failed.filter(s => s !== slug);
}

function markFailed(progress, slug) {
  if (!progress.failed.includes(slug)) {
    progress.failed.push(slug);
  }
}

module.exports = { loadProgress, saveProgress, markCompleted, markFailed };
