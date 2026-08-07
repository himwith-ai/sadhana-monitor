/* ==========================================================================
   🪷 SADHANA MONITOR — AUTHENTICATION & SECURITY MODULE (js/auth.js)
   ========================================================================== */

// Default configuration (can be updated dynamically in Settings or window config)
export const AuthConfig = {
  supabaseUrl: window.SADHANA_CONFIG?.SUPABASE_URL || localStorage.getItem('sadhana_supabase_url') || '',
  supabaseKey: window.SADHANA_CONFIG?.SUPABASE_ANON_KEY || localStorage.getItem('sadhana_supabase_key') || ''
};

const SESSION_CACHE_KEY = 'sadhana_session_user';
let supabaseClient = null;
let currentAuthUser = null;

// --------------------------------------------------------------------------
// Persist session user to localStorage for page-reload resilience
// --------------------------------------------------------------------------
function cacheSessionUser(user) {
  if (user) {
    try {
      localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Devotee'
      }));
    } catch (_) {}
  } else {
    localStorage.removeItem(SESSION_CACHE_KEY);
  }
}

export function getCachedSessionUser() {
  try {
    const raw = localStorage.getItem(SESSION_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function clearCachedSession() {
  localStorage.removeItem(SESSION_CACHE_KEY);
  localStorage.removeItem('sadhana_auth_completed');
  currentAuthUser = null;
}

// --------------------------------------------------------------------------
// Initialize Supabase Client
// --------------------------------------------------------------------------
export function initAuth() {
  if (window.supabase && AuthConfig.supabaseUrl && AuthConfig.supabaseKey) {
    try {
      supabaseClient = window.supabase.createClient(AuthConfig.supabaseUrl, AuthConfig.supabaseKey);
      console.log('[Auth] Supabase production client initialized');
    } catch (err) {
      console.warn('[Auth] Failed to initialize Supabase client:', err);
    }
  } else {
    console.log('[Auth] Operating in Offline / Local Profile mode');
  }
}

// --------------------------------------------------------------------------
// Async session resolution — MUST be awaited before routing decisions
// --------------------------------------------------------------------------
export async function getOrRestoreSession() {
  // 1. Try live Supabase session first
  if (supabaseClient) {
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      if (!error && session?.user) {
        currentAuthUser = session.user;
        cacheSessionUser(session.user);
        return session.user;
      }
    } catch (err) {
      console.warn('[Auth] getSession error:', err);
    }
  }
  // 2. Fall back to localStorage cache (covers page refresh while offline)
  const cached = getCachedSessionUser();
  if (cached) {
    currentAuthUser = cached;
    return cached;
  }
  return null;
}

export function isCloudAuthEnabled() {
  return !!supabaseClient;
}

export function getCurrentAuthUser() {
  return currentAuthUser;
}

export async function signUpUser(email, password, displayName) {
  if (!supabaseClient) {
    throw new Error('Cloud database connection not configured. Please configure Supabase URL & Anon Key in Settings.');
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { name: displayName }
    }
  });

  if (error) throw error;
  currentAuthUser = data.user;
  cacheSessionUser(data.user);
  return data.user;
}

export async function signInUser(email, password) {
  if (!supabaseClient) {
    throw new Error('Cloud database connection not configured. Please configure Supabase URL & Anon Key in Settings.');
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  currentAuthUser = data.user;
  cacheSessionUser(data.user);
  return data.user;
}

export async function signOutUser() {
  if (supabaseClient) {
    try { await supabaseClient.auth.signOut(); } catch (_) {}
  }
  clearCachedSession();
}

export async function sendPasswordResetEmail(email) {
  if (!supabaseClient) {
    throw new Error('Cloud database connection not configured. Configure Supabase in Settings.');
  }
  const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${window.location.pathname}#reset-password`
  });
  if (error) throw error;
  return data;
}

export async function updateUserPassword(newPassword) {
  if (!supabaseClient) {
    throw new Error('Cloud database connection not configured.');
  }
  const { data, error } = await supabaseClient.auth.updateUser({
    password: newPassword
  });
  if (error) throw error;
  return data;
}

