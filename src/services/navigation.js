// lets-todo-app/src/services/navigation.js

import { setCurrentView, saveSessionToStorage, setSession } from "../state.js";
import { VIEWS, PAGE_TITLES, SESSION_TYPES } from "../utils/constants.js";
import { setupDashboardEventListeners } from "./navigation-dashboard.js";
import { setupRegisterEventListeners } from "./navigation-register.js";
import { setupLoginEventListeners } from "./navigation-login.js";
import { initializeLogoutEvents } from "./navigation-logout.js";
import { setupOptionsEventListeners } from "./navigation-options.js";
import { setupPersonalDataEventListeners } from "./navigation-personal-data.js";
import { setupChangePasswordEventListeners } from "./navigation-change-password.js";
import { setupTodosListNavigation } from "./navigation-todos-list.js";
import { setupTodosNavigation } from "./navigation-todos.js";
import { setupTrashNavigation } from "./navigation-trash.js";

let isNavigationInitialized = false;

/**
 * Initializes the navigation system.
 * Sets up browser history navigation and loads the initial view from the URL.
 */
export const initializeNavigation = () => {
  if (isNavigationInitialized) return;

  setupBrowserNavigation();
  loadInitialView();
  isNavigationInitialized = true;
};

/**
 * Sets event listeners for navigation links in the main content and other components.
 */
export const setupNavigationListeners = () => {
  setupMainMenuNavigation();
  setupDashboardEventListeners();
  setupRegisterEventListeners();
  setupLoginEventListeners();
  initializeLogoutEvents();
  setupOptionsEventListeners();
  setupPersonalDataEventListeners();
  setupChangePasswordEventListeners();
  setupTodosListNavigation();
  setupTodosNavigation();
  setupTrashNavigation();
  setupBackButtonNavigation();
};

/**
 * Sets up browser navigation event listeners (back/forward buttons).
 */
const setupBrowserNavigation = () => {
  window.addEventListener("popstate", handlePopState);
};

/**
 * Handles browser navigation events.
 * Updates the view state according to browser history.
 * @param {PopStateEvent} event - PopState event
 */
const handlePopState = (event) => {
  const view = event.state?.view || extractViewFromURL();
  if (isValidView(view)) {
    setCurrentView(view);
  } else {
    // Fallback to main menu for invalid views
    navigateToView(VIEWS.MAIN_MENU);
  }
};

/**
 * Loads the initial view based on the current URL.
 */
const loadInitialView = () => {
  const view = extractViewFromURL();
  if (isValidView(view)) {
    setCurrentView(view);
    updateDocumentTitle(view);
  } else {
    // Fallback to main menu for invalid URLs
    console.warn(`Invalid view "${view}" detected, redirecting to main menu`);
    navigateToView(VIEWS.MAIN_MENU);
  }
};

/**
 * Sets up main menu navigation buttons.
 */
const setupMainMenuNavigation = () => {
  // Standard navigation buttons
  const mainMenuLinks = [
    { id: "loginBtn", view: VIEWS.LOGIN },
    { id: "registerBtn", view: VIEWS.REGISTER },
    { id: "optionBtn", view: VIEWS.OPTIONS },
  ];

  mainMenuLinks.forEach(({ id, view }) => {
    const element = document.getElementById(id);
    if (element) {
      element.onclick = (e) => handleNavigationClick(e, view);
    }
  });

  // Guest button with special handling
  const guestBtn = document.getElementById("guestBtn");
  if (guestBtn) {
    guestBtn.onclick = (e) => handleGuestLogin(e);
  }
};

/**
 * Sets up back button navigation.
 */
const setupBackButtonNavigation = () => {
  const backButtons = document.querySelectorAll('[data-action="back"]');
  backButtons.forEach((button) => {
    button.onclick = (e) => {
      e.preventDefault();
      navigateBack();
    };
  });

  const homeButtons = document.querySelectorAll('[data-action="home"]');
  homeButtons.forEach((button) => {
    button.onclick = (e) => handleNavigationClick(e, VIEWS.MAIN_MENU);
  });
};

/**
 * Handles guest login and navigation to dashboard.
 * @param {Event} event - Click event
 */
const handleGuestLogin = (event) => {
  event.preventDefault();

  // Set guest session
  setSession({
    sessionType: SESSION_TYPES.GUEST,
    sessionId: `guest_${Date.now()}`,
    userId: null,
    userEmail: null,
  });

  // Navigate to dashboard
  navigateToView(VIEWS.DASHBOARD);
};

/**
 * Handles navigation clicks.
 * Prevents the default behavior and navigates to the selected view.
 * @param {Event} event - Click event
 * @param {string} view - Target view
 */
export const handleNavigationClick = (event, view) => {
  event.preventDefault();
  navigateToView(view);
};

/**
 * Navigates to a view.
 * Updates state, browser history, document title, and saves session.
 * @param {string} view - Target view
 */
export const navigateToView = (view) => {
  if (!isValidView(view)) return;

  setCurrentView(view);
  updateBrowserHistory(view);
  updateDocumentTitle(view);
  saveSessionToStorage();
};

/**
 * Navigates back to the previous view or main menu.
 */
export const navigateBack = () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    navigateToView(VIEWS.MAIN_MENU);
  }
};

/**
 * Updates the browser history with the new view.
 * @param {string} view - View name
 */
const updateBrowserHistory = (view) => {
  const url = view === VIEWS.MAIN_MENU ? "/" : `/${view}`;
  window.history.pushState({ view }, "", url);
};

/**
 * Updates the document title based on the current view.
 * @param {string} view - View name
 */
const updateDocumentTitle = (view) => {
  const title = PAGE_TITLES[view] || "Let's Todo";
  document.title = title;
};

/**
 * Extracts the view name from the current URL.
 * @returns {string} View name
 */
const extractViewFromURL = () => {
  const path = window.location.pathname;
  return path.substring(1) || VIEWS.MAIN_MENU;
};

/**
 * Checks if a view is valid.
 * @param {string} view - View name
 * @returns {boolean} Is valid
 */
const isValidView = (view) => {
  return Object.values(VIEWS).includes(view);
};

/**
 * Updates the body class for view-specific styling.
 * @param {string} view - View name
 */
export const updateBodyClass = (view) => {
  // Remove existing view classes
  document.body.className = document.body.className
    .split(" ")
    .filter((cls) => !cls.startsWith("view-"))
    .join(" ");

  // Add new view class
  document.body.classList.add(`view-${view}`);
};
