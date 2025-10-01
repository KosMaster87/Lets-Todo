// lets-todo-app/src/services/api-auth.js

import { getApiBase, apiHandler } from "./../utils/api-handler.js";
import { setSession, clearSession } from "./../state.js";
import { navigateToView } from "./navigation.js";

/**
 * Centralized authentication API service
 * Handles all authentication-related API calls
 */

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
    console.error("❌ Registration failed:", error);
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

    // 🎯 WICHTIG: User-Session setzen
    setSession({
      sessionType: "user",
      userId: result.userId,
      userEmail: userData.email,
      sessionId: `user_${result.userId}`,
    });

    console.log("✅ User logged in successfully:", result);
    return result;
  } catch (error) {
    console.error("❌ Login failed:", error);
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
        credentials: "include", // Include cookies
      });
    } catch (error) {
      console.warn(
        "Server logout failed, continuing with local logout:",
        error
      );
    }

    // Clear local session data
    clearSession();

    // Navigate back to main menu
    navigateToView("main-menu");

    console.log("✅ User logged out successfully");
  } catch (error) {
    console.error("❌ Logout error:", error);

    // Even if server logout fails, clear local session
    clearSession();
    navigateToView("main-menu");
  }
};

/**
 * Checks if user is currently authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  // This could be expanded to check server-side validation
  return Boolean(localStorage.getItem("todoapp-session"));
};

/**
 * Validates current session with server
 * @returns {Promise<boolean>} Validation result
 */
export const validateSession = async () => {
  const API_BASE = getApiBase();

  try {
    const response = await fetch(`${API_BASE}/validate-session`, {
      method: "GET",
      credentials: "include",
    });

    return response.ok;
  } catch (error) {
    console.warn("Session validation failed:", error);
    return false;
  }
};
