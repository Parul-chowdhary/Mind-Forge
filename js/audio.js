// ==========================================================================
// MINDFORGE AUDIO SYNTHESIZER ENGINE (Web Audio API)
// 100% Zero external dependencies or API calls - procedural audio soundscape
// ==========================================================================

const MindForgeAudio = (function() {
  let audioCtx = null;
  let isMuted = false;
  let masterGain = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq = 440, duration = 0.15, type = 'sine', gainVal = 0.25) {
    if (isMuted) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  // Synthesizer Presets
  function playClick() {
    playTone(800, 0.05, 'triangle', 0.15);
  }

  function playMove() {
    playTone(520, 0.08, 'sine', 0.2);
  }

  function playSuccess() {
    if (isMuted) return;
    initAudio();
    if (!audioCtx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playTone(freq, 0.22, 'triangle', 0.25);
      }, idx * 70);
    });
  }

  function playError() {
    if (isMuted) return;
    initAudio();
    if (!audioCtx) return;

    playTone(180, 0.25, 'sawtooth', 0.2);
    setTimeout(() => {
      playTone(140, 0.3, 'sawtooth', 0.2);
    }, 90);
  }

  function playFanfare() {
    if (isMuted) return;
    initAudio();
    if (!audioCtx) return;

    const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        playTone(freq, 0.4, 'sine', 0.3);
      }, idx * 100);
    });
  }

  function playTick() {
    playTone(1200, 0.03, 'sine', 0.08);
  }

  function toggleMute() {
    isMuted = !isMuted;
    return isMuted;
  }

  function setVolume(val) {
    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(val, audioCtx.currentTime);
    }
  }

  return {
    init: initAudio,
    playTone,
    playClick,
    playMove,
    playSuccess,
    playError,
    playFanfare,
    playTick,
    toggleMute,
    setVolume,
    isMuted: () => isMuted
  };
})();

window.MindForgeAudio = MindForgeAudio;
