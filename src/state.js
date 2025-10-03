// lets-todo-app/src/state.js

import { VIEWS } from "./utils/constants.js";
import { createListenerManager } from "./state/listeners.js";

/**
 * Central application state for Let's Todo App
 * @type {Object}
 */
const appState = {
  currentView: VIEWS.MAIN_MENU,
  previousView: null,
  error: null,
  loading: false,
  notifications: [],
  listeners: [], // Reactive listeners array

  // User Session
  sessionType: null, // 'guest' | 'user' | null
  sessionId: null,
  userId: null,
  userEmail: null,

  // Todos
  todos: [],
  trashedTodos: [],
  currentTodo: null,

  // User Preferences
  userPreferences: {
    theme: "light",
    language: "de",
    showNotifications: true,
    autoSave: true,
  },
};

// Create listener manager instance
const listenerManager = createListenerManager(appState);
const {
  addListener,
  removeListener,
  notifyListeners,
  getListenerCount,
  clearAllListeners,
} = listenerManager;

/**
 * Loads todos from LocalStorage (session-aware)
 */
const loadTodosFromStorage = () => {
  try {
    const key = getStorageKey("todos");
    const savedTodos = localStorage.getItem(key);
    if (savedTodos) {
      appState.todos = JSON.parse(savedTodos);
    }
  } catch (error) {
    console.error("Error loading todos:", error);
  }
};

/**
 * Gets the appropriate storage key based on session type
 */
const getStorageKey = (baseKey) => {
  const sessionType = appState.sessionType || "guest";
  return `todoapp-${sessionType}-${baseKey}`;
};

/**
 * Saves todos to LocalStorage (session-aware)
 */
const saveTodosToStorage = () => {
  try {
    const key = getStorageKey("todos");
    localStorage.setItem(key, JSON.stringify(appState.todos));
  } catch (error) {
    console.error("Error saving todos:", error);
  }
};

/**
 * Saves guest data specifically to guest storage
 */
const saveGuestDataToStorage = () => {
  try {
    localStorage.setItem("todoapp-guest-todos", JSON.stringify(appState.todos));
    localStorage.setItem(
      "todoapp-guest-trash",
      JSON.stringify(appState.trashedTodos)
    );
  } catch (error) {
    console.error("Error saving guest data:", error);
  }
};

/**
 * Loads trashed todos from LocalStorage (session-aware)
 */
const loadTrashedTodosFromStorage = () => {
  try {
    const key = getStorageKey("trash");
    const savedTrash = localStorage.getItem(key);
    if (savedTrash) {
      appState.trashedTodos = JSON.parse(savedTrash);
    }
  } catch (error) {
    console.error("Error loading trashed todos:", error);
  }
};

/**
 * Saves trashed todos to LocalStorage (session-aware)
 */
const saveTrashedTodosToStorage = () => {
  try {
    const key = getStorageKey("trash");
    localStorage.setItem(key, JSON.stringify(appState.trashedTodos));
  } catch (error) {
    console.error("Error saving trashed todos:", error);
  }
};

/**
 * Loads all user preferences from LocalStorage.
 */
const loadUserPreferences = () => {
  try {
    const savedPrefs = localStorage.getItem("todoapp-preferences");
    if (savedPrefs) {
      const preferences = JSON.parse(savedPrefs);
      appState.userPreferences = {
        ...appState.userPreferences,
        ...preferences,
      };
    }
  } catch (error) {
    console.error("Error loading user preferences:", error);
  }
};

/**
 * Saves all user preferences to LocalStorage.
 */
const saveUserPreferences = () => {
  try {
    localStorage.setItem(
      "todoapp-preferences",
      JSON.stringify(appState.userPreferences)
    );
  } catch (error) {
    console.error("Error saving user preferences:", error);
  }
};

/**
 * Checks if a view is valid.
 * @param {string} view - View to check
 * @returns {boolean} Is valid
 */
const isValidView = (view) => {
  return Object.values(VIEWS).includes(view);
};

/**
 * Loads session data from LocalStorage.
 */
