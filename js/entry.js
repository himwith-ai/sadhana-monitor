/* ==========================================================================
   🪷 SADHANA MONITOR — DAILY ENTRY FORM (js/entry.js)
   ========================================================================== */

import { getEntry, saveEntry, getGoals, saveDraft, getDraft, clearDraft, getCustomActivities, saveCustomActivities } from './storage.js';
import { getCombinedShlokas } from './shlokas.js';
import { calculateScore } from './recommendations.js';

function formatMins(mins) {
  if (mins < 60) return `${mins} mins`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs} hrs`;
}

function calculateSleepDuration(wakeStr, sleepStr) {
  if (!wakeStr || !sleepStr) return 7.0;
  const [wH, wM] = wakeStr.split(':').map(Number);
  const [sH, sM] = sleepStr.split(':').map(Number);

  let wakeMins = wH * 60 + wM;
  let sleepMins = sH * 60 + sM;

  if (sleepMins >= wakeMins) {
    wakeMins += 24 * 60;
  }

  const diffHours = (wakeMins - sleepMins) / 60;
  return Math.max(0, Math.round(diffHours * 10) / 10);
}

export function renderEntryScreen(container, profileId, dateStr, onSaveSuccess) {
  const existing = getEntry(profileId, dateStr);
  const draft = getDraft(profileId, dateStr);
  const goals = getGoals(profileId);
  const shlokas = getCombinedShlokas(profileId);
  const userCustomActs = getCustomActivities(profileId);

  // Normalize initial data
  const initial = draft || existing || {
    date: dateStr,
    profileId,
    routine: { wakeUp: '04:30', sleep: '22:00', sleepDuration: 6.5 },
    morningProgram: { mangalaArati: true, guruPuja: true, tulasiPuja: false, deityDarshan: false },
    chanting: { rounds: 12, target: goals.chanting || 16 },
    hearing: { mins: 45, target: goals.hearing || 60 },
    reading: { mins: 20, target: goals.reading || 30 },
    shloka: { recitedId: '', memorizedText: '' },
    seva: { text: '', mins: 30 },
    mood: { rating: 4, note: '' },
    customLogs: {}
  };

  // Convert old string seva if needed
  if (typeof initial.seva === 'string') {
    initial.seva = { text: initial.seva, mins: 30 };
  }

  const state = JSON.parse(JSON.stringify(initial));

  const targetRounds = goals.chanting || 16;
  const targetHearing = goals.hearing || 60;
  const targetReading = goals.reading || 30;

  const html = `
    <div class="animate-fade-in-up">
      <!-- Date Selector Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h2>Today's Sadhana</h2>
        <input type="date" id="entry-date-picker" value="${dateStr}" max="${new Date().toISOString().split('T')[0]}" style="width: auto; padding: 6px 10px;" />
      </div>

      <!-- Routine Section -->
      <div class="card">
        <div class="card-title" style="margin-bottom: 12px;">⏰ Daily Routine</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
          <div>
            <label class="form-label">🌅 Wake-Up Time</label>
            <input type="time" id="input-wakeup" value="${state.routine?.wakeUp || '04:30'}" />
          </div>
          <div>
            <label class="form-label">🌙 Sleep Time</label>
            <input type="time" id="input-sleep" value="${state.routine?.sleep || '22:00'}" />
          </div>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-secondary); text-align: center;">
          Sleep Duration: <strong id="lbl-sleep-duration">${calculateSleepDuration(state.routine?.wakeUp, state.routine?.sleep)} hrs</strong>
        </div>
      </div>

      <!-- Japa Chanting Section -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">🔮 Japa / Chanting</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Target: ${targetRounds} rds</div>
        </div>
        <div class="stepper-control" style="margin-bottom: 8px;">
          <button class="stepper-btn" id="btn-rounds-minus">−</button>
          <div style="text-align: center;">
            <div class="stepper-val" id="lbl-rounds-val">${state.chanting?.rounds || 0}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);" id="lbl-rounds-pct">
              ${Math.round(((state.chanting?.rounds || 0) / targetRounds) * 100)}% of goal
            </div>
          </div>
          <button class="stepper-btn" id="btn-rounds-plus">+</button>
        </div>
      </div>

      <!-- Hearing Section -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">🎧 Hearing (Sravanam)</div>
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--lavender);" id="lbl-hearing-val">
            ${formatMins(state.hearing?.mins || 0)}
          </div>
        </div>
        <div class="slider-container">
          <input type="range" id="range-hearing" min="0" max="180" step="5" value="${state.hearing?.mins || 0}" />
        </div>
      </div>

      <!-- Reading Section -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">📖 Shastra Reading</div>
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--mint);" id="lbl-reading-val">
            ${formatMins(state.reading?.mins || 0)}
          </div>
        </div>
        <div class="slider-container">
          <input type="range" id="range-reading" min="0" max="120" step="5" value="${state.reading?.mins || 0}" />
        </div>
      </div>

      <!-- Morning Program Section -->
      <div class="card">
        <div class="card-title" style="margin-bottom: 12px;">🌸 Morning Program</div>
        <div class="checkbox-grid">
          <label class="checkbox-tile ${state.morningProgram?.mangalaArati ? 'checked' : ''}" id="tile-mp-mangala">
            <div class="custom-check">✓</div> Mangala Arati
          </label>
          <label class="checkbox-tile ${state.morningProgram?.guruPuja ? 'checked' : ''}" id="tile-mp-guru">
            <div class="custom-check">✓</div> Guru Puja
          </label>
          <label class="checkbox-tile ${state.morningProgram?.tulasiPuja ? 'checked' : ''}" id="tile-mp-tulasi">
            <div class="custom-check">✓</div> Tulasi Puja
          </label>
          <label class="checkbox-tile ${state.morningProgram?.deityDarshan ? 'checked' : ''}" id="tile-mp-darshan">
            <div class="custom-check">✓</div> Deity Darshan
          </label>
        </div>
      </div>

      <!-- Weekly Shloka Memorization Log -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">🕉️ Shloka Memorization</div>
          <div style="font-size: 0.78rem; color: var(--gold); font-weight: 600;">Target: 1 Shloka/week</div>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 8px;">
          Log what shloka verse you memorized this week:
        </p>
        <input type="text" id="input-shloka-custom" value="${state.shloka?.memorizedText || state.shloka?.recitedId || ''}" placeholder="Type shloka e.g. BG 2.20 / Śikṣāṣṭakam 1" style="margin-bottom: 8px;" />
        <div style="display: flex; gap: 6px; flex-wrap: wrap;" id="shloka-chips">
          <span style="font-size: 0.72rem; color: var(--text-muted); align-self: center;">Quick suggestions:</span>
          ${['BG 2.13', 'BG 2.20', 'BG 9.22', 'BG 18.66', 'Śikṣāṣṭakam 1', 'Brahma-samhita 5.1'].map(s => `
            <button type="button" class="btn-shloka-chip" data-val="${s}" style="font-size: 0.72rem; padding: 3px 8px; border-radius: 12px; background: var(--bg-surface-2); border: 1px solid var(--border-light); cursor: pointer; color: var(--text-secondary);">
              + ${s}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Seva & Time Duration -->
      <div class="card">
        <div class="card-title" style="margin-bottom: 8px;">🙌 Seva / Devotional Service</div>
        <div class="form-group">
          <label class="form-label">Service Description</label>
          <input type="text" id="input-seva-text" value="${state.seva?.text || ''}" placeholder="e.g. Temple flower decoration, book distribution..." />
        </div>
        <div class="form-group">
          <label class="form-label">Time Spent (Seva Duration): <span id="lbl-seva-mins" style="color: var(--saffron); font-weight: 700;">${formatMins(state.seva?.mins || 30)}</span></label>
          <input type="range" id="range-seva-mins" min="0" max="300" step="15" value="${state.seva?.mins || 30}" style="margin-bottom: 8px;" />
          <div style="display: flex; gap: 6px; flex-wrap: wrap;" id="seva-time-presets">
            ${[15, 30, 45, 60, 90, 120, 180].map(m => `
              <button type="button" class="btn-seva-preset ${(state.seva?.mins || 30) === m ? 'active' : ''}" data-mins="${m}" style="font-size: 0.75rem; padding: 4px 10px; border-radius: 12px; border: 1px solid var(--border-light); background: ${(state.seva?.mins || 30) === m ? 'var(--saffron)' : 'var(--bg-surface-2)'}; color: ${(state.seva?.mins || 30) === m ? '#fff' : 'var(--text-primary)'}; cursor: pointer;">
                ${formatMins(m)}
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Dynamic Custom Activities -->
      <div class="card">
        <div class="card-header" style="margin-bottom: 8px;">
          <div class="card-title">➕ Custom Activity Logs</div>
          <button type="button" class="btn btn-secondary" id="btn-show-add-custom-inline" style="width: auto; padding: 4px 10px; font-size: 0.75rem;">
            + Add Custom Item
          </button>
        </div>

        <div id="inline-custom-add-box" style="display: none; background: var(--bg-surface-2); padding: 10px; border-radius: var(--radius-md); margin-bottom: 12px; border: 1px dashed var(--saffron);">
          <div style="font-size: 0.8rem; font-weight: 600; margin-bottom: 6px;">Create New Custom Tracked Item</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
            <input type="text" id="inline-act-name" placeholder="Activity name (e.g. Parikrama)" style="font-size: 0.8rem;" />
            <input type="text" id="inline-act-unit" placeholder="Unit (e.g. mins / rounds)" style="font-size: 0.8rem;" />
          </div>
          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-inline-custom" style="width: auto; padding: 4px 10px; font-size: 0.75rem;">Cancel</button>
            <button type="button" class="btn btn-primary" id="btn-save-inline-custom" style="width: auto; padding: 4px 12px; font-size: 0.75rem;">Save & Track</button>
          </div>
        </div>

        <div id="custom-activities-container">
          ${userCustomActs.length === 0 ? `
            <p style="font-size: 0.8rem; color: var(--text-muted); text-align: center; margin: 8px 0;">
              No custom activities added yet. Tap <strong>"+ Add Custom Item"</strong> above to track your custom practice!
            </p>
          ` : userCustomActs.map(act => `
            <div style="margin-bottom: 10px; background: var(--bg-surface-2); padding: 10px; border-radius: var(--radius-md);">
              <label class="form-label">${act.icon || '📌'} ${act.name} (${act.unit})</label>
              <input type="number" class="custom-act-input" data-act-id="${act.id}" value="${state.customLogs?.[act.id] || 0}" placeholder="0" />
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Spiritual Taste / Ruchi -->
      <div class="card">
        <div class="card-title" style="margin-bottom: 8px;">📓 Spiritual Taste & Realizations</div>
        <div class="star-rating" id="ruchi-stars" style="margin-bottom: 10px;">
          ${[1, 2, 3, 4, 5].map(star => `
            <span class="star ${(state.mood?.rating || 4) >= star ? 'filled' : ''}" data-val="${star}">★</span>
          `).join('')}
        </div>
        <textarea id="input-realization" rows="2" placeholder="Any reflection or realization today?">${state.mood?.note || ''}</textarea>
      </div>

      <!-- Save CTA -->
      <button class="btn btn-primary" id="btn-save-entry" style="margin-top: 10px; padding: 16px;">
        🙏 Save Today's Sadhana
      </button>
    </div>
  `;

  container.innerHTML = html;

  // Add Listeners
  const roundsValEl = container.querySelector('#lbl-rounds-val');
  const roundsPctEl = container.querySelector('#lbl-rounds-pct');

  function updateRoundsUI() {
    roundsValEl.textContent = state.chanting.rounds;
    roundsValEl.classList.add('value-pop');
    setTimeout(() => roundsValEl.classList.remove('value-pop'), 300);
    const pct = Math.round((state.chanting.rounds / targetRounds) * 100);
    roundsPctEl.textContent = `${pct}% of goal`;
    triggerDraftSave();
  }

  container.querySelector('#btn-rounds-minus').addEventListener('click', () => {
    if (state.chanting.rounds > 0) {
      state.chanting.rounds--;
      updateRoundsUI();
    }
  });

  container.querySelector('#btn-rounds-plus').addEventListener('click', () => {
    state.chanting.rounds++;
    updateRoundsUI();
  });

  // Range Listeners
  const hearingRange = container.querySelector('#range-hearing');
  const hearingVal = container.querySelector('#lbl-hearing-val');
  hearingRange.addEventListener('input', (e) => {
    state.hearing.mins = parseInt(e.target.value);
    hearingVal.textContent = formatMins(state.hearing.mins);
    triggerDraftSave();
  });

  const readingRange = container.querySelector('#range-reading');
  const readingVal = container.querySelector('#lbl-reading-val');
  readingRange.addEventListener('input', (e) => {
    state.reading.mins = parseInt(e.target.value);
    readingVal.textContent = formatMins(state.reading.mins);
    triggerDraftSave();
  });

  const sevaRange = container.querySelector('#range-seva-mins');
  const sevaMinsLbl = container.querySelector('#lbl-seva-mins');
  sevaRange.addEventListener('input', (e) => {
    state.seva.mins = parseInt(e.target.value);
    sevaMinsLbl.textContent = formatMins(state.seva.mins);
    triggerDraftSave();
  });

  const sevaTextInput = container.querySelector('#input-seva-text');
  sevaTextInput.addEventListener('input', () => {
    state.seva.text = sevaTextInput.value;
    triggerDraftSave();
  });

  // Routine Time Pickers
  const wakeInput = container.querySelector('#input-wakeup');
  const sleepInput = container.querySelector('#input-sleep');
  const durationLbl = container.querySelector('#lbl-sleep-duration');

  function updateSleepUI() {
    state.routine.wakeUp = wakeInput.value;
    state.routine.sleep = sleepInput.value;
    const dur = calculateSleepDuration(state.routine.wakeUp, state.routine.sleep);
    state.routine.sleepDuration = dur;
    durationLbl.textContent = `${dur} hrs`;
    triggerDraftSave();
  }

  wakeInput.addEventListener('change', updateSleepUI);
  sleepInput.addEventListener('change', updateSleepUI);

  // Checkbox Grid Listeners
  function bindToggle(elementId, stateObj, key) {
    const tile = container.querySelector('#' + elementId);
    if (!tile) return;
    tile.addEventListener('click', () => {
      stateObj[key] = !stateObj[key];
      tile.classList.toggle('checked', stateObj[key]);
      triggerDraftSave();
    });
  }

  bindToggle('tile-mp-mangala', state.morningProgram, 'mangalaArati');
  bindToggle('tile-mp-guru', state.morningProgram, 'guruPuja');
  bindToggle('tile-mp-tulasi', state.morningProgram, 'tulasiPuja');
  bindToggle('tile-mp-darshan', state.morningProgram, 'deityDarshan');

  // Star Rating
  const stars = container.querySelectorAll('#ruchi-stars .star');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.dataset.val);
      state.mood.rating = val;
      stars.forEach(s => {
        const sVal = parseInt(s.dataset.val);
        s.classList.toggle('filled', sVal <= val);
      });
      triggerDraftSave();
    });
  });

  // Seva Time Presets
  const sevaPresets = container.querySelectorAll('.btn-seva-preset');
  sevaPresets.forEach(btn => {
    btn.addEventListener('click', () => {
      const m = parseInt(btn.dataset.mins);
      state.seva.mins = m;
      sevaRange.value = m;
      sevaMinsLbl.textContent = formatMins(m);
      sevaPresets.forEach(b => {
        const isActive = parseInt(b.dataset.mins) === m;
        b.style.background = isActive ? 'var(--saffron)' : 'var(--bg-surface-2)';
        b.style.color = isActive ? '#fff' : 'var(--text-primary)';
      });
      triggerDraftSave();
    });
  });

  // Shloka input & chips
  const shlokaCustom = container.querySelector('#input-shloka-custom');
  if (shlokaCustom) {
    shlokaCustom.addEventListener('input', () => {
      state.shloka.memorizedText = shlokaCustom.value;
      state.shloka.recitedId = shlokaCustom.value;
      triggerDraftSave();
    });
  }

  const shlokaChips = container.querySelectorAll('.btn-shloka-chip');
  shlokaChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.dataset.val;
      if (!shlokaCustom.value) {
        shlokaCustom.value = val;
      } else if (!shlokaCustom.value.includes(val)) {
        shlokaCustom.value += `, ${val}`;
      }
      state.shloka.memorizedText = shlokaCustom.value;
      state.shloka.recitedId = shlokaCustom.value;
      triggerDraftSave();
    });
  });

  // Inline Custom Activity Creator
  const btnShowInline = container.querySelector('#btn-show-add-custom-inline');
  const inlineBox = container.querySelector('#inline-custom-add-box');
  const btnCancelInline = container.querySelector('#btn-cancel-inline-custom');
  const btnSaveInline = container.querySelector('#btn-save-inline-custom');

  if (btnShowInline && inlineBox) {
    btnShowInline.addEventListener('click', () => {
      inlineBox.style.display = inlineBox.style.display === 'none' ? 'block' : 'none';
    });
    btnCancelInline.addEventListener('click', () => {
      inlineBox.style.display = 'none';
    });
    btnSaveInline.addEventListener('click', () => {
      const name = container.querySelector('#inline-act-name').value.trim();
      const unit = container.querySelector('#inline-act-unit').value.trim() || 'count';
      if (!name) {
        alert('Please enter activity name');
        return;
      }
      const newAct = { id: `act_${Date.now()}`, name, unit, icon: '📌' };
      userCustomActs.push(newAct);
      saveCustomActivities(profileId, userCustomActs);
      saveDraft(profileId, dateStr, state);
      // Re-render entry screen to show new custom field
      renderEntryScreen(container, profileId, dateStr, onSaveSuccess);
    });
  }

  // Custom Activities inputs
  if (!state.customLogs) state.customLogs = {};
  container.querySelectorAll('.custom-act-input').forEach(inp => {
    inp.addEventListener('input', () => {
      const actId = inp.dataset.actId;
      state.customLogs[actId] = parseFloat(inp.value) || 0;
      triggerDraftSave();
    });
  });

  const realizationInput = container.querySelector('#input-realization');
  if (realizationInput) {
    realizationInput.addEventListener('input', () => { state.mood.note = realizationInput.value; triggerDraftSave(); });
  }

  // Draft Auto Save Helper
  let draftTimer = null;
  function triggerDraftSave() {
    if (draftTimer) clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
      saveDraft(profileId, dateStr, state);
    }, 1200);
  }

  // Save Entry Handler
  container.querySelector('#btn-save-entry').addEventListener('click', () => {
    const computedScore = calculateScore(state, goals);
    state.score = computedScore;
    saveEntry(state);
    clearDraft(profileId, dateStr);
    onSaveSuccess(computedScore);
  });
}