export function renderAuthModal(onSuccess) {
  const existing = document.querySelector('#auth-modal-backdrop');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.id = 'auth-modal-backdrop';
  backdrop.className = 'modal-backdrop active';

  let mode = 'signin'; // 'signin' | 'signup'

  function updateModalContent() {
    backdrop.innerHTML = `
      <div class="modal-card animate-fade-in-up" style="max-width: 380px;">
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="font-size: 2.2rem; margin-bottom: 4px;">🪷</div>
          <h3 style="font-size: 1.2rem;">${mode === 'signin' ? 'Sign In to Sadhana Cloud' : 'Create Free Account'}</h3>
          <p class="subtitle" style="font-size: 0.8rem;">
            ${mode === 'signin' ? 'Sync your sadhana across all devices securely' : 'Join and back up your spiritual practice'}
          </p>
        </div>

        <form id="auth-form" style="display: flex; flex-direction: column; gap: 12px;">
          ${mode === 'signup' ? `
            <div>
              <label class="form-label">Devotee Name</label>
              <input type="text" id="auth-name" placeholder="e.g. Himanshu Das" required />
            </div>
          ` : ''}

          <div>
            <label class="form-label">Email Address</label>
            <input type="email" id="auth-email" placeholder="devotee@example.com" required />
          </div>

          <div>
            <label class="form-label">Password</label>
            <input type="password" id="auth-pass" placeholder="••••••••" required minlength="6" />
          </div>

          <div id="auth-error-msg" style="font-size: 0.78rem; color: var(--rose); text-align: center; display: none;"></div>

          <button type="submit" class="btn btn-primary" id="btn-auth-submit" style="padding: 12px; margin-top: 4px;">
            ${mode === 'signin' ? 'Sign In 🙏' : 'Create Account 🌸'}
          </button>
        </form>

        <div style="text-align: center; margin-top: 14px; font-size: 0.8rem;">
          <a href="#" id="auth-toggle-mode" style="color: var(--saffron); text-decoration: none; font-weight: 600;">
            ${mode === 'signin' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </a>
        </div>

        <button class="btn btn-secondary" id="auth-modal-close" style="margin-top: 12px; font-size: 0.8rem; padding: 6px;">
          Cancel / Continue Offline
        </button>
      </div>
    `;

    const form = backdrop.querySelector('#auth-form');
    const errEl = backdrop.querySelector('#auth-error-msg');
    const toggleBtn = backdrop.querySelector('#auth-toggle-mode');
    const closeBtn = backdrop.querySelector('#auth-modal-close');

    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      mode = mode === 'signin' ? 'signup' : 'signin';
      updateModalContent();
    });

    closeBtn.addEventListener('click', () => backdrop.remove());

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errEl.style.display = 'none';
      const email = backdrop.querySelector('#auth-email').value.trim();
      const password = backdrop.querySelector('#auth-pass').value;
      const submitBtn = backdrop.querySelector('#btn-auth-submit');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Authenticating...';

      try {
        if (mode === 'signup') {
          const name = backdrop.querySelector('#auth-name').value.trim();
          await signUpUser(email, password, name);
        } else {
          await signInUser(email, password);
        }
        backdrop.remove();
        if (onSuccess) onSuccess();
      } catch (err) {
        errEl.textContent = err.message || 'Authentication failed. Please check credentials.';
        errEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = mode === 'signin' ? 'Sign In 🙏' : 'Create Account 🌸';
      }
    });
  }

  updateModalContent();
  document.querySelector('#app-shell').appendChild(backdrop);
}

