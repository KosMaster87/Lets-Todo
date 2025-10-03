// src/state/ui-state-manager.js

import { PreferencesManager } from "./storage.js";
import { SessionManager } from "./session-manager.js";

/**
 * UI State Manager
 * Handles all UI-related state management (views, loading, preferences, errors)
 * Extracted from state.js for better modularity
 */

export const UIStateManager = {
  /**
   * Sets the current view and updates browser history
   * @param {Object} appState - Application state object
   * @param {string} view - View name
   * @param {Function} getCurrentView - Function to get current view
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  setCurrentView(appState, view, getCurrentView, notifyListeners) {
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
  setLoading(appState, loading, notifyListeners) {
    if (appState.loading !== loading) {
      appState.loading = loading;
      notifyListeners();
    }
  },

  /**
   * Sets user preferences and applies them immediately
   * @param {Object} appState - Application state object
   * @param {Object} preferences - New preferences
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  setUserPreferences(appState, preferences, notifyListeners) {
    appState.userPreferences = {
      ...appState.userPreferences,
      ...preferences,
    };
    PreferencesManager.save(appState.userPreferences);

    // Apply theme immediately
    if (preferences.theme) {
      document.body.setAttribute("data-theme", preferences.theme);
    }

    notifyListeners();
  },

  /**
   * Sets the error state and optionally creates a notification
   * @param {Object} appState - Application state object
   * @param {string|null} error - Error message or null to clear
   * @param {Function} addNotification - Function to add notifications
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  setError(appState, error, addNotification, notifyListeners) {
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
  addNotification(appState, notification, notifyListeners) {
    const newNotification = {
      id: Date.now(),
      type: "info",
      message: "",
      duration: 3000,
      displayed: false,
      ...notification,
    };
    appState.notifications = [...appState.notifications, newNotification];
    notifyListeners();
  },

  /**
   * Removes a notification from the state
   * @param {Object} appState - Application state object
   * @param {number} notificationId - ID of the notification to remove
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  removeNotification(appState, notificationId, notifyListeners) {
    appState.notifications = appState.notifications.filter(
      (notification) => notification.id !== notificationId
    );
    notifyListeners();
  },
};
