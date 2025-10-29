/**
 * @fileoverview Pure password validation logic utilities
 * @description Provides functions for validating password inputs
 * @module password-validation
 */

import { DEBUG_MODE } from "./constants.js";
import {
  focusCurrentPasswordInput,
  focusNewPasswordInput,
  focusConfirmPasswordInput,
} from "./password-dom.js";

/**
 * Password validation configuration constants
 */
const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  MESSAGES: {
    BOTH_FIELDS_REQUIRED: "Please fill in both password fields",
    CURRENT_REQUIRED: "Current password is required.",
    NEW_REQUIRED: "New password is required.",
    MIN_LENGTH: "Password must be at least 8 characters long.",
    CONFIRM_REQUIRED: "Please confirm your new password.",
    NO_MATCH: "Passwords do not match.",
    MUST_BE_DIFFERENT: "New password must be different from current password.",
  },
};

/**
 * @function logPasswordValidation
 * @description Logs password validation status for debugging
 * @param {string} action - The action being logged
 * @param {string} details - Additional details to log
 * @returns {void} No return value - performs logging side effect
 */
const logPasswordValidation = (action, details = "") => {
  if (DEBUG_MODE) {
    console.log(
      `[Password Validation] ${action}${details ? ": " + details : ""}`
    );
  }
};

/**
 * @function validatePasswordInputs
 * @description Legacy validation function for basic password validation
 * @param {string} newPassword - New password to validate
 * @param {string} confirmPassword - Password confirmation to validate
 * @param {Function} showErrorMessage - Function to display error messages
 * @returns {boolean} True if validation passes, false otherwise
 */
export const validatePasswordInputs = (
  newPassword,
  confirmPassword,
  showErrorMessage
) => {
  if (!newPassword || !confirmPassword) {
    showErrorMessage(PASSWORD_CONFIG.MESSAGES.BOTH_FIELDS_REQUIRED);
    return false;
  }

  if (newPassword.length < PASSWORD_CONFIG.MIN_LENGTH) {
    showErrorMessage(PASSWORD_CONFIG.MESSAGES.MIN_LENGTH);
    return false;
  }

  if (newPassword !== confirmPassword) {
    showErrorMessage(PASSWORD_CONFIG.MESSAGES.NO_MATCH);
    return false;
  }

  logPasswordValidation("Password validation", "Passed");
  return true;
};

/**
 * @function validateCurrentPassword
 * @description Validates current password field for presence
 * @param {string} currentPassword - Current password input value to validate
 * @param {Function} showErrorMessage - Function to display error messages
 * @returns {boolean} True if current password is provided, false if empty
 */
export const validateCurrentPassword = (currentPassword, showErrorMessage) => {
  if (!currentPassword) {
    showErrorMessage(PASSWORD_CONFIG.MESSAGES.CURRENT_REQUIRED);
    focusCurrentPasswordInput();
    return false;
  }
  return true;
};

/**
 * @function validateNewPasswordPresence
 * @description Validates that new password field is not empty
 * @param {string} newPassword - New password input value to validate
 * @param {Function} showErrorMessage - Function to display error messages
 * @returns {boolean} True if new password is provided, false if empty
 */
const validateNewPasswordPresence = (newPassword, showErrorMessage) => {
  if (!newPassword) {
    showErrorMessage(PASSWORD_CONFIG.MESSAGES.NEW_REQUIRED);
    focusNewPasswordInput();
    return false;
  }
  return true;
};

/**
 * @function validateNewPasswordLength
 * @description Validates that new password meets minimum length requirement
 * @param {string} newPassword - New password input value to validate
 * @param {Function} showErrorMessage - Function to display error messages
 * @returns {boolean} True if password meets length requirement, false if too short
 */
const validateNewPasswordLength = (newPassword, showErrorMessage) => {
  if (newPassword.length < PASSWORD_CONFIG.MIN_LENGTH) {
    showErrorMessage(PASSWORD_CONFIG.MESSAGES.MIN_LENGTH);
    focusNewPasswordInput();
    return false;
  }
  return true;
};

