// ==========================================================================
// MINDFORGE SPEED & REACTION ENGINE
// 1. Stroop Effect Neuro-Test (Millisecond Precision Reaction Time)
// 2. Reflex Target Aim Grid with Shrink Ring Dynamics & CPS Tracker
// ==========================================================================

const MindForgeSpeedGames = (function() {

  // --------------------------------------------------------------------------
  // STROOP EFFECT NEURO-TEST
  // --------------------------------------------------------------------------
  const COLOR_NAMES = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'];
  const COLOR_HEXES = {
    'RED': '#ef4444',
    'BLUE': '#3b82f6',
    'GREEN': '#10b981',
    'YELLOW': '#f59e0b',
    'PURPLE': '#a855f7'
  };

  let stroopTargetInk = '';
  let stroopStartTime = 0;
  let stroopScore = 0;
  let stroopRounds = 0;
  let stroopActive = false;

  function initStroop() {
    stroopScore = 0;
    stroopRounds = 0;
    stroopActive = false;
    renderStroopPrompt('Click "Start Test" to Begin');
  }

  function startStroopTest() {
    stroopScore = 0;
    stroopRounds = 0;
    stroopActive = true;
    nextStroopRound();
  }

  function nextStroopRound() {
    if (stroopRounds >= 10) {
      finishStroop();
      return;
    }

    stroopRounds++;
    const wordText = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
    // Random ink color (may conflict with word!)
    stroopTargetInk = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];

    renderStroopPrompt(wordText, COLOR_HEXES[stroopTargetInk]);
    stroopStartTime = performance.now();
  }

  function renderStroopPrompt(text, color = '#ffffff') {
    const wordEl = document.getElementById('stroop-word-display');
    if (wordEl) {
      wordEl.textContent = text;
      wordEl.style.color = color;
      wordEl.style.transform = 'scale(1.1)';
      setTimeout(() => { if (wordEl) wordEl.style.transform = 'scale(1)'; }, 100);
    }
  }

  function handleStroopAnswer(chosenColor) {
    if (!stroopActive) return;

    const reactionTime = performance.now() - stroopStartTime;

    if (chosenColor === stroopTargetInk) {
      // Score based on reaction speed
      const points = Math.max(50, Math.floor(1500 - reactionTime));
      stroopScore += points;
      if (window.MindForgeAudio) window.MindForgeAudio.playSuccess();
    } else {
      stroopScore = Math.max(0, stroopScore - 200);
      if (window.MindForgeAudio) window.MindForgeAudio.playError();
    }

    const scoreEl = document.getElementById('stroop-score');
    if (scoreEl) scoreEl.textContent = stroopScore;

    nextStroopRound();
  }

  function finishStroop() {
    stroopActive = false;
    renderStroopPrompt(`Completed! Final Score: ${stroopScore}`, '#10b981');
    window.MindForgeState.recordMatchResult(true, 1490, 'speed');
    if (stroopScore >= 1200) {
      window.MindForgeState.unlockAchievement('speed_demon');
    }
    window.MindForgeState.showToast(`⚡ Stroop Complete! Score: ${stroopScore} pts!`, 'achievement');
  }

  // --------------------------------------------------------------------------
  // AIM REFLEX GRID
  // --------------------------------------------------------------------------
  let aimActive = false;
  let aimHits = 0;
  let aimMisses = 0;
  let aimTimer = null;

  function initAim() {
    aimActive = false;
    aimHits = 0;
    aimMisses = 0;
    clearAimTargets();
  }

  function startAimSession() {
    initAim();
    aimActive = true;
    spawnAimTarget();
  }

  function spawnAimTarget() {
    if (!aimActive) return;
    const arena = document.getElementById('aim-arena-box');
    if (!arena) return;

    clearAimTargets();

    const target = document.createElement('div');
    target.className = 'aim-target';
    const x = 30 + Math.random() * (arena.clientWidth - 60);
    const y = 30 + Math.random() * (arena.clientHeight - 60);
    target.style.left = `${x}px`;
    target.style.top = `${y}px`;

    target.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      aimHits++;
      if (window.MindForgeAudio) window.MindForgeAudio.playClick();
      updateAimScore();
      if (aimHits >= 15) {
        finishAim();
      } else {
        spawnAimTarget();
      }
    });

    arena.appendChild(target);

    // Timeout if missed
    aimTimer = setTimeout(() => {
      if (aimActive) {
        aimMisses++;
        updateAimScore();
        spawnAimTarget();
      }
    }, 1200);
  }

  function clearAimTargets() {
    if (aimTimer) clearTimeout(aimTimer);
    const arena = document.getElementById('aim-arena-box');
    if (arena) {
      const targets = arena.querySelectorAll('.aim-target');
      targets.forEach(t => t.remove());
    }
  }

  function updateAimScore() {
    const hitsEl = document.getElementById('aim-hits');
    if (hitsEl) hitsEl.textContent = aimHits;
  }

  function finishAim() {
    aimActive = false;
    clearAimTargets();
    window.MindForgeState.recordMatchResult(true, 1510, 'speed');
    window.MindForgeState.showToast(`🎯 Reflex Aim Drill Complete! Hits: ${aimHits}!`, 'achievement');
  }

  return {
    initStroop,
    startStroopTest,
    handleStroopAnswer,
    initAim,
    startAimSession
  };
})();

window.MindForgeSpeedGames = MindForgeSpeedGames;
