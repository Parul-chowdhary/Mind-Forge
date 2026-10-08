// ==========================================================================
// MINDFORGE COMMUNITY PULL REQUESTS DATA
// 120+ Curated Open Source Pull Requests spanning engines, heuristics & puzzles
// ==========================================================================

const MindForgePullRequests = (function() {
  const authors = [
    { name: 'AlexChen_Dev', avatar: '👨‍💻' },
    { name: 'Elena_V', avatar: '👩‍🔬' },
    { name: 'QuantumForge', avatar: '⚡' },
    { name: 'AlgorithmKnight', avatar: '🛡️' },
    { name: 'NeuralNomad', avatar: '🤖' },
    { name: 'Sarah_Logic', avatar: '🧩' },
    { name: 'CipherZero', avatar: '🕵️' },
    { name: 'HexStrategist', avatar: '♟️' }
  ];

  const categories = ['Board & Strategy', 'Logic Puzzles', 'Pathfinding', 'Speed & Reflex', 'Audio Engine', 'Number Puzzles', 'Optimization', 'Security'];
  const labelsList = [
    ['enhancement', 'algorithm'],
    ['puzzle-pack', 'community'],
    ['performance', 'optimization'],
    ['bugfix', 'critical'],
    ['ui/ux', 'design-system'],
    ['ai-bot', 'minimax']
  ];

  const PR_TOPICS = [
    'Implement A* Euclidean heuristic for diagonal maze navigation',
    'Add 50 grandmaster endgame tactical chess positions to puzzle bank',
    'Optimize Nonogram row validation using bitwise bitmasks',
    'Enhance Reversi positional evaluation matrix for corners and edges',
    'Integrate Web Audio harmonic synthesizer chords for victory states',
    'Add Dual N-Back auditory cue frequency modulation',
    'Refactor Sudoku backtracking solver with Naked Single heuristic',
    'Introduce 3x3 Raven progressive matrix rotation symmetries',
    'Fix memory leak in particle synapse background render loop',
    'Add Stroop effect color-word semantic interference timer',
    'Implement Mastermind duplicate peg elimination logic',
    'Add fog of war dynamic torch radius gradient in maze runner',
    'Extend offline English lexicon with 12,000 competitive 5-letter tokens',
    'Add ELO rating volatility dampening for novice tiers',
    'Implement Dijkstra shortest path frontier step visualizer',
    'Add 2048 sliding tile undo history stack and swipe gestures',
    'Create Blackwood Manor detective case clues and alibi timeline',
    'Optimize Breadth-First-Search queue memory footprint in 50x50 grids',
    'Add high contrast theme tokens for accessibility compliance',
    'Implement daily puzzle streak local storage auto-synchronization'
  ];

  const PRS = [];

  for (let i = 1; i <= 125; i++) {
    const author = authors[i % authors.length];
    const category = categories[i % categories.length];
    const labels = labelsList[i % labelsList.length];
    const topic = PR_TOPICS[i % PR_TOPICS.length];
    const isMerged = i > 15; // First 15 are open for user to review & merge!
    const addLines = 15 + (i * 13) % 450;
    const delLines = 2 + (i * 7) % 180;

    PRS.push({
      id: 100 + i,
      title: `${topic} (#${100 + i})`,
      author: author.name,
      avatar: author.avatar,
      date: `2026-09-${String((i % 28) + 1).padStart(2, '0')}`,
      status: isMerged ? 'Merged' : 'Open',
      category: category,
      labels: labels,
      additions: addLines,
      deletions: delLines,
      ciStatus: 'Passed',
      description: `This pull request improves ${category} by implementing ${topic.toLowerCase()}. All in-browser test specs and heuristic assertions pass cleanly with zero external API dependencies.`,
      diff: [
        `@@ -${10 + (i % 20)},${7} +${10 + (i % 20)},${12} @@`,
        ` // Performance evaluation pass for ${category}`,
        `- const legacyMetric = evaluateLegacy(grid, depth);`,
        `+ const optimizedVector = computeHeuristicVector(grid, { depth, prune: true });`,
        `+ if (!optimizedVector.valid) return fallbackStrategy();`,
        `+ registerPerformanceMetric('${category}', optimizedVector.timeElapsed);`
      ],
      comments: [
        { author: 'MindForgeBot', text: '✅ All 48 unit tests passed. Heuristic benchmark improved by 34%.' },
        { author: author.name, text: 'Ready for review! Tested across local browsers with zero network latency.' }
      ]
    });
  }

  return {
    getAll: () => PRS,
    getById: (id) => PRS.find(p => p.id === id),
    mergePR: (id) => {
      const pr = PRS.find(p => p.id === id);
      if (pr) pr.status = 'Merged';
      return pr;
    }
  };
})();

window.MindForgePullRequests = MindForgePullRequests;
