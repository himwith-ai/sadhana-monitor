/* ==========================================================================
   🪷 SADHANA MONITOR — HOME DASHBOARD RENDERER (js/home.js)
   ========================================================================== */

import { getProfile, getEntry, getAllEntries, getGoals, getFavoriteQuotes, toggleFavoriteQuote, getCustomActivities } from './storage.js';
import { getQuoteOfDay } from './quotes.js';
import { getNextEvent } from './calendar.js';
import { getScoreLabel, getRecommendations } from './recommendations.js';
import { escapeHTML } from './utils.js';

export function getGreeting(name) {
  const safeName = escapeHTML(name);
  const hour = new Date().getHours();
  if (hour < 5)  return `Jai Nitai, ${safeName}! 🌙 (Brahma-muhurta)`;
  if (hour < 12) return `Hare Krishna, ${safeName}! 🙏`;
  if (hour < 17) return `Hari Bol, ${safeName}! ☀️`;
  return `Hare Krishna, ${safeName}! 🌅`;
}

function calculateStreak(entries) {
  if (!entries || entries.length === 0) return 0;
  let streak = 0;
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  
  const today = new Date().toISOString().split('T')[0];
  let currentDate = new Date();
  
  const hasToday = sorted.some(e => e.date === today && e.score >= 20);
  if (!hasToday) {
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  while (true) {
    const dStr = currentDate.toISOString().split('T')[0];
    const entry = sorted.find(e => e.date === dStr);
    if (entry && entry.score >= 20) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function formatMins(mins) {
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export function renderHomeScreen(container, profileId, onNavigateToEntry) {
  const profile = getProfile(profileId);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntry = getEntry(profileId, todayStr);
  const allEntries = getAllEntries(profileId);
  const goals = getGoals(profileId);
  const streak = calculateStreak(allEntries);
  const nextEvent = getNextEvent(todayStr);
  const quote = getQuoteOfDay();
  const favQuotes = getFavoriteQuotes(profileId);
  const isQuoteFav = favQuotes.includes(quote.id);
  const recs = getRecommendations(allEntries, goals);
  const customActs = getCustomActivities(profileId);

  const roundsDone = todayEntry?.chanting?.rounds || 0;
  const targetRounds = goals.chanting || 16;
  const roundsPct = Math.min(Math.round((roundsDone / targetRounds) * 100), 100);

  const hearingDone = todayEntry?.hearing?.mins || 0;
  const targetHearing = goals.hearing || 60;
  const hearingPct = Math.min(Math.round((hearingDone / targetHearing) * 100), 100);

  const readingDone = todayEntry?.reading?.mins || 0;
  const targetReading = goals.reading || 30;
  const readingPct = Math.min(Math.round((readingDone / targetReading) * 100), 100);

  // Seva data
  const sevaText = todayEntry?.seva?.text || (typeof todayEntry?.seva === 'string' ? todayEntry.seva : '');
  const sevaMins = todayEntry?.seva?.mins || 0;

  // Shloka data
  const shlokaDone = todayEntry?.shloka?.recitedId || todayEntry?.shloka?.memorizedText;

  const score = todayEntry?.score || 0;
  const scoreInfo = getScoreLabel(score);

  const isFirstDay = allEntries.length === 0;

  let html = `
    <div class="animate-fade-in-up">
      <!-- Auspicious Banner -->
      <div style="background: var(--bg-surface-2); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 8px 14px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; font-size: 0.82rem;">
        <div>📅 <strong style="color: var(--saffron);">${nextEvent.name}</strong></div>
        <div style="color: var(--text-muted);">${nextEvent.daysAway === 0 ? 'Today!' : 'In ' + nextEvent.daysAway + ' days'}</div>
      </div>

      <!-- Streak Banner -->
      <div class="streak-banner">
        <div class="streak-top">
          <div class="streak-count">🔥 ${streak} Day Streak</div>
          <div style="font-size: 0.8rem; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px;">Active</div>
        </div>
        <div class="streak-bar-bg">
          <div class="streak-bar-fill" style="width: ${roundsPct}%;"></div>
        </div>
        <div class="streak-sub">
          <span>Today's Progress: ${roundsPct}%</span>
          <span>Target: ${targetRounds} Rounds</span>
        </div>
      </div>
  `;

  if (isFirstDay && !todayEntry) {
    html += `
      <!-- Empty State for Day 1 -->
      <div class="card empty-state" style="margin-bottom: 16px;">
        <div class="empty-state-icon">🌸</div>
        <h3>Your Sadhana Journey Begins Today</h3>
        <p>Log your daily practice of chanting, hearing, reading, and seva to watch your spiritual life bloom.</p>
        <button class="btn btn-primary" id="btn-log-first" style="max-width: 260px; margin: 0 auto;">🙏 Log Today's Sadhana</button>
      </div>
    `;
  }

  // Widget 2x2 Grid
  html += `
      <div class="widget-grid">
        <!-- Chanting Widget -->
        <div class="widget-card" id="widget-chanting">
          <div class="widget-icon chanting">🔮</div>
          <div>
            <div class="widget-val">${roundsDone} / ${targetRounds}</div>
            <div class="widget-sub">Rounds Chanted</div>
          </div>
          <div class="widget-progress-ring">
            <svg viewBox="0 0 36 36">
              <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" />
              <path class="ring-fill" stroke="var(--saffron)" stroke-dasharray="${roundsPct}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" />
            </svg>
          </div>
        </div>

        <!-- Hearing Widget -->
        <div class="widget-card" id="widget-hearing">
          <div class="widget-icon hearing">🎧</div>
          <div>
            <div class="widget-val">${hearingDone} / ${targetHearing}m</div>
            <div class="widget-sub">Hearing Mins</div>
          </div>
          <div class="widget-progress-ring">
            <svg viewBox="0 0 36 36">
              <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" />
              <path class="ring-fill" stroke="var(--lavender)" stroke-dasharray="${hearingPct}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" />
            </svg>
          </div>
        </div>

        <!-- Reading Widget -->
        <div class="widget-card" id="widget-reading">
          <div class="widget-icon reading">📖</div>
          <div>
            <div class="widget-val">${readingDone} / ${targetReading}m</div>
            <div class="widget-sub">Reading Mins</div>
          </div>
          <div class="widget-progress-ring">
            <svg viewBox="0 0 36 36">
              <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" />
              <path class="ring-fill" stroke="var(--mint)" stroke-dasharray="${readingPct}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" />
            </svg>
          </div>
        </div>

        <!-- Weekly Shloka Widget -->
        <div class="widget-card" id="widget-shloka">
          <div class="widget-icon shloka">🕉️</div>
          <div>
            <div class="widget-val" style="font-size: 0.9rem; font-weight: 700;">${shlokaDone ? (shlokaDone.length > 18 ? shlokaDone.substring(0, 16) + '...' : shlokaDone) : '1 Verse/Wk'}</div>
            <div class="widget-sub">Weekly Target: 1 Shloka</div>
          </div>
        </div>
      </div>

      <!-- Devotional Seva Card -->
      <div class="card card-gradient-border" id="card-home-seva" style="cursor: pointer;">
        <div class="card-header">
          <div class="card-title" style="display: flex; align-items: center; gap: 6px;">
            <span>🙌</span> Devotional Service (Seva)
          </div>
          <div style="font-size: 0.82rem; font-weight: 700; color: var(--rose); background: rgba(224,86,116,0.12); padding: 4px 10px; border-radius: 12px;">
            ${sevaMins > 0 ? formatMins(sevaMins) : '0 mins'}
          </div>
        </div>
        <p style="font-size: 0.88rem; color: var(--text-primary); margin-top: 6px; font-style: ${sevaText ? 'normal' : 'italic'};">
          ${sevaText ? `"${sevaText}"` : 'Tap to log your devotional service and time spent today...'}
        </p>
      </div>

      <!-- Sadhana Score Card -->
      <div class="card score-card">
        <div style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;">Today's Sadhana Score</div>
        <div class="score-badge">${score} <span style="font-size: 1.2rem; color: var(--text-muted);">/ 100</span></div>
        <div class="score-tag" style="background: ${scoreInfo.color}15; color: ${scoreInfo.color};">
          ${scoreInfo.label}
        </div>
      </div>

      <!-- Recommendations Guidance -->
      <div class="card card-gradient-border">
        <div class="card-header">
          <div class="card-title">💡 Today's Spiritual Guidance</div>
        </div>
        ${recs.map(r => `
          <div style="margin-bottom: 10px; font-size: 0.85rem;">
            <strong>${r.icon} ${r.title}</strong>
            <p style="color: var(--text-secondary); margin-top: 2px;">${r.text}</p>
          </div>
        `).join('')}
      </div>

      <!-- Quote of the Day -->
      <div class="card quote-card">
        <blockquote style="margin-bottom: 8px;">"${quote.text}"</blockquote>
        <div class="quote-author">— ${quote.source}, ${quote.reference}</div>
        <div class="quote-actions">
          <button class="icon-btn" id="btn-fav-quote" style="width: 32px; height: 32px; font-size: 0.9rem;" title="Favorite Quote">
            ${isQuoteFav ? '❤️' : '🤍'}
          </button>
        </div>
      </div>

      <!-- Sticky Log CTA -->
      <div style="position: sticky; bottom: 80px; z-index: 40; margin-top: 20px;">
        <button class="btn btn-primary btn-log-cta" id="btn-sticky-log" style="box-shadow: 0 8px 25px rgba(232, 115, 10, 0.4);">
          ✏️ Log Today's Sadhana
        </button>
      </div>
    </div>
  `;

  container.innerHTML = html;

  container.querySelectorAll('#btn-log-first, #btn-sticky-log, .widget-card, #card-home-seva').forEach(el => {
    el.addEventListener('click', () => onNavigateToEntry(todayStr));
  });

  const favBtn = container.querySelector('#btn-fav-quote');
  if (favBtn) {
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isFav = toggleFavoriteQuote(profileId, quote.id);
      favBtn.textContent = isFav ? '❤️' : '🤍';
    });
  }
}
