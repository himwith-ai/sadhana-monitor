/* ==========================================================================
   🪷 SADHANA MONITOR — SETTINGS PAGE (js/settings.js)
   ========================================================================== */

import { getProfile, getProfiles, saveProfiles, getGoals, saveGoals, exportProfileData, importProfileData, clearAllData, getCustomActivities, saveCustomActivities } from './storage.js';
import { AVATAR_OPTIONS, renderAvatarHTML } from './profiles.js';
import { getCurrentAuthUser, renderAuthModal, signOutUser, AuthConfig, initAuth } from './auth.js';

export function renderSettingsScreen(container, profileId, onSwitchProfile, onThemeChange, showToast) {
  const profile = getProfile(profileId);
  const goals = getGoals(profileId);
  let customActs = getCustomActivities(profileId);

  let tempAvatarType = profile?.avatarType || 'preset';
  let tempAvatarPreset = profile?.avatarPreset || '👨‍🦲';
  let tempAvatarData = profile?.avatarData || '';

  const html = `
    <div class="animate-fade-in-up">
      <h2 style="margin-bottom: 16px;">⚙️ Settings</h2>

      <!-- Active Profile Settings -->
      <div class="card">
        <div class="card-title" style="margin-bottom: 12px;">👤 Active Profile</div>
        <div class="form-group">
          <label class="form-label">Display Name</label>
          <input type="text" id="set-name" value="${profile?.name || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Initiated Name</label>
          <input type="text" id="set-initiated" value="${profile?.initiatedName || ''}" />
        </div>

        <div class="form-group">
          <label class="form-label">Avatar / Photo</label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px;" id="set-avatars">
            ${AVATAR_OPTIONS.map(a => `
              <div class="set-avatar-opt ${tempAvatarPreset === a.emoji && tempAvatarType === 'preset' ? 'selected' : ''}" 
                   data-emoji="${a.emoji}"
                   style="font-size: 1.2rem; padding: 6px 10px; border-radius: 12px; cursor: pointer; border: 2px solid ${tempAvatarPreset === a.emoji && tempAvatarType === 'preset' ? 'var(--saffron)' : 'var(--border-light)'}; background: var(--bg-surface-2); display: flex; align-items: center; gap: 6px;">
                <span>${a.emoji}</span>
                <span style="font-size: 0.75rem;">${a.label}</span>
              </div>
            `).join('')}
          </div>

          <label class="btn btn-secondary" style="cursor: pointer; width: auto; font-size: 0.82rem; padding: 8px 14px;">
            📸 Upload Custom Photo
            <input type="file" id="set-photo-file" accept="image/*" style="display: none;" />
          </label>
          <span id="set-photo-status" style="font-size: 0.78rem; color: var(--mint); margin-left: 8px;"></span>
        </div>

        <button class="btn btn-secondary" id="btn-save-profile" style="padding: 10px;">Save Profile Changes</button>
      </div>

      <!-- Daily Targets -->
      <div class="card">
        <div class="card-title" style="margin-bottom: 12px;">🎯 Daily Targets</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
          <div>
            <label class="form-label">Chanting (rds)</label>
            <input type="number" id="set-goals-chanting" value="${goals.chanting || 16}" min="1" max="108" />
          </div>
          <div>
            <label class="form-label">Hearing (mins)</label>
            <input type="number" id="set-goals-hearing" value="${goals.hearing || 60}" min="0" max="300" />
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
          <div>
            <label class="form-label">Reading (mins)</label>
            <input type="number" id="set-goals-reading" value="${goals.reading || 30}" min="0" max="300" />
          </div>
          <div>
            <label class="form-label">Shlokas/week</label>
            <input type="number" id="set-goals-shloka" value="${goals.shlokaPerWeek || 1}" min="1" max="10" />
          </div>
        </div>
        <button class="btn btn-secondary" id="btn-save-goals" style="padding: 10px;">Update Daily Targets</button>
      </div>

      <!-- Custom Activities Manager -->
      <div class="card">
        <div class="card-title" style="margin-bottom: 12px;">➕ Custom Tracked Activities</div>
        <div id="set-custom-list" style="margin-bottom: 12px;">
          ${customActs.length === 0 ? '<p style="font-size: 0.8rem; color: var(--text-muted);">No custom activities added yet.</p>' : customActs.map(act => `
            <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface-2); padding: 8px 12px; border-radius: var(--radius-md); margin-bottom: 6px;">
              <div><strong>${act.icon || '📌'} ${act.name}</strong> (${act.unit})</div>
              <button class="btn btn-danger btn-del-act" data-id="${act.id}" style="width: auto; padding: 4px 8px; font-size: 0.72rem;">Delete</button>
            </div>
          `).join('')}
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
          <input type="text" id="new-act-name" placeholder="Name e.g. Book Dist." />
          <input type="text" id="new-act-unit" placeholder="Unit e.g. books / mins" />
        </div>
        <button class="btn btn-secondary" id="btn-add-custom-act" style="padding: 8px 12px; font-size: 0.82rem;">+ Add Custom Activity</button>
      </div>

      <!-- App Appearance Theme -->
      <div class="card">
        <div class="card-title" style="margin-bottom: 12px;">🎨 Appearance Theme</div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
          <button class="btn btn-secondary theme-btn ${profile?.theme === 'auto' ? 'active' : ''}" data-theme="auto" style="padding: 8px 4px; font-size: 0.78rem;">
            🌅 Auto
          </button>
          <button class="btn btn-secondary theme-btn ${profile?.theme === 'light' ? 'active' : ''}" data-theme="light" style="padding: 8px 4px; font-size: 0.78rem;">
            ☀️ Light
          </button>
          <button class="btn btn-secondary theme-btn ${profile?.theme === 'dark' ? 'active' : ''}" data-theme="dark" style="padding: 8px 4px; font-size: 0.78rem;">
            🌙 Dark
          </button>
        </div>
        <p style="font-size: 0.72rem; color: var(--text-muted); margin-top: 8px; text-align: center;">
          Auto mode activates Dark Theme before 6 AM for early japa.
        </p>
      </div>

      <!-- Cloud Sync & Security Auth Card -->
      <div class="card card-gradient-border">
        <div class="card-title" style="margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
          <span>☁️ Cloud Backup & Authentication</span>
          <span class="score-tag" style="font-size: 0.72rem; background: ${getCurrentAuthUser() ? 'rgba(58,155,115,0.15)' : 'rgba(232,115,10,0.15)'}; color: ${getCurrentAuthUser() ? 'var(--mint)' : 'var(--saffron)'};">
            ${getCurrentAuthUser() ? '🟢 Cloud Signed In' : '📱 Local Mode'}
          </span>
        </div>

        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px;">
          ${getCurrentAuthUser() ? `Signed in as <strong>${getCurrentAuthUser().email}</strong>` : 'Sign in to securely back up and sync your sadhana across all your devices.'}
        </p>

        <div style="display: flex; gap: 8px; margin-bottom: 14px;">
          <button class="btn btn-primary" id="btn-cloud-auth-action" style="padding: 10px; font-size: 0.85rem;">
            ${getCurrentAuthUser() ? '🔒 Account / Sign Out' : '🔐 Sign In / Create Account'}
          </button>
        </div>

        <details style="font-size: 0.8rem; color: var(--text-muted); cursor: pointer;">
          <summary style="font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">⚙️ Supabase Production DB Credentials (Optional)</summary>
          <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 8px;">
            <div>
              <label class="form-label" style="font-size: 0.75rem;">Supabase Project URL</label>
              <input type="text" id="set-supabase-url" value="${AuthConfig.supabaseUrl || ''}" placeholder="https://your-project.supabase.co" style="font-size: 0.78rem;" />
            </div>
            <div>
              <label class="form-label" style="font-size: 0.75rem;">Supabase Anon Key</label>
              <input type="password" id="set-supabase-key" value="${AuthConfig.supabaseKey || ''}" placeholder="eyJhbGciOi..." style="font-size: 0.78rem;" />
            </div>
            <button class="btn btn-secondary" id="btn-save-supabase-config" style="padding: 6px; font-size: 0.78rem;">
              Save DB Credentials
            </button>
          </div>
        </details>
      </div>

      <!-- Profile Switching -->
      <div class="card">
        <div class="card-title" style="margin-bottom: 12px;">👥 Multi-Profile Management</div>
        <button class="btn btn-secondary" id="btn-switch-profile" style="margin-bottom: 8px;">
          🔄 Switch Active Profile
        </button>
      </div>

      <!-- Data Backup & Safety -->
      <div class="card">
        <div class="card-title" style="margin-bottom: 12px;">📦 Data Backup & Export</div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button class="btn btn-secondary" id="btn-export-json">
            📤 Export Profile Backup (JSON)
          </button>
          <button class="btn btn-secondary" id="btn-import-json">
            📥 Import Profile Data
          </button>
          <input type="file" id="file-import-input" accept=".json" style="display: none;" />
          
          <button class="btn btn-danger" id="btn-clear-all" style="margin-top: 8px;">
            🗑️ Clear All My Local Data
          </button>
        </div>
      </div>

      <!-- App Info -->
      <div style="text-align: center; margin-top: 20px; font-size: 0.78rem; color: var(--text-muted);">
        <strong>Sadhana Monitor v1.0</strong><br />
        Offline-First Spiritual Practice Companion<br />
        "Jai Srila Prabhupada! 🙏"
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Avatar Selection Handlers
  const avatarOpts = container.querySelectorAll('.set-avatar-opt');
  avatarOpts.forEach(a => {
    a.addEventListener('click', () => {
      tempAvatarType = 'preset';
      tempAvatarPreset = a.dataset.emoji;
      tempAvatarData = '';
      avatarOpts.forEach(x => x.style.borderColor = 'var(--border-light)');
      a.style.borderColor = 'var(--saffron)';
    });
  });

  const photoInput = container.querySelector('#set-photo-file');
  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          tempAvatarType = 'custom_image';
          tempAvatarData = evt.target.result;
          avatarOpts.forEach(x => x.style.borderColor = 'var(--border-light)');
          container.querySelector('#set-photo-status').textContent = 'Photo selected! ✓';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Save Profile Handler
  container.querySelector('#btn-save-profile').addEventListener('click', () => {
    profile.name = container.querySelector('#set-name').value.trim();
    profile.initiatedName = container.querySelector('#set-initiated').value.trim();
    profile.avatarType = tempAvatarType;
    profile.avatarPreset = tempAvatarPreset;
    profile.avatarData = tempAvatarData;

    const profiles = getProfiles();
    const idx = profiles.findIndex(p => p.id === profileId);
    if (idx > -1) {
      profiles[idx] = profile;
      saveProfiles(profiles);
      showToast('Profile updated!');
      window.location.reload();
    }
  });

  // Goals Handler
  container.querySelector('#btn-save-goals').addEventListener('click', () => {
    const updatedGoals = {
      profileId,
      chanting: parseInt(container.querySelector('#set-goals-chanting').value) || 16,
      hearing: parseInt(container.querySelector('#set-goals-hearing').value) || 60,
      reading: parseInt(container.querySelector('#set-goals-reading').value) || 30,
      shlokaPerWeek: parseInt(container.querySelector('#set-goals-shloka').value) || 1
    };
    saveGoals(profileId, updatedGoals);
    showToast('Daily targets updated!');
  });

  // Custom Activities Handlers
  container.querySelector('#btn-add-custom-act').addEventListener('click', () => {
    const name = container.querySelector('#new-act-name').value.trim();
    const unit = container.querySelector('#new-act-unit').value.trim() || 'mins';
    if (!name) {
      alert('Please enter activity name');
      return;
    }
    const newAct = { id: `act_${Date.now()}`, name, unit, icon: '📌' };
    customActs.push(newAct);
    saveCustomActivities(profileId, customActs);
    showToast('Custom activity added!');
    renderSettingsScreen(container, profileId, onSwitchProfile, onThemeChange, showToast);
  });

  container.querySelectorAll('.btn-del-act').forEach(btn => {
    btn.addEventListener('click', () => {
      const actId = btn.dataset.id;
      customActs = customActs.filter(a => a.id !== actId);
      saveCustomActivities(profileId, customActs);
      showToast('Custom activity removed!');
      renderSettingsScreen(container, profileId, onSwitchProfile, onThemeChange, showToast);
    });
  });

  // Theme Handlers
  container.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.theme;
      profile.theme = mode;
      const profiles = getProfiles();
      const idx = profiles.findIndex(p => p.id === profileId);
      if (idx > -1) {
        profiles[idx] = profile;
        saveProfiles(profiles);
      }
      onThemeChange(mode);
      showToast(`Theme updated to ${mode}`);
    });
  });

  // Cloud Auth & Credentials Handlers
  const authBtn = container.querySelector('#btn-cloud-auth-action');
  if (authBtn) {
    authBtn.addEventListener('click', async () => {
      if (getCurrentAuthUser()) {
        if (confirm('Are you sure you want to sign out from Cloud Backup?')) {
          await signOutUser();
          showToast('Signed out of Cloud Account');
          renderSettingsScreen(container, profileId, onSwitchProfile, onThemeChange, showToast);
        }
      } else {
        renderAuthModal(() => {
          showToast('Signed in successfully!');
          renderSettingsScreen(container, profileId, onSwitchProfile, onThemeChange, showToast);
        });
      }
    });
  }

  const saveDbBtn = container.querySelector('#btn-save-supabase-config');
  if (saveDbBtn) {
    saveDbBtn.addEventListener('click', () => {
      const url = container.querySelector('#set-supabase-url').value.trim();
      const key = container.querySelector('#set-supabase-key').value.trim();
      localStorage.setItem('sadhana_supabase_url', url);
      localStorage.setItem('sadhana_supabase_key', key);
      AuthConfig.supabaseUrl = url;
      AuthConfig.supabaseKey = key;
      initAuth();
      showToast('Database configuration saved!');
      renderSettingsScreen(container, profileId, onSwitchProfile, onThemeChange, showToast);
    });
  }

  container.querySelector('#btn-switch-profile').addEventListener('click', onSwitchProfile);

  // Backup Export
  container.querySelector('#btn-export-json').addEventListener('click', () => {
    const jsonStr = exportProfileData(profileId);
    if (jsonStr) {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sadhana_backup_${profile.name}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup JSON downloaded!');
    }
  });

  // Backup Import
  const fileInput = container.querySelector('#file-import-input');
  container.querySelector('#btn-import-json').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const imported = importProfileData(evt.target.result);
        if (imported) {
          showToast('Data imported successfully!');
          onSwitchProfile();
        } else {
          alert('Invalid backup JSON file.');
        }
      };
      reader.readAsText(file);
    }
  });

  // Clear All Data
  container.querySelector('#btn-clear-all').addEventListener('click', () => {
    const confirmStr = prompt('To confirm deleting ALL data, please type "DELETE":');
    if (confirmStr === 'DELETE') {
      clearAllData();
      alert('All local data cleared.');
      window.location.reload();
    }
  });
}
