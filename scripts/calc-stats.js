// MindForge Statistics & Verification Script
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function countLinesInDir(dirPath, exts = ['.js', '.css', '.html', '.json', '.md']) {
  let totalLines = 0;
  let fileCount = 0;
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    if (item === '.git' || item === 'node_modules') continue;
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const res = countLinesInDir(fullPath, exts);
      totalLines += res.totalLines;
      fileCount += res.fileCount;
    } else if (exts.some(ext => item.endsWith(ext))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n').length;
      totalLines += lines;
      fileCount++;
    }
  }
  return { totalLines, fileCount };
}

const rootDir = path.join(__dirname, '..');
const stats = countLinesInDir(rootDir);

let commitCount = 0;
let prCount = 0;
try {
  const gitLog = execSync('git rev-list --count HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();
  commitCount = parseInt(gitLog, 10) || 0;
  const gitMerges = execSync('git rev-list --min-parents=2 --count HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();
  prCount = parseInt(gitMerges, 10) || 0;
} catch (e) {
  commitCount = 0;
  prCount = 0;
}

const entryPoints = ['server.js', 'Dockerfile', 'docker-compose.yml', 'Makefile'].every(f => fs.existsSync(path.join(rootDir, f)));

console.log('==================================================');
console.log('           MINDFORGE PLATFORM METRICS             ');
console.log('==================================================');
console.log(`Total Files Checked:      ${stats.fileCount}`);
console.log(`Total Lines of Code (LOC): ${stats.totalLines.toLocaleString()}`);
console.log(`Target LOC (500,000):     ${stats.totalLines >= 500000 ? '✅ PASSED' : '❌ PENDING'}`);
console.log(`Git Commits Count:        ${commitCount} ${commitCount >= 100 ? '✅ (Target >= 100)' : ''}`);
console.log(`Pull Requests / Merges:   ${prCount} ${prCount >= 80 ? '✅ (Target >= 80)' : ''}`);
console.log(`Build Manifests Detected: ${entryPoints ? '✅ Dockerfile, docker-compose, Makefile, server.js' : '❌ MISSING'}`);
console.log('==================================================');
