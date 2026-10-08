// ==========================================================================
// MINDFORGE PROFILE & COGNITIVE RADAR CHART
// Dynamic HTML5 Canvas 6-Pillar Radar Chart, Achievements & Global Rankings
// ==========================================================================

function drawRadarChart() {
  const canvas = document.getElementById('radar-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 40;

  ctx.clearRect(0, 0, width, height);

  const skills = window.MindForgeState ? window.MindForgeState.getState().skills : {
    logic: 75, strategy: 80, speed: 70, memory: 75, spatial: 80, deduction: 75
  };

  const axes = [
    { label: 'Logic', val: skills.logic },
    { label: 'Strategy', val: skills.strategy },
    { label: 'Speed', val: skills.speed },
    { label: 'Memory', val: skills.memory },
    { label: 'Spatial', val: skills.spatial },
    { label: 'Deduction', val: skills.deduction }
  ];

  const totalAxes = axes.length;
  const angleStep = (Math.PI * 2) / totalAxes;

  // Draw concentric polygon grid levels
  const levels = 5;
  for (let l = 1; l <= levels; l++) {
    const levelRadius = (radius / levels) * l;
    ctx.beginPath();
    for (let i = 0; i < totalAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * levelRadius;
      const y = centerY + Math.sin(angle) * levelRadius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw axis spokes & labels
  for (let i = 0; i < totalAxes; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.stroke();

    // Text labels
    const labelX = centerX + Math.cos(angle) * (radius + 24);
    const labelY = centerY + Math.sin(angle) * (radius + 24);
    ctx.font = '600 12px "Outfit", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${axes[i].label} (${axes[i].val})`, labelX, labelY);
  }

  // Draw skill polygon
  ctx.beginPath();
  for (let i = 0; i < totalAxes; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const valRatio = axes[i].val / 100;
    const x = centerX + Math.cos(angle) * (radius * valRatio);
    const y = centerY + Math.sin(angle) * (radius * valRatio);

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  // Polygon gradient fill
  const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
  gradient.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
  gradient.addColorStop(1, 'rgba(99, 102, 241, 0.25)');
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Draw node points
  for (let i = 0; i < totalAxes; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const valRatio = axes[i].val / 100;
    const x = centerX + Math.cos(angle) * (radius * valRatio);
    const y = centerY + Math.sin(angle) * (radius * valRatio);

    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

window.drawRadarChart = drawRadarChart;

// Global Leaderboards Renderer
const LEADERBOARD_USERS = [
  { rank: 1, name: 'QuantumVance', elo: 2680, title: 'MindForge Titan', winRate: '88.4%', badge: 'top-1' },
  { rank: 2, name: 'Sora_Algorithm', elo: 2540, title: 'Grandmaster Polymath', winRate: '84.2%', badge: 'top-2' },
  { rank: 3, name: 'CipherZero', elo: 2490, title: 'Grandmaster Polymath', winRate: '81.7%', badge: 'top-3' },
  { rank: 4, name: 'HexStrategist', elo: 2320, title: 'Master Adept', winRate: '79.5%' },
  { rank: 5, name: 'CyberTactician (You)', elo: 1420, title: 'Adept Strategist', winRate: '75.1%' },
  { rank: 6, name: 'NeonRook', elo: 1390, title: 'Adept Strategist', winRate: '72.0%' },
  { rank: 7, name: 'LogicQueen_99', elo: 1350, title: 'Adept Strategist', winRate: '68.5%' }
];

function renderLeaderboard() {
  const container = document.getElementById('leaderboard-tbody');
  if (!container) return;

  container.innerHTML = '';
  LEADERBOARD_USERS.forEach(player => {
    const row = document.createElement('tr');
    const rankClass = player.badge ? `rank-position ${player.badge}` : 'rank-position';
    const isPlayer = player.name.includes('(You)');

    row.innerHTML = `
      <td class="${rankClass}">#${player.rank}</td>
      <td>
        <div class="player-cell">
          <div class="player-mini-avatar" style="${isPlayer ? 'background: linear-gradient(135deg, #f59e0b, #6366f1); color: #fff;' : ''}">
            ${player.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <strong style="color: ${isPlayer ? 'var(--forge-amber)' : '#ffffff'};">${player.name}</strong>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${player.title}</div>
          </div>
        </div>
      </td>
      <td style="font-family: var(--font-mono); font-weight: 700; color: var(--cyber-cyan);">${player.elo}</td>
      <td style="font-family: var(--font-mono);">${player.winRate}</td>
    `;
    container.appendChild(row);
  });
}

function renderAchievementsList() {
  const container = document.getElementById('achievements-grid');
  if (!container || !window.MindForgeState) return;

  container.innerHTML = '';
  const achievements = window.MindForgeState.getState().achievements;

  achievements.forEach(ach => {
    const card = document.createElement('div');
    card.className = `achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`;
    card.innerHTML = `
      <div class="achievement-icon">${ach.icon}</div>
      <div class="achievement-info">
        <h5>${ach.title}</h5>
        <p>${ach.desc}</p>
        <span class="badge ${ach.unlocked ? 'badge-amber' : 'badge-subtle'}" style="margin-top: 6px; font-size: 0.68rem;">
          ${ach.unlocked ? 'Unlocked ✓' : 'Locked 🔒'}
        </span>
      </div>
    `;
    container.appendChild(card);
  });
}

window.initProfileAndLeaderboard = function() {
  drawRadarChart();
  renderLeaderboard();
  renderAchievementsList();
  window.addEventListener('resize', drawRadarChart);
};
