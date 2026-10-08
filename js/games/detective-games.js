// ==========================================================================
// MINDFORGE DEDUCTION & DETECTIVE ENGINE
// 1. Criminal Mystery Dossiers (Suspects, Forensic Locker & Accusation)
// 2. Mastermind Hex-Code Breaker with Peg Feedback Constraints
// ==========================================================================

const MindForgeDetectiveGames = (function() {

  // --------------------------------------------------------------------------
  // DETECTIVE CASE FILES
  // --------------------------------------------------------------------------
  const CASE_FILES = [
    {
      id: 'case-01',
      title: 'The Midnight Heist of Blackwood Manor',
      brief: 'At 11:45 PM, the legendary Star of Alexandria diamond was stolen from Lord Blackwood’s private vault. The security laser was cut from the inside.',
      suspects: [
        {
          name: 'Vincent Vance',
          role: 'Butler & Valet',
          motive: 'Accumulated massive gambling debts in Neo-Verona.',
          alibi: 'Claims he was polishing silver in the scullery until midnight.',
          evidenceConnected: 'Traces of diamond dust found on a silver polishing cloth in the cellar.'
        },
        {
          name: 'Elena Rostova',
          role: 'Antiques Appraiser',
          motive: 'Wanted to sell the gem on the dark web black market.',
          alibi: 'Claims she was asleep in Guest Suite 3.',
          evidenceConnected: 'Muddy footprints matching high-end boots near the terrace garden.'
        },
        {
          name: 'Dr. Julian Thorne',
          role: 'Chief Security Architect',
          motive: 'Revenge against Lord Blackwood for patent infringement.',
          alibi: 'Claims he was monitoring network logs in the server room.',
          evidenceConnected: 'A master bypass keycard was logged at 11:42 PM under admin privileges.'
        }
      ],
      evidence: [
        { item: 'Bypassed Keycard', desc: 'Overrode the primary vault deadbolt at 11:42 PM using Engineer Level clearance.' },
        { item: 'Glass Cutter & Diamond Dust', desc: 'Left behind on the mahogany credenza near the secret gallery.' },
        { item: 'CCTV Glitch Timestamp', desc: 'Camera 04 loop was injected from a local console in the server room.' }
      ],
      culprit: 'Dr. Julian Thorne'
    }
  ];

  let currentCase = CASE_FILES[0];
  let selectedSuspect = null;

  function initDetectiveCase() {
    renderCaseDetails();
  }

  function renderCaseDetails() {
    const listEl = document.getElementById('suspects-list');
    const caseBriefEl = document.getElementById('case-brief-text');
    const evidenceEl = document.getElementById('evidence-locker-list');

    if (!listEl || !caseBriefEl || !evidenceEl) return;

    caseBriefEl.textContent = currentCase.brief;

    // Render Suspects
    listEl.innerHTML = '';
    currentCase.suspects.forEach((suspect, idx) => {
      const card = document.createElement('div');
      card.className = `suspect-card ${selectedSuspect === suspect.name ? 'active' : ''}`;
      card.innerHTML = `
        <div style="font-size: 1.8rem;">👤</div>
        <div>
          <strong style="color: #ffffff;">${suspect.name}</strong>
          <p style="font-size: 0.78rem; color: var(--text-muted);">${suspect.role}</p>
        </div>
      `;
      card.addEventListener('click', () => {
        selectedSuspect = suspect.name;
        showSuspectDossier(suspect);
        renderCaseDetails();
      });
      listEl.appendChild(card);
    });

    // Render Evidence
    evidenceEl.innerHTML = '';
    currentCase.evidence.forEach(ev => {
      const item = document.createElement('div');
      item.style.padding = '8px 12px';
      item.style.background = 'rgba(255,255,255,0.04)';
      item.style.borderRadius = '6px';
      item.style.borderLeft = '3px solid var(--forge-amber)';
      item.innerHTML = `<strong>${ev.item}:</strong> <span style="color: var(--text-secondary);">${ev.desc}</span>`;
      evidenceEl.appendChild(item);
    });
  }

  function showSuspectDossier(suspect) {
    const detailEl = document.getElementById('suspect-detail-view');
    if (!detailEl) return;

    detailEl.innerHTML = `
      <div style="background: rgba(18, 22, 38, 0.9); padding: 18px; border-radius: 8px; border: 1px solid var(--border-glow);">
        <h4 style="color: #ffffff; font-size: 1.15rem; margin-bottom: 8px;">Dossier: ${suspect.name} (${suspect.role})</h4>
        <p><strong>Motive:</strong> ${suspect.motive}</p>
        <p><strong>Alibi:</strong> ${suspect.alibi}</p>
        <p><strong>Forensic Clue:</strong> ${suspect.evidenceConnected}</p>
        <button class="btn btn-primary" style="margin-top: 14px;" onclick="MindForgeDetectiveGames.accuseSuspect('${suspect.name}')">
          ⚖️ File Formal Accusation
        </button>
      </div>
    `;
  }

  function accuseSuspect(name) {
    if (name === currentCase.culprit) {
      window.MindForgeState.recordMatchResult(true, 1580, 'deduction');
      window.MindForgeState.unlockAchievement('mastermind_breaker');
      window.MindForgeState.showToast(`🔍 Solved! ${name} broke under interrogation and confessed! (+26 ELO)`, 'achievement');
    } else {
      window.MindForgeState.recordMatchResult(false, 1580, 'deduction');
      window.MindForgeState.showToast(`❌ False accusation! ${name} has an unbreakable alibi.`);
    }
  }

  // --------------------------------------------------------------------------
  // MASTERMIND CODEBREAKER
  // --------------------------------------------------------------------------
  const MM_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  let mmSecret = [];
  let mmCurrentGuess = [];
  let mmHistory = [];
  const MM_MAX_ATTEMPTS = 8;

  function initMastermind() {
    mmSecret = [];
    for (let i = 0; i < 4; i++) {
      mmSecret.push(MM_COLORS[Math.floor(Math.random() * MM_COLORS.length)]);
    }
    mmCurrentGuess = [];
    mmHistory = [];
    renderMastermindBoard();
  }

  function renderMastermindBoard() {
    const boardEl = document.getElementById('mastermind-board');
    if (!boardEl) return;

    boardEl.innerHTML = '';
    for (let i = 0; i < MM_MAX_ATTEMPTS; i++) {
      const row = document.createElement('div');
      row.className = 'mastermind-row';

      const entry = mmHistory[i];
      const pegsGroup = document.createElement('div');
      pegsGroup.className = 'mm-peg-group';

      for (let p = 0; p < 4; p++) {
        const peg = document.createElement('div');
        peg.className = 'mm-peg';
        if (entry) {
          peg.style.background = entry.guess[p];
        } else if (i === mmHistory.length && mmCurrentGuess[p]) {
          peg.style.background = mmCurrentGuess[p];
        } else {
          peg.style.background = 'rgba(255,255,255,0.06)';
        }
        pegsGroup.appendChild(peg);
      }
      row.appendChild(pegsGroup);

      // Feedback indicators
      const feedback = document.createElement('div');
      feedback.className = 'mm-feedback';
      if (entry) {
        for (let b = 0; b < entry.black; b++) {
          const pin = document.createElement('div');
          pin.className = 'mm-pin black';
          feedback.appendChild(pin);
        }
        for (let w = 0; w < entry.white; w++) {
          const pin = document.createElement('div');
          pin.className = 'mm-pin white';
          feedback.appendChild(pin);
        }
      }
      row.appendChild(feedback);
      boardEl.appendChild(row);
    }
  }

  function pickMastermindColor(color) {
    if (mmCurrentGuess.length < 4) {
      mmCurrentGuess.push(color);
      renderMastermindBoard();
      if (window.MindForgeAudio) window.MindForgeAudio.playClick();

      if (mmCurrentGuess.length === 4) {
        evaluateMastermindGuess();
      }
    }
  }

  function evaluateMastermindGuess() {
    let black = 0;
    let white = 0;
    const secretCopy = [...mmSecret];
    const guessCopy = [...mmCurrentGuess];

    for (let i = 0; i < 4; i++) {
      if (guessCopy[i] === secretCopy[i]) {
        black++;
        secretCopy[i] = null;
        guessCopy[i] = null;
      }
    }

    for (let i = 0; i < 4; i++) {
      if (guessCopy[i] !== null) {
        const found = secretCopy.indexOf(guessCopy[i]);
        if (found !== -1) {
          white++;
          secretCopy[found] = null;
        }
      }
    }

    mmHistory.push({ guess: [...mmCurrentGuess], black, white });
    const won = black === 4;
    mmCurrentGuess = [];
    renderMastermindBoard();

    if (won) {
      window.MindForgeState.recordMatchResult(true, 1500, 'deduction');
      window.MindForgeState.showToast('🕵️ Enigma Cracked! Mastermind Secret Deciphered!', 'achievement');
    } else if (mmHistory.length >= MM_MAX_ATTEMPTS) {
      window.MindForgeState.showToast('Codebreaker failed! Encryption remained unbroken.');
    }
  }

  return {
    initDetectiveCase,
    accuseSuspect,
    initMastermind,
    pickMastermindColor
  };
})();

window.MindForgeDetectiveGames = MindForgeDetectiveGames;
