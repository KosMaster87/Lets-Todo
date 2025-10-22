/**
 * @fileoverview Storage management system
 * @module storage
 */

import { getApiBase, apiHandler } from "./../services/api/api-handler.js";

/**
 * Storage types enum for clear categorization
 */
export const StorageTypes = {
  SESSION: "session", // sessionStorage - lost on browser close
  LOCAL: "local", // localStorage - persistent across sessions
  MEMORY: "memory", // runtime only - lost on page refresh
};

/**
 * Storage keys organized by type and purpose
 */
export const StorageKeys = {
  // SESSION STORAGE - Auth & UI state (temporary)
  SESSION: {
    AUTH_DATA: "todoapp-session-auth",
    UI_STATE: "todoapp-session-ui",
  },

  // LOCAL STORAGE - User preferences & offline data (persistent)
  LOCAL: {
    USER_PREFERENCES: "todoapp-preferences",
    GUEST_TODOS: "todoapp-guest-todos",
    GUEST_TRASH: "todoapp-guest-trash",
    USER_CACHE: "todoapp-user-cache",
  },

  // MEMORY - Temporary runtime state
  MEMORY: {
    NOTIFICATIONS: "notifications",
    UI_STATE: "uiState",
    LOADING: "loading",
  },
};

/**
 * In-memory storage for runtime-only data
 */
const memoryStorage = new Map();

/**
 * Unified Storage Manager with type-safe operations
 */
export const StorageManager = {
  // ==================================================
  // === SESSION STORAGE ===

  /**
   * Save data to sessionStorage (lost on browser close)
   * @param {string} key - Storage key
   * @param {any} data - Data to store
   */
  setSessionData(key, data) {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`❌ Failed to save session data: ${key}`, error);
    }
  },

  /**
   * Load data from sessionStorage
   * @param {string} key - Storage key
   * @returns {any|null} Parsed data or null
   */
  getSessionData(key) {
    try {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`❌ Failed to load session data: ${key}`, error);
      return null;
    }
  },

  // ==================================================
  // === LOCAL STORAGE ===

  /**
   * Save data to localStorage (persistent across sessions)
   * @param {string} key - Storage key
   * @param {any} data - Data to store
   */
  setLocalData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`❌ Failed to save local data: ${key}`, error);
    }
  },

  /**
   * Load data from localStorage
   * @param {string} key - Storage key
   * @returns {any|null} Parsed data or null
   */
  getLocalData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`❌ Failed to load local data: ${key}`, error);
      return null;
    }
  },

  // ==================================================
  // === MEMORY STORAGE ===

  /**
   * Save data to memory (lost on page refresh)
   * @param {string} key - Storage key
   * @param {any} data - Data to store
   */
  setMemoryData(key, data) {
    memoryStorage.set(key, data);
    console.log(`🧠 Memory data saved: ${key}`);
  },

  /**
   * Load data from memory
   * @param {string} key - Storage key
   * @returns {any|undefined} Data or undefined
   */
  getMemoryData(key) {
    return memoryStorage.get(key);
  },

  // ==================================================
  // === UTILITY FUNCTIONS ===

  /**
   * Save data to storage type dynamically based on remember preference
   * @param {boolean} remember - Whether to use persistent storage
   * @param {string} key - Storage key
   * @param {any} data - Data to store
   */
  setAuthData(remember, key, data) {
    const storageType = remember ? StorageTypes.LOCAL : StorageTypes.SESSION;
    console.log(`💾 Saving auth data to ${storageType} storage (remember: ${remember})`);

    if (remember) {
      this.setLocalData(key, data);
    } else {
      this.setSessionData(key, data);
    }
  },

  /**
   * Load auth data from either storage type
   * @param {string} key - Storage key
   * @returns {any|null} Auth data or null
   */
  getAuthData(key) {
    const localData = this.getLocalData(key);
    if (localData) {
      console.log(`🔓 Auth data loaded from localStorage (persistent)`);
      return localData;
    }

    const sessionData = this.getSessionData(key);
    if (sessionData) {
      console.log(`🔓 Auth data loaded from sessionStorage (temporary)`);
      return sessionData;
    }

    return null;
  },

  /**
   * Remove auth data from both storage types
   * @param {string} key - Storage key
   */
  removeAuthData(key) {
    this.removeData(StorageTypes.LOCAL, key);
    this.removeData(StorageTypes.SESSION, key);
    console.log(`🗑️ Auth data removed from both storage types`);
  },

  /**
   * Remove data from specific storage type
   * @param {string} type - Storage type (session|local|memory)
   * @param {string} key - Storage key
   */
  removeData(type, key) {
    try {
      switch (type) {
        case StorageTypes.SESSION:
          sessionStorage.removeItem(key);
          break;
        case StorageTypes.LOCAL:
          localStorage.removeItem(key);
          break;
        case StorageTypes.MEMORY:
          memoryStorage.delete(key);
          break;
      }
    } catch (error) {
      console.error(`❌ Failed to remove ${type} data: ${key}`, error);
    }
  },

  /**
   * Clear all data from specific storage type
   * @param {string} type - Storage type (session|local|memory)
   */
  clearStorage(type) {
    try {
      switch (type) {
        case StorageTypes.SESSION:
          sessionStorage.clear();
          break;
        case StorageTypes.LOCAL:
          localStorage.clear();
          break;
        case StorageTypes.MEMORY:
          memoryStorage.clear();
          break;
      }
    } catch (error) {
      console.error(`❌ Failed to clear ${type} storage`, error);
    }
  },
};

