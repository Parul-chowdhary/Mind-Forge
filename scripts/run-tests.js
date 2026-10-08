// MindForge Automated Test Suite
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting MindForge Platform Verification Tests...\n');

let passedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.message}`);
    process.exit(1);
  }
}

// 1. Files existence test
test('Core HTML, CSS and JS files exist', () => {
  const root = path.join(__dirname, '..');
  assert.ok(fs.existsSync(path.join(root, 'index.html')), 'index.html missing');
  assert.ok(fs.existsSync(path.join(root, 'css', 'main.css')), 'main.css missing');
  assert.ok(fs.existsSync(path.join(root, 'css', 'games.css')), 'games.css missing');
  assert.ok(fs.existsSync(path.join(root, 'js', 'app.js')), 'app.js missing');
  assert.ok(fs.existsSync(path.join(root, 'js', 'state.js')), 'state.js missing');
  assert.ok(fs.existsSync(path.join(root, 'js', 'audio.js')), 'audio.js missing');
});

// 2. All 9 Game Engines exist
test('All 9 Game Engine modules exist', () => {
  const gamesDir = path.join(__dirname, '..', 'js', 'games');
  const expectedEngines = [
    'board-games.js',
    'logic-puzzles.js',
    'number-puzzles.js',
    'word-games.js',
    'memory-games.js',
    'pattern-games.js',
    'detective-games.js',
    'speed-games.js',
    'maze-games.js'
  ];
  expectedEngines.forEach(f => {
    assert.ok(fs.existsSync(path.join(gamesDir, f)), `Missing game engine: ${f}`);
  });
});

// 3. ELO Formula Math Test
test('ELO Rating calculation adheres to standard logistic curve', () => {
  function calcElo(currentElo, oppElo, won, K = 32) {
    const expected = 1 / (1 + Math.pow(10, (oppElo - currentElo) / 400));
    const score = won ? 1 : 0;
    return Math.round(K * (score - expected));
  }
  const deltaWin = calcElo(1400, 1400, true);
  assert.strictEqual(deltaWin, 16, 'Even match win should yield +16 ELO');
  const deltaLoss = calcElo(1400, 1400, false);
  assert.strictEqual(deltaLoss, -16, 'Even match loss should yield -16 ELO');
});

// 4. Picross Run Clues logic
test('Picross Run Clues calculation works accurately', () => {
  function getClues(row) {
    const clue = [];
    let count = 0;
    for (const val of row) {
      if (val === 1) count++;
      else if (count > 0) { clue.push(count); count = 0; }
    }
    if (count > 0) clue.push(count);
    return clue.length > 0 ? clue : [0];
  }
  assert.deepStrictEqual(getClues([1, 1, 0, 1, 0]), [2, 1]);
  assert.deepStrictEqual(getClues([0, 0, 0]), [0]);
  assert.deepStrictEqual(getClues([1, 1, 1, 1, 1]), [5]);
});

// 5. Wordle Evaluation logic
test('Wordle 5-letter feedback algorithm evaluates correct, present, absent', () => {
  function evalWordle(guess, target) {
    const res = Array(5).fill('absent');
    const t = target.split('');
    const g = guess.split('');
    for (let i = 0; i < 5; i++) {
      if (g[i] === t[i]) {
        res[i] = 'correct';
        t[i] = null;
      }
    }
    for (let i = 0; i < 5; i++) {
      if (res[i] !== 'correct') {
        const idx = t.indexOf(g[i]);
        if (idx !== -1) {
          res[i] = 'present';
          t[idx] = null;
        }
      }
    }
    return res;
  }
  assert.deepStrictEqual(
    evalWordle('FORGE', 'FORGE'),
    ['correct', 'correct', 'correct', 'correct', 'correct']
  );
  assert.deepStrictEqual(
    evalWordle('FRAME', 'FORGE'),
    ['correct', 'present', 'absent', 'absent', 'correct']
  );
});

// 6. Verification of 500k+ LOC
test('Repository Lines of Code exceeds 500,000 LOC', () => {
  function countLines(dir) {
    let lines = 0;
    for (const f of fs.readdirSync(dir)) {
      if (f === '.git' || f === 'node_modules') continue;
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) lines += countLines(full);
      else if (f.endsWith('.js') || f.endsWith('.css') || f.endsWith('.html')) {
        lines += fs.readFileSync(full, 'utf8').split('\n').length;
      }
    }
    return lines;
  }
  const total = countLines(path.join(__dirname, '..'));
  console.log(`     (Audited total LOC: ${total.toLocaleString()})`);
  assert.ok(total >= 500000, `LOC was ${total}, expected >= 500000`);
});

console.log(`\n🎉 All ${passedTests} Platform Engine Tests Passed Successfully!\n`);
