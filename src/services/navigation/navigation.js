/**
 * @fileoverview Navigation Service
 * @description Manages application navigation, browser history, and view rendering
 * @module navigation
 */

import {
  setCurrentView,
  saveSessionToStorage,
  setSession,
} from "./../../state/main-state.js";
import { VIEWS, PAGE_TITLES, SESSION_TYPES } from "./../../utils/constants.js";
import { setupDashboardEventListeners } from "./navigation-dashboard.js";
import { setupRegisterEventListeners } from "./navigation-register.js";
import { setupLoginEventListeners } from "./navigation-login.js";
import { initializeLogoutEvents } from "./navigation-logout.js";
import { setupOptionsEventListeners } from "./navigation-options.js";
import { setupPersonalDataEventListeners } from "./navigation-personal-data.js";
import { setupChangePasswordEventListeners } from "./navigation-change-password.js";
import { setupResetPasswordEventListeners } from "./navigation-reset-password.js";
import { setupResetPasswordConfirmEventListeners } from "./navigation-reset-password-confirm.js";
import { setupImprintEventListeners } from "./navigation-imprint.js";
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
  setupResetPasswordEventListeners();
  setupResetPasswordConfirmEventListeners();
  setupImprintEventListeners();
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
  const urlInfo = extractViewAndParamsFromURL();
  if (isValidView(urlInfo.view)) {
    setCurrentView(urlInfo.view);
    // Trigger render via app.js instead of directly
  } else {
    navigateToView(VIEWS.MAIN_MENU);
  }
};

/**
 * Loads the initial view based on the current URL.
 */
const loadInitialView = () => {
  const urlInfo = extractViewAndParamsFromURL();

  // DEBUG: URL parameters output
  // console.log("🔍 loadInitialView - URL Info:", urlInfo);
  // console.log("🔍 Current URL:", window.location.pathname);

  if (isValidView(urlInfo.view)) {
    // Set URL parameters FIRST before setCurrentView is called!
    if (urlInfo.params) {
      window.currentUrlParams = urlInfo.params;
      // console.log("✅ URL parameters set:", window.currentUrlParams);
    } else {
      window.currentUrlParams = null;
      // console.log("ℹ️ No URL parameters found");
    }

    setCurrentView(urlInfo.view);
    updateDocumentTitle(urlInfo.view);
  } else {
    console.warn(
      `Invalid view "${urlInfo.view}" detected, redirecting to main menu`
    );
    navigateToView(VIEWS.MAIN_MENU);
  }
};

/**
 * Sets up main menu navigation buttons.
 */
const setupMainMenuNavigation = () => {
  const mainMenuLinks = [
    { id: "loginBtn", view: VIEWS.LOGIN },
    { id: "registerBtn", view: VIEWS.REGISTER },
    { id: "optionsBtn", view: VIEWS.OPTIONS },
    { id: "dashboardBtnLoggedIn", view: VIEWS.DASHBOARD }, // ✅ Dashboard for users
  ];

  mainMenuLinks.forEach(({ id, view }) => {
    const element = document.getElementById(id);
    if (element) {
      element.onclick = (e) => handleNavigationClick(e, view);
    }
  });

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

  setSession({
    sessionType: SESSION_TYPES.GUEST,
    sessionId: `guest_${Date.now()}`,
    userId: null,
    userEmail: null,
  });

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
 * @param {Object} [params] - Optional URL parameters
 */
export const navigateToView = (view, params = null) => {
  if (!isValidView(view)) return;

  setCurrentView(view);
  updateBrowserHistory(view, params);
  updateDocumentTitle(view);
  saveSessionToStorage();

  // Save URL parameters for later use
  if (params) {
    window.currentUrlParams = params;
  } else {
    delete window.currentUrlParams;
  }
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
 * @param {Object} [params] - Optional URL parameters
 */
const updateBrowserHistory = (view, params = null) => {
  let url = view === VIEWS.MAIN_MENU ? "/" : `/${view}`;

  // For Reset-Password-Confirm: Add token as URL parameter
  if (view === VIEWS.RESET_PASSWORD_CONFIRM && params?.token) {
    url = `/${view}/${params.token}`;
  }

  window.history.pushState({ view, params }, "", url);
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
 * Extracts the view name and parameters from the current URL.
 * @returns {{view: string, params: Object|null}} View name and parameters
 */
const extractViewAndParamsFromURL = () => {
  const path = window.location.pathname;
  const segments = path.split("/").filter((segment) => segment);

  if (segments.length === 0) {
    return { view: VIEWS.MAIN_MENU, params: null };
  }

  const view = segments[0];

  // Special handling for Reset-Password-Confirm with token
  if (view === VIEWS.RESET_PASSWORD_CONFIRM && segments[1]) {
    return {
      view: view,
      params: { token: segments[1] },
    };
  }

  return { view: view, params: null };
};

/**
 * Extracts the view name from the current URL (backwards compatibility).
 * @returns {string} View name
 */
const extractViewFromURL = () => {
  return extractViewAndParamsFromURL().view;
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
  document.body.className = document.body.className
    .split(" ")
    .filter((cls) => !cls.startsWith("view-"))
    .join(" ");

  document.body.classList.add(`view-${view}`);
};
