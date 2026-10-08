// ==========================================================================
// MINDFORGE STATE & PLAYER PROGRESSION ENGINE
// Real ELO Rating formula, Cognitive Skills Radar, and Achievement Engine
// ==========================================================================

const MindForgeState = (function() {
  const STORAGE_KEY = 'mindforge_player_state_v2';

  const defaultState = {
    user: {
      name: 'CyberTactician',
      avatar: '⚡',
      elo: 1420,
      xp: 3850,
      level: 14,
      streak: 7,
      rankTitle: 'Adept Strategist',
      coins: 1250,
      joinedDate: '2026-09-15'
    },
    skills: {
      logic: 78,
      strategy: 84,
      speed: 68,
      memory: 72,
      spatial: 80,
      deduction: 76
    },
    stats: {
      puzzlesSolved: 142,
      gamesPlayed: 189,
      winRate: 75.1,
      bestStreak: 12,
      tournamentsPlayed: 18,
      tournamentsWon: 3
    },
    achievements: [
      { id: 'first_blood', title: 'First Spark', desc: 'Solve your first MindForge puzzle', icon: '🔥', unlocked: true },
      { id: 'reversi_master', title: 'Flawless Flip', desc: 'Defeat Tactical AI in Reversi', icon: '⚪', unlocked: true },
      { id: 'chess_grandmaster', title: 'Checkmate Tactician', desc: 'Solve 10 chess tactics puzzles', icon: '♟️', unlocked: true },
      { id: 'sudoku_sage', title: 'Matrix Architect', desc: 'Complete a Hard Sudoku under 5 minutes', icon: '🔢', unlocked: true },
      { id: 'speed_demon', title: 'Sub-200ms Reflex', desc: 'Score over 1500 in Stroop Reaction test', icon: '⚡', unlocked: false },
      { id: 'dual_nback_pro', title: 'Quantum Cognition', desc: 'Reach 85% accuracy on Dual N-Back N=2', icon: '🧠', unlocked: true },
      { id: 'mastermind_breaker', title: 'Enigma Cracker', desc: 'Crack Mastermind code in 5 attempts or less', icon: '🕵️', unlocked: true },
      { id: 'maze_escape', title: 'Minotaur Bane', desc: 'Escape procedural labyrinth with fog of war', icon: '🧭', unlocked: true },
      { id: 'picross_artisan', title: 'Pixel Sculptor', desc: 'Solve a 10x10 Picross without mistakes', icon: '🖼️', unlocked: false },
      { id: 'arena_contender', title: 'Arena Contender', desc: 'Compete in 15 arena tournament battles', icon: '⚔️', unlocked: true },
      { id: 'elo_1600', title: 'Vanguard Titan', desc: 'Surpass 1600 ELO rating in competitive arena', icon: '🛡️', unlocked: false },
      { id: 'polymath', title: 'Cognitive Polymath', desc: 'Attain 75+ rating in all 6 cognitive pillars', icon: '👑', unlocked: false }
    ],
    completedPuzzles: {},
    settings: {
      soundEnabled: true,
      volume: 0.35,
      theme: 'cyber-dark'
    }
  };

  let state = loadState();

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return Object.assign({}, defaultState, JSON.parse(saved));
      }
    } catch (e) {
      console.warn('LocalStorage unavailable, using memory state:', e);
    }
    return JSON.parse(JSON.stringify(defaultState));
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed saving state to LocalStorage:', e);
    }
  }

  function getRankTitle(elo) {
    if (elo < 1000) return 'Novice Spark';
    if (elo < 1200) return 'Apprentice Thinker';
    if (elo < 1400) return 'Adept Strategist';
    if (elo < 1650) return 'Vanguard Master';
    if (elo < 1900) return 'Diamond Sage';
    if (elo < 2200) return 'Grandmaster Polymath';
    return 'MindForge Titan';
  }

  // ELO Rating Update formula
  function recordMatchResult(won, opponentElo = 1400, skillCategory = 'logic') {
    const K = 32;
    const expected = 1 / (1 + Math.pow(10, (opponentElo - state.user.elo) / 400));
    const score = won ? 1 : 0;
    const delta = Math.round(K * (score - expected));

    state.user.elo = Math.max(800, state.user.elo + delta);
    state.user.rankTitle = getRankTitle(state.user.elo);

    // Boost XP & Category Skill
    if (won) {
      state.user.xp += 150;
      state.stats.puzzlesSolved++;
      if (state.skills[skillCategory] !== undefined) {
        state.skills[skillCategory] = Math.min(99, state.skills[skillCategory] + 1);
      }
    } else {
      state.user.xp += 30;
    }

    state.stats.gamesPlayed++;
    state.stats.winRate = Number(((state.stats.puzzlesSolved / state.stats.gamesPlayed) * 100).toFixed(1));

    // Check level up
    const newLevel = Math.floor(state.user.xp / 300) + 1;
    if (newLevel > state.user.level) {
      state.user.level = newLevel;
      showToast(`🎉 Level Up! You reached Level ${newLevel}!`);
    }

    saveState();
    updateUIElements();
    return delta;
  }

  function unlockAchievement(id) {
    const ach = state.achievements.find(a => a.id === id);
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
      state.user.xp += 250;
      saveState();
      showToast(`🏆 Achievement Unlocked: ${ach.title}!`, 'achievement');
      updateUIElements();
    }
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'achievement' ? '🏆' : '✨';
    toast.innerHTML = `<span style="font-size: 1.3rem;">${icon}</span><div><strong>${message}</strong></div>`;

    container.appendChild(toast);
    if (window.MindForgeAudio) {
      type === 'achievement' ? window.MindForgeAudio.playFanfare() : window.MindForgeAudio.playSuccess();
    }

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function updateUIElements() {
    // Top Bar & Profile HUD sync
    const eloEl = document.getElementById('hud-player-elo');
    if (eloEl) eloEl.textContent = state.user.elo;

    const rankEl = document.getElementById('hud-player-rank');
    if (rankEl) rankEl.textContent = state.user.rankTitle;

    const xpEl = document.getElementById('hud-player-xp');
    if (xpEl) xpEl.textContent = `${state.user.xp} XP (Lvl ${state.user.level})`;

    const streakEl = document.getElementById('hud-player-streak');
    if (streakEl) streakEl.textContent = `${state.user.streak} Days`;

    // Redraw Radar Chart if on profile
    if (typeof window.drawRadarChart === 'function') {
      window.drawRadarChart();
    }
  }

  return {
    getState: () => state,
    recordMatchResult,
    unlockAchievement,
    showToast,
    saveState,
    updateUIElements
  };
})();

window.MindForgeState = MindForgeState;
