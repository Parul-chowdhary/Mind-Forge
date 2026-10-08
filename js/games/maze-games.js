// ==========================================================================
// MINDFORGE MAZE & PATHFINDING ENGINE
// 1. Procedural Maze Runner with Fog of War & Player Physics
// 2. A*, Dijkstra, BFS & DFS Pathfinding Algorithm Visualizer
// ==========================================================================

const MindForgeMazeGames = (function() {

  // --------------------------------------------------------------------------
  // PROCEDURAL MAZE RUNNER
  // --------------------------------------------------------------------------
  const COLS = 21;
  const ROWS = 21;
  const CELL_SIZE = 22;

  let mazeGrid = [];
  let playerPos = { r: 1, c: 1 };
  let exitPos = { r: ROWS - 2, c: COLS - 2 };
  let torchMode = false;
  let mazeCanvas = null;
  let mazeCtx = null;

  function initMaze() {
    mazeCanvas = document.getElementById('maze-canvas');
    if (!mazeCanvas) return;

    mazeCanvas.width = COLS * CELL_SIZE;
    mazeCanvas.height = ROWS * CELL_SIZE;
    mazeCtx = mazeCanvas.getContext('2d');

    generateProceduralMaze();
    playerPos = { r: 1, c: 1 };
    renderMaze();
    setupMazeControls();
  }

  // Recursive Backtracker Maze Generator
  function generateProceduralMaze() {
    mazeGrid = Array(ROWS).fill(1).map(() => Array(COLS).fill(1)); // 1 = wall, 0 = path

    function carve(r, c) {
      mazeGrid[r][c] = 0;
      const dirs = [
        [-2, 0], [2, 0], [0, -2], [0, 2]
      ].sort(() => Math.random() - 0.5);

      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr > 0 && nr < ROWS - 1 && nc > 0 && nc < COLS - 1 && mazeGrid[nr][nc] === 1) {
          mazeGrid[r + dr / 2][c + dc / 2] = 0;
          carve(nr, nc);
        }
      }
    }

    carve(1, 1);
    mazeGrid[exitPos.r][exitPos.c] = 0;
  }

  function renderMaze() {
    if (!mazeCtx) return;

    mazeCtx.fillStyle = '#090c15';
    mazeCtx.fillRect(0, 0, mazeCanvas.width, mazeCanvas.height);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (mazeGrid[r][c] === 1) {
          mazeCtx.fillStyle = '#1e263d';
          mazeCtx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Draw Exit
    mazeCtx.fillStyle = '#10b981';
    mazeCtx.shadowBlur = 15;
    mazeCtx.shadowColor = '#10b981';
    mazeCtx.fillRect(exitPos.c * CELL_SIZE + 3, exitPos.r * CELL_SIZE + 3, CELL_SIZE - 6, CELL_SIZE - 6);

    // Draw Player
    mazeCtx.fillStyle = '#f59e0b';
    mazeCtx.shadowBlur = 15;
    mazeCtx.shadowColor = '#f59e0b';
    mazeCtx.beginPath();
    mazeCtx.arc(
      playerPos.c * CELL_SIZE + CELL_SIZE / 2,
      playerPos.r * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 3,
      0,
      Math.PI * 2
    );
    mazeCtx.fill();
    mazeCtx.shadowBlur = 0;

    // Update Torch Overlay CSS Variable
    const overlay = document.getElementById('maze-torch-overlay');
    if (overlay) {
      if (torchMode) {
        overlay.style.display = 'block';
        const px = (playerPos.c + 0.5) * CELL_SIZE;
        const py = (playerPos.r + 0.5) * CELL_SIZE;
        overlay.style.setProperty('--torch-x', `${px}px`);
        overlay.style.setProperty('--torch-y', `${py}px`);
      } else {
        overlay.style.display = 'none';
      }
    }
  }

  function movePlayer(dr, dc) {
    const nr = playerPos.r + dr;
    const nc = playerPos.c + dc;

    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && mazeGrid[nr][nc] === 0) {
      playerPos.r = nr;
      playerPos.c = nc;
      renderMaze();
      if (window.MindForgeAudio) window.MindForgeAudio.playMove();

      // Check exit reached
      if (playerPos.r === exitPos.r && playerPos.c === exitPos.c) {
        window.MindForgeState.recordMatchResult(true, 1510, 'spatial');
        window.MindForgeState.unlockAchievement('maze_escape');
        window.MindForgeState.showToast('🧭 Labyrinth Escaped! Portal Reached! (+20 ELO)', 'achievement');
      }
    }
  }

  function setupMazeControls() {
    window.addEventListener('keydown', (e) => {
      const activeTab = document.querySelector('.page-view.active');
      if (!activeTab || activeTab.id !== 'view-maze') return;

      if (e.key === 'ArrowUp' || e.key === 'w') movePlayer(-1, 0);
      if (e.key === 'ArrowDown' || e.key === 's') movePlayer(1, 0);
      if (e.key === 'ArrowLeft' || e.key === 'a') movePlayer(0, -1);
      if (e.key === 'ArrowRight' || e.key === 'd') movePlayer(0, 1);
    });
  }

  function toggleTorch() {
    torchMode = !torchMode;
    renderMaze();
    return torchMode;
  }

  // --------------------------------------------------------------------------
  // PATHFINDING ALGORITHM VISUALIZER (A*, Dijkstra, BFS)
  // --------------------------------------------------------------------------
  function runPathfindingVisualizer(algo = 'astar') {
    const start = { r: 1, c: 1 };
    const goal = { r: exitPos.r, c: exitPos.c };

    const visited = [];
    const queue = [[start]];
    const seen = new Set([`${start.r},${start.c}`]);

    let foundPath = null;

    while (queue.length > 0) {
      let currentPath;
      if (algo === 'astar') {
        // Sort queue by f = g + h (Manhattan)
        queue.sort((a, b) => {
          const endA = a[a.length - 1];
          const endB = b[b.length - 1];
          const hA = Math.abs(endA.r - goal.r) + Math.abs(endA.c - goal.c);
          const hB = Math.abs(endB.r - goal.r) + Math.abs(endB.c - goal.c);
          return (a.length + hA) - (b.length + hB);
        });
        currentPath = queue.shift();
      } else {
        currentPath = queue.shift(); // BFS / Dijkstra
      }

      const node = currentPath[currentPath.length - 1];
      visited.push(node);

      if (node.r === goal.r && node.c === goal.c) {
        foundPath = currentPath;
        break;
      }

      const neighbors = [
        { r: node.r - 1, c: node.c },
        { r: node.r + 1, c: node.c },
        { r: node.r, c: node.c - 1 },
        { r: node.r, c: node.c + 1 }
      ];

      for (const n of neighbors) {
        const key = `${n.r},${n.c}`;
        if (n.r >= 0 && n.r < ROWS && n.c >= 0 && n.c < COLS && mazeGrid[n.r][n.c] === 0 && !seen.has(key)) {
          seen.add(key);
          queue.push([...currentPath, n]);
        }
      }
    }

    // Animate exploration
    let step = 0;
    const interval = setInterval(() => {
      if (step >= visited.length) {
        clearInterval(interval);
        // Highlight shortest path
        if (foundPath) {
          foundPath.forEach(pt => {
            mazeCtx.fillStyle = '#f59e0b';
            mazeCtx.fillRect(pt.c * CELL_SIZE + 4, pt.r * CELL_SIZE + 4, CELL_SIZE - 8, CELL_SIZE - 8);
          });
          if (window.MindForgeAudio) window.MindForgeAudio.playSuccess();
        }
        return;
      }

      const pt = visited[step];
      mazeCtx.fillStyle = 'rgba(6, 182, 212, 0.4)';
      mazeCtx.fillRect(pt.c * CELL_SIZE + 4, pt.r * CELL_SIZE + 4, CELL_SIZE - 8, CELL_SIZE - 8);
      step++;
    }, 15);
  }

  return {
    initMaze,
    toggleTorch,
    runPathfindingVisualizer,
    newMaze: () => {
      generateProceduralMaze();
      playerPos = { r: 1, c: 1 };
      renderMaze();
    }
  };
})();

window.MindForgeMazeGames = MindForgeMazeGames;