// === HIGH-LEVEL DATA MANAGEMENT FUNCTIONS ===

/**
 * User Preferences Management
 * Handles loading and saving user preferences using the new storage system
 */
export const PreferencesManager = {
  /**
   * Load user preferences from localStorage
   * @param {Object} defaultPreferences - Default preferences to merge with
   * @returns {Object} Loaded preferences object
   */
  load(defaultPreferences = {}) {
    try {
      const savedPrefs = this.loadSavedPreferences();
      return this.processLoadedPreferences(savedPrefs, defaultPreferences);
    } catch (error) {
      console.error("❌ Error loading user preferences:", error);
      return defaultPreferences;
    }
  },

  /**
   * Loads saved preferences from storage
   * @returns {Object|null} Saved preferences or null
   */
  loadSavedPreferences() {
    return StorageManager.getLocalData(StorageKeys.LOCAL.USER_PREFERENCES);
  },

  /**
   * Processes found preferences or returns defaults
   * @param {Object} savedPrefs - Saved preferences or null
   * @param {Object} defaultPrefs - Default preferences
   * @returns {Object} Final preferences
   */
  processLoadedPreferences(savedPrefs, defaultPrefs) {
    if (savedPrefs) {
      return this.mergePreferences(defaultPrefs, savedPrefs);
    } else {
      console.log("ℹ️ No saved preferences found, using defaults");
      return defaultPrefs;
    }
  },

  /**
   * Merges saved preferences with defaults
   * @param {Object} defaultPrefs - Default preferences
   * @param {Object} savedPrefs - Saved preferences
   * @returns {Object} Merged preferences
   */
  mergePreferences: (defaultPrefs, savedPrefs) => ({
    ...defaultPrefs,
    ...savedPrefs,
  }),

  /**
   * Save user preferences to localStorage
   * @param {Object} preferences - Preferences object to save
   */
  save(preferences) {
    try {
      StorageManager.setLocalData(
        StorageKeys.LOCAL.USER_PREFERENCES,
        preferences
      );
    } catch (error) {
      console.error("❌ Error saving user preferences:", error);
    }
  },

  /**
   * Remove all user preferences from localStorage
   */
  clear() {
    try {
      StorageManager.removeData(
        StorageTypes.LOCAL,
        StorageKeys.LOCAL.USER_PREFERENCES
      );
      console.log("✅ User preferences cleared from storage");
    } catch (error) {
      console.error("❌ Error clearing user preferences:", error);
    }
  },

  /**
   * Syncs preferences from server to localStorage for registered users
   * @param {string} sessionType - Current session type ('guest' | 'user')
   * @returns {Promise<Object|null>} Server preferences or null
   */
  async syncFromServer(sessionType) {
    if (!this.requiresServerSync(sessionType)) return null;

    try {
      const response = await this.fetchPreferencesFromServer();
      return this.processServerResponse(response);
    } catch (error) {
      console.error("❌ Error syncing preferences from server:", error);
      return null;
    }
  },

  /**
   * Validates session type for server sync
   * @param {string} sessionType - Current session type
   * @returns {boolean} Whether server sync is needed
   */
  requiresServerSync(sessionType) {
    return sessionType === "user";
  },

  /**
   * Fetches preferences from server
   * @returns {Promise<Object>} Server response
   */
  async fetchPreferencesFromServer() {
    const endpoint = this.createPreferencesEndpoint();
    return await apiHandler(endpoint, "GET");
  },

  /**
   * Processes server response for preferences
   * @param {Object} response - Server response
   * @returns {Object|null} Processed preferences or null
   */
  processServerResponse(response) {
    if (response.success && response.preferences) {
      return this.processServerPreferences(response);
    }
    return this.handleServerSyncFailure(response);
  },

  /**
   * Creates preferences endpoint URL
   * @returns {string} Full API endpoint URL for user preferences
   */
  createPreferencesEndpoint() {
    const API_BASE = getApiBase();
    return `${API_BASE}/user/preferences`;
  },

  /**
   * Processes successful server preferences response
   * @param {Object} response - Server response
   * @returns {Object} Processed preferences
   */
  processServerPreferences(response) {
    const preferences = response.preferences;
    this.save(preferences);
    console.log("✅ Preferences synced from server:", preferences);
    return preferences;
  },

  /**
   * Handles server sync failure
   * @param {Object} response - Failed server response
   * @returns {null}
   */
  handleServerSyncFailure(response) {
    console.warn("⚠️ Server sync failed:", response.message || "Unknown error");
    return null;
  },

  /**
   * Syncs preferences from localStorage to server for registered users
   * @param {Object} preferences - Preferences to sync
   * @param {string} sessionType - Current session type ('guest' | 'user')
   * @returns {Promise<boolean>} Success status
   */
  async syncToServer(preferences, sessionType) {
    if (!this.requiresServerSync(sessionType)) {
      return this.handleGuestSync();
    }

    try {
      const response = await this.sendPreferencesToServer(preferences);
      return this.processSyncToServerResponse(response);
    } catch (error) {
      console.error("❌ Error syncing preferences to server:", error);
      return false;
    }
  },

  /**
   * Handles guest session sync (always successful)
   * @returns {boolean} Success status for guest sessions
   */
  handleGuestSync() {
    console.log("ℹ️ Skipping server sync for guest session");
    return true;
  },

  /**
   * Sends preferences to server via API
   * @param {Object} preferences - Preferences to sync
   * @returns {Promise<Object>} Server response
   */
  async sendPreferencesToServer(preferences) {
    console.log("🔄 Syncing preferences to server...", preferences);
    const endpoint = this.createPreferencesEndpoint();
    return await apiHandler(endpoint, "PUT", preferences);
  },

  /**
   * Processes server sync response
   * @param {Object} response - Server response
   * @returns {boolean} Success status
   */
  processSyncToServerResponse(response) {
    if (response.success) {
      return this.handleSyncToServerSuccess();
    }
    return this.handleSyncToServerFailure(response);
  },

  /**
   * Handles successful server sync
   * @returns {boolean} Success status
   */
  handleSyncToServerSuccess() {
    console.log("✅ Preferences synced to server successfully");
    return true;
  },

  /**
   * Handles server sync failure for syncToServer
   * @param {Object} response - Failed server response
   * @returns {boolean} Failure status
   */
  handleSyncToServerFailure(response) {
    console.warn("⚠️ Server sync failed:", response.message || "Unknown error");
    return false;
  },

  /**
   * Smart sync: Load from server if user, otherwise use localStorage
   * @param {string} sessionType - Current session type ('guest' | 'user')
   * @param {Object} defaultPreferences - Fallback preferences
   * @returns {Promise<Object>} Final preferences object
   */
  async autoSync(sessionType, defaultPreferences = {}) {
    if (this.isUserSession(sessionType)) {
      return await this.handleUserSync(sessionType, defaultPreferences);
    } else {
      return this.load(defaultPreferences);
    }
  },

  /**
   * Checks if user session requires server sync
   * @param {string} sessionType - Current session type
   * @returns {boolean} True if user session
   */
  isUserSession: (sessionType) => sessionType === "user",

  /**
   * Handles preferences sync for user sessions
   * @param {string} sessionType - Current session type
   * @param {Object} defaultPreferences - Fallback preferences
   * @returns {Promise<Object>} User preferences
   */
  async handleUserSync(sessionType, defaultPreferences) {
    const serverPrefs = await this.syncFromServer(sessionType);

    if (serverPrefs) {
      return serverPrefs;
    }

    console.log("🔄 Server sync failed, using localStorage fallback");
    return this.load(defaultPreferences);
  },
};
