/* ==========================================================================
   🪷 SADHANA MONITOR — AUTHENTICATION & SECURITY MODULE (js/auth.js)
   ========================================================================== */

// Default configuration (can be updated dynamically in Settings or window config)
export const AuthConfig = {
  supabaseUrl: window.SADHANA_CONFIG?.SUPABASE_URL || localStorage.getItem('sadhana_supabase_url') || '',
  supabaseKey: window.SADHANA_CONFIG?.SUPABASE_ANON_KEY || localStorage.getItem('sadhana_supabase_key') || ''
};

let supabaseClient = null;
let currentAuthUser = null;

// Initialize Supabase Client if credentials exist
export function initAuth() {
  if (window.supabase && AuthConfig.supabaseUrl && AuthConfig.supabaseKey) {
    try {
      supabaseClient = window.supabase.createClient(AuthConfig.supabaseUrl, AuthConfig.supabaseKey);
      console.log('[Auth] Supabase production client initialized');
      checkSession();
    } catch (err) {
      console.warn('[Auth] Failed to initialize Supabase client:', err);
    }
  } else {
    console.log('[Auth] Operating in Offline / Local Profile mode (configure Supabase in Settings for cloud auth)');
  }
}

export function isCloudAuthEnabled() {
  return !!supabaseClient;
}

export function getCurrentAuthUser() {
  return currentAuthUser;
}

export async function checkSession() {
  if (!supabaseClient) return null;
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    if (session) {
      currentAuthUser = session.user;
      return session.user;
    }
  } catch (err) {
    console.error('[Auth] Error checking auth session:', err);
  }
  return null;
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
  return data.user;
}

export async function signOutUser() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  currentAuthUser = null;
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
