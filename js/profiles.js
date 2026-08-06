/* ==========================================================================
   🪷 SADHANA MONITOR — PROFILES & ONBOARDING (js/profiles.js)
   ========================================================================== */

import { getProfiles, createProfile, setActiveProfileId, saveGoals } from './storage.js';
import { escapeHTML } from './utils.js';

export const AVATAR_OPTIONS = [
  { id: 'male_1', label: 'Devotee (Male)', emoji: '👨‍🦲', type: 'preset' },
  { id: 'male_2', label: 'Devotee (Male Yogi)', emoji: '🧘‍♂️', type: 'preset' },
  { id: 'female_1', label: 'Devotee (Female)', emoji: '👩', type: 'preset' },
  { id: 'female_2', label: 'Devotee (Female Yogi)', emoji: '🧘‍♀️', type: 'preset' },
  { id: 'lotus', label: 'Lotus', emoji: '🪷', type: 'preset' },
  { id: 'peacock', label: 'Peacock Feather', emoji: '🪶', type: 'preset' },
  { id: 'tulasi', label: 'Tulasi', emoji: '🌿', type: 'preset' },
  { id: 'conch', label: 'Conch', emoji: '🐚', type: 'preset' }
];

export function renderAvatarHTML(profile, sizePx = 38) {
  if (!profile) return '🪷';
  if (profile.avatarType === 'custom_image' && profile.avatarData) {
    return `<img src="${escapeHTML(profile.avatarData)}" alt="${escapeHTML(profile.name)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`;
  }
  return escapeHTML(profile.avatarPreset) || '🪷';
}

