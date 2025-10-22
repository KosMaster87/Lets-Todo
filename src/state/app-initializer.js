/**
 * @fileoverview Application Initializer
 * @module app-initializer
 */

import { SessionManager } from "./session-manager.js";
import { PreferencesManager } from "./storage.js";
import { TodosPersistence, TrashPersistence } from "./data-persistence.js";

export const AppInitializer = {
  /**
   * Complete application initialization with async support
   * @param {Object} appState - Application state object
   * @param {Function} notifyListeners - Function to notify state listeners
   * @returns {Promise<void>}
   */
  async initialize(appState, notifyListeners) {
    const loadedData = await this.loadAllData(appState, notifyListeners);

    Object.assign(appState, {
      todos: loadedData.todos,
      trashedTodos: loadedData.trashedTodos,
      userPreferences: loadedData.userPreferences,
    });

    notifyListeners();
    this.applyUserPreferences(appState.userPreferences);
  },

  /**
   * Loads and initializes all application data with smart sync
   * @param {Object} appState - Application state object
   * @param {Function} notifyListeners - Function to notify state listeners
   * @returns {Promise<Object>} Loaded data object
   */
  async loadAllData(appState, notifyListeners) {
    // console.log("🚀 Starting application data initialization...");

    // 1. Load session data first to determine session type
    SessionManager.loadFromStorage(appState, notifyListeners);

    // 2. Load preferences with smart sync based on session type
    const userPreferences = await PreferencesManager.autoSync(
      appState.sessionType,
      appState.userPreferences
    );

    // 3. Load core data using persistence modules
    const loadedData = {
      todos: TodosPersistence.load(appState.sessionType),
      trashedTodos: TrashPersistence.load(appState.sessionType),
      userPreferences: userPreferences,
    };

    // 4. Save preferences to ensure localStorage is up to date
    PreferencesManager.save(loadedData.userPreferences);

    // console.log("✅ Application data initialization complete");
    return loadedData;
  },

  /**
   * Applies user preferences to the application (theme, etc.)
   * @param {Object} userPreferences - User preferences object
   */
  applyUserPreferences(userPreferences) {
    if (userPreferences.theme) {
      document.body.setAttribute("data-theme", userPreferences.theme);
      // console.log(`🎨 Theme applied: ${userPreferences.theme}`);
    }

    if (userPreferences.language) {
      document.documentElement.lang = userPreferences.language;
    }

    // Apply other UI preferences...
  },
};
