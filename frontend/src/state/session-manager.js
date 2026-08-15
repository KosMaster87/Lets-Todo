/**
 * @fileoverview Session Management System
 * @description Manages user sessions, including loading, saving, and clearing session data.
 * @module session-manager
 */

import { SessionPersistence, TodosPersistence, TrashPersistence } from "./data-persistence.js";
import { StorageManager } from "./storage.js";
import { VIEWS } from "./../utils/constants.js";
import { debugLog } from "./../utils/logger.js";

/**
 * Validates if a view is valid
 * @param {string} view - View to check
 * @returns {boolean} Is valid
 */
const isValidView = (view) => {
  return Object.values(VIEWS).includes(view);
};

export const SessionManager = {
  /**
   * Loads session data from storage and applies it to app state
   * @param {Object} appState - Application state object to update
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  loadFromStorage(appState, notifyListeners) {
    try {
      const session = SessionPersistence.load();
      if (!session) return;

      this.applySessionToState(appState, session);
      this.applyLastViewIfValid(appState, session);
      notifyListeners();
    } catch (error) {
      console.error("Error loading session:", error);
    }
  },

  /**
   * Applies session data to app state
   * @param {Object} appState - Application state object to update
   * @param {Object} session - Session data from storage
   */
  applySessionToState(appState, session) {
    Object.assign(appState, {
      sessionType: session.sessionType || null,
      sessionId: session.sessionId || null,
      userId: session.userId || null,
      userEmail: session.userEmail || null,
    });
  },

  /**
   * Applies last view from session if valid
   * @param {Object} appState - Application state object
   * @param {Object} session - Session data from storage
   */
  applyLastViewIfValid(appState, session) {
    if (session.lastView && isValidView(session.lastView)) {
      appState.currentView = session.lastView;
    }
  },

  /**
   * Saves current session data to storage
   * @param {Object} appState - Application state object
   * @param {Function} getCurrentView - Function to get current view
   * @param {boolean} [remember] - Whether to use persistent storage (auto-detect if not provided)
   */
  saveToStorage(appState, getCurrentView, remember) {
    try {
      if (!appState.sessionType) return;

      const sessionData = this.createSessionData(appState, getCurrentView);
      SessionPersistence.save(sessionData);
    } catch (error) {
      console.error("Error saving session:", error);
    }
  },

  /**
   * Creates session data object from app state
   * @param {Object} appState - Application state object
   * @param {Function} getCurrentView - Function to get current view
   * @returns {Object} Session data object
   */
  createSessionData(appState, getCurrentView) {
    return {
      sessionType: appState.sessionType,
      sessionId: appState.sessionId,
      userId: appState.userId,
      userEmail: appState.userEmail,
      lastView: getCurrentView(),
      timestamp: Date.now(),
    };
  },

  /**
   * Sets session data and reloads session-specific data
   * @param {Object} appState - Application state object
   * @param {Object} sessionData - Session data to set
   * @param {Function} notifyListeners - Function to notify listeners
   * @param {Function} getCurrentView - Function to get current view
   */
  setSession(appState, sessionData, notifyListeners, getCurrentView) {
    const oldSessionType = this.updateSessionState(appState, sessionData);
    this.handleSessionTypeChange(appState, oldSessionType);
    this.saveToStorage(appState, getCurrentView);
    notifyListeners();
  },

  /**
   * Updates app state with session data
   * @param {Object} appState - Application state object
   * @param {Object} sessionData - Session data to apply
   * @returns {string} Previous session type
   */
  updateSessionState(appState, sessionData) {
    const oldSessionType = appState.sessionType;

    appState.sessionType = sessionData.sessionType || null;
    appState.sessionId = sessionData.sessionId || null;
    appState.userId = sessionData.userId || null;
    appState.userEmail = sessionData.userEmail || null;

    return oldSessionType;
  },

  /**
   * Handles session type change by reloading data if needed
   * @param {Object} appState - Application state object
   * @param {string} oldSessionType - Previous session type
   */
  handleSessionTypeChange(appState, oldSessionType) {
    if (oldSessionType !== appState.sessionType) {
      this.reloadSessionData(appState);
    }
  },

  /**
   * Reloads todos and trash data for current session type
   * @param {Object} appState - Application state object
   */
  reloadSessionData(appState) {
    try {
      appState.todos = [];
      appState.trashedTodos = [];
      appState.todos = TodosPersistence.load(appState.sessionType);
      appState.trashedTodos = TrashPersistence.load(appState.sessionType);

      // console.log(`Data reloaded for ${appState.sessionType} session`);
    } catch (error) {
      console.error("Error reloading session data:", error);
    }
  },

  /**
   * Clears the session data
   * @param {Object} appState - Application state object
   * @param {Function} notifyListeners - Function to notify listeners
   */
  clearSession(appState, notifyListeners) {
    appState.sessionType = null;
    appState.sessionId = null;
    appState.userId = null;
    appState.userEmail = null;
    SessionPersistence.clear();
    notifyListeners();
  },

  /**
   * Complete user logout: clears session AND all user data
   * Restores guest data if it exists, otherwise initializes sample data
   * @param {Object} appState - Application state object
   * @param {Function} notifyListeners - Function to notify listeners
   */
  clearUserData(appState, notifyListeners) {
    try {
      this.performCompleteLogout(appState, notifyListeners);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  },

  /**
   * Resets all user-related app state properties to null/empty
   * @param {Object} appState - Application state object
   */
  resetUserAppState(appState) {
    appState.sessionType = null;
    appState.sessionId = null;
    appState.userId = null;
    appState.userEmail = null;
    appState.notifications = [];
    appState.error = null;
    appState.currentTodo = null;
  },

  /**
   * Performs complete user logout with data cleanup and guest restoration
   * @param {Object} appState - Application state object
   * @param {Function} notifyListeners - Function to notify listeners
   */
  performCompleteLogout(appState, notifyListeners) {
    this.clearUserDataFromStorage();
    this.resetUserAppState(appState);
    SessionPersistence.clear();
    this.restoreGuestData(appState);
    notifyListeners();

    debugLog("User logged out, user data cleared, guest data restored");
  },

  /**
   * Clears all user-specific data from localStorage
   */
  clearUserDataFromStorage() {
    try {
      StorageManager.removeData("local", "todoapp-user-todos");
      StorageManager.removeData("local", "todoapp-user-trash");

      debugLog("User data cleared from localStorage");
    } catch (error) {
      console.error("Error clearing user data from storage:", error);
    }
  },

  /**
   * Restores guest data or initializes sample data for guest session
   * @param {Object} appState - Application state object
   */
  restoreGuestData(appState) {
    try {
      const guestData = TodosPersistence.loadGuestData();
      this.applyGuestDataToState(appState, guestData);
      TodosPersistence.saveGuestData(appState.todos, appState.trashedTodos);
    } catch (error) {
      console.error("Error restoring guest data:", error);
      appState.todos = [];
      appState.trashedTodos = [];
    }
  },

  /**
   * Applies guest data to app state and logs result
   * @param {Object} appState - Application state object
   * @param {Object} guestData - Guest data from storage
   */
  applyGuestDataToState(appState, guestData) {
    if (this.hasExistingGuestData(guestData)) {
      appState.todos = guestData.todos;
      appState.trashedTodos = guestData.trashedTodos;
      debugLog("Guest data restored from storage");
    } else {
      appState.todos = [];
      appState.trashedTodos = [];
      debugLog("Fresh guest session initialized");
    }
  },

  /**
   * Checks if guest data contains any todos or trashed todos
   * @param {Object} guestData - Guest data from storage
   * @returns {boolean} Whether guest data exists
   */
  hasExistingGuestData(guestData) {
    return guestData.todos.length > 0 || guestData.trashedTodos.length > 0;
  },

  /**
   * Creates a session object from current state
   * @param {Object} appState - Application state object
   * @returns {Object|null} Session object or null
   */
  getSession(appState) {
    if (!appState.sessionType) {
      return null;
    }

    return {
      sessionType: appState.sessionType,
      sessionId: appState.sessionId,
      userId: appState.userId,
      userData: {
        email: appState.userEmail,
        username: appState.userEmail ? appState.userEmail.split("@")[0] : null,
      },
    };
  },
};
