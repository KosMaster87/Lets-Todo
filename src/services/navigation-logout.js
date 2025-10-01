// lets-todo-app/src/services/navigation-logout.js

import { navigateToView } from "./navigation.js";
import { logoutUser } from "./api-auth.js";

/**
 * Handles user logout functionality
 */

/**
 * Shows logout loading state
 * @param {boolean} isLoading - Loading state
 */
const showLogoutLoading = (isLoading) => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.disabled = isLoading;
    logoutBtn.textContent = isLoading ? "Wird abgemeldet..." : "Abmelden";
  }
};

/**
 * Handle user logout using centralized API service
 */
const handleUserLogout = async () => {
  try {
    showLogoutLoading(true);

    await logoutUser();

    showLogoutLoading(false);
  } catch (error) {
    showLogoutLoading(false);
    console.error("❌ Logout error:", error);
  }
};
/**
 * Initializes logout functionality for buttons with data-navigate="logout"
 */
export const initializeLogoutEvents = () => {
  document.addEventListener("click", (event) => {
    const target = event.target.closest('[data-navigate="logout"]');
    if (target) {
      event.preventDefault();
      handleUserLogout();
    }
  });

  console.log("✅ Logout events initialized");
};

/**
 * Export logout function for manual use
 */
export { handleUserLogout };
