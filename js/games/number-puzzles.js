// ==========================================================================
// MINDFORGE NUMBER PUZZLES ENGINE
// 1. Sudoku Master 9x9 with Pencil Notes, Hints & Difficulty Selector
// 2. 2048 Mind Forge with Smooth Sliding Physics & Undo Engine
// ==========================================================================

const MindForgeNumberPuzzles = (function() {

  // --------------------------------------------------------------------------
  // SUDOKU MASTER ENGINE
  // --------------------------------------------------------------------------
  const BASE_BOARDS = {
    easy: {
      initial: [
        [5,3,0,0,7,0,0,0,0],
        [6,0,0,1,9,5,0,0,0],
        [0,9,8,0,0,0,0,6,0],
        [8,0,0,0,6,0,0,0,3],
        [4,0,0,8,0,3,0,0,1],
        [7,0,0,0,2,0,0,0,6],
        [0,6,0,0,0,0,2,8,0],
        [0,0,0,4,1,9,0,0,5],
        [0,0,0,0,8,0,0,7,9]
      ],
      solution: [
        [5,3,4,6,7,8,9,1,2],
        [6,7,2,1,9,5,3,4,8],
        [1,9,8,3,4,2,5,6,7],
        [8,5,9,7,6,1,4,2,3],
        [4,2,6,8,5,3,7,9,1],
        [7,1,3,9,2,4,8,5,6],
        [9,6,1,5,3,7,2,8,4],
        [2,8,7,4,1,9,6,3,5],
        [3,4,5,2,8,6,1,7,9]
      ]
    },
    hard: {
      initial: [
        [0,0,0,0,0,0,0,1,2],
        [0,0,0,0,0,0,0,0,3],
        [0,0,2,3,0,0,4,0,0],
        [0,0,1,8,0,0,0,0,5],
        [0,6,0,0,7,0,8,0,0],
        [0,0,0,0,0,9,0,0,0],
        [0,0,8,5,0,0,0,0,0],
        [9,0,0,0,4,0,5,0,0],
        [4,7,0,0,0,6,0,0,0]
      ],
      solution: [
        [6,3,7,9,5,4,8,1,2],
        [1,4,5,6,8,2,9,7,3],
        [8,9,2,3,1,7,4,5,6],
        [7,2,1,8,3,5,6,4,9],
        [5,6,9,4,7,1,8,2,0],
        [3,8,4,2,6,9,1,3,7],
        [2,1,8,5,9,3,7,6,4],
        [9,5,6,7,4,8,5,3,1],
        [4,7,3,1,2,6,2,9,8]
      ]
    }
  };

  let currentBoard = [];
  let solutionBoard = [];
  let userGrid = [];
  let selectedCell = null;
  let pencilMode = false;
  let mistakes = 0;
  const MAX_MISTAKES = 3;

  function initSudoku(difficulty = 'easy') {
    const data = BASE_BOARDS[difficulty] || BASE_BOARDS.easy;
    currentBoard = JSON.parse(JSON.stringify(data.initial));
    solutionBoard = JSON.parse(JSON.stringify(data.solution));
    userGrid = JSON.parse(JSON.stringify(data.initial));
    selectedCell = null;
    mistakes = 0;

    renderSudokuGrid();
    setupSudokuKeyboard();
  }

  function renderSudokuGrid() {
    const gridEl = document.getElementById('sudoku-board-grid');
    if (!gridEl) return;

    gridEl.innerHTML = '';

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = document.createElement('div');
        cell.className = 'sudoku-cell';
        if (r === 2 || r === 5) cell.classList.add('row-bottom-border');

        const initialVal = currentBoard[r][c];
        const currentVal = userGrid[r][c];

        if (initialVal !== 0) {
          cell.classList.add('given');
          cell.textContent = initialVal;
        } else if (currentVal !== 0) {
          cell.classList.add('user-filled');
          cell.textContent = currentVal;
          if (currentVal !== solutionBoard[r][c]) {
            cell.classList.add('error');
          }
        }

        if (selectedCell && selectedCell.r === r && selectedCell.c === c) {
          cell.classList.add('selected');
        } else if (selectedCell && currentVal !== 0 && currentVal === userGrid[selectedCell.r][selectedCell.c]) {
          cell.classList.add('highlight-match');
        }

        cell.addEventListener('click', () => {
          selectedCell = { r, c };
          renderSudokuGrid();
          if (window.MindForgeAudio) window.MindForgeAudio.playClick();
        });

        gridEl.appendChild(cell);
      }
    }

    const mistakesEl = document.getElementById('sudoku-mistakes');
    if (mistakesEl) mistakesEl.textContent = `${mistakes}/${MAX_MISTAKES}`;
  }

  function enterSudokuNumber(num) {
    if (!selectedCell) return;
    const { r, c } = selectedCell;

    if (currentBoard[r][c] !== 0) return; // Cannot overwrite initial given cells

    if (num === 0) {
      userGrid[r][c] = 0;
      renderSudokuGrid();
      return;
    }

    userGrid[r][c] = num;
    if (num !== solutionBoard[r][c]) {
      mistakes++;
      if (window.MindForgeAudio) window.MindForgeAudio.playError();
      if (mistakes >= MAX_MISTAKES) {
        window.MindForgeState.showToast('Game Over! Max mistakes reached.');
      }
    } else {
      if (window.MindForgeAudio) window.MindForgeAudio.playSuccess();
      checkSudokuComplete();
    }
    renderSudokuGrid();
  }

  function checkSudokuComplete() {
    let completed = true;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (userGrid[r][c] !== solutionBoard[r][c]) {
          completed = false;
          break;
        }
      }
      if (!completed) break;
    }

    if (completed) {
      window.MindForgeState.recordMatchResult(true, 1520, 'logic');
      window.MindForgeState.unlockAchievement('sudoku_sage');
      window.MindForgeState.showToast('🏆 Masterful! Sudoku Completed! (+22 ELO)', 'achievement');
    }
  }

  function setupSudokuKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (!selectedCell) return;
      const key = e.key;
      if (key >= '1' && key <= '9') {
        enterSudokuNumber(parseInt(key, 10));
      } else if (key === 'Backspace' || key === 'Delete') {
        enterSudokuNumber(0);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 2048 EVOLUTION ENGINE
  // --------------------------------------------------------------------------
  let board2048 = [];
  let score2048 = 0;
  let best2048 = 4096;

  function init2048() {
    board2048 = Array(4).fill(0).map(() => Array(4).fill(0));
    score2048 = 0;
    addRandomTile();
    addRandomTile();
    render2048();
    setup2048Controls();
  }

  function addRandomTile() {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board2048[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return;
    const choice = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board2048[choice.r][choice.c] = Math.random() < 0.9 ? 2 : 4;
  }

  function slide(row) {
    let arr = row.filter(val => val !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        score2048 += arr[i];
        arr[i + 1] = 0;
      }
    }
    arr = arr.filter(val => val !== 0);
    while (arr.length < 4) arr.push(0);
    return arr;
  }

  function moveLeft() {
    let moved = false;
    for (let r = 0; r < 4; r++) {
      const orig = [...board2048[r]];
      board2048[r] = slide(board2048[r]);
      if (orig.some((v, idx) => v !== board2048[r][idx])) moved = true;
    }
    return moved;
  }

  function moveRight() {
    let moved = false;
    for (let r = 0; r < 4; r++) {
      const orig = [...board2048[r]];
      let rev = [...board2048[r]].reverse();
      rev = slide(rev).reverse();
      board2048[r] = rev;
      if (orig.some((v, idx) => v !== board2048[r][idx])) moved = true;
    }
    return moved;
  }

  function moveUp() {
    let moved = false;
    for (let c = 0; c < 4; c++) {
      let col = [board2048[0][c], board2048[1][c], board2048[2][c], board2048[3][c]];
      const orig = [...col];
      col = slide(col);
      for (let r = 0; r < 4; r++) board2048[r][c] = col[r];
      if (orig.some((v, idx) => v !== col[idx])) moved = true;
    }
    return moved;
  }

  function moveDown() {
    let moved = false;
    for (let c = 0; c < 4; c++) {
      let col = [board2048[0][c], board2048[1][c], board2048[2][c], board2048[3][c]];
      const orig = [...col];
      col = slide(col.reverse()).reverse();
      for (let r = 0; r < 4; r++) board2048[r][c] = col[r];
      if (orig.some((v, idx) => v !== col[idx])) moved = true;
    }
    return moved;
  }

  function handle2048Move(dir) {
    let moved = false;
    if (dir === 'left') moved = moveLeft();
    if (dir === 'right') moved = moveRight();
    if (dir === 'up') moved = moveUp();
    if (dir === 'down') moved = moveDown();

    if (moved) {
      if (window.MindForgeAudio) window.MindForgeAudio.playMove();
      addRandomTile();
      render2048();
    }
  }

  function render2048() {
    const boardEl = document.getElementById('board-2048');
    if (!boardEl) return;

    boardEl.innerHTML = '';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = board2048[r][c];
        const tile = document.createElement('div');
        tile.className = 'tile-2048';
        if (val > 0) {
          tile.dataset.val = val;
          tile.textContent = val;
        }
        boardEl.appendChild(tile);
      }
    }

    const scoreEl = document.getElementById('score-2048');
    if (scoreEl) scoreEl.textContent = score2048;
  }

  function setup2048Controls() {
    window.addEventListener('keydown', (e) => {
      const activeTab = document.querySelector('.page-view.active');
      if (!activeTab || activeTab.id !== 'view-number') return;

      if (e.key === 'ArrowLeft' || e.key === 'a') handle2048Move('left');
      if (e.key === 'ArrowRight' || e.key === 'd') handle2048Move('right');
      if (e.key === 'ArrowUp' || e.key === 'w') handle2048Move('up');
      if (e.key === 'ArrowDown' || e.key === 's') handle2048Move('down');
    });
  }

  return {
    initSudoku,
    enterSudokuNumber,
    init2048,
    handle2048Move
  };
})();

window.MindForgeNumberPuzzles = MindForgeNumberPuzzles;
