/**
 * @fileoverview Main Content Component
 * @module main-content
 */

import { getCurrentView } from "./../state/main-state.js";
import { VIEWS, PAGE_TITLES } from "./../utils/constants.js";
import { updateBodyClass as updateViewBodyClass } from "./../services/navigation/navigation.js";
import { initializeResetPasswordConfirm } from "./../services/navigation/navigation-reset-password-confirm.js";
import { renderMainMenuPage } from "./pages/main-menu.js";
import { renderDashboardPage } from "./pages/dashboard.js";
import { renderRegisterPage } from "./pages/register.js";
import { renderLoginPage } from "./pages/login.js";
import { renderOptionsPage } from "./pages/options.js";
import { renderPersonalDataPage } from "./pages/personal-data.js";
import { renderChangePasswordPage } from "./pages/change-password.js";
import { renderResetPasswordPage } from "./pages/reset-password.js";
import { renderResetPasswordConfirmPage } from "./pages/reset-password-confirm.js";
import { renderImprintPage } from "./pages/imprint.js";
import { renderTodosListPage } from "./pages/todos-list.js";
import { renderTodosPage } from "./pages/todos.js";
import { renderTrashPage } from "./pages/trash.js";
import { renderTodoViewPage } from "./pages/todo-view.js";

/**
 * Renders the main content based on the current view.
 * @param {string} [urlParams] - Optional URL parameters (e.g., token for reset-password-confirm)
 */
export const renderMainContent = (urlParams = null) => {
  const mainElement = document.getElementById("mainContent");
  const currentView = getCurrentView();

  // console.log("🖼️ renderMainContent called");
  // console.log("📋 Current View:", currentView);
  // console.log("📋 URL Params passed:", urlParams);
  // console.log("📋 Global URL Params:", window.currentUrlParams);

  // Fallback zu globalen URL-Parametern wenn nicht direkt übergeben
  const params = urlParams || window.currentUrlParams || null;
  // console.log("📋 Final params:", params);

  mainElement.innerHTML = createMainContentHTML(currentView, params);
  updatePageTitle(currentView);
  updateBodyClass(currentView);

  // Spezielle Initialisierung für Reset-Password-Confirm
  if (currentView === VIEWS.RESET_PASSWORD_CONFIRM && params) {
    // console.log(
    //   "🚀 Calling initializeResetPasswordConfirm with token:",
    //   params.token
    // );
    initializeResetPasswordConfirm(params.token);
  } else if (currentView === VIEWS.RESET_PASSWORD_CONFIRM) {
    console.log("⚠️ Reset-Password-Confirm view detected but NO params found!");
  }
};

/**
 * Creates the main content HTML structure.
 * @param {string} currentView - The current view name
 * @param {Object} [urlParams] - Optional URL parameters
 * @returns {string} HTML string for the main content
 */
const createMainContentHTML = (currentView, urlParams = null) => {
  return `
      <div class="page-content">
        ${getCurrentViewHTML(currentView, urlParams)}
      </div>
  `;
};

/**
 * Returns the HTML for the currently selected view.
 * @param {string} currentView - The current view name
 * @param {Object} [urlParams] - Optional URL parameters
 * @returns {string} HTML string for the current view
 */
const getCurrentViewHTML = (currentView, urlParams = null) => {
  switch (currentView) {
    case VIEWS.MAIN_MENU:
      return renderMainMenuPage();
    case VIEWS.REGISTER:
      return renderRegisterPage();
    case VIEWS.LOGIN:
      return renderLoginPage();
    case VIEWS.DASHBOARD:
      return renderDashboardPage();
    case VIEWS.OPTIONS:
      return renderOptionsPage();
    case VIEWS.PERSONAL_DATA:
      return renderPersonalDataPage();
    case VIEWS.CHANGE_PASSWORD:
      return renderChangePasswordPage();
    case VIEWS.RESET_PASSWORD:
      return renderResetPasswordPage();
    case VIEWS.RESET_PASSWORD_CONFIRM:
      return renderResetPasswordConfirmPage(urlParams?.token || "");
    case VIEWS.IMPRINT:
      return renderImprintPage();
    case VIEWS.TODOS_LIST:
      return renderTodosListPage();
    case VIEWS.TODOS:
      return renderTodosPage();
    case VIEWS.TRASH:
      return renderTrashPage();
    case VIEWS.TODO_VIEW:
      return renderTodoViewPage();
    default:
      return renderMainMenuPage();
  }
};

/**
 * Updates the page title based on the current view.
 * @param {string} currentView - The current view name
 */
const updatePageTitle = (currentView) => {
  const pageTitle = PAGE_TITLES[currentView] || "Let's Todo";
  document.title = pageTitle;
};

/**
 * Updates the body class for view-specific styling.
 * @param {string} currentView - The current view name
 */
const updateBodyClass = (currentView) => {
  updateViewBodyClass(currentView);
};
