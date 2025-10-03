// lets-todo-app/src/state/app-initializer.js

import { SessionManager } from "./session-manager.js";
import { PreferencesManager } from "./storage.js";
import {
  TodosPersistence,
  TrashPersistence,
  DataMaintenance,
} from "./data-persistence.js";

/**
 * Application Initializer
 * Handles complete app initialization and data loading coordination
 * Extracted from state.js for better separation of concerns
 */

export const AppInitializer = {
  /**
   * Loads and initializes all application data
   * @param {Object} appState - Application state object
   * @param {Function} notifyListeners - Function to notify state listeners
   * @returns {Object} Loaded data object
   */
  loadAllData(appState, notifyListeners) {
    console.log("🚀 Starting application data initialization...");

    // 1. Load core data using persistence modules
    const loadedData = {
      todos: TodosPersistence.load(appState.sessionType),
      trashedTodos: TrashPersistence.load(appState.sessionType),
      userPreferences: PreferencesManager.load(appState.userPreferences),
    };

    // 2. Load session data (this may modify appState.sessionType)
    SessionManager.loadFromStorage(appState, notifyListeners);

    // 3. Re-load todos/trash if session changed during load
    if (appState.sessionType) {
      loadedData.todos = TodosPersistence.load(appState.sessionType);
      loadedData.trashedTodos = TrashPersistence.load(appState.sessionType);
    }

    // 4. Repair any data issues
    const repairResult = DataMaintenance.repairTodos(
      loadedData.todos,
      loadedData.trashedTodos
    );

    if (repairResult.hasChanges) {
      loadedData.todos = repairResult.todos;
      loadedData.trashedTodos = repairResult.trashedTodos;

      // Save repaired data
      TodosPersistence.save(loadedData.todos, appState.sessionType);
      TrashPersistence.save(loadedData.trashedTodos, appState.sessionType);
      console.log("🔧 Todo data repaired - missing IDs added");
    }

    // 5. Save preferences to ensure storage is up to date
    PreferencesManager.save(loadedData.userPreferences);

    console.log("✅ Application data initialization complete");
    return loadedData;
  },

  /**
   * Applies user preferences to the application (theme, etc.)
   * @param {Object} userPreferences - User preferences object
   */
  applyUserPreferences(userPreferences) {
    // Apply theme to DOM
    if (userPreferences.theme) {
      document.body.setAttribute("data-theme", userPreferences.theme);
      console.log(`🎨 Theme applied: ${userPreferences.theme}`);
    }

    // Apply language (if needed in future)
    if (userPreferences.language) {
      document.documentElement.lang = userPreferences.language;
    }

    // Apply other UI preferences...
  },

  /**
   * Complete application initialization
   * @param {Object} appState - Application state object
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  initialize(appState, notifyListeners) {
    // Load all data
    const loadedData = this.loadAllData(appState, notifyListeners);

    // Update app state with loaded data
    Object.assign(appState, {
      todos: loadedData.todos,
      trashedTodos: loadedData.trashedTodos,
      userPreferences: loadedData.userPreferences,
    });

    // Apply user preferences to UI
    this.applyUserPreferences(appState.userPreferences);

    console.log("🎯 Complete application initialization finished");
  },
};
