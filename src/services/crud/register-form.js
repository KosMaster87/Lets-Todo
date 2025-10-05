// lets-todo-app/src/services/crud/register-form.js

import {
  validateEmailField,
  validatePasswordField,
  validatePasswordConfirmField,
  setElementValidity,
} from "./register-validation.js";

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

/**
 * Sets up form event handlers for registration form
 * @param {Function} onSubmit - Form submission callback
 * @param {string} formSelector - CSS selector for form
 */
export const setupRegisterFormHandlers = (
  onSubmit,
  formSelector = ".register-menu"
) => {
  const form = document.querySelector(formSelector);
  if (!form) {
    return false;
  }

  form.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit?.(e);
    }
  });

  return true;
};

/**
 * Sets up individual field validation handlers
 * @param {Object} fieldIds - Object with field ID mappings
 */
export const setupFieldValidation = (fieldIds = FORM_FIELD_IDS) => {
  const emailInput = document.getElementById(fieldIds.EMAIL);
  const passwordInput = document.getElementById(fieldIds.PASSWORD);
  const passwordConfirmInput = document.getElementById(
    fieldIds.PASSWORD_CONFIRM
  );

  if (emailInput) {
    emailInput.addEventListener("blur", handleEmailValidation);
  }

  if (passwordInput) {
    passwordInput.addEventListener("blur", handlePasswordValidation);
  }

  if (passwordConfirmInput) {
    passwordConfirmInput.addEventListener(
      "blur",
      handlePasswordConfirmValidation
    );
  }
};

/**
 * Handles email field validation on blur
 * @param {Event} event - Blur event
 */
export const handleEmailValidation = (event) => {
  const email = event.target.value;
  const validation = validateEmailField(email);

  setElementValidity(
    event.target,
    validation.isValid ? "" : validation.message
  );
};

/**
 * Handles password field validation on blur
 * @param {Event} event - Blur event
 */
export const handlePasswordValidation = (event) => {
  const password = event.target.value;
  const validation = validatePasswordField(password);

  setElementValidity(
    event.target,
    validation.isValid ? "" : validation.message
  );
};

/**
 * Handles password confirmation field validation on blur
 * @param {Event} event - Blur event
 */
export const handlePasswordConfirmValidation = (event) => {
  const passwordConfirm = event.target.value;
  const password =
    document.getElementById(FORM_FIELD_IDS.PASSWORD)?.value || "";
  const validation = validatePasswordConfirmField(password, passwordConfirm);

  setElementValidity(
    event.target,
    validation.isValid ? "" : validation.message
  );
};

/**
 * Extracts form data from registration form
 * @param {Object} fieldIds - Object with field ID mappings
 * @returns {Object|null} Form data object or null if form not found
 */
export const getRegisterFormData = (fieldIds = FORM_FIELD_IDS) => {
  const email = document.getElementById(fieldIds.EMAIL)?.value;
  const password = document.getElementById(fieldIds.PASSWORD)?.value;
  const passwordConfirm = document.getElementById(
    fieldIds.PASSWORD_CONFIRM
  )?.value;
  const termsAccepted = document.getElementById(fieldIds.TERMS)?.checked;

  // Check if at least one field exists (form is present)
  const emailElement = document.getElementById(fieldIds.EMAIL);
  if (!emailElement) {
    return null; // Form not available
  }

  return {
    email: email || "",
    password: password || "",
    passwordConfirm: passwordConfirm || "",
    termsAccepted: termsAccepted || false,
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
  if (!submitBtn) {
    return false;
  }

  submitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    onSubmit?.(e);
  });

  return true;
};

/**
 * Complete form setup with all handlers
 * @param {Function} onSubmit - Form submission callback
 * @param {Object} options - Configuration options
 * @returns {boolean} True if setup was successful
 */
export const setupCompleteRegisterForm = (onSubmit, options = {}) => {
  const {
    formSelector = ".register-menu",
    fieldIds = FORM_FIELD_IDS,
    enableFieldValidation = true,
  } = options;
  let success = true;

  if (!setupRegisterFormHandlers(onSubmit, formSelector)) {
    success = false;
  }

  if (!setupSubmitHandler(onSubmit, fieldIds.SUBMIT_BTN)) {
    success = false;
  }

  if (enableFieldValidation) {
    setupFieldValidation(fieldIds);
  }

  return success;
};
