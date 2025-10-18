// lets-todo-app/src/services/api-auth.js

import { getApiBase, apiHandler } from "./../utils/api-handler.js";
import { PreferencesManager } from "./../state/storage.js";
import {
  setSession,
  clearUserData,
  setTodos,
  setTrashedTodos,
  setUserPreferences,
} from "./../state.js";
import { navigateToView } from "./navigation/navigation.js";
import { syncTodosWithServer } from "./api-todos.js";


// #################################################

/**
 * Registers a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @returns {Promise<Object>} Registration result
 */
export const registerUser = async (userData) => {
  try {
    const endpoint = createRegistrationEndpoint();
    const result = await apiHandler(endpoint, "POST", userData);
    return handleRegistrationSuccess(result);
  } catch (error) {
    handleRegistrationError(error);
  }
};

/**
 * Creates registration endpoint URL
 * @returns {string} Full API endpoint URL for user registration
 */
const createRegistrationEndpoint = () => {
  const API_BASE = getApiBase();
  return `${API_BASE}/register`;
};

/**
 * Handles successful user registration response
 * @param {Object} result - Server response
 * @returns {Object} Registration result
 */
const handleRegistrationSuccess = (result) => {
  console.log("✅ User registered successfully:", result);
  return result;
};

/**
 * Handles registration error with conditional logging
 * @param {Error} error - Registration error
 * @throws {Error} Re-throws the error for caller handling
 */
const handleRegistrationError = (error) => {
  if (shouldLogRegistrationError(error)) {
    console.error("❌ Registration failed:", error);
  }
  throw error;
};

/**
 * Checks if error should be logged for registration
 * @param {Error} error - Registration error
 * @returns {boolean} True if error should be logged
 */
const shouldLogRegistrationError = (error) => {
  const expectedErrorCodes = ["EMAIL_ALREADY_EXISTS", "MISSING_CREDENTIALS"];
  return !error.code || !expectedErrorCodes.includes(error.code);
};

// #################################################

/**
 * Logs in an existing user
 * @param {Object} userData - User login data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @returns {Promise<Object>} Login result
 */
export const loginUser = async (userData) => {
  try {
    const endpoint = createLoginEndpoint();
    const result = await apiHandler(endpoint, "POST", userData);
    const sessionData = createUserSession(result, userData.email);

    setSession(sessionData);
    await handlePostLoginSync();
    return result;
  } catch (error) {
    handleLoginError(error);
  }
};

/**
 * Creates login endpoint URL
 * @returns {string} Full API endpoint URL for user login
 */
const createLoginEndpoint = () => {
  const API_BASE = getApiBase();
  return `${API_BASE}/login`;
};

/**
 * Creates user session object from login result
 * @param {Object} result - Login API result
 * @param {string} userEmail - User email from login data
 * @returns {Object} Session object
 */
const createUserSession = (result, userEmail) => {
  return {
    sessionType: "user",
    userId: result.userId,
    userEmail: userEmail,
    sessionId: `user_${result.userId}`,
  };
};

/**
 * Handles post-login data synchronization
 * @returns {Promise<void>}
 */
const handlePostLoginSync = async () => {
  try {
    const syncResult = await syncTodosData(); // Just in debug mode
    await syncUserPreferences();
    logLoginSuccess(syncResult); // Just in debug mode
  } catch (error) {
    console.warn("⚠️ Login successful, but sync failed:", error);
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
    console.log(`✅ User preferences synced from server:`, serverPreferences);
  }

  return serverPreferences;
};

/**
 * Logs successful login with sync results
 * @param {Object} syncResult - Todo sync result
 */
const logLoginSuccess = (syncResult) => {
  console.log(
    `✅ User logged in successfully with ${syncResult.todos.length} todos and ${syncResult.trashedTodos.length} trashed items loaded`
  );
};

/**
 * Checks if login error should be logged
 * @param {Error} error - Login error
 * @returns {boolean} True if error should be logged
 */
const shouldLogLoginError = (error) => {
  return !error.code || error.code !== "INVALID_CREDENTIALS";
};

/**
 * Handles login error with conditional logging
 * @param {Error} error - Login error
 * @throws {Error} Re-throws the error for caller handling
 */
const handleLoginError = (error) => {
  if (shouldLogLoginError(error)) {
    console.error("❌ Login failed:", error);
  }
  throw error;
};

// #################################################

/**
 * Logs out the current user
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    await notifyServerLogout();
    performLocalLogout();
    handleLogoutSuccess();
  } catch (error) {
    handleLogoutError(error);
  }
};

/**
 * Attempts to notify server about logout
 * @returns {Promise<void>}
 */
const notifyServerLogout = async () => {
  try {
    const endpoint = createLogoutEndpoint();
    await fetch(endpoint, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.warn("Server logout failed, continuing with local logout:", error);
  }
};

/**
 * Creates logout endpoint URL
 * @returns {string} Full API endpoint URL for user logout
 */
const createLogoutEndpoint = () => {
  const API_BASE = getApiBase();
  return `${API_BASE}/logout`;
};

/**
 * Performs local logout operations
 */
const performLocalLogout = () => {
  clearUserData();
  navigateToView("main-menu");
};

/**
 * Handles successful logout
 */
const handleLogoutSuccess = () => {
  console.log("✅ User logged out successfully");
};

/**
 * Handles logout error and ensures cleanup
 * @param {Error} error - Logout error
 */
const handleLogoutError = (error) => {
  console.error("❌ Logout error:", error);
  performLocalLogout();
};
