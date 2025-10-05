// lets-todo-app/src/services/crud/register-ui-state.js

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
 * Updates loading state for register submit button
 * @param {boolean} isLoading - Loading state
 * @param {string} buttonId - ID of submit button
 */
export const updateRegisterLoadingState = (
  isLoading,
  buttonId = "registerSubmitBtn"
) => {
  const submitBtn = document.getElementById(buttonId);
  if (!submitBtn) {
    return false;
  }

  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? "Registrierung läuft..." : "Registrieren";

  return true;
};

/**
 * Shows register success message
 * @param {string} message - Success message to display
 * @param {Function} customHandler - Optional custom message handler
 */
export const showRegisterSuccess = (message, customHandler) => {
  if (customHandler && typeof customHandler === "function") {
    customHandler(message, MESSAGE_TYPES.SUCCESS);
    return;
  }

  // TODO: Replace with proper toast/notification system
  alert(`✅ ${message}`);
};

/**
 * Shows register error message
 * @param {string} message - Error message to display
 * @param {Function} customHandler - Optional custom message handler
 */
export const showRegisterError = (message, customHandler) => {
  if (customHandler && typeof customHandler === "function") {
    customHandler(message, MESSAGE_TYPES.ERROR);
    return;
  }

  // TODO: Replace with proper toast/notification system
  alert(`❌ ${message}`);
};

/**
 * Shows register info message
 * @param {string} message - Info message to display
 * @param {Function} customHandler - Optional custom message handler
 */
export const showRegisterInfo = (message, customHandler) => {
  if (customHandler && typeof customHandler === "function") {
    customHandler(message, MESSAGE_TYPES.INFO);
    return;
  }

  // TODO: Replace with proper toast/notification system
  alert(`ℹ️ ${message}`);
};

/**
 * Clears all form validation states
 * @param {Array} elementIds - Array of input element IDs to clear
 */
export const clearFormValidation = (elementIds = []) => {
  const defaultIds = [
    "registerEmail",
    "registerPassword",
    "registerPasswordConfirm",
    "registerTerms",
  ];

  const idsToProcess = elementIds.length > 0 ? elementIds : defaultIds;

  idsToProcess.forEach((id) => {
    const element = document.getElementById(id);
    if (element && typeof element.setCustomValidity === "function") {
      element.setCustomValidity("");
    }
  });
};

/**
 * Resets the register form to initial state
 * @param {string} formSelector - CSS selector for the form
 */
export const resetRegisterForm = (formSelector = ".register-menu") => {
  const form = document.querySelector(formSelector);
  if (!form) {
    return false;
  }

  // Reset form fields
  const inputs = form.querySelectorAll("input");
  inputs.forEach((input) => {
    input.value = "";
    input.checked = false;
    if (typeof input.setCustomValidity === "function") {
      input.setCustomValidity("");
    }
  });

  // Reset submit button
  updateRegisterLoadingState(false);

  return true;
};

/**
 * Sets focus to the first invalid field
 * @param {Object} fieldErrors - Object with field validation errors
 */
export const focusFirstInvalidField = (fieldErrors) => {
  const fieldMapping = {
    email: "registerEmail",
    password: "registerPassword",
    passwordConfirm: "registerPasswordConfirm",
    terms: "registerTerms",
  };

  for (const [fieldName, errorMessage] of Object.entries(fieldErrors)) {
    if (errorMessage) {
      const elementId = fieldMapping[fieldName];
      const element = document.getElementById(elementId);
      if (element) {
        element.focus();
        break;
      }
    }
  }
};

/**
 * Creates a unified message handler for all register UI feedback
 * @param {Object} options - Configuration options for message display
 * @returns {Function} Message handler function
 */
export const createRegisterMessageHandler = (options = {}) => {
  return (message, type = MESSAGE_TYPES.INFO) => {
    switch (type) {
      case MESSAGE_TYPES.SUCCESS:
        showRegisterSuccess(message, options.successHandler);
        break;
      case MESSAGE_TYPES.ERROR:
        showRegisterError(message, options.errorHandler);
        break;
      case MESSAGE_TYPES.INFO:
        showRegisterInfo(message, options.infoHandler);
        break;
      default:
        showRegisterInfo(message, options.defaultHandler);
    }
  };
};
