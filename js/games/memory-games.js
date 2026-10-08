// ==========================================================================
// MINDFORGE MEMORY GAMES ENGINE
// 1. Quantum Simon Sequence with Harmonic Synthesizer Pads
// 2. Dual N-Back Cognitive Trainer (Visual Spatial + Auditory Cues)
// ==========================================================================

const MindForgeMemoryGames = (function() {

  // --------------------------------------------------------------------------
  // QUANTUM SIMON SEQUENCE
  // --------------------------------------------------------------------------
  const PADS = ['green', 'red', 'yellow', 'blue'];
  const FREQS = {
    green: 330,  // E4
    red: 440,    // A4
    yellow: 554, // C#5
    blue: 659    // E5
  };

  let simonSequence = [];
  let userStep = 0;
  let simonScore = 0;
  let isPlayingSequence = false;

  function initSimon() {
    simonSequence = [];
    userStep = 0;
    simonScore = 0;
    updateSimonScoreDisplay();
  }

  function startSimonGame() {
    simonSequence = [];
    simonScore = 0;
    userStep = 0;
    updateSimonScoreDisplay();
    nextSimonRound();
  }

  function nextSimonRound() {
    userStep = 0;
    const randomPad = PADS[Math.floor(Math.random() * PADS.length)];
    simonSequence.push(randomPad);
    simonScore = simonSequence.length - 1;
    updateSimonScoreDisplay();
    playSequence();
  }

  function playSequence() {
    isPlayingSequence = true;
    let delay = 600;

    simonSequence.forEach((padColor, idx) => {
      setTimeout(() => {
        activatePadVisual(padColor);
        if (idx === simonSequence.length - 1) {
          setTimeout(() => {
            isPlayingSequence = false;
          }, 400);
        }
      }, (idx + 1) * delay);
    });
  }

  function activatePadVisual(padColor) {
    const padEl = document.getElementById(`simon-${padColor}`);
    if (padEl) {
      padEl.classList.add('active');
      if (window.MindForgeAudio) {
        window.MindForgeAudio.playTone(FREQS[padColor], 0.3, 'sine', 0.35);
      }
      setTimeout(() => padEl.classList.remove('active'), 300);
    }
  }

  function handleSimonPadClick(padColor) {
    if (isPlayingSequence || simonSequence.length === 0) return;

    activatePadVisual(padColor);

    if (padColor === simonSequence[userStep]) {
      userStep++;
      if (userStep === simonSequence.length) {
        // Round completed successfully!
        setTimeout(nextSimonRound, 800);
      }
    } else {
      // Mistake!
      if (window.MindForgeAudio) window.MindForgeAudio.playError();
      window.MindForgeState.showToast(`Game Over! Sequence broken at step ${simonSequence.length}!`);
      if (simonScore >= 8) {
        window.MindForgeState.recordMatchResult(true, 1480, 'memory');
      }
      simonSequence = [];
    }
  }

  function updateSimonScoreDisplay() {
    const scoreEl = document.getElementById('simon-score');
    if (scoreEl) scoreEl.textContent = simonScore;
  }

  // --------------------------------------------------------------------------
  // DUAL N-BACK COGNITIVE TRAINER
  // --------------------------------------------------------------------------
  let nBackLevel = 2; // Default N=2
  let nBackHistory = [];
  let nBackCurrentStep = 0;
  let nBackRunning = false;
  let nBackScore = { visualHits: 0, audioHits: 0, totalRounds: 0 };
  const LETTERS = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'];

  function initNBack() {
    nBackHistory = [];
    nBackScore = { visualHits: 0, audioHits: 0, totalRounds: 0 };
    nBackRunning = false;
    renderNBackGrid();
  }

  function renderNBackGrid(activePos = -1) {
    const gridEl = document.getElementById('nback-board-grid');
    if (!gridEl) return;

    gridEl.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.className = 'nback-cell';
      if (i === activePos) cell.classList.add('active-spatial');
      gridEl.appendChild(cell);
    }
  }

  function startNBackSession() {
    initNBack();
    nBackRunning = true;
    runNBackStep();
  }

  function runNBackStep() {
    if (!nBackRunning) return;

    const spatialPos = Math.floor(Math.random() * 9);
    const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    nBackHistory.push({ spatialPos, letter });
    nBackScore.totalRounds++;

    renderNBackGrid(spatialPos);
    if (window.MindForgeAudio) {
      window.MindForgeAudio.playTone(400 + spatialPos * 50, 0.25, 'triangle');
    }

    const letterEl = document.getElementById('nback-audio-letter');
    if (letterEl) letterEl.textContent = letter;

    // Reset grid highlight after 1.5s
    setTimeout(() => {
      renderNBackGrid(-1);
    }, 1200);

    if (nBackHistory.length < 15) {
      setTimeout(runNBackStep, 2500);
    } else {
      finishNBackSession();
    }
  }

  function checkSpatialMatch() {
    if (!nBackRunning || nBackHistory.length <= nBackLevel) return;
    const current = nBackHistory[nBackHistory.length - 1];
    const target = nBackHistory[nBackHistory.length - 1 - nBackLevel];
    if (current.spatialPos === target.spatialPos) {
      nBackScore.visualHits++;
      window.MindForgeState.showToast('🎯 Spatial Match Correct!');
    } else {
      window.MindForgeState.showToast('❌ Spatial False Alarm!');
    }
  }

  function checkAudioMatch() {
    if (!nBackRunning || nBackHistory.length <= nBackLevel) return;
    const current = nBackHistory[nBackHistory.length - 1];
    const target = nBackHistory[nBackHistory.length - 1 - nBackLevel];
    if (current.letter === target.letter) {
      nBackScore.audioHits++;
      window.MindForgeState.showToast('🎯 Auditory Match Correct!');
    } else {
      window.MindForgeState.showToast('❌ Auditory False Alarm!');
    }
  }

  function finishNBackSession() {
    nBackRunning = false;
    window.MindForgeState.recordMatchResult(true, 1530, 'memory');
    window.MindForgeState.unlockAchievement('dual_nback_pro');
    window.MindForgeState.showToast(`🧠 Dual N-Back Session Complete! Cognition Rating Boosted!`, 'achievement');
  }

  return {
    initSimon,
    startSimonGame,
    handleSimonPadClick,
    initNBack,
    startNBackSession,
    checkSpatialMatch,
    checkAudioMatch
  };
})();

window.MindForgeMemoryGames = MindForgeMemoryGames;
