/**
 * @fileoverview Navigation Dashboard Module
 * @description Manages navigation and event handling for the dashboard page
 * @module navigation-dashboard
 */

import { handleNavigationClick } from "./navigation.js";
import { setCurrentTodo } from "./../../state/main-state.js";
import { VIEWS } from "./../../utils/constants.js";

/**
 * @function initializeDashboardNavigation
 * @exports
 * @description Initializes and sets up dashboard navigation event listeners for all dashboard page interactions
 * @returns {void} No return value - configures dashboard navigation event listeners as side effect
 */
export const initializeDashboardNavigation = () => {
  setupDashboardNavigation();
};

/**
 * @function setupDashboardNavigation
 * @description Sets up dashboard navigation buttons by configuring standard navigation links and create todo functionality
 * @returns {void} No return value - orchestrates all dashboard navigation setup as side effects
 */
const setupDashboardNavigation = () => {
  const dashboardLinks = getDashboardNavigationLinks();
  setupStandardNavigationButtons(dashboardLinks);
  setupCreateTodoButton();
};

/**
 * @function getDashboardNavigationLinks
 * @description Returns configuration array for standard dashboard navigation buttons
 * @returns {Array<Object>} Array of navigation link configuration objects
 * @returns {string} returns[].id - DOM element ID for the navigation button
 * @returns {string} returns[].view - Target view constant from VIEWS enum
 */
const getDashboardNavigationLinks = () => [
  { id: "todosListDashboardBtn", view: VIEWS.TODOS_LIST },
  { id: "trashDashboardBtn", view: VIEWS.TRASH },
  { id: "dashboardCancelBtn", view: VIEWS.MAIN_MENU },
];

/**
 * @function setupStandardNavigationButtons
 * @description Sets up click event handlers for standard dashboard navigation buttons
 * @param {Array<Object>} dashboardLinks - Array of navigation link configurations
 * @returns {void} No return value - configures standard navigation button event listeners as side effects
 */
const setupStandardNavigationButtons = (dashboardLinks) => {
  dashboardLinks.forEach(({ id, view }) => {
    const element = document.getElementById(id);
    if (element) {
      element.onclick = (e) => handleNavigationClick(e, view);
    }
  });
};

/**
 * @function setupCreateTodoButton
 * @description Sets up click event handler for create todo button with state management
 * @returns {void} No return value - configures create todo button event listener as side effect
 */
const setupCreateTodoButton = () => {
  const createTodoBtn = document.getElementById("createTodoDashboardBtn");
  if (createTodoBtn) {
    createTodoBtn.onclick = handleCreateTodoClick;
  }
};

/**
 * @function handleCreateTodoClick
 * @description Handles create todo button click by resetting current todo state and navigating to todos view
 * @param {Event} event - Click event object from create todo button
 * @returns {void} No return value - performs state reset and navigation side effects
 */
const handleCreateTodoClick = (event) => {
  setCurrentTodo(null);
  handleNavigationClick(event, VIEWS.TODOS);
};

/**
 * @function setupDashboardEventListeners
 * @exports
 * @description Sets up comprehensive dashboard-specific navigation handlers including navigation buttons and extensible functionality for stats refresh and quick actions
 * @returns {void} No return value - configures all dashboard page event listeners as side effects
 */
export const setupDashboardEventListeners = () => {
  setupDashboardNavigation();

  // Additional dashboard-specific event listeners can be added here
  // For example: stats refresh, quick actions, etc.
};
