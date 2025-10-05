// lets-todo-app/src/services/crud/register-validation.js

/**
 * Validation error messages
 */
export const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: "E-Mail-Adresse ist erforderlich",
  EMAIL_INVALID: "Ungültige E-Mail-Adresse",
  PASSWORD_REQUIRED: "Passwort ist erforderlich",
  PASSWORD_TOO_SHORT: "Das Passwort muss mindestens 6 Zeichen lang sein",
  PASSWORD_CONFIRM_REQUIRED: "Passwort-Bestätigung ist erforderlich",
  PASSWORD_MISMATCH: "Die Passwörter stimmen nicht überein",
  TERMS_NOT_ACCEPTED: "Du musst die Nutzungsbedingungen akzeptieren",
  ALL_FIELDS_REQUIRED: "Bitte fülle alle Felder aus",
};

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
 * Validates email field
 * @param {string} email - Email to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateEmailField = (email) => {
  if (!email || email.trim() === "") {
    return {
      isValid: false,
      message: VALIDATION_MESSAGES.EMAIL_REQUIRED,
    };
  }

  if (!isValidEmail(email)) {
    return {
      isValid: false,
      message: VALIDATION_MESSAGES.EMAIL_INVALID,
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validates password field
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validatePasswordField = (password) => {
  if (!password || password.trim() === "") {
    return {
      isValid: false,
      message: VALIDATION_MESSAGES.PASSWORD_REQUIRED,
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      message: VALIDATION_MESSAGES.PASSWORD_TOO_SHORT,
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validates password confirmation field
 * @param {string} password - Original password
 * @param {string} passwordConfirm - Password confirmation
 * @returns {Object} Validation result with isValid and message
 */
export const validatePasswordConfirmField = (password, passwordConfirm) => {
  if (!passwordConfirm || passwordConfirm.trim() === "") {
    return {
      isValid: false,
      message: VALIDATION_MESSAGES.PASSWORD_CONFIRM_REQUIRED,
    };
  }

  if (password !== passwordConfirm) {
    return {
      isValid: false,
      message: VALIDATION_MESSAGES.PASSWORD_MISMATCH,
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validates terms acceptance
 * @param {boolean} termsAccepted - Terms acceptance state
 * @returns {Object} Validation result with isValid and message
 */
export const validateTermsAcceptance = (termsAccepted) => {
  if (!termsAccepted) {
    return {
      isValid: false,
      message: VALIDATION_MESSAGES.TERMS_NOT_ACCEPTED,
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validates entire registration form
 * @param {Object} formData - Form data object
 * @returns {Object} Validation result with isValid, message, and field errors
 */
export const validateRegistrationForm = (formData) => {
  const { email, password, passwordConfirm, termsAccepted } = formData;

  const emailValidation = validateEmailField(email);
  const passwordValidation = validatePasswordField(password);
  const passwordConfirmValidation = validatePasswordConfirmField(
    password,
    passwordConfirm
  );
  const termsValidation = validateTermsAcceptance(termsAccepted);

  const fieldErrors = {};
  if (!emailValidation.isValid) fieldErrors.email = emailValidation.message;
  if (!passwordValidation.isValid)
    fieldErrors.password = passwordValidation.message;
  if (!passwordConfirmValidation.isValid)
    fieldErrors.passwordConfirm = passwordConfirmValidation.message;
  if (!termsValidation.isValid) fieldErrors.terms = termsValidation.message;

  const isValid =
    emailValidation.isValid &&
    passwordValidation.isValid &&
    passwordConfirmValidation.isValid &&
    termsValidation.isValid;

  return {
    isValid,
    message: isValid ? "" : Object.values(fieldErrors)[0], // First error message
    fieldErrors,
  };
};

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
