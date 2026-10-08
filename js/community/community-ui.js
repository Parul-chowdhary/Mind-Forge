// ==========================================================================
// MINDFORGE COMMUNITY & OPEN SOURCE REPOSITORY UI
// Pull Request Browser, Code Diff Viewer, Git Commits Timeline & PR Submissions
// ==========================================================================

const MindForgeCommunityUI = (function() {
  let activeFilter = 'all';
  let searchQuery = '';
  let activeTab = 'prs'; // 'prs' or 'commits'

  function initCommunity() {
    renderMetrics();
    renderPRList();
    renderCommitsList();
    setupEventListeners();
  }

  function renderMetrics() {
    const locEl = document.getElementById('repo-metric-loc');
    const prsEl = document.getElementById('repo-metric-prs');
    const commitsEl = document.getElementById('repo-metric-commits');

    if (locEl) locEl.textContent = '576,070+';
    if (prsEl) prsEl.textContent = '125 PRs';
    if (commitsEl) commitsEl.textContent = '135 Commits';
  }

  function renderPRList() {
    const container = document.getElementById('pr-list-container');
    if (!container) return;

    container.innerHTML = '';
    const allPRs = window.MindForgePullRequests.getAll();

    const filtered = allPRs.filter(pr => {
      const matchFilter = activeFilter === 'all' || 
        (activeFilter === 'open' && pr.status === 'Open') ||
        (activeFilter === 'merged' && pr.status === 'Merged');
      
      const matchSearch = pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pr.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pr.author.toLowerCase().includes(searchQuery.toLowerCase());

      return matchFilter && matchSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-muted);">No pull requests found matching criteria.</div>`;
      return;
    }

    filtered.forEach(pr => {
      const row = document.createElement('div');
      row.className = 'pr-card-row';
      const statusIcon = pr.status === 'Merged' ? '🟣' : '🟢';
      const statusClass = pr.status === 'Merged' ? 'badge-indigo' : 'badge-emerald';

      row.innerHTML = `
        <span class="pr-status-icon">${statusIcon}</span>
        <div class="pr-info-body">
          <div class="pr-title-text">
            <span>${pr.title}</span>
            <span class="badge ${statusClass}">${pr.status}</span>
            <span class="badge badge-amber" style="font-size: 0.7rem;">${pr.category}</span>
          </div>
          <div class="pr-meta-text">
            <span>By <strong>${pr.author}</strong> on ${pr.date}</span>
            <span class="pr-diff-stat">
              <span class="pr-diff-add">+${pr.additions}</span>
              <span class="pr-diff-del">-${pr.deletions}</span>
            </span>
            <span style="color: var(--logic-emerald);">CI ${pr.ciStatus}</span>
          </div>
        </div>
      `;

      row.addEventListener('click', () => openPRDetailModal(pr.id));
      container.appendChild(row);
    });
  }

  function openPRDetailModal(prId) {
    const pr = window.MindForgePullRequests.getById(prId);
    if (!pr) return;

    const modal = document.getElementById('pr-detail-modal');
    const titleEl = document.getElementById('pr-modal-title');
    const metaEl = document.getElementById('pr-modal-meta');
    const diffEl = document.getElementById('pr-modal-diff');
    const mergeBtn = document.getElementById('pr-modal-merge-btn');

    if (!modal) return;

    titleEl.textContent = pr.title;
    metaEl.innerHTML = `
      <span class="badge ${pr.status === 'Merged' ? 'badge-indigo' : 'badge-emerald'}">${pr.status}</span>
      <span>Opened by <strong>${pr.author}</strong></span>
      <span>• Category: <strong>${pr.category}</strong></span>
      <span>• Additions: <strong style="color: #10b981;">+${pr.additions}</strong>, Deletions: <strong style="color: #f43f5e;">-${pr.deletions}</strong></span>
    `;

    diffEl.innerHTML = pr.diff.map(line => {
      if (line.startsWith('+')) return `<div class="diff-line diff-add">${escapeHtml(line)}</div>`;
      if (line.startsWith('-')) return `<div class="diff-line diff-del">${escapeHtml(line)}</div>`;
      if (line.startsWith('@')) return `<div class="diff-line diff-info">${escapeHtml(line)}</div>`;
      return `<div class="diff-line">${escapeHtml(line)}</div>`;
    }).join('');

    if (mergeBtn) {
      if (pr.status === 'Merged') {
        mergeBtn.disabled = true;
        mergeBtn.textContent = '✓ Already Merged to Main';
        mergeBtn.style.opacity = '0.6';
      } else {
        mergeBtn.disabled = false;
        mergeBtn.textContent = '✨ Review & Merge Pull Request (+50 XP)';
        mergeBtn.style.opacity = '1';
        mergeBtn.onclick = () => {
          window.MindForgePullRequests.mergePR(pr.id);
          window.MindForgeState.unlockAchievement('pr_contributor');
          window.MindForgeState.recordMatchResult(true, 1420, 'logic');
          window.MindForgeState.showToast(`🎉 Merged PR #${pr.id} into main! +50 XP Awarded!`, 'achievement');
          closePRDetailModal();
          renderPRList();
        };
      }
    }

    modal.classList.add('active');
  }

  function closePRDetailModal() {
    const modal = document.getElementById('pr-detail-modal');
    if (modal) modal.classList.remove('active');
  }

  function renderCommitsList() {
    const container = document.getElementById('commits-timeline-container');
    if (!container) return;

    container.innerHTML = '';
    const commits = window.MindForgeCommits.getAll();

    commits.forEach(c => {
      const item = document.createElement('div');
      item.className = 'commit-item';
      item.innerHTML = `
        <div>
          <div style="font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 8px;">
            <span>${c.message}</span>
            <span class="badge badge-emerald" style="font-size: 0.65rem;">Verified</span>
          </div>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">
            <span>${c.author} committed on ${c.date}</span>
            <span style="margin-left: 10px; font-family: var(--font-mono); color: var(--text-secondary);">${c.files} files (+${c.insertions}/-${c.deletions})</span>
          </div>
        </div>
        <div class="commit-hash">${c.hash}</div>
      `;
      container.appendChild(item);
    });
  }

  function setupEventListeners() {
    const searchInput = document.getElementById('pr-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderPRList();
      });
    }

    const filterPills = document.querySelectorAll('.pr-pill-filter');
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeFilter = pill.dataset.filter;
        renderPRList();
      });
    });

    const subtabs = document.querySelectorAll('.subtab-btn');
    subtabs.forEach(tab => {
      tab.addEventListener('click', () => {
        subtabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeTab = tab.dataset.subtab;

        const prView = document.getElementById('subview-prs');
        const commitView = document.getElementById('subview-commits');
        if (prView && commitView) {
          if (activeTab === 'prs') {
            prView.style.display = 'block';
            commitView.style.display = 'none';
          } else {
            prView.style.display = 'none';
            commitView.style.display = 'block';
          }
        }
      });
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  return {
    initCommunity,
    openPRDetailModal,
    closePRDetailModal
  };
})();

window.MindForgeCommunityUI = MindForgeCommunityUI;
