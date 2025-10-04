// lets-todo-app/src/state/data-persistence.js

import { StorageManager, StorageKeys } from "./storage.js";

/**
 * Data Persistence Manager
 * Handles all storage operations for todos, trash, and session data
 * Extracted from state.js for better modularity
 */

/**
 * Gets the appropriate storage key based on session type
 * @param {string} baseKey - Base key name
 * @param {string} sessionType - Session type ('guest' | 'user' | null)
 * @returns {string} Complete storage key
 */
const getStorageKey = (baseKey, sessionType) => {
  const type = sessionType || "guest";
  return `todoapp-${type}-${baseKey}`;
};

/**
 * Todos Persistence Functions
 */
export const TodosPersistence = {
  /**
   * Loads todos from storage (session-aware) using StorageManager
   * @param {string} sessionType - Current session type
   * @returns {Array} Array of todos or empty array
   */
  load(sessionType) {
    try {
      const key = getStorageKey("todos", sessionType);
      const savedTodos = StorageManager.getLocalData(key);
      return savedTodos || [];
    } catch (error) {
      console.error("Error loading todos:", error);
      return [];
    }
  },

  /**
   * Saves todos to storage (session-aware) using StorageManager
   * @param {Array} todos - Todos array to save
   * @param {string} sessionType - Current session type
   */
  save(todos, sessionType) {
    try {
      const key = getStorageKey("todos", sessionType);
      StorageManager.setLocalData(key, todos);
    } catch (error) {
      console.error("Error saving todos:", error);
    }
  },

  /**
   * Saves guest data specifically to guest storage
   * @param {Array} todos - Guest todos
   * @param {Array} trashedTodos - Guest trashed todos
   */
  saveGuestData(todos, trashedTodos) {
    try {
      StorageManager.setLocalData(StorageKeys.LOCAL.GUEST_TODOS, todos);
      StorageManager.setLocalData(StorageKeys.LOCAL.GUEST_TRASH, trashedTodos);
    } catch (error) {
      console.error("Error saving guest data:", error);
    }
  },

  /**
   * Loads guest data from storage
   * @returns {Object} Object with todos and trashedTodos arrays
   */
  loadGuestData() {
    try {
      const savedGuestTodos = StorageManager.getLocalData(
        StorageKeys.LOCAL.GUEST_TODOS
      );
      const savedGuestTrash = StorageManager.getLocalData(
        StorageKeys.LOCAL.GUEST_TRASH
      );

      return {
        todos: savedGuestTodos || [],
        trashedTodos: savedGuestTrash || [],
      };
    } catch (error) {
      console.error("Error loading guest data:", error);
      return {
        todos: [],
        trashedTodos: [],
      };
    }
  },
};

/**
 * Trash Persistence Functions
 */
export const TrashPersistence = {
  /**
   * Loads trashed todos from storage (session-aware) using StorageManager
   * @param {string} sessionType - Current session type
   * @returns {Array} Array of trashed todos or empty array
   */
  load(sessionType) {
    try {
      const key = getStorageKey("trash", sessionType);
      const savedTrash = StorageManager.getLocalData(key);
      return savedTrash || [];
    } catch (error) {
      console.error("Error loading trashed todos:", error);
      return [];
    }
  },

  /**
   * Saves trashed todos to storage (session-aware) using StorageManager
   * @param {Array} trashedTodos - Trashed todos array to save
   * @param {string} sessionType - Current session type
   */
  save(trashedTodos, sessionType) {
    try {
      const key = getStorageKey("trash", sessionType);
      StorageManager.setLocalData(key, trashedTodos);
    } catch (error) {
      console.error("Error saving trashed todos:", error);
    }
  },
};

/**
 * Session Persistence Functions
 */
export const SessionPersistence = {
  /**
   * Loads session data using StorageManager
   * @returns {Object|null} Session object or null
   */
  load() {
    try {
      const session = StorageManager.getSessionData(
        StorageKeys.SESSION.AUTH_DATA
      );
      return session;
    } catch (error) {
      console.error("Error loading session:", error);
      return null;
    }
  },

  /**
   * Saves session data using StorageManager
   * @param {Object} sessionData - Session data to save
   */
  save(sessionData) {
    try {
      StorageManager.setSessionData(StorageKeys.SESSION.AUTH_DATA, sessionData);
    } catch (error) {
      console.error("Error saving session:", error);
    }
  },

  /**
   * Removes session data from storage
   */
  clear() {
    try {
      StorageManager.removeData("session", StorageKeys.SESSION.AUTH_DATA);
    } catch (error) {
      console.error("Error clearing session:", error);
    }
  },
};
