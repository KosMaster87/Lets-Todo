// lets-todo-app/src/state/session-manager.js

import {
  SessionPersistence,
  TodosPersistence,
  TrashPersistence,
} from "./data-persistence.js";
import { StorageManager } from "./storage.js";
import { VIEWS } from "./../utils/constants.js";

/**
 * Session Manager
 * Handles all session-related operations and state management
 * Extracted from state.js for better modularity
 */

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
      if (session) {
        Object.assign(appState, {
          sessionType: session.sessionType || null,
          sessionId: session.sessionId || null,
          userId: session.userId || null,
          userEmail: session.userEmail || null,
        });

        if (session.lastView && isValidView(session.lastView)) {
          appState.currentView = session.lastView;
        }

        notifyListeners();
      }
    } catch (error) {
      console.error("Error loading session:", error);
    }
  },

  /**
   * Saves current session data to storage
   * @param {Object} appState - Application state object
   * @param {Function} getCurrentView - Function to get current view
   */
  saveToStorage(appState, getCurrentView) {
    try {
      if (!appState.sessionType) {
        return;
      }

      const sessionData = {
        sessionType: appState.sessionType,
        sessionId: appState.sessionId,
        userId: appState.userId,
        userEmail: appState.userEmail,
        lastView: getCurrentView(),
        timestamp: Date.now(),
      };
      SessionPersistence.save(sessionData);
    } catch (error) {
      console.error("Error saving session:", error);
    }
  },

  /**
   * Sets session data and reloads session-specific data
   * @param {Object} appState - Application state object
   * @param {Object} sessionData - Session data to set
   * @param {Function} notifyListeners - Function to notify listeners
   * @param {Function} getCurrentView - Function to get current view
   */
  setSession(appState, sessionData, notifyListeners, getCurrentView) {
    const oldSessionType = appState.sessionType;

    appState.sessionType = sessionData.sessionType || null;
    appState.sessionId = sessionData.sessionId || null;
    appState.userId = sessionData.userId || null;
    appState.userEmail = sessionData.userEmail || null;

    if (oldSessionType !== appState.sessionType) {
      // console.log(
      //   `🔄 Session changed from ${oldSessionType} to ${appState.sessionType}, reloading data...`
      // );
      this.reloadSessionData(appState);
    }

    this.saveToStorage(appState, getCurrentView);
    notifyListeners();
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

      // console.log(`✅ Data reloaded for ${appState.sessionType} session`);
    } catch (error) {
      console.error("❌ Error reloading session data:", error);
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
      // Clear user data from localStorage before resetting app state
      this.clearUserDataFromStorage();

      appState.sessionType = null;
      appState.sessionId = null;
      appState.userId = null;
      appState.userEmail = null;
      appState.notifications = [];
      appState.error = null;
      appState.currentTodo = null;

      SessionPersistence.clear();

      this.restoreGuestData(appState);
      notifyListeners();

      console.log("✅ User logged out, user data cleared, guest data restored");
    } catch (error) {
      console.error("❌ Error during logout:", error);
    }
  },

  /**
   * Clears all user-specific data from localStorage
   */
  clearUserDataFromStorage() {
    try {
      // Clear user todos and trash from localStorage
      StorageManager.removeData("local", "todoapp-user-todos");
      StorageManager.removeData("local", "todoapp-user-trash");

      console.log("🧹 User data cleared from localStorage");
    } catch (error) {
      console.error("❌ Error clearing user data from storage:", error);
    }
  },

  /**
   * Restores guest data or initializes sample data for guest session
   * @param {Object} appState - Application state object
   */
  restoreGuestData(appState) {
    try {
      const guestData = TodosPersistence.loadGuestData();

      if (guestData.todos.length > 0 || guestData.trashedTodos.length > 0) {
        appState.todos = guestData.todos;
        appState.trashedTodos = guestData.trashedTodos;
        console.log("✅ Guest data restored from storage");
      } else {
        appState.todos = [];
        appState.trashedTodos = [];
        console.log("✅ Fresh guest session initialized");
      }

      // Update storage with current state
      TodosPersistence.saveGuestData(appState.todos, appState.trashedTodos);
    } catch (error) {
      console.error("❌ Error restoring guest data:", error);
      // Fallback: empty state
      appState.todos = [];
      appState.trashedTodos = [];
    }
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
