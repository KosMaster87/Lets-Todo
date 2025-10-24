/**
 * @fileoverview Registration Form Handlers and Validation
 * @module register-form
 */

import {
  validateEmailField,
  validatePasswordField,
  validatePasswordConfirmField,
  setElementValidity,
} from "./register-validation.js";

// ###############################################################
// Form Field Configuration
// ###############################################################

/**
 * Form field IDs for consistent reference
 */
export const FORM_FIELD_IDS = {
  EMAIL: "registerEmail",
  PASSWORD: "registerPassword",
  PASSWORD_CONFIRM: "registerPasswordConfirm",
  TERMS: "registerTerms",
  SUBMIT_BTN: "registerSubmitBtn",
};

// ###############################################################
// Form Event Handler Setup
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
 * Creates Enter key handler for form submission
 * @param {Function} onSubmit - Submit callback
 * @returns {Function} Event handler function
 */
const createEnterKeyHandler = (onSubmit) => {
  return (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit?.(e);
    }
  };
};

/**
 * Sets up form event handlers for registration form
 * @param {Function} onSubmit - Form submission callback
 * @param {string} formSelector - CSS selector for form
 */
export const setupRegisterFormHandlers = (
  onSubmit,
  formSelector = ".register-menu"
) => {
  const form = getFormElement(formSelector);
  if (!form) return false;

  form.addEventListener("keypress", createEnterKeyHandler(onSubmit));
  return true;
};

// ###############################################################
// Field Validation Setup
// ###############################################################

/**
 * Sets up email field validation
 * @param {string} fieldId - Email field ID
 */
const setupEmailValidation = (fieldId) => {
  const emailInput = document.getElementById(fieldId);
  if (emailInput) {
    emailInput.addEventListener("blur", handleEmailValidation);
  }
};

/**
 * Sets up password field validation
 * @param {string} fieldId - Password field ID
 */
const setupPasswordValidation = (fieldId) => {
  const passwordInput = document.getElementById(fieldId);
  if (passwordInput) {
    passwordInput.addEventListener("blur", handlePasswordValidation);
  }
};

/**
 * Sets up password confirmation field validation
 * @param {string} fieldId - Password confirm field ID
 */
const setupPasswordConfirmValidation = (fieldId) => {
  const passwordConfirmInput = document.getElementById(fieldId);
  if (passwordConfirmInput) {
    passwordConfirmInput.addEventListener(
      "blur",
      handlePasswordConfirmValidation
    );
  }
};

/**
 * Sets up individual field validation handlers
 * @param {Object} fieldIds - Object with field ID mappings
 */
export const setupFieldValidation = (fieldIds = FORM_FIELD_IDS) => {
  setupEmailValidation(fieldIds.EMAIL);
  setupPasswordValidation(fieldIds.PASSWORD);
  setupPasswordConfirmValidation(fieldIds.PASSWORD_CONFIRM);
};

// ###############################################################
// Field Validation Handlers
// ###############################################################

/**
 * Sets validation message on element
 * @param {HTMLElement} element - Target element
 * @param {Object} validation - Validation result
 */
const setValidationMessage = (element, validation) => {
  setElementValidity(element, validation.isValid ? "" : validation.message);
};

/**
 * Handles email field validation on blur
 * @param {Event} event - Blur event
 */
export const handleEmailValidation = (event) => {
  const email = event.target.value;
  const validation = validateEmailField(email);
  setValidationMessage(event.target, validation);
};

/**
 * Handles password field validation on blur
 * @param {Event} event - Blur event
 */
export const handlePasswordValidation = (event) => {
  const password = event.target.value;
  const validation = validatePasswordField(password);
  setValidationMessage(event.target, validation);
};

/**
 * Gets password field value
 * @returns {string} Password field value
 */
const getPasswordValue = () => {
  return document.getElementById(FORM_FIELD_IDS.PASSWORD)?.value || "";
};

/**
 * Handles password confirmation field validation on blur
 * @param {Event} event - Blur event
 */
export const handlePasswordConfirmValidation = (event) => {
  const passwordConfirm = event.target.value;
  const password = getPasswordValue();
  const validation = validatePasswordConfirmField(password, passwordConfirm);
  setValidationMessage(event.target, validation);
};

// ###############################################################
// Form Data Extraction
// ###############################################################

/**
 * Checks if form is available
 * @param {Object} fieldIds - Field ID mappings
 * @returns {boolean} True if form is available
 */
const isFormAvailable = (fieldIds) => {
  return document.getElementById(fieldIds.EMAIL) !== null;
};

/**
 * Extracts field values from form
 * @param {Object} fieldIds - Field ID mappings
 * @returns {Object} Field values object
 */
const extractFieldValues = (fieldIds) => {
  return {
    email: document.getElementById(fieldIds.EMAIL)?.value || "",
    password: document.getElementById(fieldIds.PASSWORD)?.value || "",
    passwordConfirm:
      document.getElementById(fieldIds.PASSWORD_CONFIRM)?.value || "",
    termsAccepted: document.getElementById(fieldIds.TERMS)?.checked || false,
  };
};

/**
 * Extracts form data from registration form
 * @param {Object} fieldIds - Object with field ID mappings
 * @returns {Object|null} Form data object or null if form not found
 */
export const getRegisterFormData = (fieldIds = FORM_FIELD_IDS) => {
  if (!isFormAvailable(fieldIds)) {
    return null; // Form not available
  }

  return extractFieldValues(fieldIds);
};

// ###############################################################
// Submit Handler Setup
// ###############################################################

/**
 * Creates submit button click handler
 * @param {Function} onSubmit - Submit callback
 * @returns {Function} Click event handler
 */
const createSubmitClickHandler = (onSubmit) => {
  return (e) => {
    e.preventDefault();
    onSubmit?.(e);
  };
};

/**
 * Sets up submit button event handler
 * @param {Function} onSubmit - Submit callback function
 * @param {string} buttonId - Submit button ID
 */
export const setupSubmitHandler = (
  onSubmit,
  buttonId = FORM_FIELD_IDS.SUBMIT_BTN
) => {
  const submitBtn = document.getElementById(buttonId);
  if (!submitBtn) return false;

  submitBtn.addEventListener("click", createSubmitClickHandler(onSubmit));
  return true;
};

// ###############################################################
// Complete Form Setup
// ###############################################################

/**
 * Gets form setup options with defaults
 * @param {Object} options - User provided options
 * @returns {Object} Complete options object
 */
const getFormSetupOptions = (options) => {
  return {
    formSelector: ".register-menu",
    fieldIds: FORM_FIELD_IDS,
    enableFieldValidation: true,
    ...options,
  };
};

/**
 * Sets up core form handlers
 * @param {Function} onSubmit - Submit callback
 * @param {Object} options - Setup options
 * @returns {boolean} True if successful
 */
const setupCoreHandlers = (onSubmit, options) => {
  let success = true;

  if (!setupRegisterFormHandlers(onSubmit, options.formSelector)) {
    success = false;
  }

  if (!setupSubmitHandler(onSubmit, options.fieldIds.SUBMIT_BTN)) {
    success = false;
  }

  return success;
};

/**
 * Complete form setup with all handlers
 * @param {Function} onSubmit - Form submission callback
 * @param {Object} options - Configuration options
 * @returns {boolean} True if setup was successful
 */
export const setupCompleteRegisterForm = (onSubmit, options = {}) => {
  const setupOptions = getFormSetupOptions(options);
  const success = setupCoreHandlers(onSubmit, setupOptions);

  if (setupOptions.enableFieldValidation) {
    setupFieldValidation(setupOptions.fieldIds);
  }

  return success;
};
