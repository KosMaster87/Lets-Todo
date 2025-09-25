// lets-todo-app/src/components/main-content.js

import { getCurrentView } from "../state.js";
import { VIEWS, PAGE_TITLES } from "../utils/constants.js";
import { updateBodyClass as updateViewBodyClass } from "../services/navigation.js";
import { renderMainMenuPage } from "./pages/main-menu.js";
import { renderDashboardPage } from "./pages/dashboard.js";
import { renderRegisterPage } from "./pages/register.js";
import { renderLoginPage } from "./pages/login.js";
import { renderOptionsPage } from "./pages/options.js";
import { renderPersonalDataPage } from "./pages/personal-data.js";
import { renderChangePasswordPage } from "./pages/change-password.js";
import { renderTodosListPage } from "./pages/todos-list.js";
import { renderTodosPage } from "./pages/todos.js";
import { renderTrashPage } from "./pages/trash.js";
import { renderTodoViewPage } from "./pages/todo-view.js";
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
    case VIEWS.OPTIONS:
      return renderOptionsPage();
    case VIEWS.PERSONAL_DATA:
      return renderPersonalDataPage();
    case VIEWS.CHANGE_PASSWORD:
      return renderChangePasswordPage();
    case VIEWS.TODOS_LIST:
      return renderTodosListPage();
    case VIEWS.TODOS:
      return renderTodosPage();
    case VIEWS.TRASH:
      return renderTrashPage();
    case VIEWS.TODO_VIEW:
      return renderTodoViewPage();
    // TODO: Implement additional views
    // case VIEWS.TODOS:
    //   return renderTodosPage();
    // case VIEWS.TODO_VIEW:
    //   return renderTodoViewPage();
    // case VIEWS.TRASH:
    //   return renderTrashPage();
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
