/**
 * @fileoverview Main Menu Page Component
 * @description Renders the main menu page with navigation optionsw
 * @module main-menu
 */

import { getSession } from "./../../state/main-state.js";

/**
 * Renders the main menu page.
 * @returns {string} HTML string for the main menu page
 */
export const renderMainMenuPage = () => {
  const session = getSession();
  const isLoggedIn = session && session.sessionType === "user";
  return `
      <section class="main-menu-intro">
        <header class="app-header">
          <h1 class="app-header-title">Let's Todo App</h1>
          <p class="app-header-subtitle">Your todos, available everywhere</p>
        </header>

        <footer class="app-footer">
          <h2 class="app-footer-title">Welcome!</h2>
          <p class="app-footer-subtitle">Here you have the first overview of your options</p>
        </footer>
      </section>

      <nav class="main-menu">
        ${isLoggedIn ? renderLoggedInMenu(session) : renderGuestMenu()}
      </nav>
  `;
};

/**
 * Creates a menu button HTML.
 * @param {string} className - CSS class for the button
 * @param {string} id - Button ID
 * @param {string} title - Button title
 * @param {string} description - Button description
 * @param {string|null} navigateTo - Target view (null for guest button)
 * @param {boolean} isGuestBtn - Whether this is the guest button
 * @returns {string} HTML string for the menu button
 */
const createMenuButton = (
  className,
  id,
  title,
  description,
  navigateTo = null,
  isGuestBtn = false
) => {
  const attributes = isGuestBtn
    ? "data-guest-login"
    : `data-navigate="${navigateTo}"`;

  return `
    <button class="menu-btn ${className}" id="${id}" ${attributes}>
      <div class="btn-icon ${className}-icon"></div>
      <div class="btn-content">
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
    </button>
  `;
};

/**
 * Renders menu for guest (not logged in) users.
 * @returns {string} HTML for guest menu
 */
const renderGuestMenu = () => {
  return `
    ${createMenuButton(
      "guest-btn",
      "guestBtn",
      "Guest Session",
      "Get started immediately without registration",
      null,
      true
    )}
    ${createMenuButton(
      "register-btn",
      "registerBtn",
      "Register",
      "Create a new account",
      "register"
    )}
    ${createMenuButton(
      "login-btn",
      "loginBtn",
      "Login",
      "Login with existing account",
      "login"
    )}
    ${createMenuButton(
      "options-btn",
      "optionsBtn",
      "Options",
      "Manage user settings",
      "options"
    )}
  `;
};

/**
 * Renders menu for logged in users.
 * @param {Object} session - User session data
 * @returns {string} HTML for logged in user menu
 */
const renderLoggedInMenu = (session) => {
  const username = session?.userData?.username || "User";

  return `
    ${createMenuButton(
      "dashboard-btn",
      "dashboardBtnLoggedIn",
      "Dashboard",
      `Welcome back, ${username}!`,
      "dashboard"
    )}
    ${createMenuButton(
      "options-btn",
      "optionsBtn",
      "Options",
      "Manage user settings",
      "options"
    )}
    ${createMenuButton(
      "logout-btn",
      "logoutBtn",
      "Logout",
      "End session and logout",
      "logout"
    )}
  `;
};
