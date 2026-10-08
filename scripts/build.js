// MindForge Application Build & Integrity Verification Script
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

console.log('==================================================');
console.log('       MINDFORGE PRODUCTION BUILD SYSTEM          ');
console.log('==================================================');

const requiredFiles = [
  'index.html',
  'server.js',
  'package.json',
  'css/main.css',
  'css/games.css',
  'css/navigation.css',
  'css/profile.css',
  'js/app.js',
  'js/audio.js',
  'js/canvas-bg.js',
  'js/state.js',
  'js/profile.js',
  'js/games/board-games.js',
  'js/games/logic-puzzles.js',
  'js/games/number-puzzles.js',
  'js/games/word-games.js',
  'js/games/memory-games.js',
  'js/games/pattern-games.js',
  'js/games/detective-games.js',
  'js/games/speed-games.js',
  'js/games/maze-games.js'
];

let missing = 0;
for (const file of requiredFiles) {
  const fullPath = path.join(rootDir, file);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Missing asset: ${file}`);
    missing++;
  } else {
    const stat = fs.statSync(fullPath);
    console.log(`✅ Verified: ${file} (${stat.size} bytes)`);
  }
}

if (missing > 0) {
  console.error(`\nBuild failed with ${missing} missing files.`);
  process.exit(1);
}

console.log('\n✨ MindForge Build successful! Ready for production deployment.');
console.log('==================================================\n');
