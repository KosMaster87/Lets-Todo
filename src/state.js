// lets-todo-app/src/state.js

import { VIEWS } from "./utils/constants.js";

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

/**
 * Notifies all listeners about state changes.
 * The "listener" parameter refers to the function to be called.
 */
const notifyListeners = () => {
  appState.listeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      console.error("Error in state listener:", error);
    }
  });
};

/**
 * Loads todos from LocalStorage.
 */
const loadTodosFromStorage = () => {
  try {
    const savedTodos = localStorage.getItem("todoapp-todos");
    if (savedTodos) {
      appState.todos = JSON.parse(savedTodos);
    }
  } catch (error) {
    console.error("Error loading todos:", error);
  }
};

/**
 * Saves todos to LocalStorage.
 */
const saveTodosToStorage = () => {
  try {
    localStorage.setItem("todoapp-todos", JSON.stringify(appState.todos));
  } catch (error) {
    console.error("Error saving todos:", error);
  }
};

/**
 * Loads trashed todos from LocalStorage.
 */
const loadTrashedTodosFromStorage = () => {
  try {
    const savedTrash = localStorage.getItem("todoapp-trash");
    if (savedTrash) {
      appState.trashedTodos = JSON.parse(savedTrash);
    }
  } catch (error) {
    console.error("Error loading trashed todos:", error);
  }
};

/**
 * Saves trashed todos to LocalStorage.
 */
const saveTrashedTodosToStorage = () => {
  try {
    localStorage.setItem(
      "todoapp-trash",
      JSON.stringify(appState.trashedTodos)
    );
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
 * Checks if a view is valid (for session restore).
 * @param {string} view - View name
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
 * Loads all stored data at app start.
 */
const loadAllStoredData = () => {
  loadTodosFromStorage();
  loadTrashedTodosFromStorage();
  loadUserPreferences();
  loadSessionFromStorage();
  saveUserPreferences();

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
 * Sets the session data.
 * @param {Object} sessionData - Session data object
 */
export const setSession = (sessionData) => {
  appState.sessionType = sessionData.sessionType || null;
  appState.sessionId = sessionData.sessionId || null;
  appState.userId = sessionData.userId || null;
  appState.userEmail = sessionData.userEmail || null;
  saveSessionToStorage();
  notifyListeners();
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
 * Sets the todos.
 * @param {Array} todos - New todos array
 */
export const setTodos = (todos) => {
  appState.todos = [...todos];
  saveTodosToStorage();
  notifyListeners();
};

/**
 * Adds a todo.
 * @param {Object} todo - Todo object
 */
export const addTodo = (todo) => {
  appState.todos = [...appState.todos, todo];
  saveTodosToStorage();
  notifyListeners();
};

/**
 * Updates a todo.
 * @param {string} todoId - Todo ID
 * @param {Object} updates - Todo updates
 */
export const updateTodo = (todoId, updates) => {
  appState.todos = appState.todos.map((todo) =>
    todo.id === todoId ? { ...todo, ...updates } : todo
  );
  saveTodosToStorage();
  notifyListeners();
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
 * Moves a todo to trash.
 * @param {string} todoId - Todo ID to trash
 */
export const trashTodo = (todoId) => {
  const todo = appState.todos.find((t) => t.id === todoId);
  if (todo) {
    appState.todos = appState.todos.filter((t) => t.id !== todoId);
    appState.trashedTodos = [
      ...appState.trashedTodos,
      { ...todo, trashedAt: Date.now() },
    ];
    saveTodosToStorage();
    saveTrashedTodosToStorage();
    notifyListeners();
  }
};

/**
 * Restores a todo from trash.
 * @param {string} todoId - Todo ID to restore
 */
export const restoreTodo = (todoId) => {
  const todo = appState.trashedTodos.find((t) => t.id === todoId);
  if (todo) {
    appState.trashedTodos = appState.trashedTodos.filter(
      (t) => t.id !== todoId
    );
    const { trashedAt, ...restoredTodo } = todo;
    appState.todos = [...appState.todos, restoredTodo];
    saveTodosToStorage();
    saveTrashedTodosToStorage();
    notifyListeners();
  }
};

/**
 * Permanently deletes a todo from trash.
 * @param {string} todoId - Todo ID to delete permanently
 */
export const deleteTodoPermanently = (todoId) => {
  appState.trashedTodos = appState.trashedTodos.filter((t) => t.id !== todoId);
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
};
