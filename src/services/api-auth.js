// lets-todo-app/src/services/api-auth.js

import { getApiBase, apiHandler } from "./../utils/api-handler.js";
import {
  setSession,
  clearUserData,
  setTodos,
  setTrashedTodos,
} from "./../state.js";
import { navigateToView } from "./navigation/navigation.js";
import { syncTodosWithServer } from "./api-todos.js";

/**
 * Registers a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @returns {Promise<Object>} Registration result
 */
export const registerUser = async (userData) => {
  const API_BASE = getApiBase();

  try {
    const result = await apiHandler(`${API_BASE}/register`, "POST", userData);

    console.log("✅ User registered successfully:", result);
    return result;
  } catch (error) {
    // Only log unexpected errors, not user-facing registration errors
    if (
      !error.code ||
      !["EMAIL_ALREADY_EXISTS", "MISSING_CREDENTIALS"].includes(error.code)
    ) {
      console.error("❌ Registration failed:", error);
    }
    throw error;
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
  const API_BASE = getApiBase();

  try {
    const result = await apiHandler(`${API_BASE}/login`, "POST", userData);

    setSession({
      sessionType: "user",
      userId: result.userId,
      userEmail: userData.email,
      sessionId: `user_${result.userId}`,
    });

    try {
      const syncResult = await syncTodosWithServer();
      setTodos(syncResult.todos);
      setTrashedTodos(syncResult.trashedTodos);
      console.log(
        `✅ User logged in successfully with ${syncResult.todos.length} todos and ${syncResult.trashedTodos.length} trashed items loaded`
      );
    } catch (error) {
      console.warn("⚠️ Login successful, but todo sync failed:", error);
    }

    return result;
  } catch (error) {
    // Only log unexpected errors, not user authentication failures
    if (!error.code || error.code !== "INVALID_CREDENTIALS") {
      console.error("❌ Login failed:", error);
    }
    throw error;
  }
};

/**
 * Logs out the current user
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  const API_BASE = getApiBase();

  try {
    // Optional: Notify server about logout (for session cleanup)
    try {
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.warn(
        "Server logout failed, continuing with local logout:",
        error
      );
    }

    clearUserData();
    navigateToView("main-menu");

    console.log("✅ User logged out successfully");
  } catch (error) {
    console.error("❌ Logout error:", error);

    clearUserData();
    navigateToView("main-menu");
  }
};
