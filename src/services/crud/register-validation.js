/**
 * @fileoverview Registration Form Validation Utilities
 * @description Provides functions to validate registration form inputs
 * @module register-validation
 */

// ###############################################################
// Validation Messages and Constants
// ###############################################################

/**
 * Validation error messages
 */
export const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: "E-Mail-Adresse ist erforderlich",
  EMAIL_INVALID: "Ungültige E-Mail-Adresse",
  PASSWORD_REQUIRED: "Passwort ist erforderlich",
  PASSWORD_TOO_SHORT: "Password must be at least 6 characters long",
  PASSWORD_CONFIRM_REQUIRED: "Passwort-Bestätigung ist erforderlich",
  PASSWORD_MISMATCH: "Die Passwörter stimmen nicht überein",
  TERMS_NOT_ACCEPTED: "You must accept the terms and conditions",
  ALL_FIELDS_REQUIRED: "Bitte fülle alle Felder aus",
};

// ###############################################################
// Input Validation Utilities
// ###############################################################

/**
 * Checks if email format is valid using regex
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Checks if string is empty or only whitespace
 * @param {string} value - Value to check
 * @returns {boolean} True if empty
 */
const isEmpty = (value) => !value || value.trim() === "";

/**
 * Creates validation result object
 * @param {boolean} isValid - Validation result
 * @param {string} message - Error message
 * @returns {Object} Validation result object
 */
const createValidationResult = (isValid, message = "") => ({
  isValid,
  message,
});

// ###############################################################
// Field-Specific Validation Functions
// ###############################################################

/**
 * Validates email field
 * @param {string} email - Email to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateEmailField = (email) => {
  if (isEmpty(email)) {
    return createValidationResult(false, VALIDATION_MESSAGES.EMAIL_REQUIRED);
  }

  if (!isValidEmail(email)) {
    return createValidationResult(false, VALIDATION_MESSAGES.EMAIL_INVALID);
  }

  return createValidationResult(true);
};

/**
 * Validates password field
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validatePasswordField = (password) => {
  if (isEmpty(password)) {
    return createValidationResult(false, VALIDATION_MESSAGES.PASSWORD_REQUIRED);
  }

  if (password.length < 6) {
    return createValidationResult(
      false,
      VALIDATION_MESSAGES.PASSWORD_TOO_SHORT
    );
  }

  return createValidationResult(true);
};

/**
 * Validates password confirmation field
 * @param {string} password - Original password
 * @param {string} passwordConfirm - Password confirmation
 * @returns {Object} Validation result with isValid and message
 */
export const validatePasswordConfirmField = (password, passwordConfirm) => {
  if (isEmpty(passwordConfirm)) {
    return createValidationResult(
      false,
      VALIDATION_MESSAGES.PASSWORD_CONFIRM_REQUIRED
    );
  }

  if (password !== passwordConfirm) {
    return createValidationResult(false, VALIDATION_MESSAGES.PASSWORD_MISMATCH);
  }

  return createValidationResult(true);
};

/**
 * Validates terms acceptance
 * @param {boolean} termsAccepted - Terms acceptance state
 * @returns {Object} Validation result with isValid and message
 */
export const validateTermsAcceptance = (termsAccepted) => {
  if (!termsAccepted) {
    return createValidationResult(
      false,
      VALIDATION_MESSAGES.TERMS_NOT_ACCEPTED
    );
  }

  return createValidationResult(true);
};

// ###############################################################
// Form Validation Orchestration
// ###############################################################

/**
 * Runs all field validations
 * @param {Object} formData - Form data object
 * @returns {Object} All validation results
 */
const runAllValidations = (formData) => {
  const { email, password, passwordConfirm, termsAccepted } = formData;

  return {
    email: validateEmailField(email),
    password: validatePasswordField(password),
    passwordConfirm: validatePasswordConfirmField(password, passwordConfirm),
    terms: validateTermsAcceptance(termsAccepted),
  };
};

/**
 * Builds field errors object from validations
 * @param {Object} validations - Validation results
 * @returns {Object} Field errors object
 */
const buildFieldErrors = (validations) => {
  const fieldErrors = {};

  if (!validations.email.isValid) fieldErrors.email = validations.email.message;
  if (!validations.password.isValid)
    fieldErrors.password = validations.password.message;
  if (!validations.passwordConfirm.isValid)
    fieldErrors.passwordConfirm = validations.passwordConfirm.message;
  if (!validations.terms.isValid) fieldErrors.terms = validations.terms.message;

  return fieldErrors;
};

/**
 * Checks if all validations passed
 * @param {Object} validations - Validation results
 * @returns {boolean} True if all valid
 */
const areAllValidationsValid = (validations) => {
  return Object.values(validations).every((v) => v.isValid);
};

/**
 * Validates entire registration form
 * @param {Object} formData - Form data object
 * @returns {Object} Validation result with isValid, message, and field errors
 */
export const validateRegistrationForm = (formData) => {
  const validations = runAllValidations(formData);
  const fieldErrors = buildFieldErrors(validations);
  const isValid = areAllValidationsValid(validations);

  return {
    isValid,
    message: isValid ? "" : Object.values(fieldErrors)[0], // First error message
    fieldErrors,
  };
};

// ###############################################################
// DOM Validation Utilities
// ###############################################################

/**
 * Sets custom validity message on DOM element
 * @param {Element} element - DOM input element
 * @param {string} message - Validation message
 */
export const setElementValidity = (element, message) => {
  if (element && typeof element.setCustomValidity === "function") {
    element.setCustomValidity(message);
  }
};
