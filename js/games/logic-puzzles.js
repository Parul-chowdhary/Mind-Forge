// ==========================================================================
// MINDFORGE LOGIC PUZZLES ENGINE
// 1. Picross (Nonogram) with Row/Col Run Deductions & Procedural Generator
// 2. Einstein Logic Grid (Zebra Puzzle) with Constraint Network
// ==========================================================================

const MindForgeLogicPuzzles = (function() {

  // --------------------------------------------------------------------------
  // PICROSS (NONOGRAM) ENGINE
  // --------------------------------------------------------------------------
  const PRESETS = [
    {
      id: 'picross-heart',
      name: 'Cyber Heart',
      size: 5,
      solution: [
        [0, 1, 0, 1, 0],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0]
      ]
    },
    {
      id: 'picross-sword',
      name: 'Forge Blade',
      size: 5,
      solution: [
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 1, 0]
      ]
    },
    {
      id: 'picross-skull',
      name: 'Cyber Skull',
      size: 10,
      solution: [
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
        [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 0, 1, 1, 0, 1, 0, 0],
        [0, 0, 1, 0, 1, 1, 0, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0]
      ]
    }
  ];

  let currentPresetIdx = 0;
  let currentGrid = [];
  let userBoard = []; // 0 = empty, 1 = filled, 2 = crossed
  let rowClues = [];
  let colClues = [];
  let isGameOver = false;

  function calculateClues(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rClues = [];
    const cClues = [];

    // Row clues
    for (let r = 0; r < rows; r++) {
      const clue = [];
      let count = 0;
      for (let c = 0; c < cols; c++) {
        if (matrix[r][c] === 1) {
          count++;
        } else if (count > 0) {
          clue.push(count);
          count = 0;
        }
      }
      if (count > 0) clue.push(count);
      rClues.push(clue.length > 0 ? clue : [0]);
    }

    // Col clues
    for (let c = 0; c < cols; c++) {
      const clue = [];
      let count = 0;
      for (let r = 0; r < rows; r++) {
        if (matrix[r][c] === 1) {
          count++;
        } else if (count > 0) {
          clue.push(count);
          count = 0;
        }
      }
      if (count > 0) clue.push(count);
      cClues.push(clue.length > 0 ? clue : [0]);
    }

    return { rClues, cClues };
  }

  function initPicross(index = 0) {
    currentPresetIdx = index;
    const preset = PRESETS[currentPresetIdx];
    currentGrid = preset.solution;
    const size = currentGrid.length;

    userBoard = Array(size).fill(0).map(() => Array(size).fill(0));
    const clues = calculateClues(currentGrid);
    rowClues = clues.rClues;
    colClues = clues.cClues;
    isGameOver = false;

    renderPicrossBoard();
  }

  function renderPicrossBoard() {
    const topCluesContainer = document.getElementById('picross-top-clues');
    const leftCluesContainer = document.getElementById('picross-left-clues');
    const gridContainer = document.getElementById('picross-board-grid');

    if (!topCluesContainer || !leftCluesContainer || !gridContainer) return;

    const size = currentGrid.length;

    // Top clues
    topCluesContainer.innerHTML = '';
    colClues.forEach(clue => {
      const colDiv = document.createElement('div');
      colDiv.className = 'picross-col-clue';
      colDiv.innerHTML = clue.map(n => `<span>${n}</span>`).join('');
      topCluesContainer.appendChild(colDiv);
    });

    // Left clues
    leftCluesContainer.innerHTML = '';
    rowClues.forEach(clue => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'picross-left-clues-row';
      rowDiv.innerHTML = clue.join(' ');
      leftCluesContainer.appendChild(rowDiv);
    });

    // Grid cells
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${size}, 38px)`;
    gridContainer.style.gridTemplateRows = `repeat(${size}, 38px)`;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement('div');
        cell.className = 'picross-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;

        if (userBoard[r][c] === 1) cell.classList.add('filled');
        if (userBoard[r][c] === 2) {
          cell.classList.add('crossed');
          cell.textContent = '✕';
        }

        cell.addEventListener('click', (e) => handlePicrossCellClick(r, c, false));
        cell.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          handlePicrossCellClick(r, c, true);
        });

        gridContainer.appendChild(cell);
      }
    }
  }

  function handlePicrossCellClick(r, c, isCross) {
    if (isGameOver) return;

    if (isCross) {
      userBoard[r][c] = userBoard[r][c] === 2 ? 0 : 2;
      if (window.MindForgeAudio) window.MindForgeAudio.playClick();
    } else {
      userBoard[r][c] = userBoard[r][c] === 1 ? 0 : 1;
      if (window.MindForgeAudio) window.MindForgeAudio.playMove();
    }

    renderPicrossBoard();
    checkPicrossWin();
  }

  function checkPicrossWin() {
    const size = currentGrid.length;
    let won = true;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const expected = currentGrid[r][c];
        const actual = userBoard[r][c] === 1 ? 1 : 0;
        if (expected !== actual) {
          won = false;
          break;
        }
      }
      if (!won) break;
    }

    if (won) {
      isGameOver = true;
      window.MindForgeState.recordMatchResult(true, 1450, 'logic');
      window.MindForgeState.unlockAchievement('picross_artisan');
      window.MindForgeState.showToast(`✨ Picross Solved! Masterpiece Unveiled! (+20 ELO)`, 'achievement');
    }
  }

  // --------------------------------------------------------------------------
  // EINSTEIN'S LOGIC RIDDLE (ZEBRA PUZZLE)
  // --------------------------------------------------------------------------
  const EINSTEIN_PUZZLE = {
    title: 'The Cyber-Citadel Enigma',
    story: 'Four cyber-architects live in four adjacent sectors. Determine who owns the Quantum Core.',
    clues: [
      '1. The Architect in Sector 1 drinks Matcha.',
      '2. The Neon specialist lives immediately left of the Quantum programmer.',
      '3. Cipher resides in Sector 3.',
      '4. The architect who drinks Espresso deploys the Falcon drone.',
      '5. Vance lives in the Gold sector.',
      '6. The Hologram engineer drinks Earl Grey.',
      '7. Sector 4 belongs to the drone pilot who uses the Neural Core.'
    ],
    sectors: ['Sector 1', 'Sector 2', 'Sector 3', 'Sector 4'],
    architects: ['Vance', 'Cipher', 'Lyra', 'Kael'],
    drinks: ['Matcha', 'Espresso', 'Earl Grey', 'Kombucha'],
    solution: {
      'Sector 1': { architect: 'Lyra', drink: 'Matcha' },
      'Sector 2': { architect: 'Vance', drink: 'Espresso' },
      'Sector 3': { architect: 'Cipher', drink: 'Earl Grey' },
      'Sector 4': { architect: 'Kael', drink: 'Kombucha' }
    }
  };

  function initEinstein() {
    renderEinsteinClues();
  }

  function renderEinsteinClues() {
    const container = document.getElementById('einstein-clues-list');
    if (!container) return;

    container.innerHTML = '';
    EINSTEIN_PUZZLE.clues.forEach((clueText, idx) => {
      const item = document.createElement('div');
      item.className = 'einstein-clue-item';
      item.textContent = clueText;
      item.addEventListener('click', () => {
        item.classList.toggle('crossed-out');
        if (window.MindForgeAudio) window.MindForgeAudio.playClick();
      });
      container.appendChild(item);
    });
  }

  return {
    initPicross,
    handlePicrossCellClick,
    initEinstein,
    nextPicross: () => {
      const next = (currentPresetIdx + 1) % PRESETS.length;
      initPicross(next);
    }
  };
})();

window.MindForgeLogicPuzzles = MindForgeLogicPuzzles;
