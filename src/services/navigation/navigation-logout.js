// lets-todo-app/src/services/navigation-logout.js

/**
 * @fileoverview Navigation Logout Module
 * @module navigation-logout
 */

import { logoutUser } from "./../api/api-auth.js";
import { DEBUG_MODE } from "./../../utils/constants.js";

/**
 * @function logLogoutStatus
 * @description Logs logout operation status with type-specific console output for debugging purposes
 * @param {string} type - Message type determining log function (success, error, warning, info)
 * @param {string} message - Primary message to log to console
 * @param {any} [data=null] - Optional additional data to include in log output
 * @returns {void} No return value - performs console logging side effect
 */
const logLogoutStatus = (type, message, data = null) => {
  if (!DEBUG_MODE) return;

  const logFunctions = {
    success: console.log,
    error: console.error,
    warning: console.warn,
    info: console.log,
  };

  const logFunction = logFunctions[type] || console.log;
  data ? logFunction(message, data) : logFunction(message);
};

/**
 * @function showLogoutLoading
 * @description Shows logout loading state by updating logout button text and disabled state
 * @param {boolean} isLoading - Loading state flag to determine button appearance and functionality
 * @returns {void} No return value - performs DOM manipulation side effects on logout button
 */
const showLogoutLoading = (isLoading) => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.disabled = isLoading;
    logoutBtn.textContent = isLoading ? "Logging out..." : "Log Out";
  }
};

/**
 * @function handleLogoutSuccess
 * @description Handles successful logout response by resetting loading state and logging success message
 * @returns {void} No return value - performs UI updates and logging side effects
 */
const handleLogoutSuccess = () => {
  showLogoutLoading(false);
  logLogoutStatus("success", "User logged out successfully");
};

/**
 * @function handleLogoutError
 * @description Handles logout error response by resetting loading state and logging error details
 * @param {Error} error - Error object from failed logout operation
 * @returns {void} No return value - performs UI updates and error logging side effects
 */
const handleLogoutError = (error) => {
  showLogoutLoading(false);
  logLogoutStatus("error", "Logout error:", error);
};

/**
 * @function handleUserLogout
 * @async
 * @description Handle user logout using centralized API service with loading state management and error handling
 * @returns {Promise<void>} Promise that resolves when logout operation completes successfully or rejects with error
 * @throws {Error} Thrown when logout API call fails
 */
const handleUserLogout = async () => {
  try {
    showLogoutLoading(true);
    await logoutUser();
    handleLogoutSuccess();
  } catch (error) {
    handleLogoutError(error);
  }
};

/**
 * @function initializeLogoutEvents
 * @exports
 * @description Initializes logout functionality by setting up document-level click event listener for buttons with data-navigate="logout"
 * @returns {void} No return value - configures global logout event listener as side effect
 */
export const initializeLogoutEvents = () => {
  document.addEventListener("click", handleLogoutClick);
};

/**
 * @function handleLogoutClick
 * @description Handles logout button click events by checking for data-navigate="logout" attribute and triggering logout process
 * @param {Event} event - Click event object from document-level listener
 * @param {HTMLElement} event.target - Event target element that was clicked
 * @returns {void} No return value - performs logout initiation or event delegation side effects
 */
const handleLogoutClick = (event) => {
  const target = event.target.closest('[data-navigate="logout"]');
  if (target) {
    event.preventDefault();
    handleUserLogout();
  }
};

/**
 * @exports handleUserLogout
 * @description Export logout function for manual use in other modules requiring programmatic logout functionality
 */
export { handleUserLogout };
