// lets-todo-app/src/services/crud/personal-data-ui-state.js

/**
 * Message types for consistent UI feedback
 */
export const MESSAGE_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
  WARNING: "warning",
};

/**
 * Shows personal data success message
 * @param {string} message - Success message to display
 * @param {Function} customHandler - Optional custom message handler
 */
export const showPersonalDataSuccess = (message, customHandler) => {
  if (customHandler && typeof customHandler === "function") {
    customHandler(message, MESSAGE_TYPES.SUCCESS);
    return;
  }

  // TODO: Replace with proper toast/notification system
  alert(`✅ ${message}`);
};

/**
 * Shows personal data error message
 * @param {string} message - Error message to display
 * @param {Function} customHandler - Optional custom message handler
 */
export const showPersonalDataError = (message, customHandler) => {
  if (customHandler && typeof customHandler === "function") {
    customHandler(message, MESSAGE_TYPES.ERROR);
    return;
  }

  // TODO: Replace with proper toast/notification system
  alert(`❌ ${message}`);
};

/**
 * Shows personal data info message
 * @param {string} message - Info message to display
 * @param {Function} customHandler - Optional custom message handler
 */
export const showPersonalDataInfo = (message, customHandler) => {
  if (customHandler && typeof customHandler === "function") {
    customHandler(message, MESSAGE_TYPES.INFO);
    return;
  }

  // TODO: Replace with proper toast/notification system
  alert(`ℹ️ ${message}`);
};

/**
 * Updates loading state for buttons
 * @param {boolean} isLoading - Loading state
 * @param {string} buttonId - ID of button to update
 * @param {string} loadingText - Text to show during loading
 * @param {string} defaultText - Default button text
 */
export const updateButtonLoadingState = (
  isLoading,
  buttonId,
  loadingText = "Lädt...",
  defaultText = "Button"
) => {
  const button = document.getElementById(buttonId);
  if (!button) {
    return false;
  }

  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : defaultText;

  return true;
};

/**
 * Updates download button loading state
 * @param {boolean} isLoading - Loading state
 * @param {string} buttonId - Download button ID
 */
export const updateDownloadLoadingState = (
  isLoading,
  buttonId = "downloadTodosBtn"
) => {
  return updateButtonLoadingState(
    isLoading,
    buttonId,
    "Exportiere...",
    "Todos exportieren"
  );
};

/**
 * Updates upload button loading state
 * @param {boolean} isLoading - Loading state
 * @param {string} buttonId - Upload button ID
 */
export const updateUploadLoadingState = (
  isLoading,
  buttonId = "uploadTodosBtn"
) => {
  return updateButtonLoadingState(
    isLoading,
    buttonId,
    "Importiere...",
    "Todos importieren"
  );
};

/**
 * Creates a progress indicator for upload operations
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} status - Status message
 * @returns {string} - HTML for progress indicator
 */
function createProgressIndicator(progress, status) {
  return `
    <div class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <div class="progress-text">${status}</div>
    </div>
  `;
}

/**
 * Shows password change feedback messages
 * @param {string} message - Success message
 * @param {number} duration - Display duration in milliseconds
 */
function showPasswordChangeSuccess(message, duration = 3000) {
  showPersonalDataSuccess(message, duration);
}

/**
 * Shows password change error messages
 * @param {string} message - Error message
 * @param {number} duration - Display duration in milliseconds
 */
function showPasswordChangeError(message, duration = 5000) {
  showPersonalDataError(message, duration);
}

/**
 * Updates password strength indicator in UI
 * @param {string} containerId - ID of container element
 * @param {Object} strengthData - Password strength data from validation
 */
function updatePasswordStrengthIndicator(containerId, strengthData) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const { isValid, strengthLevel, strengthScore, strengthIndicators, errors } =
    strengthData;

  // Create strength indicator HTML
  let strengthClass = "strength-weak";
  if (strengthLevel === "Stark") strengthClass = "strength-strong";
  else if (strengthLevel === "Mittel") strengthClass = "strength-medium";

  const indicatorHTML = `
    <div class="password-strength-indicator ${strengthClass}">
      <div class="strength-bar">
        <div class="strength-fill" style="width: ${
          (strengthScore / 6) * 100
        }%"></div>
      </div>
      <div class="strength-text">Stärke: ${strengthLevel}</div>
      ${
        strengthIndicators.length > 0
          ? `
        <div class="strength-details">
          ${strengthIndicators
            .map(
              (indicator) => `<span class="strength-item">✓ ${indicator}</span>`
            )
            .join("")}
        </div>
      `
          : ""
      }
      ${
        errors.length > 0
          ? `
        <div class="strength-errors">
          ${errors
            .map((error) => `<span class="error-item">⚠ ${error}</span>`)
            .join("")}
        </div>
      `
          : ""
      }
    </div>
  `;

  container.innerHTML = indicatorHTML;
}

/**
 * Shows password change loading state
 * @param {boolean} isLoading - Whether to show loading state
 * @param {string} buttonId - ID of submit button
 * @param {string} originalText - Original button text
 */
function updatePasswordChangeLoadingState(
  isLoading,
  buttonId = "change-password-btn",
  originalText = "Passwort ändern"
) {
  const button = document.getElementById(buttonId);
  if (!button) return;

  if (isLoading) {
    button.disabled = true;
    button.innerHTML = `
      <span class="loading-spinner"></span>
      Passwort wird geändert...
    `;
  } else {
    button.disabled = false;
    button.innerHTML = originalText;
  }
}

export {
  createProgressIndicator,
  showPasswordChangeSuccess,
  showPasswordChangeError,
  updatePasswordStrengthIndicator,
  updatePasswordChangeLoadingState,
};

/**
 * Removes progress indicator
 * @param {string} containerId - Container element ID
 */
export const removeProgressIndicator = (containerId) => {
  const container = document.getElementById(containerId);
  const progressDiv = document.getElementById("personalDataProgress");

  if (container && progressDiv) {
    container.removeChild(progressDiv);
  }
};

/**
 * Shows file selection dialog info
 * @param {Array} supportedFormats - Array of supported file formats
 * @param {Function} onMessage - Message callback
 */
export const showFileSelectionInfo = (supportedFormats, onMessage) => {
  const formatList = supportedFormats.join(", ").toUpperCase();
  const message = `Bitte wähle eine Datei aus. Unterstützte Formate: ${formatList}`;

  showPersonalDataInfo(message, onMessage);
};
