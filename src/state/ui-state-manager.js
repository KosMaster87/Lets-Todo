/**
 * @fileoverview UI state management utilities
 * @module ui-state-manager
 */

import { PreferencesManager } from "./storage.js";
import { SessionManager } from "./session-manager.js";
import { DEBUG_MODE } from "./../utils/constants.js";

export const UIStateManager = {
  /**
   * Sets the current view and updates browser history
   * @param {Object} appState - Application state object
   * @param {string} view - View name
   * @param {Function} getCurrentView - Function to get current view
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  setCurrentView: (appState, view, getCurrentView, notifyListeners) => {
    if (appState.currentView !== view) {
      appState.previousView = appState.currentView;
      appState.currentView = view;
      SessionManager.saveToStorage(appState, getCurrentView);
      notifyListeners();
    }
  },

  /**
   * Sets the loading state
   * @param {Object} appState - Application state object
   * @param {boolean} loading - Loading state
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  setLoading: (appState, loading, notifyListeners) => {
    if (appState.loading !== loading) {
      appState.loading = loading;
      notifyListeners();
    }
  },

  /**
   * Sets user preferences and applies them immediately with API sync for registered users
   * @param {Object} appState - Application state object
   * @param {Object} preferences - New preferences
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  setUserPreferences: async (appState, preferences, notifyListeners) => {
    UIStateManager.updatePreferencesState(appState, preferences);
    UIStateManager.applyThemePreference(preferences);
    PreferencesManager.save(appState.userPreferences);

    // Background server sync for registered users
    UIStateManager.handleServerSync(
      appState.userPreferences,
      appState.sessionType
    );

    notifyListeners();
  },

  /**
   * Updates preferences in application state
   * @param {Object} appState - Application state object
   * @param {Object} preferences - New preferences to merge
   */
  updatePreferencesState: (appState, preferences) => {
    appState.userPreferences = {
      ...appState.userPreferences,
      ...preferences,
    };
  },

  /**
   * Applies theme preference to DOM immediately
   * @param {Object} preferences - Preferences object
   */
  applyThemePreference: (preferences) => {
    if (preferences.theme) {
      document.body.setAttribute("data-theme", preferences.theme);
    }
  },

  /**
   * Handles server synchronization for registered users
   * @param {Object} preferences - User preferences to sync
   * @param {string} sessionType - Current session type
   */
  /**
   * Logs server sync status messages
   * @param {string} type - Message type (start, success, warning, error)
   * @param {Error} [error] - Optional error object
   */
  logServerSyncStatus: (type, error = null) => {
    if (!DEBUG_MODE) return;

    const messages = {
      start: "🔄 Auto-syncing preferences to server for registered user",
      success: "✅ Preferences successfully synced to server",
      warning: "⚠️ Preferences saved locally but server sync failed",
      error: "❌ Server sync error (preferences still saved locally):",
    };

    if (type === "error" && error) {
      console.error(messages[type], error);
    } else {
      console.log(messages[type]);
    }
  },

  handleServerSync: async (preferences, sessionType) => {
    if (sessionType !== "user") return;

    UIStateManager.logServerSyncStatus("start");

    try {
      const syncSuccess = await PreferencesManager.syncToServer(
        preferences,
        sessionType
      );

      if (syncSuccess) {
        UIStateManager.logServerSyncStatus("success");
      } else {
        UIStateManager.logServerSyncStatus("warning");
      }
    } catch (error) {
      UIStateManager.logServerSyncStatus("error", error);
    }
  },

  /**
   * Sets the error state and optionally creates a notification
   * @param {Object} appState - Application state object
   * @param {string|null} error - Error message or null to clear
   * @param {Function} addNotification - Function to add notifications
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  setError: (appState, error, addNotification, notifyListeners) => {
    appState.error = error;
    if (error) {
      addNotification({
        type: "error",
        message: error,
      });
    }
    notifyListeners();
  },

  /**
   * Adds a notification to the state
   * @param {Object} appState - Application state object
   * @param {Object} notification - Notification object
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  addNotification: (appState, notification, notifyListeners) => {
    const newNotification =
      UIStateManager.createNotificationObject(notification);
    appState.notifications = [...appState.notifications, newNotification];
    notifyListeners();
  },

  /**
   * Removes a notification from the state
   * @param {Object} appState - Application state object
   * @param {number} notificationId - ID of the notification to remove
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  removeNotification: (appState, notificationId, notifyListeners) => {
    appState.notifications = appState.notifications.filter(
      (notification) => notification.id !== notificationId
    );
    notifyListeners();
  },

  /**
   * Creates default notification object with provided overrides
   * @param {Object} notification - Notification overrides
   * @returns {Object} Complete notification object
   */
  createNotificationObject: (notification) => ({
    id: Date.now(),
    type: "info",
    message: "",
    duration: 3000,
    displayed: false,
    ...notification,
  }),
};
