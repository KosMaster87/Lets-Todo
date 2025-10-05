// lets-todo-app/src/services/navigation-personal-data.js

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
 */
const setupPersonalDataNavigation = () => {
  const personalDataLinks = [
    { id: "personalDataCancelBtn", view: VIEWS.OPTIONS },
    { id: "resetPasswordBtn", view: VIEWS.RESET_PASSWORD },
    { id: "changePasswordBtn", view: VIEWS.CHANGE_PASSWORD },
  ];

  personalDataLinks.forEach(({ id, view }) => {
    const element = document.getElementById(id);
    if (element) {
      element.onclick = (e) => handleNavigationClick(e, view);
    }
  });

  const downloadTodosBtn = document.getElementById("downloadTodosBtn");
  if (downloadTodosBtn) {
    downloadTodosBtn.onclick = (e) => handleDownloadTodos(e);
  }

  const uploadTodosBtn = document.getElementById("uploadTodosBtn");
  if (uploadTodosBtn) {
    uploadTodosBtn.onclick = (e) => handleUploadTodos(e);
  }

  const resetPasswordBtn = document.getElementById("resetPasswordBtn");
  if (resetPasswordBtn) {
    resetPasswordBtn.onclick = (e) => handleEmailPasswordReset(e);
  }

  const changePasswordBtn = document.getElementById("changePasswordBtn");
  if (changePasswordBtn) {
    changePasswordBtn.onclick = (e) => handleChangePassword(e);
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

  updateDownloadLoadingState(true);

  // Default to JSON format - could be made configurable
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
 * Handles todos upload functionality.
 * @param {Event} event - Click event
 */
const handleUploadTodos = (event) => {
  event.preventDefault();

  updateUploadLoadingState(true);

  // Show info about supported formats
  showPersonalDataSuccess(
    "Wähle eine JSON- oder CSV-Datei zum Importieren aus..."
  );

  // Trigger file upload with options
  triggerFileUpload(
    (success, result) => {
      updateUploadLoadingState(false);

      if (success) {
        // Success message already shown by upload handler
        console.log("Upload successful:", result);

        // Show detailed result if available
        if (result && result.totalFound) {
          showPersonalDataSuccess(
            `📁 Insgesamt ${result.totalFound} Todos gefunden und verarbeitet`
          );
        }
      } else {
        console.error("Upload failed:", result);
      }
    },
    {
      allowDuplicates: false,
      showPreview: true,
      skipTrash: false, // Include trash todos in import
      containerId: "personalDataContainer",
    }
  );
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
