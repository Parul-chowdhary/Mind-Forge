// ==========================================================================
// MINDFORGE APPLICATION COORDINATOR & ROUTER
// Central view management, event binding, and engine lifecycle
// ==========================================================================

const MindForgeApp = (function() {

  function init() {
    setupNavigation();
    setupSoundToggle();
    initCurrentView('view-dashboard');

    // Setup global state HUD
    if (window.MindForgeState) {
      window.MindForgeState.updateUIElements();
    }

    // Initialize Community Hub
    if (window.MindForgeCommunityUI) {
      window.MindForgeCommunityUI.initCommunity();
    }
  }

  function setupNavigation() {
    // Sidebar nav links
    const navLinks = document.querySelectorAll('.nav-link[data-view]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.dataset.view;
        switchView(targetView);
      });
    });

    // Profile card in sidebar clicks to profile view
    const sidebarProfile = document.querySelector('.sidebar-profile');
    if (sidebarProfile) {
      sidebarProfile.addEventListener('click', () => switchView('view-profile'));
    }

    // Category jump cards on dashboard
    const categoryCards = document.querySelectorAll('.category-jump-card[data-view]');
    categoryCards.forEach(card => {
      card.addEventListener('click', () => {
        switchView(card.dataset.view);
      });
    });
  }

  function switchView(viewId) {
    // Hide all views
    const allViews = document.querySelectorAll('.page-view');
    allViews.forEach(v => v.classList.remove('active'));

    // Deactivate all sidebar nav links
    const allNavLinks = document.querySelectorAll('.nav-link');
    allNavLinks.forEach(l => l.classList.remove('active'));

    // Show target view
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Activate corresponding nav link
    const matchingLink = document.querySelector(`.nav-link[data-view="${viewId}"]`);
    if (matchingLink) {
      matchingLink.classList.add('active');
    }

    if (window.MindForgeAudio) window.MindForgeAudio.playClick();
    initCurrentView(viewId);
  }

  function initCurrentView(viewId) {
    switch (viewId) {
      case 'view-board':
        if (window.MindForgeBoardGames) {
          window.MindForgeBoardGames.initReversi();
          window.MindForgeBoardGames.initChess();
        }
        break;
      case 'view-logic':
        if (window.MindForgeLogicPuzzles) {
          window.MindForgeLogicPuzzles.initPicross(0);
          window.MindForgeLogicPuzzles.initEinstein();
        }
        break;
      case 'view-number':
        if (window.MindForgeNumberPuzzles) {
          window.MindForgeNumberPuzzles.initSudoku('easy');
          window.MindForgeNumberPuzzles.init2048();
        }
        break;
      case 'view-word':
        if (window.MindForgeWordGames) {
          window.MindForgeWordGames.initWordle();
          window.MindForgeWordGames.initCryptogram();
        }
        break;
      case 'view-memory':
        if (window.MindForgeMemoryGames) {
          window.MindForgeMemoryGames.initSimon();
          window.MindForgeMemoryGames.initNBack();
        }
        break;
      case 'view-pattern':
        if (window.MindForgePatternGames) {
          window.MindForgePatternGames.initPatternMatrix();
        }
        break;
      case 'view-detective':
        if (window.MindForgeDetectiveGames) {
          window.MindForgeDetectiveGames.initDetectiveCase();
          window.MindForgeDetectiveGames.initMastermind();
        }
        break;
      case 'view-speed':
        if (window.MindForgeSpeedGames) {
          window.MindForgeSpeedGames.initStroop();
          window.MindForgeSpeedGames.initAim();
        }
        break;
      case 'view-maze':
        if (window.MindForgeMazeGames) {
          window.MindForgeMazeGames.initMaze();
        }
        break;
      case 'view-profile':
        if (typeof window.initProfileAndLeaderboard === 'function') {
          setTimeout(window.initProfileAndLeaderboard, 100);
        }
        break;
      case 'view-community':
        if (window.MindForgeCommunityUI) {
          window.MindForgeCommunityUI.initCommunity();
        }
        break;
      default:
        break;
    }
  }

  function setupSoundToggle() {
    const toggleBtn = document.getElementById('sound-toggle-btn');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      if (window.MindForgeAudio) {
        const muted = window.MindForgeAudio.toggleMute();
        toggleBtn.innerHTML = muted ? '🔇' : '🔊';
        toggleBtn.title = muted ? 'Sound Muted' : 'Sound Enabled';
        if (window.MindForgeState) {
          window.MindForgeState.showToast(muted ? 'Audio Muted' : 'Audio Enabled');
        }
      }
    });
  }

  return {
    init,
    switchView
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  MindForgeApp.init();
});

window.MindForgeApp = MindForgeApp;