export function renderProfileSelectScreen(container, onSelectProfile, onAddNew) {
  const profiles = getProfiles();

  let html = `
    <div class="empty-state animate-fade-in-up" style="padding-top: 40px;">
      <div style="font-size: 3.8rem; margin-bottom: 8px;">🪷</div>
      <h2>Sadhana Monitor</h2>
      <p style="margin-bottom: 24px;">"Chant Hare Krishna and be happy"</p>

      <h3 style="font-size: 1.05rem; margin-bottom: 16px;">Who is practicing today?</h3>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 24px;">
  `;

  profiles.forEach(p => {
    const isCounsellor = p.role === 'counsellor';
    const avatarContent = renderAvatarHTML(p, 50);
    html += `
      <div class="card profile-select-card" data-id="${p.id}" style="cursor: pointer; text-align: center; padding: 18px 12px; margin-bottom: 0;">
        <div class="avatar-circle" style="width: 50px; height: 50px; font-size: 1.5rem; margin: 0 auto 10px auto; overflow: hidden;">
          ${avatarContent}
        </div>
        <div style="font-weight: 600; font-size: 0.95rem;">${escapeHTML(p.name)}</div>
        <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: capitalize;">
          ${isCounsellor ? '📋 Counsellor' : '🧘 Devotee'}
        </div>
      </div>
    `;
  });

  // Add new profile button
  html += `
        <div class="card" id="btn-add-profile-card" style="cursor: pointer; text-align: center; padding: 18px 12px; margin-bottom: 0; border: 2px dashed var(--border-light); background: transparent;">
          <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--border-subtle); color: var(--text-secondary); font-size: 1.5rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto;">+</div>
          <div style="font-weight: 600; font-size: 0.95rem;">Add New</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">Create Profile</div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  container.querySelectorAll('.profile-select-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      setActiveProfileId(id);
      onSelectProfile(id);
    });
  });

  const addBtn = container.querySelector('#btn-add-profile-card');
  if (addBtn) {
    addBtn.addEventListener('click', onAddNew);
  }
}

// --------------------------------------------------------------------------
// Onboarding Wizard Implementation
// --------------------------------------------------------------------------
export function renderOnboardingWizard(container, onComplete) {
  let step = 1;
  const formData = {
    name: '',
    initiatedName: '',
    guruName: '',
    avatarType: 'preset',
    avatarPreset: '👨‍🦲',
    avatarData: '',
    chanting: 16,
    hearing: 60,
    reading: 30,
    role: 'devotee'
  };

  function renderStep() {
    let content = '';

    if (step === 1) {
      content = `
        <div class="animate-fade-in-up">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 2.5rem; margin-bottom: 6px;">🌸</div>
            <h2>Welcome to Sadhana Monitor</h2>
            <p class="subtitle">Step 1 of 3 — Who are you?</p>
          </div>

          <div class="form-group">
            <label class="form-label">Your Display Name *</label>
            <input type="text" id="ob-name" value="${formData.name}" placeholder="e.g. Himanshu" required />
          </div>

          <div class="form-group">
            <label class="form-label">Initiated Name (optional)</label>
            <input type="text" id="ob-initiated" value="${formData.initiatedName}" placeholder="e.g. Himanshu Das" />
          </div>

          <div class="form-group">
            <label class="form-label">Choose Avatar or Upload Photo</label>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px;" id="ob-avatars">
              ${AVATAR_OPTIONS.map(a => `
                <div class="avatar-opt ${formData.avatarPreset === a.emoji && formData.avatarType === 'preset' ? 'selected' : ''}" 
                     data-emoji="${a.emoji}"
                     style="font-size: 1.3rem; padding: 8px 12px; border-radius: 12px; cursor: pointer; border: 2px solid ${formData.avatarPreset === a.emoji && formData.avatarType === 'preset' ? 'var(--saffron)' : 'var(--border-light)'}; background: var(--bg-surface-2); display: flex; align-items: center; gap: 6px;">
                  <span>${a.emoji}</span>
                  <span style="font-size: 0.78rem;">${a.label}</span>
                </div>
              `).join('')}
            </div>

            <div style="margin-top: 10px;">
              <label class="btn btn-secondary" style="cursor: pointer; width: auto; font-size: 0.82rem; padding: 8px 14px;">
                📸 Upload Custom Photo
                <input type="file" id="ob-photo-file" accept="image/*" style="display: none;" />
              </label>
              <span id="ob-photo-status" style="font-size: 0.78rem; color: var(--mint); margin-left: 8px;"></span>
            </div>
          </div>

          <button class="btn btn-primary" id="ob-next-1" style="margin-top: 10px;">Continue →</button>
        </div>
      `;
    } else if (step === 2) {
      content = `
        <div class="animate-fade-in-up">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 2.5rem; margin-bottom: 6px;">🎯</div>
            <h2>Set Daily Goals</h2>
            <p class="subtitle">Step 2 of 3 — Personal Sadhana Targets</p>
          </div>

          <div class="form-group">
            <label class="form-label">Daily Japa Rounds (target)</label>
            <div class="stepper-control">
              <button class="stepper-btn" id="ob-rounds-minus">−</button>
              <span class="stepper-val" id="ob-rounds-val">${formData.chanting}</span>
              <button class="stepper-btn" id="ob-rounds-plus">+</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Daily Hearing Target: <span id="ob-hearing-val">${formData.hearing}</span> min</label>
            <input type="range" id="ob-hearing-range" min="0" max="180" step="15" value="${formData.hearing}" />
          </div>

          <div class="form-group">
            <label class="form-label">Daily Reading Target: <span id="ob-reading-val">${formData.reading}</span> min</label>
            <input type="range" id="ob-reading-range" min="0" max="120" step="15" value="${formData.reading}" />
          </div>

          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button class="btn btn-secondary" id="ob-back-2">← Back</button>
            <button class="btn btn-primary" id="ob-next-2">Continue →</button>
          </div>
        </div>
      `;
    } else if (step === 3) {
      content = `
        <div class="animate-fade-in-up">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 2.5rem; margin-bottom: 6px;">👤</div>
            <h2>Select Your Role</h2>
            <p class="subtitle">Step 3 of 3 — How will you use the app?</p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
            <div class="card ${formData.role === 'devotee' ? 'card-gradient-border' : ''}" id="ob-role-devotee" style="cursor: pointer;">
              <div style="font-weight: 700; font-size: 1rem; margin-bottom: 4px;">🧘 Devotee</div>
              <div style="font-size: 0.82rem; color: var(--text-secondary);">I want to track my own sadhana practice daily.</div>
            </div>

            <div class="card ${formData.role === 'counsellor' ? 'card-gradient-border' : ''}" id="ob-role-counsellor" style="cursor: pointer;">
              <div style="font-weight: 700; font-size: 1rem; margin-bottom: 4px;">📋 Counsellor / Guide</div>
              <div style="font-size: 0.82rem; color: var(--text-secondary);">I monitor mentees' sadhana in addition to tracking my own.</div>
            </div>
          </div>

          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" id="ob-back-3">← Back</button>
            <button class="btn btn-primary" id="ob-finish">Start My Sadhana 🙏</button>
          </div>
        </div>
      `;
    }

    container.innerHTML = content;
    attachStepEvents();
  }

  function attachStepEvents() {
    if (step === 1) {
      const avatars = container.querySelectorAll('.avatar-opt');
      avatars.forEach(a => {
        a.addEventListener('click', () => {
          formData.avatarType = 'preset';
          formData.avatarPreset = a.dataset.emoji;
          formData.avatarData = '';
          avatars.forEach(x => x.style.borderColor = 'var(--border-light)');
          a.style.borderColor = 'var(--saffron)';
          const status = container.querySelector('#ob-photo-status');
          if (status) status.textContent = '';
        });
      });

      const photoInput = container.querySelector('#ob-photo-file');
      if (photoInput) {
        photoInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              formData.avatarType = 'custom_image';
              formData.avatarData = evt.target.result;
              avatars.forEach(x => x.style.borderColor = 'var(--border-light)');
              const status = container.querySelector('#ob-photo-status');
              if (status) status.textContent = 'Photo selected! ✓';
            };
            reader.readAsDataURL(file);
          }
        });
      }

      container.querySelector('#ob-next-1').addEventListener('click', () => {
        const nameInput = container.querySelector('#ob-name').value.trim();
        if (!nameInput) {
          alert('Please enter your name');
          return;
        }
        formData.name = nameInput;
        formData.initiatedName = container.querySelector('#ob-initiated').value.trim();
        step = 2;
        renderStep();
      });
    } else if (step === 2) {
      const roundsVal = container.querySelector('#ob-rounds-val');
      container.querySelector('#ob-rounds-minus').addEventListener('click', () => {
        if (formData.chanting > 0) formData.chanting--;
        roundsVal.textContent = formData.chanting;
      });
      container.querySelector('#ob-rounds-plus').addEventListener('click', () => {
        formData.chanting++;
        roundsVal.textContent = formData.chanting;
      });

      const hearingRange = container.querySelector('#ob-hearing-range');
      const hearingVal = container.querySelector('#ob-hearing-val');
      hearingRange.addEventListener('input', (e) => {
        formData.hearing = parseInt(e.target.value);
        hearingVal.textContent = formData.hearing;
      });

      const readingRange = container.querySelector('#ob-reading-range');
      const readingVal = container.querySelector('#ob-reading-val');
      readingRange.addEventListener('input', (e) => {
        formData.reading = parseInt(e.target.value);
        readingVal.textContent = formData.reading;
      });

      container.querySelector('#ob-back-2').addEventListener('click', () => {
        step = 1;
        renderStep();
      });
      container.querySelector('#ob-next-2').addEventListener('click', () => {
        step = 3;
        renderStep();
      });
    } else if (step === 3) {
      container.querySelector('#ob-role-devotee').addEventListener('click', () => {
        formData.role = 'devotee';
        renderStep();
      });
      container.querySelector('#ob-role-counsellor').addEventListener('click', () => {
        formData.role = 'counsellor';
        renderStep();
      });
      container.querySelector('#ob-back-3').addEventListener('click', () => {
        step = 2;
        renderStep();
      });
      container.querySelector('#ob-finish').addEventListener('click', () => {
        const newProf = createProfile({
          name: formData.name,
          initiatedName: formData.initiatedName,
          avatarType: formData.avatarType,
          avatarPreset: formData.avatarPreset,
          avatarData: formData.avatarData,
          role: formData.role
        });

        saveGoals(newProf.id, {
          profileId: newProf.id,
          chanting: formData.chanting,
          hearing: formData.hearing,
          reading: formData.reading,
          shlokaPerWeek: 1
        });

        setActiveProfileId(newProf.id);
        onComplete(newProf.id);
      });
    }
  }

  renderStep();
}
