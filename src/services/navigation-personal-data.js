// lets-todo-app/src/services/navigation-personal-data.js

import { handleNavigationClick } from "./navigation.js";
import { VIEWS } from "../utils/constants.js";

/**
 * Sets up personal data navigation buttons.
 * Maps personal data button clicks to their corresponding views and actions.
 */
const setupPersonalDataNavigation = () => {
  const personalDataLinks = [
    { id: "personalDataCancelBtn", view: VIEWS.OPTIONS },
    { id: "resetPasswordBtn", view: VIEWS.CHANGE_PASSWORD },
  ];

  personalDataLinks.forEach(({ id, view }) => {
    const element = document.getElementById(id);
    if (element) {
      element.onclick = (e) => handleNavigationClick(e, view);
    }
  });

  // Setup action buttons with special handling
  const downloadTodosBtn = document.getElementById("downloadTodosBtn");
  if (downloadTodosBtn) {
    downloadTodosBtn.onclick = (e) => handleDownloadTodos(e);
  }

  const uploadTodosBtn = document.getElementById("uploadTodosBtn");
  if (uploadTodosBtn) {
    uploadTodosBtn.onclick = (e) => handleUploadTodos(e);
  }
};

/**
 * Sets up form-specific handlers for the personal data page.
 */
const setupPersonalDataFormHandlers = () => {
  // Additional personal data-specific handlers can be added here
  // For example: file input validation, progress indicators, etc.
};

/**
 * Handles todos download functionality.
 * @param {Event} event - Click event
 */
const handleDownloadTodos = (event) => {
  event.preventDefault();

  // TODO: Implement actual todos download logic
  console.log("Download todos clicked");

  // For now, show a placeholder message
  showPersonalDataMessage("Todos-Download wird noch implementiert.");
};

/**
 * Handles todos upload functionality.
 * @param {Event} event - Click event
 */
const handleUploadTodos = (event) => {
  event.preventDefault();

  // TODO: Implement actual todos upload logic
  console.log("Upload todos clicked");

  // For now, show a placeholder message
  showPersonalDataMessage("Todos-Upload wird noch implementiert.");
};

/**
 * Shows personal data message.
 * @param {string} message - Message to display
 */
const showPersonalDataMessage = (message) => {
  // TODO: Implement proper toast/message display system
  alert(message);
};

/**
 * Sets up additional personal data-specific navigation handlers.
 * Called by the main navigation system for all personal data-related event listeners.
 */
export const setupPersonalDataEventListeners = () => {
  setupPersonalDataNavigation();
  setupPersonalDataFormHandlers();

  // Additional personal data-specific event listeners can be added here
  // For example: file upload progress, backup/restore functionality, etc.
};
