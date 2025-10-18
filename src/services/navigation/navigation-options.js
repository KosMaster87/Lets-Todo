// lets-todo-app/src/services/navigation-options.js

import { handleNavigationClick } from "./navigation.js";
import { VIEWS } from "./../../utils/constants.js";
import { setUserPreferences, getUserPreferences } from "./../../state.js";

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
 * Handles theme toggle functionality with async API sync support
 * @param {Event} event - Click event from theme toggle button
 */
const handleThemeToggle = async (event) => {
  try {
    // Get current theme preference
    const currentPreferences = getUserPreferences();
    const currentTheme = currentPreferences?.theme || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";

    // Update preferences with API sync for registered users
    await setUserPreferences({ theme: newTheme });
    console.log(`Theme switched to: ${newTheme}`);
    showOptionsMessage(
      `Theme zu ${newTheme === "dark" ? "Dunkel" : "Hell"} gewechselt!`
    );
  } catch (error) {
    console.error("Failed to persist theme preference:", error);
    showOptionsMessage(
      "Theme gewechselt, aber Einstellung konnte nicht gespeichert werden."
    );
  }
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
