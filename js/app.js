/* ==========================================================================
   🪷 SADHANA MONITOR — MAIN APPLICATION ENGINE (js/app.js)
   ========================================================================== */

import { initStorage, getProfiles, getActiveProfileId, setActiveProfileId, getProfile } from './storage.js';
import { initAuth, isCloudAuthEnabled, getCurrentAuthUser, renderAuthModal, renderAuthScreen, signOutUser, getOrRestoreSession, getCachedSessionUser } from './auth.js';
import { renderProfileSelectScreen, renderOnboardingWizard, renderAvatarHTML } from './profiles.js';
import { renderHomeScreen, getGreeting } from './home.js';
import { renderEntryScreen } from './entry.js';
import { renderAnalyticsScreen } from './analytics.js';
import { renderCounsellorScreen } from './counsellor.js';
import { renderSettingsScreen } from './settings.js';

export const App = {
  state: {
    activeProfileId: null,
    currentScreen: 'home',
    selectedEntryDate: new Date().toISOString().split('T')[0]
  },

  async init() {
    initStorage();
    initAuth();
    this.registerServiceWorker();
    this.applyTheme();
    this.bindEvents();

    // Bug Fix: Await session resolution BEFORE making any routing decisions.
    // initAuth() only creates the client; the actual session check is async.
    const authUser = await getOrRestoreSession();
    const profiles = getProfiles();
    const activeId = getActiveProfileId();

    const isCloud = isCloudAuthEnabled();

    if (isCloud && !authUser) {
      // Cloud mode + no session = must sign in
      this.navigateTo('auth');
    } else if (profiles.length === 0) {
      // Authenticated but no profile yet = go to onboarding
      this.navigateTo('onboarding');
    } else if (!activeId || !getProfile(activeId)) {
      this.navigateTo('profile-select');
    } else {
      this.state.activeProfileId = activeId;
      this.navigateTo('home');
    }
  },

  registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => console.log('[PWA] Service Worker registered:', reg.scope))
          .catch(err => console.warn('[PWA] Service Worker registration failed:', err));
      });
    }
  },

  applyTheme(overrideMode) {
    const profile = this.state.activeProfileId ? getProfile(this.state.activeProfileId) : null;
    const mode = overrideMode || profile?.theme || 'auto';

    let isDark = false;
    if (mode === 'dark') {
      isDark = true;
    } else if (mode === 'light') {
      isDark = false;
    } else {
      // Auto theme: before 6 AM or after 8 PM -> dark theme
      const hrs = new Date().getHours();
      isDark = hrs < 6 || hrs >= 20;
    }

    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  },

  showToast(message) {
    const container = document.querySelector('#toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>🪷</span> <div>${message}</div>`;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  },

  showCelebrationOverlay(score) {
    const overlay = document.querySelector('#celebration-overlay');
    const scoreNumEl = document.querySelector('#cel-score-num');
    if (!overlay || !scoreNumEl) return;

    scoreNumEl.textContent = score;
    overlay.classList.add('active');

    // Auto dismiss after 2.5 seconds or on click
    const dismiss = () => {
      overlay.classList.remove('active');
      overlay.removeEventListener('click', dismiss);
    };
    overlay.addEventListener('click', dismiss);
    setTimeout(dismiss, 2600);
  },

  updateHeader() {
    const header = document.querySelector('#top-header');
    const profile = getProfile(this.state.activeProfileId);

    if (!header || !profile || ['auth', 'profile-select', 'onboarding'].includes(this.state.currentScreen)) {
      if (header) header.style.display = 'none';
      return;
    }

    header.style.display = 'flex';
    const avatarEl = header.querySelector('#header-avatar');
    const nameEl = header.querySelector('#header-user-name');
    const subEl = header.querySelector('#header-user-sub');

    if (avatarEl) {
      avatarEl.innerHTML = renderAvatarHTML(profile);
      avatarEl.style.overflow = 'hidden';
    }
    if (nameEl) nameEl.textContent = profile.initiatedName || profile.name;
    if (subEl) subEl.textContent = getGreeting(profile.name);
  },

  updateBottomNav() {
    const nav = document.querySelector('#bottom-nav');
    const profile = getProfile(this.state.activeProfileId);

    if (!nav || ['auth', 'profile-select', 'onboarding'].includes(this.state.currentScreen)) {
      if (nav) nav.style.display = 'none';
      return;
    }

    nav.style.display = 'flex';

    // Show/hide Counsellor tab dynamically based on role
    const counsellorTab = nav.querySelector('[data-screen="counsellor"]');
    if (counsellorTab) {
      counsellorTab.style.display = profile?.role === 'counsellor' ? 'flex' : 'none';
    }

    // Active Tab Highlight
    nav.querySelectorAll('.nav-item').forEach(item => {
      const screen = item.dataset.screen;
      item.classList.toggle('active', screen === this.state.currentScreen);
    });
  },

  navigateTo(screenName, dateParam, prefillData) {
    this.state.currentScreen = screenName;
    if (dateParam) this.state.selectedEntryDate = dateParam;
    if (prefillData) this.state.onboardingPrefill = prefillData;

    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));

    const targetScreen = document.querySelector(`#screen-${screenName}`);
    if (targetScreen) targetScreen.classList.add('active');

    this.updateHeader();
    this.updateBottomNav();
    this.applyTheme();

    // Render screen contents
    switch (screenName) {
      case 'auth':
        renderAuthScreen(
          document.querySelector('#screen-auth'),
          // onAuthSuccess: called after sign-in OR register
          (userData) => {
            const profiles = getProfiles();
            const activeId = getActiveProfileId();
            if (profiles.length === 0) {
              // New user: go to onboarding, pre-fill name from registration
              this.navigateTo('onboarding', null, userData);
            } else if (!activeId || !getProfile(activeId)) {
              this.navigateTo('profile-select');
            } else {
              this.state.activeProfileId = activeId;
              this.navigateTo('home');
            }
          },
          // onGuestContinue: offline mode
          () => {
            const profiles = getProfiles();
            const activeId = getActiveProfileId();
            if (profiles.length === 0) {
              this.navigateTo('onboarding');
            } else if (!activeId || !getProfile(activeId)) {
              this.navigateTo('profile-select');
            } else {
              this.state.activeProfileId = activeId;
              this.navigateTo('home');
            }
          }
        );
        break;

      case 'profile-select':
        renderProfileSelectScreen(
          document.querySelector('#screen-profile-select'),
          (id) => {
            this.state.activeProfileId = id;
            this.navigateTo('home');
          },
          () => this.navigateTo('onboarding')
        );
        break;

      case 'onboarding':
        renderOnboardingWizard(
          document.querySelector('#screen-onboarding'),
          (id) => {
            this.state.activeProfileId = id;
            this.navigateTo('home');
          },
          this.state.onboardingPrefill || {}
        );
        this.state.onboardingPrefill = null; // clear after use
        break;

      case 'home':
        renderHomeScreen(
          document.querySelector('#screen-home'),
          this.state.activeProfileId,
          (date) => this.navigateTo('entry', date)
        );
        break;

      case 'entry':
        renderEntryScreen(
          document.querySelector('#screen-entry'),
          this.state.activeProfileId,
          this.state.selectedEntryDate,
          (score) => {
            this.showCelebrationOverlay(score);
            setTimeout(() => this.navigateTo('home'), 1800);
          }
        );
        break;

      case 'analytics':
        renderAnalyticsScreen(
          document.querySelector('#screen-analytics'),
          this.state.activeProfileId
        );
        break;

      case 'counsellor':
        renderCounsellorScreen(
          document.querySelector('#screen-counsellor'),
          this.state.activeProfileId,
          (msg) => this.showToast(msg)
        );
        break;

      case 'settings':
        renderSettingsScreen(
          document.querySelector('#screen-settings'),
          this.state.activeProfileId,
          () => this.navigateTo('profile-select'),
          (mode) => this.applyTheme(mode),
          (msg) => this.showToast(msg)
        );
        break;
    }
  },

  bindEvents() {
    // Bottom Nav clicks
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const screen = item.dataset.screen;
        this.navigateTo(screen);
      });
    });

    // Header Avatar click -> switch profile
    const avatarEl = document.querySelector('#header-avatar');
    if (avatarEl) {
      avatarEl.addEventListener('click', () => this.navigateTo('profile-select'));
    }

    // Header Logout button -> Sign Out & Lock App
    const logoutBtn = document.querySelector('#header-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        if (confirm('Sign out and return to Login screen?')) {
          await signOutUser();
          this.showToast('Signed out successfully');
          this.navigateTo('auth');
        }
      });
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal-backdrop.active');
        if (activeModal) activeModal.remove();
      }
      // Quick tabs 1-5
      if (['1', '2', '3', '4', '5'].includes(e.key) && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        const screenMap = { '1': 'home', '2': 'entry', '3': 'analytics', '4': 'counsellor', '5': 'settings' };
        this.navigateTo(screenMap[e.key]);
      }
    });
  }
};

// Auto boot on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => App.init());
