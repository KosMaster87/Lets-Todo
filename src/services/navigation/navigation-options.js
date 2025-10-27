/**
 * @fileoverview Navigation Options Module
 * @module navigation-options
 */

import { handleNavigationClick } from "./navigation.js";
import { VIEWS, DEBUG_MODE } from "./../../utils/constants.js";
import {
  setUserPreferences,
  getUserPreferences,
} from "./../../state/main-state.js";

/**
 * @function logOptionsStatus
 * @description Logs options operation status with type-specific console output for debugging purposes
 * @param {string} type - Message type determining log function (success, error, warning, info)
 * @param {string} message - Primary message to log to console
 * @param {any} [data=null] - Optional additional data to include in log output
 * @returns {void} No return value - performs console logging side effect
 */
const logOptionsStatus = (type, message, data = null) => {
  if (!DEBUG_MODE) return;

  const logFunctions = {
    success: console.log,
    error: console.error,
    warning: console.warn,
    info: console.log,
  };

  const logFunction = logFunctions[type] || console.log;
  data ? logFunction(message, data) : logFunction(message);
};

/**
 * @function setupOptionsNavigation
 * @description Sets up click event handlers for options navigation buttons including cancel, personal data, and theme toggle
 * @returns {void} No return value - configures DOM event listeners as side effect
 */
const setupOptionsNavigation = () => {
  const optionsLinks = [
    { id: "optionsCancelBtn", view: VIEWS.MAIN_MENU },
    { id: "personalDataBtn", view: VIEWS.PERSONAL_DATA },
    { id: "imprintBtn", view: VIEWS.IMPRINT },
  ];

  optionsLinks.forEach(({ id, view }) => {
    const element = document.getElementById(id);
    if (element) {
      element.onclick = (e) => handleNavigationClick(e, view);
    }
  });

  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (themeToggleBtn) {
    themeToggleBtn.onclick = (e) => handleThemeToggle(e);
  }
};

/**
 * @function setupOptionsFormHandlers
 * @description Sets up form-specific event handlers for options page functionality like settings validation and preference changes
 * @returns {void} No return value - placeholder for future form handler configuration
 */
const setupOptionsFormHandlers = () => {
  // Additional options-specific handlers can be added here.
  // For example: settings validation, preference changes, etc.
};

/**
 * @function getNewTheme
 * @description Determines the opposite theme value for theme toggling functionality
 * @param {string} currentTheme - Current theme value ('light' or 'dark')
 * @returns {string} New theme value ('dark' if current is 'light', 'light' if current is 'dark')
 */
const getNewTheme = (currentTheme) => {
  return currentTheme === "light" ? "dark" : "light";
};

/**
 * @function getThemeDisplayName
 * @description Converts theme value to user-friendly display name for UI messages
 * @param {string} theme - Theme value ('light' or 'dark')
 * @returns {string} Capitalized display name ('Light' or 'Dark') for user interface
 */
const getThemeDisplayName = (theme) => {
  return theme === "dark" ? "Dark" : "Light";
};

/**
 * @function handleThemeToggleSuccess
 * @description Handles successful theme toggle operation with logging and user notification
 * @param {string} newTheme - New theme value that was successfully applied ('light' or 'dark')
 * @returns {void} No return value - performs logging and UI update side effects
 */
const handleThemeToggleSuccess = (newTheme) => {
  logOptionsStatus("success", `Theme switched to: ${newTheme}`);
  const displayName = getThemeDisplayName(newTheme);
  showOptionsMessage(`Theme switched to ${displayName}!`);
};

/**
 * @function handleThemeToggleError
 * @description Handles theme toggle error with logging and user notification about persistence failure
 * @param {Error} error - Error object from failed theme preference persistence
 * @returns {void} No return value - performs error logging and user notification side effects
 */
const handleThemeToggleError = (error) => {
  logOptionsStatus("error", "Failed to persist theme preference:", error);
  showOptionsMessage("Theme switched, but setting could not be saved.");
};

/**
 * @function handleThemeToggle
 * @async
 * @description Handles theme toggle functionality with async API sync support, retrieving current preferences and persisting new theme
 * @param {Event} event - Click event object from theme toggle button interaction
 * @returns {Promise<void>} Promise that resolves when theme toggle operation completes
 * @throws {Error} Thrown when theme preference persistence fails
 */
const handleThemeToggle = async (event) => {
  try {
    const currentPreferences = getUserPreferences();
    const currentTheme = currentPreferences?.theme || "light";
    const newTheme = getNewTheme(currentTheme);

    await setUserPreferences({ theme: newTheme });
    handleThemeToggleSuccess(newTheme);
  } catch (error) {
    handleThemeToggleError(error);
  }
};

/**
 * @function createMessageElement
 * @description Creates a styled DOM element for temporary message display with fixed positioning and green success styling
 * @param {string} message - Text message content to display in the notification element
 * @returns {HTMLDivElement} Configured div element with inline styles for temporary message display
 */
const createMessageElement = (message) => {
  const messageDiv = document.createElement("div");
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed; top: 20px; right: 20px;
    background: rgba(76, 175, 80, 0.9); color: white;
    padding: 1rem; border-radius: 0.5rem; z-index: 1000;
    font-size: 0.9rem; max-width: 300px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `;
  return messageDiv;
};

/**
 * @function showOptionsMessage
 * @description Shows temporary options message with auto-removal after 3 seconds, creating and appending message element to document body
 * @param {string} message - Message text to display in temporary notification
 * @returns {void} No return value - performs DOM manipulation and timeout scheduling side effects
 */
const showOptionsMessage = (message) => {
  const messageDiv = createMessageElement(message);
  document.body.appendChild(messageDiv);

  setTimeout(() => {
    if (document.body.contains(messageDiv)) {
      document.body.removeChild(messageDiv);
    }
  }, 3000);
};

/**
 * @function setupOptionsEventListeners
 * @exports
 * @description Sets up comprehensive options-specific navigation handlers including navigation buttons, form handlers, and theme system
 * @returns {void} No return value - configures all options page event listeners as side effects
 */
export const setupOptionsEventListeners = () => {
  setupOptionsNavigation();
  setupOptionsFormHandlers();
  // Additional options-specific event listeners can be added here.
  // For example: theme system, settings persistence, etc.
};
