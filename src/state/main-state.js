/**
 * @fileoverview Central application state management for Let's Todo App
 * @description Manages the global state, session, todos, UI state, and provides
 * reactive listener support.
 * @module main-state
 */

import { VIEWS } from "./../utils/constants.js";
import { createListenerManager } from "./listeners.js";
import { SessionManager } from "./session-manager.js";
import { TodoOperations } from "./todo-operations.js";
import { UIStateManager } from "./ui-state-manager.js";
import { AppInitializer } from "./app-initializer.js";

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
    language: "en",
    showNotifications: true,
    autoSave: true,
  },
};

const listenerManager = createListenerManager(appState);
const {
  addListener,
  removeListener,
  notifyListeners,
  getListenerCount,
  clearAllListeners,
} = listenerManager;

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
 * Returns the complete session data using SessionManager.
 * @returns {Object|null} Session object with all session data
 */
export const getSession = () => SessionManager.getSession(appState);

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

// === UI STATE MANAGEMENT (Delegated to UIStateManager) ===

/**
 * Sets the current view.
 * @param {string} view - View name
 */
export const setCurrentView = (view) => {
  UIStateManager.setCurrentView(
    appState,
    view,
    getCurrentView,
    notifyListeners
  );
};

/**
 * Sets the loading state.
 * @param {boolean} loading - Loading state
 */
export const setLoading = (loading) => {
  UIStateManager.setLoading(appState, loading, notifyListeners);
};

/**
 * Sets user preferences using UIStateManager with async API sync support.
 * @param {Object} preferences - New preferences
 * @returns {Promise<void>}
 */
export const setUserPreferences = async (preferences) => {
  await UIStateManager.setUserPreferences(
    appState,
    preferences,
    notifyListeners
  );
};

/**
 * Sets the error state.
 * @param {string|null} error - Error message or null to clear
 */
export const setError = (error) => {
  UIStateManager.setError(appState, error, addNotification, notifyListeners);
};

// === SESSION MANAGEMENT (Delegated to SessionManager) ===

/**
 * Sets the session data and reloads session-specific data
 * @param {Object} sessionData - Session data object
 */
export const setSession = (sessionData) => {
  SessionManager.setSession(
    appState,
    sessionData,
    notifyListeners,
    getCurrentView
  );
};

/**
 * Clears the session data.
 */
export const clearSession = () => {
  SessionManager.clearSession(appState, notifyListeners);
};

/**
 * Complete user logout: clears session AND all user data
 */
export const clearUserData = () => {
  SessionManager.clearUserData(appState, notifyListeners);
};

/**
 * Saves current session data to storage
 * Legacy export for compatibility with existing code
 */
export const saveSessionToStorage = () => {
  SessionManager.saveToStorage(appState, getCurrentView);
};

// === TODO OPERATIONS (Delegated to TodoOperations) ===

/**
 * Adds a todo (with server sync for users)
 * @param {Object} todo - Todo object
 */
export const addTodo = async (todo) => {
  await TodoOperations.add(appState, todo, notifyListeners);
};

/**
 * Updates an existing todo (with server sync for users)
 * @param {string} todoId - Todo ID to update
 * @param {Object} updates - Todo updates
 */
export const updateTodo = async (todoId, updates) => {
  await TodoOperations.update(appState, todoId, updates, notifyListeners);
};

/**
 * Removes a todo.
 * @param {string} todoId - Todo ID to remove
 */
export const removeTodo = (todoId) => {
  TodoOperations.remove(appState, todoId, notifyListeners);
};

/**
 * Sets the current todo.
 * @param {Object|null} todo - Current todo
 */
export const setCurrentTodo = (todo) => {
  TodoOperations.setCurrentTodo(appState, todo, notifyListeners);
};

/**
 * Moves a todo to trash (with server sync for users)
 * @param {string} todoId - Todo ID to trash
 */
export const trashTodo = async (todoId) => {
  await TodoOperations.trash(appState, todoId, notifyListeners);
};

/**
 * Restores a todo from trash (with server sync for users)
 * @param {string} todoId - Todo ID to restore
 */
export const restoreTodo = async (todoId) => {
  await TodoOperations.restore(appState, todoId, notifyListeners);
};

/**
 * Permanently deletes a todo from trash (with server sync for users)
 * @param {string} todoId - Todo ID to delete permanently
 */
export const deleteTodo = async (todoId) => {
  await TodoOperations.delete(appState, todoId, notifyListeners);
};

/**
 * Empties the entire trash by deleting all trashed todos permanently.
 */
export const emptyTrash = async () => {
  await TodoOperations.emptyTrash(appState, notifyListeners);
};

/**
 * Sets the todos.
 * @param {Array} todos - New todos array
 */
export const setTodos = (todos) => {
  TodoOperations.setTodos(appState, todos, notifyListeners);
};

/**
 * Sets the trashed todos.
 * @param {Array} trashedTodos - New trashed todos array
 */
export const setTrashedTodos = (trashedTodos) => {
  TodoOperations.setTrashedTodos(appState, trashedTodos, notifyListeners);
};

// === NOTIFICATION MANAGEMENT (Delegated to UIStateManager) ===

/**
 * Adds a notification.
 * @param {Object} notification - Notification object
 */
export const addNotification = (notification) => {
  UIStateManager.addNotification(appState, notification, notifyListeners);
};

/**
 * Removes a notification.
 * @param {number} notificationId - ID of the notification to remove
 */
export const removeNotification = (notificationId) => {
  UIStateManager.removeNotification(appState, notificationId, notifyListeners);
};

// === DATA PERSISTENCE (Delegated to DataPersistence) ===

/**
 * Initializes all stored data with async API sync support (called explicitly from app.js)
 * @returns {Promise<void>}
 */
export const initializeStoredData = async () => {
  await AppInitializer.initialize(appState, notifyListeners);
};

/**
 * Re-initializes all stored data with async API sync support (useful for testing or manual refresh)
 * @returns {Promise<void>}
 */
export const reinitializeStoredData = async () => {
  await AppInitializer.initialize(appState, notifyListeners);
  notifyListeners();
};

// === LISTENER FUNCTIONS (from modular system) ===

// Export listener functions from the listener manager
export { addListener, removeListener, getListenerCount, clearAllListeners };
