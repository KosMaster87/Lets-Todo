// lets-todo-app/src/services/navigation-personal-data.js

/**
 * @fileoverview Personal Data Navigation Module
 *
 * Handles personal data management functionality including navigation,
 * file upload/download operations, and user account settings. Provides
 * a comprehensive interface for data import/export and account management.
 *
 * Key Features:
 * - Navigation to password change/reset views
 * - Todos download in JSON format with progress feedback
 * - Todos upload from JSON/CSV with validation and preview
 * - Loading states and user experience optimization
 * - Error handling with user-friendly messages
 * - Configurable upload options (duplicates, preview, trash handling)
 *
 * @module navigation-personal-data
 * @requires ./navigation.js
 * @requires ./../../utils/constants.js
 * @requires ./../crud/personal-data-download.js
 * @requires ./../crud/personal-data-upload-handler.js
 * @requires ./../crud/personal-data-ui-state.js
 * @since 1.0.0
 */

import { handleNavigationClick } from "./navigation.js";
import { VIEWS } from "./../../utils/constants.js";
import { downloadTodos } from "./../crud/personal-data-download.js";
import { triggerFileUpload } from "./../crud/personal-data-upload-handler.js";
import {
  showPersonalDataSuccess,
  showPersonalDataError,
  updateDownloadLoadingState,
  updateUploadLoadingState,
} from "./../crud/personal-data-ui-state.js";

/**
 * Sets up personal data navigation buttons.
 * Maps personal data button clicks to their corresponding views and actions.
 * @function setupPersonalDataNavigation
 * @returns {void}
 */
const setupPersonalDataNavigation = () => {
  setupStandardNavigationButtons();
  setupActionButtons();
};

/**
 * Sets up standard navigation buttons that redirect to other views.
 * @function setupStandardNavigationButtons
 * @returns {void}
 */
const setupStandardNavigationButtons = () => {
  const links = getPersonalDataLinks();

  links.forEach(({ id, view }) => {
    const element = document.getElementById(id);
    if (element) {
      element.onclick = (e) => handleNavigationClick(e, view);
    }
  });
};

/**
 * Gets personal data navigation link configurations.
 * @function getPersonalDataLinks
 * @returns {Array<{id: string, view: string}>} Array of navigation link configurations
 */
const getPersonalDataLinks = () => {
  return [
    { id: "personalDataCancelBtn", view: VIEWS.OPTIONS },
    { id: "resetPasswordBtn", view: VIEWS.RESET_PASSWORD },
    { id: "changePasswordBtn", view: VIEWS.CHANGE_PASSWORD },
  ];
};

/**
 * Sets up action buttons for download and upload functionality.
 * @function setupActionButtons
 * @returns {void}
 */
const setupActionButtons = () => {
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
 * Handles todos download functionality.
 * Initiates JSON export with loading states and success/error feedback.
 * @function handleDownloadTodos
 * @param {Event} event - Click event from download button
 * @returns {void}
 */
const handleDownloadTodos = (event) => {
  event.preventDefault();

  updateDownloadLoadingState(true);
  downloadTodos(
    "json",
    (successMessage) => {
      showPersonalDataSuccess(successMessage);
      updateDownloadLoadingState(false);
    },
    (errorMessage) => {
      showPersonalDataError(errorMessage);
      updateDownloadLoadingState(false);
    }
  );
};

/**
 * Gets upload configuration options.
 * @function getUploadOptions
 * @returns {Object} Upload configuration object
 */
const getUploadOptions = () => {
  return {
    allowDuplicates: false,
    showPreview: true,
    skipTrash: false, // Include trash todos in import
    containerId: "personalDataContainer",
  };
};

/**
 * Handles successful upload result.
 * @function handleUploadSuccess
 * @param {Object} result - Upload result object
 * @returns {void}
 */
const handleUploadSuccess = (result) => {
  console.log("Upload successful:", result);

  if (result && result.totalFound) {
    showPersonalDataSuccess(
      `📁 Insgesamt ${result.totalFound} Todos gefunden und verarbeitet`
    );
  }
};

/**
 * Handles upload error.
 * @function handleUploadError
 * @param {Object} result - Error result object
 * @returns {void}
 */
const handleUploadError = (result) => {
  console.error("Upload failed:", result);
};

/**
 * Upload callback function that processes upload results.
 * @function processUploadResult
 * @param {boolean} success - Whether upload was successful
 * @param {Object} result - Upload result or error object
 * @returns {void}
 */
const processUploadResult = (success, result) => {
  updateUploadLoadingState(false);

  if (success) {
    handleUploadSuccess(result);
  } else {
    handleUploadError(result);
  }
};

/**
 * Handles todos upload functionality.
 * @function handleUploadTodos
 * @param {Event} event - Click event
 * @returns {void}
 */
const handleUploadTodos = (event) => {
  event.preventDefault();

  updateUploadLoadingState(true);

  showPersonalDataSuccess(
    "Wähle eine JSON- oder CSV-Datei zum Importieren aus..."
  );

  triggerFileUpload(processUploadResult, getUploadOptions());
};

/**
 * Sets up form-specific handlers for the personal data page.
 * Reserved for future form validation and progress indicators.
 * @function setupPersonalDataFormHandlers
 * @returns {void}
 */
const setupPersonalDataFormHandlers = () => {
  // Additional personal data-specific handlers can be added here
  // For example: file input validation, progress indicators, etc.
};

/**
 * Sets up additional personal data-specific navigation handlers.
 * Called by the main navigation system for all personal data-related event listeners.
 * Main entry point for initializing personal data page functionality.
 * @function setupPersonalDataEventListeners
 * @returns {void}
 * @exports
 */
export const setupPersonalDataEventListeners = () => {
  setupPersonalDataNavigation();
  setupPersonalDataFormHandlers();

  // Additional personal data-specific event listeners can be added here
  // For example: file upload progress, backup/restore functionality, etc.
};
