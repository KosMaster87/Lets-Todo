// lets-todo-app/src/components/main-content.js

import { getCurrentView } from "../state.js";
import { VIEWS, PAGE_TITLES } from "../utils/constants.js";
import { updateBodyClass as updateViewBodyClass } from "../services/navigation.js";
import { renderMainMenuPage } from "./pages/main-menu.js";
import { renderRegisterPage } from "./pages/register.js";
import { renderLoginPage } from "./pages/login.js";
import { renderDashboardPage } from "./pages/dashboard.js";
// import { renderNotifications } from "../components/notifications.js";

/**
 * Renders the main content based on the current view.
 */
export const renderMainContent = () => {
  const mainElement = document.getElementById("mainContent");
  const currentView = getCurrentView();

  mainElement.innerHTML = createMainContentHTML(currentView);
  updatePageTitle(currentView);
  updateBodyClass(currentView);
};

/**
 * Creates the main content HTML structure.
 * @param {string} currentView - The current view name
 * @returns {string} HTML string for the main content
 */
const createMainContentHTML = (currentView) => {
  return `
      <div class="page-content">
        ${getCurrentViewHTML(currentView)}
      </div>
  `;
};

/**
 * Returns the HTML for the currently selected view.
 * @param {string} currentView - The current view name
 * @returns {string} HTML string for the current view
 */
const getCurrentViewHTML = (currentView) => {
  switch (currentView) {
    case VIEWS.MAIN_MENU:
      return renderMainMenuPage();
    case VIEWS.REGISTER:
      return renderRegisterPage();
    case VIEWS.LOGIN:
      return renderLoginPage();
    case VIEWS.DASHBOARD:
      return renderDashboardPage();
    case VIEWS.NOTES_LIST:
      return renderNotesListPage();
    case VIEWS.NOTES:
      return renderNotesPage();
    case VIEWS.NOTE_VIEW:
      return renderNoteViewPage();
    case VIEWS.TRASH:
      return renderTrashPage();
    case VIEWS.OPTIONS:
      return renderOptionsPage();
    case VIEWS.PERSONAL_DATA:
      return renderPersonalDataPage();
    case VIEWS.CHANGE_PASSWORD:
      return renderChangePasswordPage();
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
