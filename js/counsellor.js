/* ==========================================================================
   🪷 SADHANA MONITOR — COUNSELLOR DASHBOARD (js/counsellor.js)
   ========================================================================== */

import { getProfile, getProfiles, getAllEntries, saveProfiles, getCounsellorNotes, saveCounsellorNotes } from './storage.js';
import { renderAvatarHTML } from './profiles.js';

export function renderCounsellorScreen(container, counsellorId, showToast) {
  const counsellor = getProfile(counsellorId);
  const allProfiles = getProfiles();
  
  // Mentees assigned to this counsellor
  const menteeIds = counsellor?.menteeIds || [];
  let mentees = allProfiles.filter(p => menteeIds.includes(p.id));

  // If no mentees assigned yet, auto-assign other devotee profiles on device for demonstration
  if (mentees.length === 0) {
    mentees = allProfiles.filter(p => p.id !== counsellorId);
  }

  let selectedMenteeId = null;
  let viewMode = 'cards'; // 'cards' | 'table'

  function renderMainView() {
    let html = `
      <div class="animate-fade-in-up">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div>
            <h2>📋 Counsellor Dashboard</h2>
            <p class="subtitle">Guiding Mentees in Sadhana</p>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="icon-btn" id="btn-toggle-view" title="Toggle Card / Table View">
              ${viewMode === 'cards' ? '📊' : '🎴'}
            </button>
            <button class="icon-btn" id="btn-add-mentee" title="Add Mentee">+</button>
          </div>
        </div>
    `;

    // Attention Needed Alert Box
    const inactiveMentees = mentees.filter(m => {
      const entries = getAllEntries(m.id);
      if (entries.length === 0) return true;
      const latest = entries.sort((a,b) => b.date.localeCompare(a.date))[0];
      const diffDays = (new Date() - new Date(latest.date)) / (1000 * 60 * 60 * 24);
      return diffDays >= 2;
    });

    if (inactiveMentees.length > 0) {
      html += `
        <div class="card" style="background: var(--rose-light); border-color: rgba(224, 86, 116, 0.3); margin-bottom: 16px;">
          <div style="font-weight: 700; color: var(--rose); margin-bottom: 4px;">⚠️ Attention Needed</div>
          <div style="font-size: 0.82rem; color: var(--text-primary);">
            ${inactiveMentees.map(m => m.name || 'Devotee').join(', ')} missed sadhana for 2+ days. Reach out with encouragement.
          </div>
        </div>
      `;
    }

    if (viewMode === 'cards') {
      html += `
        <h3 style="font-size: 1rem; margin-bottom: 12px;">My Mentees (${mentees.length})</h3>
        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
      `;

      mentees.forEach(m => {
        const entries = getAllEntries(m.id);
        const latest = entries.length > 0 ? entries.sort((a,b) => b.date.localeCompare(a.date))[0] : null;
        const score = latest?.score || '--';
        const rounds = latest?.chanting?.rounds || 0;

        let statusBadge = '🟢 Active';
        if (!latest) statusBadge = '🔴 Inactive';

        html += `
          <div class="card mentee-card" data-id="${m.id}" style="cursor: pointer; position: relative;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div class="avatar-circle" style="width: 36px; height: 36px; font-size: 1.1rem; overflow: hidden;">
                  ${renderAvatarHTML(m, 36)}
                </div>
                <div>
                  <div style="font-weight: 700; font-size: 0.95rem;">${m.initiatedName || m.name}</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">Score Today: ${score}</div>
                </div>
              </div>
              <span class="score-tag" style="font-size: 0.72rem;">${statusBadge}</span>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); display: flex; justify-content: space-between;">
              <span>🔮 Chanting: ${rounds} rounds</span>
              <span>View Details →</span>
            </div>
          </div>
        `;
      });

      html += `</div>`;
    } else {
      // Table View
      html += `
        <div class="card" style="padding: 10px; overflow-x: auto; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-light); text-align: left;">
                <th style="padding: 8px;">Mentee</th>
                <th style="padding: 8px;">Score</th>
                <th style="padding: 8px;">Chanting</th>
                <th style="padding: 8px;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${mentees.map(m => {
                const entries = getAllEntries(m.id);
                const latest = entries.length > 0 ? entries.sort((a,b) => b.date.localeCompare(a.date))[0] : null;
                return `
                  <tr style="border-bottom: 1px solid var(--border-subtle);">
                    <td style="padding: 8px; font-weight: 600;">${m.name}</td>
                    <td style="padding: 8px;">${latest?.score || '--'}</td>
                    <td style="padding: 8px;">${latest?.chanting?.rounds || 0} rds</td>
                    <td style="padding: 8px;">
                      <button class="btn btn-secondary btn-view-m" data-id="${m.id}" style="padding: 4px 8px; font-size: 0.75rem;">View</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    container.innerHTML = html;

    // Listeners
    container.querySelector('#btn-toggle-view').addEventListener('click', () => {
      viewMode = viewMode === 'cards' ? 'table' : 'cards';
      renderMainView();
    });

    container.querySelector('#btn-add-mentee').addEventListener('click', () => {
      openAddMenteeModal();
    });

    container.querySelectorAll('.mentee-card, .btn-view-m').forEach(el => {
      el.addEventListener('click', () => {
        selectedMenteeId = el.dataset.id;
        renderMenteeDetailView(selectedMenteeId);
      });
    });
  }

  function renderMenteeDetailView(menteeId) {
    const mentee = getProfile(menteeId);
    const entries = getAllEntries(menteeId).sort((a,b) => b.date.localeCompare(a.date));
    const latest = entries[0];
    const savedNotes = getCounsellorNotes(counsellorId, menteeId);

    const html = `
      <div class="animate-slide-right">
        <button class="btn btn-secondary" id="btn-back-mentees" style="margin-bottom: 14px; width: auto; padding: 6px 12px; font-size: 0.82rem;">
          ← Back to Mentees
        </button>

        <div class="card card-gradient-border">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div class="avatar-circle" style="width: 44px; height: 44px; font-size: 1.3rem; overflow: hidden;">
              ${renderAvatarHTML(mentee, 44)}
            </div>
            <div>
              <h3 style="margin-bottom: 2px;">${mentee.initiatedName || mentee.name}</h3>
              <div style="font-size: 0.78rem; color: var(--text-muted);">Mentee Sadhana Overview</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; text-align: center; font-size: 0.82rem; background: var(--bg-surface-2); padding: 10px; border-radius: var(--radius-md);">
            <div>Score: <strong>${latest?.score || '--'}</strong></div>
            <div>Rounds: <strong>${latest?.chanting?.rounds || 0}</strong></div>
            <div>Hearing: <strong>${latest?.hearing?.mins || 0}m</strong></div>
          </div>
        </div>

        <!-- Counsellor Private Notes -->
        <div class="card">
          <div class="card-title" style="margin-bottom: 8px;">📝 Private Counsellor Notes</div>
          <textarea id="txt-counsellor-notes" rows="3" placeholder="Write private notes or guidance points for this mentee...">${savedNotes}</textarea>
          <button class="btn btn-secondary" id="btn-save-c-notes" style="margin-top: 8px; padding: 8px 14px; font-size: 0.82rem;">
            Save Note
          </button>
        </div>

        <!-- WhatsApp Encouragement Generator -->
        <div class="card" style="background: var(--mint-light); border-color: rgba(58, 155, 115, 0.3);">
          <div class="card-title" style="margin-bottom: 6px; color: var(--mint);">📤 Send Encouragement</div>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px;">
            Generate a personalized Hare Krishna message to send via WhatsApp or text.
          </p>
          <button class="btn btn-primary" id="btn-send-whatsapp" style="background: var(--mint); box-shadow: none;">
            💬 Share Encouragement Message
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;

    container.querySelector('#btn-back-mentees').addEventListener('click', renderMainView);

    container.querySelector('#btn-save-c-notes').addEventListener('click', () => {
      const text = container.querySelector('#txt-counsellor-notes').value;
      saveCounsellorNotes(counsellorId, menteeId, text);
      showToast('Counsellor notes saved!');
    });

    container.querySelector('#btn-send-whatsapp').addEventListener('click', () => {
      const msg = `Hare Krishna ${mentee.name} Prabhu! 🙏\n\n` +
        `I noticed your sadhana progress today. Keep up the wonderful chanting and hearing practice!\n\n` +
        `— Your Counsellor, ${counsellor?.name || 'Prabhu'}`;

      if (navigator.share) {
        navigator.share({ title: 'Sadhana Encouragement', text: msg });
      } else {
        navigator.clipboard.writeText(msg);
        showToast('Message copied to clipboard! Ready to paste in WhatsApp.');
      }
    });
  }

  function openAddMenteeModal() {
    const nonMentees = allProfiles.filter(p => p.id !== counsellorId && !menteeIds.includes(p.id));
    if (nonMentees.length === 0) {
      alert('All existing devotee profiles on this device are already assigned to you!');
      return;
    }

    const selectHtml = nonMentees.map(p => `<option value="${p.id}">${p.name} (${p.role})</option>`).join('');
    const modalHtml = `
      <div class="modal-card">
        <h3>Add Mentee</h3>
        <p class="subtitle" style="margin-bottom: 14px;">Select a profile on this device to monitor:</p>
        <select id="modal-select-mentee" style="margin-bottom: 16px;">${selectHtml}</select>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="modal-confirm">Add</button>
        </div>
      </div>
    `;

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop active';
    backdrop.innerHTML = modalHtml;
    document.querySelector('#app-shell').appendChild(backdrop);

    backdrop.querySelector('#modal-cancel').addEventListener('click', () => backdrop.remove());
    backdrop.querySelector('#modal-confirm').addEventListener('click', () => {
      const selectedId = backdrop.querySelector('#modal-select-mentee').value;
      if (!counsellor.menteeIds) counsellor.menteeIds = [];
      counsellor.menteeIds.push(selectedId);
      
      const profiles = getProfiles();
      const idx = profiles.findIndex(p => p.id === counsellorId);
      if (idx > -1) {
        profiles[idx] = counsellor;
        saveProfiles(profiles);
      }

      backdrop.remove();
      showToast('Mentee added successfully!');
      renderMainView();
    });
  }

  renderMainView();
}
