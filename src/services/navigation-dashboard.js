// lets-todo-app/src/services/navigation-dashboard.js

import { handleNavigationClick } from "./navigation.js";
import { VIEWS } from "../utils/constants.js";

/**
 * Initializes and sets up dashboard navigation event listeners.
 * This function should be called when the dashboard page is rendered.
 */
export const initializeDashboardNavigation = () => {
  setupDashboardNavigation();
};

/**
 * Sets up dashboard navigation buttons.
 * Maps dashboard button clicks to their corresponding views.
 */
const setupDashboardNavigation = () => {
  const dashboardLinks = [
    { id: "notesListDashboardBtn", view: VIEWS.NOTES_LIST },
    { id: "createNoteDashboardBtn", view: VIEWS.NOTES },
    { id: "trashDashboardBtn", view: VIEWS.TRASH },
    { id: "dashboardCancelBtn", view: VIEWS.MAIN_MENU },
  ];

  dashboardLinks.forEach(({ id, view }) => {
    const element = document.getElementById(id);
    if (element) {
      element.onclick = (e) => handleNavigationClick(e, view);
    }
  });
};

/**
 * Sets up additional dashboard-specific navigation handlers.
 * Can be extended for dashboard-specific functionality.
 */
export const setupDashboardEventListeners = () => {
  setupDashboardNavigation();

  // Additional dashboard-specific event listeners can be added here
  // For example: stats refresh, quick actions, etc.
};
