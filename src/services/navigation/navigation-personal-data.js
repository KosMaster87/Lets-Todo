/**
 * @fileoverview Personal Data Navigation Module
 * @module navigation-personal-data
 */

import { handleNavigationClick } from "./navigation.js";
import { VIEWS, DEBUG_MODE } from "./../../utils/constants.js";
import { downloadTodos } from "./../crud/personal-data-download.js";
import { triggerFileUpload } from "./../crud/personal-data-upload-handler.js";
import {
  showSuccessNotification,
  showErrorNotification,
} from "./../../utils/notifications.js";
import {
  setDownloadButtonState,
  setUploadButtonState,
} from "./../../utils/ui-state-helpers.js";

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
  showSuccessNotification(successMessage);
  setDownloadButtonState(false);
};

/**
 * Handles download error callback
 * @function handleDownloadError
 * @param {string} errorMessage - Error message from download operation
 * @returns {void}
 */
const handleDownloadError = (errorMessage) => {
  showErrorNotification(errorMessage);
  setDownloadButtonState(false);
};

/**
 * Handles download todos click event with loading state management
 * @function handleDownloadTodos
 * @param {Event} event - Click event from download button
 * @returns {void}
 */
const handleDownloadTodos = (event) => {
  event.preventDefault();
  setDownloadButtonState(true);

  const safetyTimeoutId = createDownloadSafetyTimeout();
  const { onSuccess, onError } = createDownloadCallbacks(safetyTimeoutId);

  executeDownloadWithDelay(onSuccess, onError);
};

/**
 * Creates safety timeout for download operations
 * @function createDownloadSafetyTimeout
 * @returns {number} Timeout ID for cleanup
 */
const createDownloadSafetyTimeout = () => {
  return setTimeout(() => {
    setDownloadButtonState(false);
    showErrorNotification("Download process timed out. Please try again.");
  }, 1000);
};

/**
 * Creates download callbacks with timeout cleanup
 * @function createDownloadCallbacks
 * @param {number} safetyTimeoutId - Timeout ID to clear
 * @returns {Object} Success and error callback functions
 */
const createDownloadCallbacks = (safetyTimeoutId) => ({
  onSuccess: (successMessage) => {
    clearTimeout(safetyTimeoutId);
    handleDownloadSuccess(successMessage);
  },
  onError: (errorMessage) => {
    clearTimeout(safetyTimeoutId);
    handleDownloadError(errorMessage);
  },
});

/**
 * Executes download with minimum loading time for user feedback
 * @function executeDownloadWithDelay
 * @param {Function} onSuccess - Success callback function
 * @param {Function} onError - Error callback function
 * @returns {void}
 */
const executeDownloadWithDelay = (onSuccess, onError) => {
  setTimeout(() => {
    downloadTodos(onSuccess, onError);
  }, 800);
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
    showSuccessNotification(
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
  setUploadButtonState(false);

  if (success) {
    handleUploadSuccess(result);
  } else {
    handleUploadError(result);
  }
};

/**
 * Creates safety timeout for upload operations
 * @function createUploadSafetyTimeout
 * @returns {number} Timeout ID for cleanup
 */
const createUploadSafetyTimeout = () => {
  return setTimeout(() => {
    setUploadButtonState(false);
    showErrorNotification("File selection timed out. Please try again.");
  }, 30000);
};

/**
 * Creates upload callback with timeout cleanup
 * @function createUploadCallback
 * @param {number} safetyTimeoutId - Timeout ID to clear
 * @returns {Function} Upload completion callback
 */
const createUploadCallback = (safetyTimeoutId) => {
  return (success, result) => {
    clearTimeout(safetyTimeoutId);
    processUploadResult(success, result);
  };
};

/**
 * Handles upload todos click event with loading state management
 * @function handleUploadTodos
 * @param {Event} event - Click event from upload button
 * @returns {void}
 */
const handleUploadTodos = (event) => {
  event.preventDefault();
  setUploadButtonState(true);
  showSuccessNotification("Select a JSON file to import...");

  const safetyTimeoutId = createUploadSafetyTimeout();
  const uploadCallback = createUploadCallback(safetyTimeoutId);

  triggerFileUpload(uploadCallback, getUploadOptions());
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