// Full Startup Screen Authentication View (Rendered at app start)
export function renderAuthScreen(container, onAuthSuccess, onGuestContinue) {
  let mode = 'signin'; // 'signin' | 'signup' | 'forgot'
  let passwordVisible = false;

  function renderView() {
    let subtitleText = 'Sign in to access your spiritual practice log';
    if (mode === 'signup') subtitleText = 'Register your profile to start tracking sadhana';
    if (mode === 'forgot') subtitleText = 'Enter your registered email to reset password';

    container.innerHTML = `
      <div class="animate-fade-in-up" style="padding: 24px 12px; max-width: 440px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 3.5rem; margin-bottom: 8px;">🪷</div>
          <h2 style="font-size: 1.6rem; font-weight: 800;">Sadhana Monitor</h2>
          <p style="color: var(--saffron); font-weight: 600; font-size: 0.9rem; margin-top: 2px;">"Chant Hare Krishna & Be Happy"</p>
          <p class="subtitle" style="margin-top: 6px; font-size: 0.82rem;">${subtitleText}</p>
        </div>

        <div class="card card-gradient-border" style="padding: 20px;">
          ${mode !== 'forgot' ? `
            <div style="display: flex; background: var(--bg-surface-2); border-radius: var(--radius-md); padding: 4px; margin-bottom: 18px;">
              <button type="button" id="tab-auth-signin" class="btn btn-secondary" style="flex: 1; padding: 8px; font-size: 0.82rem; border: none; background: ${mode === 'signin' ? 'var(--saffron)' : 'transparent'}; color: ${mode === 'signin' ? '#fff' : 'var(--text-secondary)'}; font-weight: 600;">
                🔐 Sign In
              </button>
              <button type="button" id="tab-auth-signup" class="btn btn-secondary" style="flex: 1; padding: 8px; font-size: 0.82rem; border: none; background: ${mode === 'signup' ? 'var(--saffron)' : 'transparent'}; color: ${mode === 'signup' ? '#fff' : 'var(--text-secondary)'}; font-weight: 600;">
                🌸 Register
              </button>
            </div>
          ` : `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <h3 style="font-size: 1.05rem;">🔑 Reset Password</h3>
              <button type="button" class="btn btn-secondary" id="btn-back-to-signin" style="width: auto; padding: 4px 10px; font-size: 0.75rem;">← Back to Sign In</button>
            </div>
          `}

          <div id="scr-auth-info-msg" style="font-size: 0.82rem; color: var(--mint); background: var(--mint-light); padding: 10px; border-radius: var(--radius-md); margin-bottom: 14px; text-align: center; display: none;"></div>

          <form id="screen-auth-form" style="display: flex; flex-direction: column; gap: 14px;">
            ${mode === 'signup' ? `
              <div>
                <label class="form-label">Devotee Display Name *</label>
                <input type="text" id="scr-auth-name" placeholder="e.g. Himanshu" required />
              </div>
            ` : ''}

            <div>
              <label class="form-label">Email Address *</label>
              <input type="email" id="scr-auth-email" placeholder="devotee@example.com" required />
            </div>

            ${mode !== 'forgot' ? `
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <label class="form-label">Password *</label>
                  ${mode === 'signin' ? `<a href="#" id="link-forgot-pass" style="font-size: 0.75rem; color: var(--saffron); text-decoration: none; font-weight: 600;">Forgot Password?</a>` : ''}
                </div>
                <div style="position: relative;">
                  <input type="${passwordVisible ? 'text' : 'password'}" id="scr-auth-pass" placeholder="••••••••" required minlength="6" style="padding-right: 40px;" />
                  <button type="button" id="btn-toggle-pass" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1rem;">
                    ${passwordVisible ? '🙈' : '👁️'}
                  </button>
                </div>
                ${mode === 'signup' ? `<div id="pass-strength" style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">Min 6 characters</div>` : ''}
              </div>
            ` : ''}

            <div id="scr-auth-error-msg" style="font-size: 0.78rem; color: var(--rose); text-align: center; display: none;"></div>

            <button type="submit" class="btn btn-primary" id="btn-scr-auth-submit" style="padding: 14px; margin-top: 6px; box-shadow: 0 4px 15px rgba(232, 115, 10, 0.3);">
              ${mode === 'signin' ? 'Sign In 🙏' : mode === 'signup' ? 'Create Free Account & Start 🌸' : 'Send Password Reset Link 📧'}
            </button>
          </form>

          <div style="margin-top: 16px; border-top: 1px dashed var(--border-light); padding-top: 14px; text-align: center;">
            <button type="button" class="btn btn-secondary" id="btn-scr-auth-guest" style="font-size: 0.8rem; padding: 8px 12px; width: 100%;">
              📱 Continue as Offline Guest Devotee
            </button>
          </div>
        </div>
      </div>
    `;

    if (mode !== 'forgot') {
      container.querySelector('#tab-auth-signin').addEventListener('click', () => {
        mode = 'signin';
        renderView();
      });
      container.querySelector('#tab-auth-signup').addEventListener('click', () => {
        mode = 'signup';
        renderView();
      });
    } else {
      const backBtn = container.querySelector('#btn-back-to-signin');
      if (backBtn) backBtn.addEventListener('click', () => { mode = 'signin'; renderView(); });
    }

    const forgotLink = container.querySelector('#link-forgot-pass');
    if (forgotLink) {
      forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        mode = 'forgot';
        renderView();
      });
    }

    const togglePassBtn = container.querySelector('#btn-toggle-pass');
    if (togglePassBtn) {
      togglePassBtn.addEventListener('click', () => {
        passwordVisible = !passwordVisible;
        const passInp = container.querySelector('#scr-auth-pass');
        if (passInp) passInp.type = passwordVisible ? 'text' : 'password';
        togglePassBtn.textContent = passwordVisible ? '🙈' : '👁️';
      });
    }

    const passInp = container.querySelector('#scr-auth-pass');
    const strengthEl = container.querySelector('#pass-strength');
    if (passInp && strengthEl) {
      passInp.addEventListener('input', () => {
        const val = passInp.value;
        if (val.length < 6) {
          strengthEl.textContent = 'Weak (Min 6 characters)';
          strengthEl.style.color = 'var(--rose)';
        } else if (val.length < 10) {
          strengthEl.textContent = 'Medium strength';
          strengthEl.style.color = 'var(--gold)';
        } else {
          strengthEl.textContent = 'Strong password ✓';
          strengthEl.style.color = 'var(--mint)';
        }
      });
    }

    container.querySelector('#btn-scr-auth-guest').addEventListener('click', () => {
      onGuestContinue();
    });

    const form = container.querySelector('#screen-auth-form');
    const errEl = container.querySelector('#scr-auth-error-msg');
    const infoEl = container.querySelector('#scr-auth-info-msg');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errEl.style.display = 'none';
      if (infoEl) infoEl.style.display = 'none';

      const email = container.querySelector('#scr-auth-email').value.trim();
      const submitBtn = container.querySelector('#btn-scr-auth-submit');

      if (mode === 'forgot') {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending Link...';
        try {
          if (isCloudAuthEnabled()) {
            await sendPasswordResetEmail(email);
          }
          if (infoEl) {
            infoEl.textContent = `📧 Password reset link sent to ${email}. Please check your inbox.`;
            infoEl.style.display = 'block';
          }
          submitBtn.textContent = 'Link Sent ✓';
        } catch (err) {
          errEl.textContent = err.message || 'Failed to send reset link.';
          errEl.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Password Reset Link 📧';
        }
        return;
      }

      const password = container.querySelector('#scr-auth-pass').value;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Authenticating...';

      try {
        if (mode === 'signup') {
          const name = container.querySelector('#scr-auth-name').value.trim();
          let createdUser = null;
          if (isCloudAuthEnabled()) {
            createdUser = await signUpUser(email, password, name);
          }
          if (createdUser && !createdUser.email_confirmed_at && createdUser.identities?.length > 0) {
            if (infoEl) {
              infoEl.textContent = '✉️ Account created! Please check your email to verify your account.';
              infoEl.style.display = 'block';
            }
          }
          onAuthSuccess({ email, name });
        } else {
          if (isCloudAuthEnabled()) {
            await signInUser(email, password);
          }
          onAuthSuccess({ email });
        }
      } catch (err) {
        let msg = err.message || 'Authentication failed. Please check credentials.';
        if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('rate')) {
          msg = '⚠️ Email Rate Limit Exceeded: Supabase default email service limits to 3 emails/hour.\n\n👉 Fix: In your Supabase Dashboard -> Authentication -> Providers -> Email, turn OFF "Confirm Email" for instant sign-ups, or try Signing In directly!';
        }
        errEl.textContent = msg;
        errEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = mode === 'signin' ? 'Sign In 🙏' : 'Create Free Account & Start 🌸';
      }
    });
  }

  renderView();
}