const loadSessionFromStorage = () => {
  try {
    const savedSession = localStorage.getItem("todoapp-session");
    if (savedSession) {
      const session = JSON.parse(savedSession);

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
};

/**
 * Saves session data to LocalStorage.
 */
const saveSessionToStorage = () => {
  try {
    const sessionData = {
      sessionType: appState.sessionType,
      sessionId: appState.sessionId,
      userId: appState.userId,
      userEmail: appState.userEmail,
      lastView: getCurrentView(),
      timestamp: Date.now(),
    };
    localStorage.setItem("todoapp-session", JSON.stringify(sessionData));
  } catch (error) {
    console.error("Error saving session:", error);
  }
};

/**
 * Repairs todos by adding missing IDs and required fields
 */
const repairTodos = () => {
  let hasChanges = false;

  // Fix todos missing IDs
  appState.todos = appState.todos.map((todo) => {
    if (!todo.id) {
      hasChanges = true;
      return {
        ...todo,
        id: generateId(),
        created: todo.created || new Date().toISOString(),
        lastModified: todo.lastModified || new Date().toISOString(),
      };
    }
    return todo;
  });

  // Fix trashed todos missing IDs
  appState.trashedTodos = appState.trashedTodos.map((todo) => {
    if (!todo.id) {
      hasChanges = true;
      return {
        ...todo,
        id: generateId(),
        created: todo.created || new Date().toISOString(),
        lastModified: todo.lastModified || new Date().toISOString(),
      };
    }
    return todo;
  });

  // Save changes if any repairs were made
  if (hasChanges) {
    saveTodosToStorage();
    saveTrashedTodosToStorage();
    console.log("✅ Todo data repaired - missing IDs added");
  }
};

/**
 * Loads all stored data at app start.
 */
const loadAllStoredData = () => {
  loadTodosFromStorage();
  loadTrashedTodosFromStorage();
  loadUserPreferences();
  loadSessionFromStorage();
  saveUserPreferences();

  // Repair any data issues
  repairTodos();

  if (appState.userPreferences.theme) {
    document.body.setAttribute("data-theme", appState.userPreferences.theme);
  }

  console.log("✅ Stored data loaded successfully");
};

/**
 * Clears all stored data.
 */
export const clearAllStoredData = () => {
  try {
    localStorage.removeItem("todoapp-session");
    localStorage.removeItem("todoapp-todos");
    localStorage.removeItem("todoapp-trash");
    localStorage.removeItem("todoapp-preferences");
    console.log("✅ All stored data cleared");
  } catch (error) {
    console.error("❌ Error clearing stored data:", error);
  }
};

// === GETTER FUNCTIONS ===

/**
 * Returns a copy of the todos.
 * @returns {Array} Copy of todos
 */
export const getTodos = () => [...appState.todos];

/**
 * Returns a copy of the trashed todos.
 * @returns {Array} Copy of trashed todos
 */
export const getTrashedTodos = () => [...appState.trashedTodos];

/**
 * Returns the current todo.
 * @returns {Object|null} Current todo
 */
export const getCurrentTodo = () =>
  appState.currentTodo ? { ...appState.currentTodo } : null;

/**
 * Returns a copy of the notifications.
 * @returns {Array} Copy of notifications
 */
export const getNotifications = () => [...appState.notifications];

/**
 * Returns the user preferences.
 * @returns {Object} User preferences
 */
export const getUserPreferences = () => ({ ...appState.userPreferences });

/**
 * Returns the current view.
 * @returns {string} Current view
 */
export const getCurrentView = () => appState.currentView;

/**
 * Returns the previous view.
 * @returns {string|null} Previous view
 */
export const getPreviousView = () => appState.previousView;

/**
 * Returns the session type.
 * @returns {string|null} Session type
 */
export const getSessionType = () => appState.sessionType;

/**
 * Returns the session ID.
 * @returns {string|null} Session ID
 */
export const getSessionId = () => appState.sessionId;

/**
 * Returns the complete session data.
 * @returns {Object|null} Session object with all session data
 */
export const getSession = () => {
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
};

/**
 * Returns the user ID.
 * @returns {string|null} User ID
 */
export const getUserId = () => appState.userId;

/**
 * Returns the user email.
 * @returns {string|null} User email
 */
export const getUserEmail = () => appState.userEmail;

/**
 * Returns the loading state.
 * @returns {boolean} Loading state
 */
export const isLoading = () => appState.loading;

/**
 * Returns the error state.
 * @returns {string|null} Error message
 */
export const getError = () => appState.error;

// === SETTER FUNCTIONS ===

/**
 * Sets the current view.
 * @param {string} view - View name
 */
export const setCurrentView = (view) => {
  if (appState.currentView !== view) {
    appState.previousView = appState.currentView;
    appState.currentView = view;
    saveSessionToStorage();
    notifyListeners();
  }
};

/**
 * Sets the loading state.
 * @param {boolean} loading - Loading state
 */
export const setLoading = (loading) => {
  if (appState.loading !== loading) {
    appState.loading = loading;
    notifyListeners();
  }
};

/**
 * Sets the session data and reloads session-specific data
 * @param {Object} sessionData - Session data object
 */
export const setSession = (sessionData) => {
  // Store old session type for comparison
  const oldSessionType = appState.sessionType;

  // Update session
  appState.sessionType = sessionData.sessionType || null;
  appState.sessionId = sessionData.sessionId || null;
  appState.userId = sessionData.userId || null;
  appState.userEmail = sessionData.userEmail || null;

  // If session type changed, reload todos and trash for new session
  if (oldSessionType !== appState.sessionType) {
    console.log(
      `🔄 Session changed from ${oldSessionType} to ${appState.sessionType}, reloading data...`
    );
    reloadSessionData();
  }

  saveSessionToStorage();
  notifyListeners();
};

/**
 * Reloads todos and trash data for current session type
 */
const reloadSessionData = () => {
  try {
    // Clear current data
    appState.todos = [];
    appState.trashedTodos = [];

    // Load data for current session
    loadTodosFromStorage();
    loadTrashedTodosFromStorage();

    console.log(`✅ Data reloaded for ${appState.sessionType} session`);
  } catch (error) {
    console.error("❌ Error reloading session data:", error);
  }
};

/**
 * Clears the session data.
 */
export const clearSession = () => {
  appState.sessionType = null;
  appState.sessionId = null;
  appState.userId = null;
  appState.userEmail = null;
  localStorage.removeItem("todoapp-session");
  notifyListeners();
};

/**
 * Complete user logout: clears session AND all user data
 * Restores guest data if it exists, otherwise initializes sample data
 */
export const clearUserData = () => {
  try {
    appState.sessionType = null;
    appState.sessionId = null;
    appState.userId = null;
    appState.userEmail = null;
    appState.notifications = [];
    appState.error = null;
    appState.currentTodo = null;
    localStorage.removeItem("todoapp-session");
    localStorage.removeItem("todoapp-user-todos");
    localStorage.removeItem("todoapp-user-trash");

    restoreGuestData();
    notifyListeners();

    console.log("✅ User logged out, guest data restored");
  } catch (error) {
    console.error("❌ Error during logout:", error);
  }
};

/**
 * Restores guest data or initializes sample data for guest session
 */
const restoreGuestData = () => {
  try {
    // Try to load existing guest data
    const savedGuestTodos = localStorage.getItem("todoapp-guest-todos");
    const savedGuestTrash = localStorage.getItem("todoapp-guest-trash");

    if (savedGuestTodos && savedGuestTrash) {
      // Restore existing guest data
      appState.todos = JSON.parse(savedGuestTodos);
      appState.trashedTodos = JSON.parse(savedGuestTrash);
      console.log("✅ Guest data restored from storage");
    } else {
      // No guest data exists, initialize with sample data
      appState.todos = [];
      appState.trashedTodos = [];

      // Initialize sample data (will be imported when needed)
      console.log("✅ Fresh guest session initialized");
    }

    // Update localStorage with current state
    saveGuestDataToStorage();
  } catch (error) {
    console.error("❌ Error restoring guest data:", error);
    // Fallback: empty state
    appState.todos = [];
    appState.trashedTodos = [];
  }
};

/**
 * Sets the todos.
 * @param {Array} todos - New todos array
 */
export const setTodos = (todos) => {
  appState.todos = [...todos];
  saveTodosToStorage();
  notifyListeners();
};

/**
 * Sets the trashed todos.
 * @param {Array} trashedTodos - New trashed todos array
 */
export const setTrashedTodos = (trashedTodos) => {
  appState.trashedTodos = [...trashedTodos];
  saveTrashedTodosToStorage();
  notifyListeners();
};

/**
 * Generates a unique ID
 * @returns {string} Unique ID
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Adds a todo (with server sync for users)
 * @param {Object} todo - Todo object
 */
export const addTodo = async (todo) => {
  // Ensure todo has an ID
  const todoWithId = {
    ...todo,
    id: todo.id || generateId(),
    created: todo.created || new Date().toISOString(),
    lastModified: todo.lastModified || new Date().toISOString(),
  };

  // Add to local state first
  appState.todos = [...appState.todos, todoWithId];
  saveTodosToStorage();
  notifyListeners();

  // Sync to server if user session
  if (appState.sessionType === "user") {
    try {
      const { saveTodoToServer } = await import("./services/api-todos.js");
      const serverResponse = await saveTodoToServer(todoWithId);

      // Update local todo with server ID
      if (serverResponse && serverResponse.id) {
        const todoIndex = appState.todos.findIndex(
          (t) => t.id === todoWithId.id
        );
        if (todoIndex !== -1) {
          appState.todos[todoIndex].id = serverResponse.id;
          saveTodosToStorage();
          notifyListeners();
          console.log(`✅ Todo synced to server with ID: ${serverResponse.id}`);
        }
      }
    } catch (error) {
      console.warn("⚠️ Failed to sync todo to server:", error);
      // Todo is still saved locally
    }
  }
};

/**
 * Updates an existing todo (with server sync for users)
 * @param {string} todoId - Todo ID to update
 * @param {Object} updates - Todo updates
 */
export const updateTodo = async (todoId, updates) => {
  // Update locally first
  appState.todos = appState.todos.map((todo) =>
    todo.id === todoId ? { ...todo, ...updates } : todo
  );
  saveTodosToStorage();
  notifyListeners();

  // Sync to server if user session
  if (appState.sessionType === "user") {
    try {
      const { updateTodoOnServer } = await import("./services/api-todos.js");
      const updatedTodo = appState.todos.find((t) => t.id === todoId);
      if (updatedTodo) {
        await updateTodoOnServer(todoId, updatedTodo);
        console.log("✅ Todo updated on server");
      }
    } catch (error) {
      console.warn("⚠️ Failed to sync update to server:", error);
      // Todo is still updated locally
    }
  }
};

/**
 * Removes a todo.
 * @param {string} todoId - Todo ID to remove
 */
export const removeTodo = (todoId) => {
  appState.todos = appState.todos.filter((todo) => todo.id !== todoId);
  saveTodosToStorage();
  notifyListeners();
};

/**
 * Sets the current todo.
 * @param {Object|null} todo - Current todo
 */
export const setCurrentTodo = (todo) => {
  appState.currentTodo = todo;
  notifyListeners();
};

/**
 * Moves a todo to trash (with server sync for users)
 * @param {string} todoId - Todo ID to trash
 */
export const trashTodo = async (todoId) => {
  console.log(`🔍 trashTodo called with ID: ${todoId}, type: ${typeof todoId}`);

  // Convert todoId to number if it's a string (handles both number and string IDs)
  const numericId = typeof todoId === "string" ? parseInt(todoId, 10) : todoId;
  console.log(`🔄 Converted ID: ${numericId}, type: ${typeof numericId}`);

  const todo = appState.todos.find((t) => t.id == todoId || t.id === numericId);
  console.log(`🔎 Found todo:`, todo);
  if (todo) {
    // Move to trash locally first
    appState.todos = appState.todos.filter(
      (t) => t.id != todoId && t.id !== numericId
    );
    appState.trashedTodos = [
      ...appState.trashedTodos,
      { ...todo, trashedAt: Date.now() },
    ];
    saveTodosToStorage();
    saveTrashedTodosToStorage();
    console.log(
      `🗑️ Todo ${todoId} moved to trash, notifying ${appState.listeners.length} listeners`
    );
    notifyListeners();

    // Sync to server if user session
    if (appState.sessionType === "user") {
      try {
        const { trashTodoOnServer } = await import("./services/api-todos.js");
        await trashTodoOnServer(numericId);
        console.log("✅ Todo trashed on server");
      } catch (error) {
        console.warn("⚠️ Failed to sync trash to server:", error);
        // Todo is still trashed locally
      }
    }
  }
};

/**
 * Restores a todo from trash (with server sync for users)
 * @param {string} todoId - Todo ID to restore
 */
export const restoreTodo = async (todoId) => {
  console.log(
    `🔍 restoreTodo called with ID: ${todoId}, type: ${typeof todoId}`
  );

  // Convert todoId to handle both string and number types
  const numericId = typeof todoId === "string" ? parseInt(todoId, 10) : todoId;

  const todo = appState.trashedTodos.find(
    (t) => t.id == todoId || t.id === numericId
  );
  console.log(`🔎 Found trashed todo:`, todo);
  if (todo) {
    // Restore locally first
    appState.trashedTodos = appState.trashedTodos.filter(
      (t) => t.id != todoId && t.id !== numericId
    );
    appState.todos = [...appState.todos, { ...todo, trashedAt: undefined }];
    saveTodosToStorage();
    saveTrashedTodosToStorage();
    notifyListeners();

    // Sync to server if user session
    if (appState.sessionType === "user") {
      try {
        const { restoreTodoOnServer } = await import("./services/api-todos.js");
        await restoreTodoOnServer(numericId);
        console.log("✅ Todo restored on server");
      } catch (error) {
        console.warn("⚠️ Failed to sync restore to server:", error);
        // Todo is still restored locally
      }
    }
  }
};

/**
 * Permanently deletes a todo from trash (with server sync for users)
 * @param {string} todoId - Todo ID to delete permanently
 */
export const deleteTodo = async (todoId) => {
  console.log(
    `🔍 deleteTodo called with ID: ${todoId}, type: ${typeof todoId}`
  );

  // Convert todoId to handle both string and number types
  const numericId = typeof todoId === "string" ? parseInt(todoId, 10) : todoId;

  // Delete locally first
  appState.trashedTodos = appState.trashedTodos.filter(
    (t) => t.id != todoId && t.id !== numericId
  );
  saveTrashedTodosToStorage();
  notifyListeners();

  // Sync to server if user session
  if (appState.sessionType === "user") {
    console.log(`🌐 Attempting to delete todo ${numericId} on server...`);
    try {
      const { deleteTodoFromServer } = await import("./services/api-todos.js");
      const result = await deleteTodoFromServer(numericId);
      console.log("✅ Todo deleted on server:", result);
    } catch (error) {
      console.error("❌ Failed to sync delete to server:", error);
      // Todo is still deleted locally
    }
  } else {
    console.log("👤 Guest session - no server sync needed");
  }
};

/**
 * Permanently deletes a todo from trash.
 * @param {string} todoId - Todo ID to delete permanently
 */
export const deleteTodoPermanently = (todoId) => {
  console.log(
    `🔍 deleteTodoPermanently called with ID: ${todoId}, type: ${typeof todoId}`
  );

  // Convert todoId to handle both string and number types
  const numericId = typeof todoId === "string" ? parseInt(todoId, 10) : todoId;

  appState.trashedTodos = appState.trashedTodos.filter(
    (t) => t.id != todoId && t.id !== numericId
  );
  saveTrashedTodosToStorage();
  notifyListeners();
};

/**
 * Empties the entire trash by deleting all trashed todos permanently.
 */
export const emptyTrash = async () => {
  console.log(`🗑️ Emptying trash with ${appState.trashedTodos.length} todos`);

  // For user sessions, delete each todo on server before emptying locally
  if (appState.sessionType === "user" && appState.trashedTodos.length > 0) {
    console.log("🌐 Deleting all trash todos on server...");

    try {
      const { deleteTodoFromServer } = await import("./services/api-todos.js");

      // Delete all trashed todos on server
      const deletePromises = appState.trashedTodos.map((todo) => {
        const numericId =
          typeof todo.id === "string" ? parseInt(todo.id, 10) : todo.id;
        return deleteTodoFromServer(numericId);
      });

      await Promise.all(deletePromises);
      console.log(
        `✅ All ${appState.trashedTodos.length} trash todos deleted on server`
      );
    } catch (error) {
      console.error("❌ Failed to delete some todos on server:", error);
      // Continue with local empty anyway
    }
  } else {
    console.log("👤 Guest session or empty trash - no server sync needed");
  }

  // Empty locally
  appState.trashedTodos = [];
  saveTrashedTodosToStorage();
  notifyListeners();
};

/**
 * Sets user preferences.
 * @param {Object} preferences - New preferences
 */
export const setUserPreferences = (preferences) => {
  appState.userPreferences = {
    ...appState.userPreferences,
    ...preferences,
  };
  saveUserPreferences();

  // Apply theme immediately
  if (preferences.theme) {
    document.body.setAttribute("data-theme", preferences.theme);
  }

  notifyListeners();
};

/**
 * Adds a notification.
 * @param {Object} notification - Notification object
 */
export const addNotification = (notification) => {
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
};

/**
 * Removes a notification.
 * @param {number} notificationId - ID of the notification to remove
 */
export const removeNotification = (notificationId) => {
  appState.notifications = appState.notifications.filter(
    (notification) => notification.id !== notificationId
  );
  notifyListeners();
};

/**
 * Sets the error state.
 * @param {string|null} error - Error message or null to clear
 */
export const setError = (error) => {
  appState.error = error;
  if (error) {
    addNotification({
      type: "error",
      message: error,
    });
  }
  notifyListeners();
};

// === LISTENER FUNCTIONS (using modular system) ===
// Listeners are now managed by the listener manager created above

/**
 * Exports the central application state and relevant functions.
 */
export {
  appState,
  loadTodosFromStorage,
  saveTodosToStorage,
  loadTrashedTodosFromStorage,
  saveTrashedTodosToStorage,
  loadUserPreferences,
  saveUserPreferences,
  saveSessionToStorage,
  loadAllStoredData,
  notifyListeners,
  reloadSessionData,
  // Listener functions from modular system
  addListener,
  removeListener,
  getListenerCount,
  clearAllListeners,
};

// Initialize on load
if (typeof window !== "undefined") {
  window.addEventListener("load", loadAllStoredData);
}
