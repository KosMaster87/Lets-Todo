// lets-todo-app/src/services/navigation-personal-data.js

/**
 * @fileoverview Personal Data Navigation Module
 * @module navigation-personal-data
 */

import { handleNavigationClick } from "./navigation.js";
import { VIEWS, DEBUG_MODE } from "./../../utils/constants.js";
import { downloadTodos } from "./../crud/personal-data-download.js";
import { triggerFileUpload } from "./../crud/personal-data-upload-handler.js";
import {
  showPersonalDataSuccess,
  showPersonalDataError,
  updateDownloadLoadingState,
  updateUploadLoadingState,
} from "./../crud/personal-data-ui-state.js";

/**
 * Logs personal data operation status for debugging
 * @function logPersonalDataStatus
 * @param {string} type - Message type (success, error, warning, info)
 * @param {string} message - Message to log
 * @param {any} [data=null] - Optional data to log
 * @returns {void}
 */
const logPersonalDataStatus = (type, message, data = null) => {
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
 * Sets up standard navigation buttons that redirect to other views
 * Maps navigation button clicks to their corresponding views and actions.
 * @function setupStandardNavigationButtons
 * @returns {void}
 */
const setupStandardNavigationButtons = () => {
  const links = [
    { id: "personalDataCancelBtn", view: VIEWS.OPTIONS },
    { id: "resetPasswordBtn", view: VIEWS.RESET_PASSWORD },
    { id: "changePasswordBtn", view: VIEWS.CHANGE_PASSWORD },
  ];

  links.forEach(({ id, view }) => {
    const element = document.getElementById(id);
    if (element) {
      element.onclick = (e) => handleNavigationClick(e, view);
    }
  });
};

/**
 * Sets up action buttons for download and upload functionality
 * Configures click handlers for data import/export operations.
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
 * Sets up personal data navigation buttons and handlers
 * Coordinates setup of both standard navigation and action buttons.
 * @function setupPersonalDataNavigation
 * @returns {void}
 */
const setupPersonalDataNavigation = () => {
  setupStandardNavigationButtons();
  setupActionButtons();
};

/**
 * Handles download success callback
 * @function handleDownloadSuccess
 * @param {string} successMessage - Success message from download operation
 * @returns {void}
 */
const handleDownloadSuccess = (successMessage) => {
  showPersonalDataSuccess(successMessage);
  updateDownloadLoadingState(false);
};

/**
 * Handles download error callback
 * @function handleDownloadError
 * @param {string} errorMessage - Error message from download operation
 * @returns {void}
 */
const handleDownloadError = (errorMessage) => {
  showPersonalDataError(errorMessage);
  updateDownloadLoadingState(false);
};

/**
 * Handles todos download functionality
 * Initiates download process with loading state management.
 * @function handleDownloadTodos
 * @param {Event} event - Click event from download button
 * @returns {void}
 */
const handleDownloadTodos = (event) => {
  event.preventDefault();

  updateDownloadLoadingState(true);
  downloadTodos("json", handleDownloadSuccess, handleDownloadError);
};

/**
 * Gets upload configuration options
 * @function getUploadOptions
 * @returns {Object} Upload configuration object
 * @returns {boolean} returns.allowDuplicates - Whether to allow duplicate todos
 * @returns {boolean} returns.showPreview - Whether to show upload preview
 * @returns {boolean} returns.skipTrash - Whether to skip trash during upload
 * @returns {string} returns.containerId - DOM container ID for upload UI
 */
const getUploadOptions = () => ({
  allowDuplicates: false,
  showPreview: true,
  skipTrash: false,
  containerId: "personalDataContainer",
});

/**
 * Handles successful upload result
 * @function handleUploadSuccess
 * @param {Object} result - Upload result object
 * @param {number} [result.totalFound] - Number of todos found and processed
 * @param {string} [result.message] - Success message from upload operation
 * @returns {void}
 */
const handleUploadSuccess = (result) => {
  logPersonalDataStatus("success", "Upload successful:", result);

  if (result && result.totalFound) {
    showPersonalDataSuccess(
      `📁 Total ${result.totalFound} todos found and processed`
    );
  }
};

/**
 * Handles upload error
 * @function handleUploadError
 * @param {Object} result - Error result object
 * @param {string} [result.message] - Error message from upload operation
 * @param {string} [result.error] - Detailed error information
 * @returns {void}
 */
const handleUploadError = (result) => {
  logPersonalDataStatus("error", "Upload failed:", result);
};

/**
 * Upload callback function that processes upload results
 * Routes upload results to appropriate success or error handlers.
 * @function processUploadResult
 * @param {boolean} success - Whether upload was successful
 * @param {Object} result - Upload result or error object
 * @param {number} [result.totalFound] - Number of todos processed (success)
 * @param {string} [result.message] - Result message
 * @param {string} [result.error] - Error details (failure)
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
 * Handles todos upload functionality
 * Initiates file upload process with loading state and user guidance.
 * @function handleUploadTodos
 * @param {Event} event - Click event from upload button
 * @returns {void}
 */
const handleUploadTodos = (event) => {
  event.preventDefault();

  updateUploadLoadingState(true);

  showPersonalDataSuccess("Select a JSON or CSV file to import...");

  triggerFileUpload(processUploadResult, getUploadOptions());
};

/**
 * Sets up form-specific handlers for the personal data page
 * Placeholder for additional form handling logic.
 * @function setupPersonalDataFormHandlers
 * @returns {void}
 */
const setupPersonalDataFormHandlers = () => {
  // Additional personal data-specific handlers can be added here.
  // For example: file input validation, progress indicators, etc.
};

/**
 * Sets up personal data-specific navigation handlers and event listeners
 * Main entry point called by the navigation system for all personal data-related event listeners.
 * @function setupPersonalDataEventListeners
 * @returns {void}
 * @exports
 */
export const setupPersonalDataEventListeners = () => {
  setupPersonalDataNavigation();
  setupPersonalDataFormHandlers();
  // Additional personal data-specific event listeners can be added here.
  // For example: file upload progress, backup/restore functionality, etc.
};
