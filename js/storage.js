/* ==========================================================================
   🪷 SADHANA MONITOR — STORAGE DATA LAYER (js/storage.js)
   ========================================================================== */

const STORAGE_VERSION = 1;
const PREFIX = 'sadhana_';

// --------------------------------------------------------------------------
// 1. Safe localStorage Helpers & Versioning
// --------------------------------------------------------------------------
export function safeGet(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`[Storage] Read error for key '${key}':`, err);
    return defaultValue;
  }
}

export function safeSet(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[Storage] Write error for key '${key}':`, err);
    return false;
  }
}

export function safeRemove(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch (err) {
    console.error(`[Storage] Remove error for key '${key}':`, err);
  }
}

// Run schema migrations on boot
export function initStorage() {
  const currentVersion = safeGet('version', 0);
  if (currentVersion < STORAGE_VERSION) {
    console.log(`[Storage] Migrating schema from v${currentVersion} to v${STORAGE_VERSION}...`);
    // Migration logic if needed in future versions
    safeSet('version', STORAGE_VERSION);
  }
}

// --------------------------------------------------------------------------
// 2. Profiles Management
// --------------------------------------------------------------------------
export function getProfiles() {
  return safeGet('profiles', []);
}

export function saveProfiles(profiles) {
  return safeSet('profiles', profiles);
}

export function getActiveProfileId() {
  return safeGet('active_profile_id', null);
}

export function setActiveProfileId(id) {
  return safeSet('active_profile_id', id);
}

export function getProfile(id) {
  const profiles = getProfiles();
  return profiles.find(p => p.id === id) || null;
}

export function createProfile(profileData) {
  const profiles = getProfiles();
  const newProfile = {
    id: `profile_${Date.now()}`,
    name: profileData.name || 'Devotee',
    initiatedName: profileData.initiatedName || '',
    guruName: profileData.guruName || '',
    role: profileData.role || 'devotee', // 'devotee' | 'counsellor'
    menteeIds: profileData.menteeIds || [],
    avatarType: profileData.avatarType || 'preset', // 'preset' | 'male' | 'female' | 'custom_image'
    avatarPreset: profileData.avatarPreset || '🪷',
    avatarData: profileData.avatarData || '', // Base64 data URL if custom photo
    theme: profileData.theme || 'auto', // 'auto' | 'light' | 'dark'
    createdAt: new Date().toISOString()
  };
  profiles.push(newProfile);
  saveProfiles(profiles);

  // Set default goals
  saveGoals(newProfile.id, {
    profileId: newProfile.id,
    chanting: 16,
    hearing: 60,
    reading: 30,
    shlokaPerWeek: 1
  });

  return newProfile;
}

// --------------------------------------------------------------------------
// 3. Indexed Entry Management (Optimized for performance)
// --------------------------------------------------------------------------
function getEntryIndex(profileId) {
  return safeGet(`entry_index_${profileId}`, []);
}

function updateEntryIndex(profileId, dateStr) {
  const index = getEntryIndex(profileId);
  if (!index.includes(dateStr)) {
    index.push(dateStr);
    index.sort(); // keep chronological
    safeSet(`entry_index_${profileId}`, index);
  }
}

export function getEntry(profileId, dateStr) {
  if (!profileId || !dateStr) return null;
  return safeGet(`entry_${profileId}_${dateStr}`, null);
}

export function saveEntry(entry) {
  if (!entry || !entry.profileId || !entry.date) return false;
  entry.lastModified = new Date().toISOString();
  const key = `entry_${entry.profileId}_${entry.date}`;
  const success = safeSet(key, entry);
  if (success) {
    updateEntryIndex(entry.profileId, entry.date);
    // Clear draft if it exists
    clearDraft(entry.profileId, entry.date);
  }
  return success;
}

export function getAllEntries(profileId) {
  const index = getEntryIndex(profileId);
  return index.map(dateStr => getEntry(profileId, dateStr)).filter(Boolean);
}

export function getEntriesInRange(profileId, startDateStr, endDateStr) {
  const index = getEntryIndex(profileId);
  const filteredDates = index.filter(d => d >= startDateStr && d <= endDateStr);
  return filteredDates.map(dateStr => getEntry(profileId, dateStr)).filter(Boolean);
}

// --------------------------------------------------------------------------
// 4. Draft Auto-Save
// --------------------------------------------------------------------------
export function saveDraft(profileId, dateStr, draftData) {
  return safeSet(`draft_${profileId}_${dateStr}`, draftData);
}

export function getDraft(profileId, dateStr) {
  return safeGet(`draft_${profileId}_${dateStr}`, null);
}

export function clearDraft(profileId, dateStr) {
  safeRemove(`draft_${profileId}_${dateStr}`);
}

// --------------------------------------------------------------------------
// 5. Goals & Settings
// --------------------------------------------------------------------------
export function getGoals(profileId) {
  return safeGet(`goals_${profileId}`, {
    profileId,
    chanting: 16,
    hearing: 60,
    reading: 30,
    shlokaPerWeek: 1
  });
}

export function saveGoals(profileId, goals) {
  return safeSet(`goals_${profileId}`, goals);
}

// --------------------------------------------------------------------------
// 6. Custom Activities & Shlokas
// --------------------------------------------------------------------------
export function getCustomActivities(profileId) {
  return safeGet(`custom_act_${profileId}`, []);
}

export function saveCustomActivities(profileId, activities) {
  return safeSet(`custom_act_${profileId}`, activities);
}

export function getUserShlokas(profileId) {
  return safeGet(`shlokas_${profileId}`, []);
}

export function saveUserShlokas(profileId, shlokas) {
  return safeSet(`shlokas_${profileId}`, shlokas);
}

// --------------------------------------------------------------------------
// 7. Counsellor Notes & Favorites
// --------------------------------------------------------------------------
export function getCounsellorNotes(counsellorId, menteeId) {
  return safeGet(`c_notes_${counsellorId}_${menteeId}`, '');
}

export function saveCounsellorNotes(counsellorId, menteeId, text) {
  return safeSet(`c_notes_${counsellorId}_${menteeId}`, text);
}

export function getFavoriteQuotes(profileId) {
  return safeGet(`fav_quotes_${profileId}`, []);
}

export function toggleFavoriteQuote(profileId, quoteId) {
  const favs = getFavoriteQuotes(profileId);
  const index = favs.indexOf(quoteId);
  if (index > -1) {
    favs.splice(index, 1);
  } else {
    favs.push(quoteId);
  }
  safeSet(`fav_quotes_${profileId}`, favs);
  return favs.includes(quoteId);
}

// --------------------------------------------------------------------------
// 8. Export, Import & Reset
// --------------------------------------------------------------------------
export function exportProfileData(profileId) {
  const profile = getProfile(profileId);
  if (!profile) return null;

  const data = {
    profile,
    goals: getGoals(profileId),
    entries: getAllEntries(profileId),
    customActivities: getCustomActivities(profileId),
    userShlokas: getUserShlokas(profileId),
    favoriteQuotes: getFavoriteQuotes(profileId),
    exportedAt: new Date().toISOString(),
    version: STORAGE_VERSION
  };

  return JSON.stringify(data, null, 2);
}

export function importProfileData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data.profile || !data.profile.id) {
      throw new Error('Invalid profile data schema');
    }

    // Save profile
    const profiles = getProfiles();
    const existingIdx = profiles.findIndex(p => p.id === data.profile.id);
    if (existingIdx > -1) {
      profiles[existingIdx] = data.profile;
    } else {
      profiles.push(data.profile);
    }
    saveProfiles(profiles);

    // Save goals
    if (data.goals) saveGoals(data.profile.id, data.goals);
    
    // Save entries
    if (Array.isArray(data.entries)) {
      data.entries.forEach(entry => saveEntry(entry));
    }

    if (Array.isArray(data.customActivities)) {
      saveCustomActivities(data.profile.id, data.customActivities);
    }

    if (Array.isArray(data.userShlokas)) {
      saveUserShlokas(data.profile.id, data.userShlokas);
    }

    return data.profile;
  } catch (err) {
    console.error('[Storage] Import failed:', err);
    return null;
  }
}

export function clearAllData() {
  try {
    localStorage.clear();
    return true;
  } catch (err) {
    console.error('[Storage] Clear error:', err);
    return false;
  }
}
