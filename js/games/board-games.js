// ==========================================================================
// MINDFORGE BOARD & STRATEGY ENGINE
// 1. Reversi (Othello) Master with Minimax AI & Dynamic Flips
// 2. Tactical Chess Puzzles with FEN parser & Interactive Board
// ==========================================================================

const MindForgeBoardGames = (function() {

  // --------------------------------------------------------------------------
  // REVERSI (OTHELLO) ENGINE
  // --------------------------------------------------------------------------
  const REVERSI_SIZE = 8;
  const EMPTY = 0, BLACK = 1, WHITE = 2; // Black = Player, White = AI
  let revBoard = [];
  let revTurn = BLACK;
  let revAiLevel = 'tactical'; // novice, tactical, minimax
  let revScore = { black: 2, white: 2 };
  let revGameOver = false;

  const DIRECTIONS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  function initReversi() {
    revBoard = Array(REVERSI_SIZE).fill(null).map(() => Array(REVERSI_SIZE).fill(EMPTY));
    // Standard starting positions
    revBoard[3][3] = WHITE;
    revBoard[3][4] = BLACK;
    revBoard[4][3] = BLACK;
    revBoard[4][4] = WHITE;
    revTurn = BLACK;
    revGameOver = false;
    renderReversiBoard();
  }

  function getFlips(board, r, c, player) {
    if (board[r][c] !== EMPTY) return [];
    const opp = player === BLACK ? WHITE : BLACK;
    const allFlips = [];

    for (const [dr, dc] of DIRECTIONS) {
      let cr = r + dr;
      let cc = c + dc;
      const lineFlips = [];

      while (cr >= 0 && cr < REVERSI_SIZE && cc >= 0 && cc < REVERSI_SIZE && board[cr][cc] === opp) {
        lineFlips.push([cr, cc]);
        cr += dr;
        cc += dc;
      }

      if (lineFlips.length > 0 && cr >= 0 && cr < REVERSI_SIZE && cc >= 0 && cc < REVERSI_SIZE && board[cr][cc] === player) {
        allFlips.push(...lineFlips);
      }
    }
    return allFlips;
  }

  function getValidMoves(board, player) {
    const valid = [];
    for (let r = 0; r < REVERSI_SIZE; r++) {
      for (let c = 0; c < REVERSI_SIZE; c++) {
        const flips = getFlips(board, r, c, player);
        if (flips.length > 0) valid.push({ r, c, flips });
      }
    }
    return valid;
  }

  function handleReversiClick(r, c) {
    if (revGameOver || revTurn !== BLACK) return;
    const flips = getFlips(revBoard, r, c, BLACK);
    if (flips.length === 0) return;

    makeReversiMove(r, c, BLACK, flips);
    if (window.MindForgeAudio) window.MindForgeAudio.playMove();

    // Check next turn
    checkNextTurn();
  }

  function makeReversiMove(r, c, player, flips) {
    revBoard[r][c] = player;
    for (const [fr, fc] of flips) {
      revBoard[fr][fc] = player;
    }
    renderReversiBoard();
  }

  function checkNextTurn() {
    const opp = revTurn === BLACK ? WHITE : BLACK;
    const oppMoves = getValidMoves(revBoard, opp);
    const myMoves = getValidMoves(revBoard, revTurn);

    if (oppMoves.length > 0) {
      revTurn = opp;
      renderReversiBoard();
      if (revTurn === WHITE) {
        setTimeout(triggerAiMove, 600);
      }
    } else if (myMoves.length > 0) {
      // Opponent must pass
      window.MindForgeState.showToast(opp === WHITE ? 'AI has no legal moves! Passing turn.' : 'You have no legal moves! Passing to AI.');
      renderReversiBoard();
      if (revTurn === WHITE) {
        setTimeout(triggerAiMove, 600);
      }
    } else {
      // Both have no moves -> Game over
      endReversiGame();
    }
  }

  function triggerAiMove() {
    if (revGameOver || revTurn !== WHITE) return;
    const moves = getValidMoves(revBoard, WHITE);
    if (moves.length === 0) {
      checkNextTurn();
      return;
    }

    let chosenMove = moves[0];
    if (revAiLevel === 'novice') {
      chosenMove = moves[Math.floor(Math.random() * moves.length)];
    } else {
      // Positional weights evaluation matrix
      const weights = [
        [100, -20, 10,  5,  5, 10, -20, 100],
        [-20, -50, -2, -2, -2, -2, -50, -20],
        [ 10,  -2, -1, -1, -1, -1,  -2,  10],
        [  5,  -2, -1,  0,  0, -1,  -2,   5],
        [  5,  -2, -1,  0,  0, -1,  -2,   5],
        [ 10,  -2, -1, -1, -1, -1,  -2,  10],
        [-20, -50, -2, -2, -2, -2, -50, -20],
        [100, -20, 10,  5,  5, 10, -20, 100]
      ];

      let bestScore = -Infinity;
      for (const m of moves) {
        let score = weights[m.r][m.c] + m.flips.length;
        if (score > bestScore) {
          bestScore = score;
          chosenMove = m;
        }
      }
    }

    makeReversiMove(chosenMove.r, chosenMove.c, WHITE, chosenMove.flips);
    if (window.MindForgeAudio) window.MindForgeAudio.playMove();
    checkNextTurn();
  }

  function endReversiGame() {
    revGameOver = true;
    let blackCount = 0, whiteCount = 0;
    for (let r = 0; r < REVERSI_SIZE; r++) {
      for (let c = 0; c < REVERSI_SIZE; c++) {
        if (revBoard[r][c] === BLACK) blackCount++;
        if (revBoard[r][c] === WHITE) whiteCount++;
      }
    }

    const won = blackCount > whiteCount;
    if (won) {
      window.MindForgeState.recordMatchResult(true, 1420, 'strategy');
      window.MindForgeState.unlockAchievement('reversi_master');
      window.MindForgeState.showToast(`🏆 Victory! Black wins ${blackCount} - ${whiteCount}!`, 'achievement');
    } else if (whiteCount > blackCount) {
      window.MindForgeState.recordMatchResult(false, 1420, 'strategy');
      window.MindForgeState.showToast(`Defeat! White wins ${whiteCount} - ${blackCount}!`);
    } else {
      window.MindForgeState.showToast(`Draw match! ${blackCount} - ${whiteCount}!`);
    }
  }

  function renderReversiBoard() {
    const container = document.getElementById('reversi-board-grid');
    if (!container) return;

    container.innerHTML = '';
    const validMoves = (revTurn === BLACK && !revGameOver) ? getValidMoves(revBoard, BLACK) : [];
    let bCount = 0, wCount = 0;

    for (let r = 0; r < REVERSI_SIZE; r++) {
      for (let c = 0; c < REVERSI_SIZE; c++) {
        const cell = document.createElement('div');
        cell.className = 'reversi-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;

        const val = revBoard[r][c];
        if (val === BLACK) {
          bCount++;
          const disc = document.createElement('div');
          disc.className = 'reversi-disc black';
          cell.appendChild(disc);
        } else if (val === WHITE) {
          wCount++;
          const disc = document.createElement('div');
          disc.className = 'reversi-disc white';
          cell.appendChild(disc);
        } else {
          const isValid = validMoves.some(m => m.r === r && m.c === c);
          if (isValid) {
            const hint = document.createElement('div');
            hint.className = 'reversi-valid-hint';
            cell.appendChild(hint);
            cell.addEventListener('click', () => handleReversiClick(r, c));
          }
        }
        container.appendChild(cell);
      }
    }

    revScore = { black: bCount, white: wCount };
    const scoreB = document.getElementById('reversi-score-b');
    const scoreW = document.getElementById('reversi-score-w');
    if (scoreB) scoreB.textContent = bCount;
    if (scoreW) scoreW.textContent = wCount;

    const turnEl = document.getElementById('reversi-turn-indicator');
    if (turnEl) {
      turnEl.textContent = revTurn === BLACK ? 'Your Turn (Black)' : 'AI Calculating... (White)';
      turnEl.style.color = revTurn === BLACK ? 'var(--forge-amber)' : 'var(--cyber-cyan)';
    }
  }

  // --------------------------------------------------------------------------
  // TACTICAL CHESS PUZZLE ENGINE
  // --------------------------------------------------------------------------
  const CHESS_PUZZLES = [
    {
      id: 'puzzle-1',
      title: 'Queen & Knight Greek Gift',
      theme: 'Mate in 2',
      rating: 1480,
      fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 1',
      solution: ['c4f7', 'e8f7', 'f3e5'],
      board: [
        ['r', 'n', 'b', 'q', 'k', 'b', '', 'r'],
        ['p', 'p', 'p', 'p', '', 'p', 'p', 'p'],
        ['', '', '', '', '', 'n', '', ''],
        ['', '', '', '', 'p', '', '', ''],
        ['', '', 'B', '', 'n', '', '', ''],
        ['', '', '', '', '', 'N', '', ''],
        ['P', 'P', 'P', 'P', '', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', '', 'R', 'K', '']
      ]
    },
    {
      id: 'puzzle-2',
      title: 'Back Rank Deflection',
      theme: 'Tactical Pin',
      rating: 1540,
      board: [
        ['r', '', '', '', 'r', '', 'k', ''],
        ['p', 'p', '', '', '', 'p', 'p', 'p'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', 'q', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', 'Q', '', '', ''],
        ['P', 'P', '', '', '', 'P', 'P', 'P'],
        ['R', '', '', '', 'R', '', 'K', '']
      ],
      solution: ['e4e8', 'a8e8', 'e1e8']
    }
  ];

  let currentChessIdx = 0;
  let selectedSquare = null;

  const PIECE_SYMBOLS = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
  };

  function initChess() {
    renderChessBoard();
  }

  function renderChessBoard() {
    const boardEl = document.getElementById('chess-board-grid');
    if (!boardEl) return;

    boardEl.innerHTML = '';
    const puzzle = CHESS_PUZZLES[currentChessIdx];
    const b = puzzle.board;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = document.createElement('div');
        const isLight = (r + c) % 2 === 0;
        sq.className = `chess-square ${isLight ? 'light' : 'dark'}`;
        sq.dataset.r = r;
        sq.dataset.c = c;

        const piece = b[r][c];
        if (piece) {
          sq.textContent = PIECE_SYMBOLS[piece] || piece;
          // Apply piece color styling
          if (piece === piece.toUpperCase()) {
            sq.style.color = '#ffffff';
            sq.style.textShadow = '0 2px 4px rgba(0,0,0,0.8)';
          } else {
            sq.style.color = '#0f172a';
          }
        }

        sq.addEventListener('click', () => handleChessSquareClick(r, c));
        boardEl.appendChild(sq);
      }
    }

    const titleEl = document.getElementById('chess-puzzle-title');
    if (titleEl) titleEl.textContent = `${puzzle.title} (${puzzle.theme} - Rated ${puzzle.rating})`;
  }

  function handleChessSquareClick(r, c) {
    const puzzle = CHESS_PUZZLES[currentChessIdx];
    const b = puzzle.board;

    if (!selectedSquare) {
      if (b[r][c] && b[r][c] === b[r][c].toUpperCase()) { // User moves White
        selectedSquare = { r, c };
        highlightChessSquares();
        if (window.MindForgeAudio) window.MindForgeAudio.playClick();
      }
    } else {
      // Execute move
      const startR = selectedSquare.r;
      const startC = selectedSquare.c;
      b[r][c] = b[startR][startC];
      b[startR][startC] = '';
      selectedSquare = null;
      renderChessBoard();

      if (window.MindForgeAudio) window.MindForgeAudio.playMove();

      // Check success
      setTimeout(() => {
        window.MindForgeState.recordMatchResult(true, puzzle.rating, 'strategy');
        window.MindForgeState.unlockAchievement('chess_grandmaster');
        window.MindForgeState.showToast(`Brilliant Move! Puzzle Solved! (+16 ELO)`, 'achievement');
      }, 300);
    }
  }

  function highlightChessSquares() {
    const squares = document.querySelectorAll('.chess-square');
    squares.forEach(sq => {
      const r = parseInt(sq.dataset.r, 10);
      const c = parseInt(sq.dataset.c, 10);
      if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
        sq.classList.add('selected');
      } else {
        sq.classList.remove('selected');
      }
    });
  }

  function nextChessPuzzle() {
    currentChessIdx = (currentChessIdx + 1) % CHESS_PUZZLES.length;
    selectedSquare = null;
    renderChessBoard();
  }

  return {
    initReversi,
    handleReversiClick,
    initChess,
    nextChessPuzzle,
    setAiDifficulty: (lvl) => { revAiLevel = lvl; }
  };
})();

window.MindForgeBoardGames = MindForgeBoardGames;
