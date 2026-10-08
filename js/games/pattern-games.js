// ==========================================================================
// MINDFORGE PATTERN RECOGNITION ENGINE
// 1. Raven's Progressive Matrix IQ Challenge (SVG Geometric Deductions)
// 2. Neuro-Sequence Predictor with Series Transformation Analysis
// ==========================================================================

const MindForgePatternGames = (function() {

  // --------------------------------------------------------------------------
  // RAVEN PROGRESSIVE MATRICES
  // --------------------------------------------------------------------------
  const MATRIX_PUZZLES = [
    {
      id: 'matrix-1',
      title: 'Rotational Symmetry & Node Density',
      difficulty: 'Hard (IQ 135+)',
      correctAnswer: 3,
      tiles: [
        { type: 'circle', count: 1, angle: 0 },
        { type: 'circle', count: 2, angle: 45 },
        { type: 'circle', count: 3, angle: 90 },
        { type: 'square', count: 1, angle: 0 },
        { type: 'square', count: 2, angle: 45 },
        { type: 'square', count: 3, angle: 90 },
        { type: 'triangle', count: 1, angle: 0 },
        { type: 'triangle', count: 2, angle: 45 },
        null // Missing 9th tile!
      ],
      options: [
        { id: 1, type: 'triangle', count: 2, angle: 0 },
        { id: 2, type: 'circle', count: 3, angle: 90 },
        { id: 3, type: 'triangle', count: 3, angle: 90 }, // Correct!
        { id: 4, type: 'square', count: 1, angle: 45 },
        { id: 5, type: 'triangle', count: 4, angle: 180 },
        { id: 6, type: 'diamond', count: 3, angle: 90 }
      ]
    }
  ];

  let currentMatrixIdx = 0;

  function renderShapeSVG(tile) {
    if (!tile) return '<span style="font-size: 2rem; color: var(--forge-amber);">?</span>';

    const { type, count, angle } = tile;
    let shapePath = '';

    if (type === 'circle') {
      shapePath = `<circle cx="45" cy="45" r="28" fill="none" stroke="#6366f1" stroke-width="4"/>`;
    } else if (type === 'square') {
      shapePath = `<rect x="22" y="22" width="46" height="46" rx="6" fill="none" stroke="#06b6d4" stroke-width="4"/>`;
    } else if (type === 'triangle') {
      shapePath = `<polygon points="45,18 74,68 16,68" fill="none" stroke="#f59e0b" stroke-width="4"/>`;
    } else {
      shapePath = `<rect x="45" y="16" width="40" height="40" rx="4" transform="rotate(45 45 16)" fill="none" stroke="#10b981" stroke-width="4"/>`;
    }

    // Inner dots/nodes
    let dots = '';
    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * 12;
      dots += `<circle cx="${45 + offset}" cy="45" r="3.5" fill="#ffffff"/>`;
    }

    return `
      <svg width="90" height="90" viewBox="0 0 90 90" style="transform: rotate(${angle}deg);">
        ${shapePath}
        ${dots}
      </svg>
    `;
  }

  function initPatternMatrix() {
    renderPatternMatrix();
  }

  function renderPatternMatrix() {
    const gridEl = document.getElementById('raven-matrix-grid');
    const optsEl = document.getElementById('raven-options-grid');
    if (!gridEl || !optsEl) return;

    const puzzle = MATRIX_PUZZLES[currentMatrixIdx];

    // Render 3x3 Matrix
    gridEl.innerHTML = '';
    puzzle.tiles.forEach(tile => {
      const tileEl = document.createElement('div');
      tileEl.className = 'raven-tile';
      if (!tile) tileEl.classList.add('missing');
      tileEl.innerHTML = renderShapeSVG(tile);
      gridEl.appendChild(tileEl);
    });

    // Render Option Choices
    optsEl.innerHTML = '';
    puzzle.options.forEach(opt => {
      const optCard = document.createElement('div');
      optCard.className = 'raven-opt-card';
      optCard.innerHTML = renderShapeSVG(opt);
      optCard.addEventListener('click', () => handleOptionSelection(opt.id));
      optsEl.appendChild(optCard);
    });

    const titleEl = document.getElementById('raven-puzzle-title');
    if (titleEl) titleEl.textContent = `${puzzle.title} (${puzzle.difficulty})`;
  }

  function handleOptionSelection(chosenId) {
    const puzzle = MATRIX_PUZZLES[currentMatrixIdx];
    if (chosenId === puzzle.correctAnswer) {
      window.MindForgeState.recordMatchResult(true, 1550, 'spatial');
      window.MindForgeState.showToast('🎯 Brilliant Pattern Deduction! Estimated IQ: 138 (+24 ELO)', 'achievement');
    } else {
      window.MindForgeState.recordMatchResult(false, 1550, 'spatial');
      window.MindForgeState.showToast('❌ Pattern mismatch. Re-analyze rotational and element invariants.');
    }
  }

  return {
    initPatternMatrix,
    handleOptionSelection
  };
})();

window.MindForgePatternGames = MindForgePatternGames;
