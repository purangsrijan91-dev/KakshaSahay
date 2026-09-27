/**
 * KakshaSahay - Centralized Classroom Storage & Vault Service
 * Provides robust localStorage isolation, legacy key migration,
 * data export for teacher offline handoffs, and scoped state resets.
 */
'use strict';

const STORAGE_PREFIX = 'kakshasahay_';
const LEGACY_PREFIX = 'vidyasetu_';

const KNOWN_KEYS = {
  ROSTER: 'kakshasahay_roster',
  LANG: 'kakshasahay_lang',
  STATE: 'kakshasahay_classroom_state',
  LEVEL: 'kakshasahay_ability_level',
  WEEKLY: 'kakshasahay_weekly_metrics',
  VAULT: 'kakshasahay_enc_vault_v1'
};

const LEGACY_KEY_MAPPING = {
  'vidyasetu_roster': 'kakshasahay_roster',
  'vidyasetu_lang': 'kakshasahay_lang',
  'vidyasetu_classroom_state': 'kakshasahay_classroom_state',
  'vidyasetu_ability_level': 'kakshasahay_ability_level',
  'vidyasetu_weekly_metrics': 'kakshasahay_weekly_metrics',
  'vidyasetu_enc_vault_v1': 'kakshasahay_enc_vault_v1'
};

/**
 * Automatically migrates any legacy VidyaSetu keys to KakshaSahay namespace
 * @returns {number} Count of migrated keys
 */
function migrateLegacyKeys() {
  if (typeof localStorage === 'undefined') return 0;
  let migratedCount = 0;

  try {
    for (const [oldKey, newKey] of Object.entries(LEGACY_KEY_MAPPING)) {
      const oldVal = localStorage.getItem(oldKey);
      if (oldVal !== null) {
        // If new key doesn't exist yet, copy it over
        if (localStorage.getItem(newKey) === null) {
          localStorage.setItem(newKey, oldVal);
        }
        localStorage.removeItem(oldKey);
        migratedCount++;
      }
    }
  } catch (err) {
    console.warn('[StorageService] Legacy migration warning:', err);
  }

  return migratedCount;
}

/**
 * Retrieves an item from localStorage
 * @param {string} key 
 * @param {*} defaultValue 
 * @returns {*}
 */
function getItem(key, defaultValue = null) {
  if (typeof localStorage === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  } catch (err) {
    console.warn(`[StorageService] Error reading key ${key}:`, err);
    return defaultValue;
  }
}

/**
 * Stores an item in localStorage
 * @param {string} key 
 * @param {*} value 
 * @returns {boolean}
 */
function setItem(key, value) {
  if (typeof localStorage === 'undefined') return false;
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    console.warn(`[StorageService] Error setting key ${key}:`, err);
    return false;
  }
}

/**
 * Removes a specific key
 * @param {string} key 
 */
function removeItem(key) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[StorageService] Error removing key ${key}:`, err);
  }
}

/**
 * Safely clears ONLY KakshaSahay application data.
 * NEVER deletes unrelated host application keys or third-party cookies.
 * @returns {number} Number of keys cleared
 */
function clearAllClassroomData() {
  if (typeof localStorage === 'undefined') return 0;
  const keysToRemove = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(STORAGE_PREFIX) || key.startsWith(LEGACY_PREFIX))) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (err) {
    console.warn('[StorageService] Error clearing classroom data:', err);
  }

  return keysToRemove.length;
}

/**
 * Exports all active classroom state and rosters into a clean JSON structure
 * suitable for offline teacher records and peer-handoffs.
 * @returns {string} Formatted JSON payload
 */
function exportClassroomData() {
  const exportPayload = {
    app: 'KakshaSahay',
    version: '1.2.0',
    exportTimestamp: new Date().toISOString(),
    classroomState: getItem(KNOWN_KEYS.STATE, {}),
    roster: getItem(KNOWN_KEYS.ROSTER, []),
    abilityLevel: getItem(KNOWN_KEYS.LEVEL, 'beginner'),
    weeklyMetrics: getItem(KNOWN_KEYS.WEEKLY, {}),
    languagePreference: getItem(KNOWN_KEYS.LANG, 'hi')
  };

  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Measures current storage usage in bytes and entry counts
 * @returns {{ entryCount: number, approximateBytes: number }}
 */
function getStorageUsage() {
  if (typeof localStorage === 'undefined') return { entryCount: 0, approximateBytes: 0 };
  let count = 0;
  let bytes = 0;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(STORAGE_PREFIX) || key.startsWith(LEGACY_PREFIX))) {
        count++;
        const val = localStorage.getItem(key) || '';
        bytes += (key.length + val.length) * 2; // Approximate UTF-16 size
      }
    }
  } catch (e) {
    console.warn('[StorageService] Error computing storage usage:', e);
  }

  return { entryCount: count, approximateBytes: bytes };
}

const StorageService = {
  KNOWN_KEYS,
  STORAGE_PREFIX,
  LEGACY_PREFIX,
  migrateLegacyKeys,
  getItem,
  setItem,
  removeItem,
  clearAllClassroomData,
  exportClassroomData,
  getStorageUsage
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageService;
}
if (typeof window !== 'undefined') {
  window.StorageService = StorageService;
}
