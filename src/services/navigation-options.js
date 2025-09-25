// lets-todo-app/src/services/navigation-options.js

import { handleNavigationClick } from "./navigation.js";
import { VIEWS } from "../utils/constants.js";

/**
 * Sets up options navigation buttons.
 * Maps options button clicks to their corresponding views and actions.
 */
const setupOptionsNavigation = () => {
  const optionsLinks = [
    { id: "optionsCancelBtn", view: VIEWS.MAIN_MENU },
    { id: "personalDataBtn", view: VIEWS.PERSONAL_DATA },
  ];

  optionsLinks.forEach(({ id, view }) => {
    const element = document.getElementById(id);
    if (element) {
      element.onclick = (e) => handleNavigationClick(e, view);
    }
  });

  // Setup theme toggle button with special handling
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (themeToggleBtn) {
    themeToggleBtn.onclick = (e) => handleThemeToggle(e);
  }
};

/**
 * Sets up form-specific handlers for the options page.
 */
const setupOptionsFormHandlers = () => {
  // Additional options-specific handlers can be added here
  // For example: settings validation, preference changes, etc.
};

/**
 * Handles theme toggle functionality.
 * @param {Event} event - Click event
 */
const handleThemeToggle = (event) => {
  event.preventDefault();

  // TODO: Implement actual theme toggle logic
  console.log("Theme toggle clicked");

  // For now, show a placeholder message
  showOptionsMessage("Theme-Wechsel wird noch implementiert.");
};

/**
 * Shows options message.
 * @param {string} message - Message to display
 */
const showOptionsMessage = (message) => {
  // TODO: Implement proper toast/message display system
  alert(message);
};

/**
 * Sets up additional options-specific navigation handlers.
 * Called by the main navigation system for all options-related event listeners.
 */
export const setupOptionsEventListeners = () => {
  setupOptionsNavigation();
  setupOptionsFormHandlers();

  // Additional options-specific event listeners can be added here
  // For example: theme system, settings persistence, etc.
};
