// lets-todo-app/src/components/pages/main-menu.js

import { getSession } from "./../../state.js";

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
          <p class="app-header-subtitle">Deine Todos, überall verfügbar</p>
        </header>

        <footer class="app-footer">
          <h2 class="app-footer-title">Willkommen!</h2>
          <p class="app-footer-subtitle">Hier hast du die erste Übersicht deiner Möglichkeiten</p>
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
      "Gast-Sitzung",
      "Sofort loslegen ohne Registrierung",
      null,
      true
    )}
    ${createMenuButton(
      "register-btn",
      "registerBtn",
      "Registrieren",
      "Neues Konto erstellen",
      "register"
    )}
    ${createMenuButton(
      "login-btn",
      "loginBtn",
      "Anmelden",
      "Mit bestehendem Konto einloggen",
      "login"
    )}
    ${createMenuButton(
      "options-btn",
      "optionsBtn",
      "Optionen",
      "Benutzereinstellungen verwalten",
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
  const username = session?.userData?.username || "Benutzer";

  return `
    ${createMenuButton(
      "dashboard-btn",
      "dashboardBtn",
      "Dashboard",
      `Willkommen zurück, ${username}!`,
      "dashboard"
    )}
    ${createMenuButton(
      "options-btn",
      "optionsBtn",
      "Optionen",
      "Benutzereinstellungen verwalten",
      "options"
    )}
    ${createMenuButton(
      "logout-btn",
      "logoutBtn",
      "Abmelden",
      "Sitzung beenden und ausloggen",
      "logout"
    )}
  `;
};
