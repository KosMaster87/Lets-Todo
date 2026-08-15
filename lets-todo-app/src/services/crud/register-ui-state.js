/**
 * @fileoverview Registration UI State Management
 * @description Manages loading states, messages, and form resets for user registration
 * @module register-ui-state
 */

// Import the toast notification system
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
} from "../../utils/toast-notifications.js";

// ###############################################################
// Message Type Constants
// ###############################################################

/**
 * Message types for consistent UI feedback
 */
export const MESSAGE_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
  WARNING: "warning",
};

// ###############################################################
// Button State Management
// ###############################################################

/**
 * Gets submit button element
 * @param {string} buttonId - Button element ID
 * @returns {HTMLElement|null} Button element or null
 */
const getSubmitButton = (buttonId) => {
  return document.getElementById(buttonId);
};

/**
 * Updates button loading appearance
 * @param {HTMLElement} button - Button element
 * @param {boolean} isLoading - Loading state
 */
const updateButtonAppearance = (button, isLoading) => {
  button.disabled = isLoading;
  button.textContent = isLoading ? "Registrierung läuft..." : "Registrieren";
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
  const submitBtn = getSubmitButton(buttonId);
  if (!submitBtn) return false;

  updateButtonAppearance(submitBtn, isLoading);
  return true;
};

// ###############################################################
// Message Display Functions
// ###############################################################

/**
 * Executes custom handler if provided
 * @param {Function} handler - Custom handler function
 * @param {string} message - Message to display
 * @param {string} type - Message type
 * @returns {boolean} True if custom handler was used
 */
const executeCustomHandler = (handler, message, type) => {
  if (handler && typeof handler === "function") {
    handler(message, type);
    return true;
  }
  return false;
};

/**
 * Shows register success message
 * @param {string} message - Success message to display
 * @param {Function} customHandler - Optional custom message handler
 */
export const showRegisterSuccess = (message, customHandler) => {
  if (executeCustomHandler(customHandler, message, MESSAGE_TYPES.SUCCESS)) {
    return;
  }

  showSuccessToast(message);
};

/**
 * Shows register error message
 * @param {string} message - Error message to display
 * @param {Function} customHandler - Optional custom message handler
 */
export const showRegisterError = (message, customHandler) => {
  if (executeCustomHandler(customHandler, message, MESSAGE_TYPES.ERROR)) {
    return;
  }

  // Server messages are now clean and user-friendly
  showErrorToast(message);
};

/**
 * Shows register info message
 * @param {string} message - Info message to display
 * @param {Function} customHandler - Optional custom message handler
 */
export const showRegisterInfo = (message, customHandler) => {
  if (executeCustomHandler(customHandler, message, MESSAGE_TYPES.INFO)) {
    return;
  }

  showInfoToast(message);
};

// ###############################################################
// Form Validation State Management
// ###############################################################

/**
 * Gets default form element IDs
 * @returns {Array} Array of default element IDs
 */
const getDefaultElementIds = () => [
  "registerEmail",
  "registerPassword",
  "registerPasswordConfirm",
  "registerTerms",
];

/**
 * Clears validation state for single element
 * @param {string} elementId - Element ID to clear
 */
const clearElementValidation = (elementId) => {
  const element = document.getElementById(elementId);
  if (element && typeof element.setCustomValidity === "function") {
    element.setCustomValidity("");
  }
};

/**
 * Clears all form validation states
 * @param {Array} elementIds - Array of input element IDs to clear
 */
export const clearFormValidation = (elementIds = []) => {
  const idsToProcess =
    elementIds.length > 0 ? elementIds : getDefaultElementIds();
  idsToProcess.forEach(clearElementValidation);
};

// ###############################################################
// Form Reset Operations
// ###############################################################

/**
 * Gets form element by selector
 * @param {string} selector - CSS selector for form
 * @returns {HTMLElement|null} Form element or null
 */
const getFormElement = (selector) => {
  return document.querySelector(selector);
};

/**
 * Resets single input element
 * @param {HTMLElement} input - Input element to reset
 */
const resetInputElement = (input) => {
  input.value = "";
  input.checked = false;
  if (typeof input.setCustomValidity === "function") {
    input.setCustomValidity("");
  }
};

/**
 * Resets all form inputs
 * @param {HTMLElement} form - Form element
 */
const resetFormInputs = (form) => {
  const inputs = form.querySelectorAll("input");
  inputs.forEach(resetInputElement);
};

/**
 * Resets the register form to initial state
 * @param {string} formSelector - CSS selector for the form
 */
export const resetRegisterForm = (formSelector = ".register-menu") => {
  const form = getFormElement(formSelector);
  if (!form) return false;

  resetFormInputs(form);
  updateRegisterLoadingState(false);

  return true;
};

// ###############################################################
// Focus Management
// ###############################################################

/**
 * Gets field to element ID mapping
 * @returns {Object} Field mapping object
 */
const getFieldMapping = () => ({
  email: "registerEmail",
  password: "registerPassword",
  passwordConfirm: "registerPasswordConfirm",
  terms: "registerTerms",
});

/**
 * Focuses element by ID
 * @param {string} elementId - Element ID to focus
 * @returns {boolean} True if element was focused
 */
const focusElementById = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.focus();
    return true;
  }
  return false;
};

/**
 * Sets focus to the first invalid field
 * @param {Object} fieldErrors - Object with field validation errors
 */
export const focusFirstInvalidField = (fieldErrors) => {
  const fieldMapping = getFieldMapping();

  for (const [fieldName, errorMessage] of Object.entries(fieldErrors)) {
    if (errorMessage && fieldMapping[fieldName]) {
      if (focusElementById(fieldMapping[fieldName])) {
        break;
      }
    }
  }
};

// ###############################################################
// Unified Message Handler
// ###############################################################

/**
 * Handles success message display
 * @param {string} message - Message to display
 * @param {Object} options - Handler options
 */
const handleSuccessMessage = (message, options) => {
  showRegisterSuccess(message, options.successHandler);
};

/**
 * Handles error message display
 * @param {string} message - Message to display
 * @param {Object} options - Handler options
 */
const handleErrorMessage = (message, options) => {
  showRegisterError(message, options.errorHandler);
};

/**
 * Handles info message display
 * @param {string} message - Message to display
 * @param {Object} options - Handler options
 */
const handleInfoMessage = (message, options) => {
  showRegisterInfo(message, options.infoHandler);
};

/**
 * Handles message display by type
 * @param {string} message - Message to display
 * @param {string} type - Message type
 * @param {Object} options - Handler options
 */
const handleMessageByType = (message, type, options) => {
  if (type === MESSAGE_TYPES.SUCCESS) {
    handleSuccessMessage(message, options);
  } else if (type === MESSAGE_TYPES.ERROR) {
    handleErrorMessage(message, options);
  } else if (type === MESSAGE_TYPES.INFO) {
    handleInfoMessage(message, options);
  } else {
    showRegisterInfo(message, options.defaultHandler);
  }
};

/**
 * Creates a unified message handler for all register UI feedback
 * @param {Object} options - Configuration options for message display
 * @returns {Function} Message handler function
 */
export const createRegisterMessageHandler = (options = {}) => {
  return (message, type = MESSAGE_TYPES.INFO) => {
    handleMessageByType(message, type, options);
  };
};
