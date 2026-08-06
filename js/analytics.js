/* ==========================================================================
   🪷 SADHANA MONITOR — ANALYTICS DASHBOARD (js/analytics.js)
   ========================================================================== */

import { getAllEntries, getGoals, getProfile } from './storage.js';

export function renderAnalyticsScreen(container, profileId) {
  const entries = getAllEntries(profileId).sort((a, b) => a.date.localeCompare(b.date));
  const goals = getGoals(profileId);
  const profile = getProfile(profileId);

  // Averages & Highlights
  const totalDays = entries.length;
  const avgScore = totalDays > 0 ? Math.round(entries.reduce((a, b) => a + (b.score || 0), 0) / totalDays) : 0;
  const avgRounds = totalDays > 0 ? (entries.reduce((a, b) => a + (b.chanting?.rounds || 0), 0) / totalDays).toFixed(1) : 0;
  const avgHearing = totalDays > 0 ? Math.round(entries.reduce((a, b) => a + (b.hearing?.mins || 0), 0) / totalDays) : 0;
  const avgReading = totalDays > 0 ? Math.round(entries.reduce((a, b) => a + (b.reading?.mins || 0), 0) / totalDays) : 0;

  // Personal Bests
  let maxRounds = 0;
  let maxHearing = 0;
  let maxReading = 0;
  let maxScore = 0;

  entries.forEach(e => {
    if ((e.chanting?.rounds || 0) > maxRounds) maxRounds = e.chanting.rounds;
    if ((e.hearing?.mins || 0) > maxHearing) maxHearing = e.hearing.mins;
    if ((e.reading?.mins || 0) > maxReading) maxReading = e.reading.mins;
    if ((e.score || 0) > maxScore) maxScore = e.score;
  });

  const html = `
    <div class="animate-fade-in-up">
      <h2 style="margin-bottom: 16px;">📊 Sadhana Analytics</h2>

      <!-- Period Summary Stats Cards -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px;">
        <div class="card" style="padding: 10px; text-align: center; margin-bottom: 0;">
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--saffron);">${totalDays}</div>
          <div style="font-size: 0.68rem; color: var(--text-muted);">Days</div>
        </div>
        <div class="card" style="padding: 10px; text-align: center; margin-bottom: 0;">
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--gold);">${avgScore}</div>
          <div style="font-size: 0.68rem; color: var(--text-muted);">Avg Score</div>
        </div>
        <div class="card" style="padding: 10px; text-align: center; margin-bottom: 0;">
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--lavender);">${avgRounds}</div>
          <div style="font-size: 0.68rem; color: var(--text-muted);">Avg Rds</div>
        </div>
        <div class="card" style="padding: 10px; text-align: center; margin-bottom: 0;">
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--mint);">${avgHearing}m</div>
          <div style="font-size: 0.68rem; color: var(--text-muted);">Avg Hear</div>
        </div>
      </div>

      <!-- Heatmap Grid -->
      <div class="card">
        <div class="card-title" style="margin-bottom: 12px;">🗓️ Practice Heatmap</div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;" id="heatmap-grid">
          ${renderHeatmap(entries)}
        </div>
      </div>

      <!-- Score Trend Chart Canvas -->
      <div class="card">
        <div class="card-title" style="margin-bottom: 12px;">📈 Sadhana Score Trend</div>
        <canvas id="chart-score-trend" height="180"></canvas>
      </div>

      <!-- Rounds & Hearing Breakdown Canvas -->
      <div class="card">
        <div class="card-title" style="margin-bottom: 12px;">🔮 Daily Chanting Rounds</div>
        <canvas id="chart-rounds-trend" height="180"></canvas>
      </div>

      <!-- Personal Bests Card -->
      <div class="card card-gradient-border">
        <div class="card-title" style="margin-bottom: 12px;">🏆 Personal Bests</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.85rem;">
          <div>🔮 Most Rounds: <strong>${maxRounds}</strong></div>
          <div>🎧 Most Hearing: <strong>${maxHearing}m</strong></div>
          <div>📖 Most Reading: <strong>${maxReading}m</strong></div>
          <div>⭐ Highest Score: <strong>${maxScore}/100</strong></div>
        </div>
      </div>

      <!-- Export Button -->
      <button class="btn btn-secondary" id="btn-export-pdf" style="margin-top: 10px;">
        📄 Export Monthly Sadhana Report
      </button>
    </div>
  `;

  container.innerHTML = html;

  // Render Chart.js if available
  setTimeout(() => {
    initCharts(entries, goals);
  }, 100);

  // PDF Export trigger
  container.querySelector('#btn-export-pdf').addEventListener('click', () => {
    window.print();
  });
}

function renderHeatmap(entries) {
  if (entries.length === 0) {
    return `<div style="grid-column: span 7; text-align: center; color: var(--text-muted); padding: 10px;">No entries logged yet</div>`;
  }
  return entries.slice(-28).map(e => {
    const score = e.score || 0;
    let bg = 'var(--border-subtle)';
    if (score >= 90) bg = 'var(--mint)';
    else if (score >= 70) bg = 'var(--saffron)';
    else if (score >= 40) bg = 'var(--gold)';
    else if (score > 0) bg = 'var(--rose)';

    return `<div title="${e.date}: ${score} pts" style="height: 24px; border-radius: 4px; background: ${bg};"></div>`;
  }).join('');
}

function initCharts(entries, goals) {
  if (!window.Chart || entries.length === 0) return;

  const labels = entries.slice(-14).map(e => e.date.substring(5));
  const scores = entries.slice(-14).map(e => e.score || 0);
  const rounds = entries.slice(-14).map(e => e.chanting?.rounds || 0);

  // Score Trend Line Chart
  const ctxScore = document.getElementById('chart-score-trend');
  if (ctxScore) {
    new window.Chart(ctxScore, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Score',
          data: scores,
          borderColor: '#E8730A',
          backgroundColor: 'rgba(232, 115, 10, 0.1)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { min: 0, max: 100 } }
      }
    });
  }

  // Rounds Bar Chart
  const ctxRounds = document.getElementById('chart-rounds-trend');
  if (ctxRounds) {
    new window.Chart(ctxRounds, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Rounds',
          data: rounds,
          backgroundColor: '#8B62CC',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { min: 0 } }
      }
    });
  }
}
