// ==========================================================================
// MINDFORGE WORD GAMES ENGINE
// 1. Wordle Forge with On-screen Keyboard & Color-Coded Deductions
// 2. Cryptogram Detective with Frequency Analysis & Substitution Solver
// ==========================================================================

const MindForgeWordGames = (function() {

  // --------------------------------------------------------------------------
  // WORDLE FORGE
  // --------------------------------------------------------------------------
  const TARGET_WORDS = ['FORGE', 'LOGIC', 'BRAIN', 'CHESS', 'SOLVE', 'CRYPT', 'TOWER', 'BLITZ', 'PRISM', 'NEXUS', 'SMART', 'PULSE'];
  let currentTarget = 'FORGE';
  let currentGuess = '';
  let guesses = [];
  const MAX_GUESSES = 6;
  const WORD_LEN = 5;
  let wordleOver = false;

  const KEYBOARD_LAYOUT = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
  ];

  function initWordle() {
    currentTarget = TARGET_WORDS[Math.floor(Math.random() * TARGET_WORDS.length)];
    currentGuess = '';
    guesses = [];
    wordleOver = false;

    renderWordleBoard();
    renderWordleKeyboard();
    setupWordleKeyboard();
  }

  function renderWordleBoard() {
    const boardEl = document.getElementById('wordle-board-grid');
    if (!boardEl) return;

    boardEl.innerHTML = '';
    for (let r = 0; r < MAX_GUESSES; r++) {
      const row = document.createElement('div');
      row.className = 'wordle-row';

      const guess = guesses[r] || (r === guesses.length ? currentGuess : '');
      const evaluated = guesses[r] ? evaluateGuess(guesses[r], currentTarget) : null;

      for (let c = 0; c < WORD_LEN; c++) {
        const tile = document.createElement('div');
        tile.className = 'wordle-tile';
        const char = guess[c] || '';
        tile.textContent = char;

        if (evaluated) {
          tile.classList.add(evaluated[c]); // correct, present, absent
        }
        row.appendChild(tile);
      }
      boardEl.appendChild(row);
    }
  }

  function evaluateGuess(guess, target) {
    const result = Array(WORD_LEN).fill('absent');
    const targetArr = target.split('');
    const guessArr = guess.split('');

    // First pass: exact matches
    for (let i = 0; i < WORD_LEN; i++) {
      if (guessArr[i] === targetArr[i]) {
        result[i] = 'correct';
        targetArr[i] = null;
      }
    }

    // Second pass: present matches
    for (let i = 0; i < WORD_LEN; i++) {
      if (result[i] !== 'correct') {
        const foundIdx = targetArr.indexOf(guessArr[i]);
        if (foundIdx !== -1) {
          result[i] = 'present';
          targetArr[foundIdx] = null;
        }
      }
    }
    return result;
  }

  function renderWordleKeyboard() {
    const kbEl = document.getElementById('wordle-keyboard');
    if (!kbEl) return;

    kbEl.innerHTML = '';
    KEYBOARD_LAYOUT.forEach(rowKeys => {
      const row = document.createElement('div');
      row.className = 'keyboard-row';
      rowKeys.forEach(k => {
        const btn = document.createElement('button');
        btn.className = `key-btn ${k.length > 1 ? 'wide' : ''}`;
        btn.textContent = k;
        btn.id = `key-${k}`;
        btn.addEventListener('click', () => handleWordleKey(k));
        row.appendChild(btn);
      });
      kbEl.appendChild(row);
    });
  }

  function handleWordleKey(key) {
    if (wordleOver) return;

    if (key === 'DEL' || key === 'BACKSPACE') {
      if (currentGuess.length > 0) {
        currentGuess = currentGuess.slice(0, -1);
        renderWordleBoard();
        if (window.MindForgeAudio) window.MindForgeAudio.playClick();
      }
    } else if (key === 'ENTER') {
      if (currentGuess.length === WORD_LEN) {
        submitWordleGuess();
      } else {
        window.MindForgeState.showToast('Word must be 5 letters!');
      }
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LEN) {
      currentGuess += key;
      renderWordleBoard();
      if (window.MindForgeAudio) window.MindForgeAudio.playClick();
    }
  }

  function submitWordleGuess() {
    guesses.push(currentGuess);
    const win = currentGuess === currentTarget;
    currentGuess = '';
    renderWordleBoard();

    if (win) {
      wordleOver = true;
      window.MindForgeState.recordMatchResult(true, 1400, 'logic');
      window.MindForgeState.showToast(`✨ Incredible! Wordle Solved: ${currentTarget}!`, 'achievement');
    } else if (guesses.length >= MAX_GUESSES) {
      wordleOver = true;
      window.MindForgeState.showToast(`Game Over! The target word was ${currentTarget}.`);
    } else {
      if (window.MindForgeAudio) window.MindForgeAudio.playMove();
    }
  }

  function setupWordleKeyboard() {
    window.addEventListener('keydown', (e) => {
      const activeTab = document.querySelector('.page-view.active');
      if (!activeTab || activeTab.id !== 'view-word') return;

      const k = e.key.toUpperCase();
      if (k === 'ENTER' || k === 'BACKSPACE' || /^[A-Z]$/.test(k)) {
        handleWordleKey(k);
      }
    });
  }

  // --------------------------------------------------------------------------
  // CRYPTOGRAM DETECTIVE
  // --------------------------------------------------------------------------
  const CRYPTOGRAM_QUOTE = {
    plain: "PURE MATHEMATICS IS THE POETRY OF LOGICAL IDEAS",
    author: "Albert Einstein"
  };

  let cipherMapping = {};
  let userCipherGuesses = {};

  function initCryptogram() {
    // Generate simple Caesar or random cipher
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const shuffled = [...letters].sort(() => 0.5 - Math.random());
    cipherMapping = {};
    letters.forEach((l, idx) => {
      cipherMapping[l] = shuffled[idx];
    });

    userCipherGuesses = {};
    renderCryptogram();
  }

  function renderCryptogram() {
    const container = document.getElementById('cryptogram-container');
    if (!container) return;

    container.innerHTML = '';
    const words = CRYPTOGRAM_QUOTE.plain.split(' ');

    words.forEach(word => {
      const wordBox = document.createElement('div');
      wordBox.className = 'crypto-word';

      for (const char of word) {
        const cipherChar = cipherMapping[char] || char;
        const col = document.createElement('div');
        col.className = 'crypto-letter-col';

        const input = document.createElement('input');
        input.className = 'crypto-input';
        input.maxLength = 1;
        input.value = userCipherGuesses[cipherChar] || '';
        input.addEventListener('input', (e) => {
          const val = e.target.value.toUpperCase();
          userCipherGuesses[cipherChar] = val;
          if (window.MindForgeAudio) window.MindForgeAudio.playClick();
          checkCryptogramWin();
        });

        const label = document.createElement('span');
        label.className = 'crypto-cipher-char';
        label.textContent = cipherChar;

        col.appendChild(input);
        col.appendChild(label);
        wordBox.appendChild(col);
      }
      container.appendChild(wordBox);
    });
  }

  function checkCryptogramWin() {
    let won = true;
    for (const char of CRYPTOGRAM_QUOTE.plain) {
      if (char !== ' ') {
        const cipherChar = cipherMapping[char];
        if (userCipherGuesses[cipherChar] !== char) {
          won = false;
          break;
        }
      }
    }
    if (won) {
      window.MindForgeState.recordMatchResult(true, 1500, 'deduction');
      window.MindForgeState.showToast(`🕵️ Cryptogram Decoded: "${CRYPTOGRAM_QUOTE.plain}" - ${CRYPTOGRAM_QUOTE.author}!`, 'achievement');
    }
  }

  return {
    initWordle,
    handleWordleKey,
    initCryptogram
  };
})();

window.MindForgeWordGames = MindForgeWordGames;