/**
 * @function validateNewPasswordEnhanced
 * @description Validates new password for presence and minimum length
 * @param {string} newPassword - New password input value to validate
 * @param {Function} showErrorMessage - Function to display error messages
 * @returns {boolean} True if new password meets requirements, false if invalid
 */
export const validateNewPasswordEnhanced = (newPassword, showErrorMessage) => {
  return (
    validateNewPasswordPresence(newPassword, showErrorMessage) &&
    validateNewPasswordLength(newPassword, showErrorMessage)
  );
};

/**
 * @function validateConfirmPasswordPresence
 * @description Validates that confirmation password field is not empty
 * @param {string} confirmPassword - Confirmation password input value to validate
 * @param {Function} showErrorMessage - Function to display error messages
 * @returns {boolean} True if confirmation password is provided, false if empty
 */
const validateConfirmPasswordPresence = (confirmPassword, showErrorMessage) => {
  if (!confirmPassword) {
    showErrorMessage(PASSWORD_CONFIG.MESSAGES.CONFIRM_REQUIRED);
    focusConfirmPasswordInput();
    return false;
  }
  return true;
};

/**
 * @function validatePasswordsMatch
 * @description Validates that new password and confirmation match
 * @param {string} confirmPassword - Confirmation password input value
 * @param {string} newPassword - New password value to match against
 * @param {Function} showErrorMessage - Function to display error messages
 * @returns {boolean} True if passwords match, false if they don't match
 */
const validatePasswordsMatch = (
  confirmPassword,
  newPassword,
  showErrorMessage
) => {
  if (newPassword !== confirmPassword) {
    showErrorMessage(PASSWORD_CONFIG.MESSAGES.NO_MATCH);
    focusConfirmPasswordInput();
    return false;
  }
  return true;
};

/**
 * @function validatePasswordConfirmation
 * @description Validates password confirmation field for presence and matching
 * @param {string} confirmPassword - Confirmation password input value to validate
 * @param {string} newPassword - New password value to match against
 * @param {Function} showErrorMessage - Function to display error messages
 * @returns {boolean} True if confirmation is valid, false if invalid
 */
export const validatePasswordConfirmation = (
  confirmPassword,
  newPassword,
  showErrorMessage
) => {
  return (
    validateConfirmPasswordPresence(confirmPassword, showErrorMessage) &&
    validatePasswordsMatch(confirmPassword, newPassword, showErrorMessage)
  );
};

/**
 * @function validatePasswordUniqueness
 * @description Validates that new password is different from current password
 * @param {string} currentPassword - Current password value for comparison
 * @param {string} newPassword - New password value to validate
 * @param {Function} showErrorMessage - Function to display error messages
 * @returns {boolean} True if passwords are different, false if identical
 */
export const validatePasswordUniqueness = (
  currentPassword,
  newPassword,
  showErrorMessage
) => {
  if (currentPassword === newPassword) {
    showErrorMessage(PASSWORD_CONFIG.MESSAGES.MUST_BE_DIFFERENT);
    focusNewPasswordInput();
    return false;
  }
  return true;
};

/**
 * @function validatePasswordChangeInputs
 * @description Validates all password change form inputs through validation chain
 * @param {string} currentPassword - Current password input value
 * @param {string} newPassword - New password input value
 * @param {string} confirmPassword - Password confirmation input value
 * @param {Function} showErrorMessage - Function to display error messages
 * @returns {boolean} True if all validation steps pass, false if any validation fails
 */
export const validatePasswordChangeInputs = (
  currentPassword,
  newPassword,
  confirmPassword,
  showErrorMessage
) => {
  return (
    validateCurrentPassword(currentPassword, showErrorMessage) &&
    validateNewPasswordEnhanced(newPassword, showErrorMessage) &&
    validatePasswordConfirmation(
      confirmPassword,
      newPassword,
      showErrorMessage
    ) &&
    validatePasswordUniqueness(currentPassword, newPassword, showErrorMessage)
  );
};
