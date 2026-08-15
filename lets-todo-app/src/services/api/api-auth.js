/**
 * @fileoverview User Authentication API services
 * @description Provides functions for user registration, login, logout, and session management
 * @module api-auth
 */

import { getApiBase, apiHandler } from "./api-handler.js";
import { PreferencesManager } from "./../../state/storage.js";
import {
  setSession,
  clearUserData,
  setTodos,
  setTrashedTodos,
  setUserPreferences,
} from "./../../state/main-state.js";
import { navigateToView } from "./../navigation/navigation.js";
import { syncTodosWithServer } from "./api-todos.js";
import { DEBUG_MODE } from "./../../utils/constants.js";

/**
 * Registers a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @returns {Promise<Object>} Registration result
 */
export const registerUser = async (userData) => {
  try {
    const API_BASE = getApiBase();
    const endpoint = `${API_BASE}/register`;
    const result = await apiHandler(endpoint, "POST", userData);
    logAuthStatus("success", "User registered successfully:", result);
    return result;
  } catch (error) {
    const expectedCodes = ["EMAIL_ALREADY_EXISTS", "MISSING_CREDENTIALS"];
    if (shouldLogAuthError(error, expectedCodes)) {
      logAuthStatus("error", "Registration failed:", error);
    }
    throw error;
  }
};

/**
 * Checks if auth error should be logged (filters expected errors)
 * @param {Error} error - Authentication error
 * @param {Array} expectedCodes - Array of expected error codes to filter
 * @returns {boolean} True if error should be logged
 */
const shouldLogAuthError = (error, expectedCodes = []) => {
  return !error.code || !expectedCodes.includes(error.code);
};

/**
 * Logs authentication operation status messages
 * @param {string} type - Message type (success, error, warning)
 * @param {string} operation - Operation name
 * @param {any} data - Optional data to log
 */
const logAuthStatus = (type, operation, data = null) => {
  if (!DEBUG_MODE) return;

  const messages = {
    success: `✅ ${operation}`,
    error: `❌ ${operation}`,
    warning: `⚠️ ${operation}`,
  };

  if (type === "error" && data) {
    console.error(messages[type], data);
  } else if (data) {
    console.log(messages[type], data);
  } else {
    console.log(messages[type]);
  }
};

/**
 * Logs in an existing user
 * @param {Object} userData - User login data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @returns {Promise<Object>} Login result
 */
export const loginUser = async (userData) => {
  try {
    const API_BASE = getApiBase();
    const endpoint = `${API_BASE}/login`;
    const result = await apiHandler(endpoint, "POST", userData);
    const sessionData = createUserSession(result, userData.email);

    setSession(sessionData);
    await handlePostLoginSync();
    return result;
  } catch (error) {
    const expectedCodes = ["INVALID_CREDENTIALS"];
    if (shouldLogAuthError(error, expectedCodes)) {
      logAuthStatus("error", "Login failed:", error);
    }
    throw error;
  }
};

/**
 * Creates user session object from login result
 * @param {Object} result - Login API result
 * @param {string} userEmail - User email from login data
 * @returns {Object} Session object
 */
const createUserSession = (result, userEmail) => ({
  sessionType: "user",
  userId: result.userId,
  userEmail: userEmail,
  sessionId: `user_${result.userId}`,
});

/**
 * Handles post-login data synchronization
 * @returns {Promise<void>}
 */
const handlePostLoginSync = async () => {
  try {
    const syncResult = await syncTodosData();
    await syncUserPreferences();

    const message = `User logged in successfully with ${syncResult.todos.length} todos and ${syncResult.trashedTodos.length} trashed items loaded`;
    logAuthStatus("success", message);
  } catch (error) {
    logAuthStatus("warning", "Login successful, but sync failed:", error);
  }
};

/**
 * Syncs todos data after successful login
 * @returns {Promise<Object>} Sync result with todos and trashedTodos
 */
const syncTodosData = async () => {
  const syncResult = await syncTodosWithServer();
  setTodos(syncResult.todos);
  setTrashedTodos(syncResult.trashedTodos);
  return syncResult;
};

/**
 * Syncs user preferences from server
 * @returns {Promise<Object|null>} Server preferences or null
 */
const syncUserPreferences = async () => {
  const serverPreferences = await PreferencesManager.syncFromServer("user");

  if (serverPreferences) {
    await setUserPreferences(serverPreferences);
    logAuthStatus("success", "User preferences synced from server:", serverPreferences);
  }

  return serverPreferences;
};

/**
 * Logs out the current user
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    await notifyServerLogout();
    performLocalLogout();
    logAuthStatus("success", "User logged out successfully");
  } catch (error) {
    logAuthStatus("error", "Logout error:", error);
    performLocalLogout(); // Ensure cleanup even on error
  }
};

/**
 * Attempts to notify server about logout
 * @returns {Promise<void>}
 */
const notifyServerLogout = async () => {
  try {
    const API_BASE = getApiBase();
    const endpoint = `${API_BASE}/logout`;
    await fetch(endpoint, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    logAuthStatus("warning", "Server logout failed, continuing with local logout:", error);
  }
};

/**
 * Performs local logout operations
 */
const performLocalLogout = () => {
  clearUserData();
  navigateToView("main-menu");
};
