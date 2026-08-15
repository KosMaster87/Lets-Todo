/**
 * @fileoverview Password reset confirmation module
 * @description Handles the password reset confirmation process, including token validation,
 * password input validation, and submission to the API.
 * @module navigation-reset-password-confirm
 */

import { handleNavigationClick } from "./navigation.js";
import { VIEWS, DEBUG_MODE } from "./../../utils/constants.js";
import {
  callTokenValidationAPI,
  callPasswordResetAPI,
} from "../api/api-password.js";
import { validatePasswordInputs } from "./../../utils/password-validation.js";
import {
  checkPasswordStrength,
  checkPasswordMatch,
} from "./../../utils/password-dom.js";
import {
  showElement,
  hideElement,
  showErrorMessage,
  showSuccessMessage,
  clearErrorMessages,
} from "./../../utils/dom-helpers.js";
import { setSubmitButtonState } from "./../../utils/ui-state-helpers.js";

let currentToken = null;
let tokenValidationResult = null; // Variable to store token validation result

/**
 * Logs reset password confirmation status for debugging
 * @function logResetPasswordStatus
 * @param {string} action - The action being performed
 * @param {string} [details=''] - Additional details about the action
 * @returns {void}
 */
const logResetPasswordStatus = (action, details = "") => {
  if (DEBUG_MODE) {
    console.log(
      `[Reset Password Confirm] ${action}${details ? ": " + details : ""}`
    );
  }
};

/**
 * Initializes the reset password confirmation page
 * Called when the page loads to set up token validation and event listeners.
 * @function initializeResetPasswordConfirm
 * @param {string} token - The reset token from URL parameters
 * @returns {void}
 * @exports
 */
export const initializeResetPasswordConfirm = (token) => {
  logResetPasswordStatus(
    "Initialize",
    `Token: ${token ? "Present" : "Missing"}`
  );
  currentToken = token;

  if (!token) {
    showInvalidTokenMessage("No token found in URL");
    return;
  }

  setupResetPasswordConfirmNavigation();
  setupResetPasswordConfirmFormHandlers();
  validateTokenOnLoad();
};

/**
 * Sets up navigation buttons for reset password confirmation
 * @function setupResetPasswordConfirmNavigation
 * @returns {void}
 */
const setupResetPasswordConfirmNavigation = () => {
  setupNavigationButtons();
  setupSubmitButton();
};

/**
 * Sets up navigation button click handlers
 * Maps navigation button clicks to their corresponding views and actions.
 * @function setupNavigationButtons
 * @returns {void}
 */
const setupNavigationButtons = () => {
  const navigationButtons = [
    { id: "resetPasswordConfirmCancelBtn", view: VIEWS.LOGIN },
    { id: "requestNewResetBtn", view: VIEWS.RESET_PASSWORD },
    { id: "backToLoginBtn", view: VIEWS.LOGIN },
  ];

  navigationButtons.forEach(({ id, view }) => {
    const element = document.getElementById(id);
    if (element) {
      element.onclick = (e) => handleNavigationClick(e, view);
    }
  });
};

/**
 * Sets up submit button click handler
 * @function setupSubmitButton
 * @returns {void}
 */
const setupSubmitButton = () => {
  const submitBtn = document.getElementById("resetPasswordConfirmSubmitBtn");
  if (submitBtn) {
    submitBtn.onclick = (e) => handlePasswordResetSubmit(e);
  }
};

/**
 * Sets up form event handlers for password input and validation
 * @function setupResetPasswordConfirmFormHandlers
 * @returns {void}
 */
const setupResetPasswordConfirmFormHandlers = () => {
  setupFormSubmissionHandler();
  setupPasswordInputHandlers();
};

/**
 * Sets up form submission handler with preventDefault
 * @function setupFormSubmissionHandler
 * @returns {void}
 */
const setupFormSubmissionHandler = () => {
  const form = document.getElementById("resetPasswordConfirmForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handlePasswordResetSubmit(e);
    });
  }
};

/**
 * Sets up password input change handlers for real-time validation
 * @function setupPasswordInputHandlers
 * @returns {void}
 */
const setupPasswordInputHandlers = () => {
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  if (newPasswordInput) {
    newPasswordInput.addEventListener("input", handleNewPasswordInput);
  }

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", handleConfirmPasswordInput);
  }
};

/**
 * Handles new password input changes with strength checking
 * @function handleNewPasswordInput
 * @returns {void}
 */
const handleNewPasswordInput = () => {
  checkPasswordStrength(getPasswordInputs, showElement, hideElement);
  clearErrorMessages();
};

/**
 * Handles confirm password input changes with match validation
 * @function handleConfirmPasswordInput
 * @returns {void}
 */
const handleConfirmPasswordInput = () => {
  checkPasswordMatch(getPasswordInputs);
  clearErrorMessages();
};

/**
 * Validates the reset token on page load
 * @async
 * @function validateTokenOnLoad
 * @returns {Promise<void>}
 */
const validateTokenOnLoad = async () => {
  logResetPasswordStatus("Token validation started", currentToken);

  try {
    const result = await callTokenValidationAPIWrapper();
    handleTokenValidationResult(result);
  } catch (error) {
    logResetPasswordStatus("Token validation failed", error.message);
    showInvalidTokenMessage("Token validation error");
  }
};

/**
 * Calls token validation API endpoint
 * @async
 * @function callTokenValidationAPIWrapper
 * @returns {Promise<Object>} Token validation result from API
 * @throws {Error} When API request fails
 */
const callTokenValidationAPIWrapper = async () => {
  return await callTokenValidationAPI(currentToken);
};

/**
 * Handles token validation result from API
 * @function handleTokenValidationResult
 * @param {Object} result - Token validation result object
 * @param {boolean} result.valid - Whether the token is valid
 * @param {string} [result.error] - Error message if token is invalid
 * @param {string} [result.email] - User email if token is valid
 * @returns {void}
 */
const handleTokenValidationResult = (result) => {
  logResetPasswordStatus(
    "Token validation result",
    result.valid ? "Valid" : "Invalid"
  );

  if (result.valid) {
    tokenValidationResult = result;
    showValidTokenForm(result);
  } else {
    showInvalidTokenMessage(result.error || "Invalid token");
  }
};

/**
 * Shows the password reset form for valid tokens
 * @function showValidTokenForm
 * @param {Object} tokenResult - Token validation result from API
 * @param {string} tokenResult.email - User's email address
 * @returns {void}
 */
const showValidTokenForm = (tokenResult) => {
  hideValidationElements();
  showResetFormElements();
  displayUserEmail(tokenResult.email);
  focusPasswordInput();
};

/**
 * Hides token validation status elements
 * @function hideValidationElements
 * @returns {void}
 */
const hideValidationElements = () => {
  hideElement("tokenValidationStatus");
  hideElement("invalidTokenMessage");
};

/**
 * Shows password reset form elements
 * @function showResetFormElements
 * @returns {void}
 */
const showResetFormElements = () => {
  showElement("resetPasswordConfirmMenu");
  showElement("resetUserInfo");
};

/**
 * Displays user email in the reset form
 * @function displayUserEmail
 * @param {string} email - User's email address to display
 * @returns {void}
 */
const displayUserEmail = (email) => {
  const emailElement = document.getElementById("resetUserEmail");
  if (emailElement) {
    emailElement.textContent = email;
  }
};

/**
 * Focuses on the first password input field for better UX
 * @function focusPasswordInput
 * @returns {void}
 */
const focusPasswordInput = () => {
  const newPasswordInput = document.getElementById("newPassword");
  if (newPasswordInput) {
    newPasswordInput.focus();
  }
};

/**
 * Shows invalid token message and hides form
 * @function showInvalidTokenMessage
 * @param {string} message - Error message to display
 * @returns {void}
 */
const showInvalidTokenMessage = (message) => {
  hideElement("tokenValidationStatus");
  hideElement("resetPasswordConfirmMenu");
  showElement("invalidTokenMessage");

  logResetPasswordStatus("Invalid token", message);
};

/**
 * Gets password input values from the form
 * @function getPasswordInputs
 * @returns {{newPassword: string, confirmPassword: string}} Object containing trimmed password values
 */
const getPasswordInputs = () => {
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  return {
    newPassword: newPasswordInput ? newPasswordInput.value.trim() : "",
    confirmPassword: confirmPasswordInput
      ? confirmPasswordInput.value.trim()
      : "",
  };
};

/**
 * Calls the password reset API endpoint
 * @async
 * @function callPasswordResetAPIWrapper
 * @param {string} newPassword - New password to set
 * @returns {Promise<Object>} API response object
 * @throws {Error} When API request fails
 */
const callPasswordResetAPIWrapper = async (newPassword) => {
  return await callPasswordResetAPI(currentToken, newPassword);
};

/**
 * Handles successful password reset
 * @function handlePasswordResetSuccess
 * @returns {void}
 */
const handlePasswordResetSuccess = () => {
  showSuccessMessage("Password changed successfully! Redirecting to login...");
  scheduleLoginRedirect();
};

/**
 * Schedules automatic redirect to login page after successful password reset
 * @function scheduleLoginRedirect
 * @returns {void}
 */
const scheduleLoginRedirect = () => {
  setTimeout(() => {
    handleNavigationClick({ preventDefault: () => {} }, VIEWS.LOGIN);
  }, 3000);
};

/**
 * Handles password reset form submission
 * Main coordinator function that orchestrates the password reset process.
 * @async
 * @function handlePasswordResetSubmit
 * @param {Event} e - Form submit event
 * @returns {Promise<void>}
 */
const handlePasswordResetSubmit = async (e) => {
  e.preventDefault();

  try {
    clearErrorMessages();
    const { newPassword, confirmPassword } = getPasswordInputs();

    if (!validatePasswordInputs(newPassword, confirmPassword, showErrorMessage))
      return;

    await processPasswordReset(newPassword);
  } catch (error) {
    handlePasswordResetError(error);
  } finally {
    setSubmitButtonState(false);
  }
};

/**
 * Processes password reset with loading state management
 * @async
 * @function processPasswordReset
 * @param {string} newPassword - New password to set
 * @returns {Promise<void>}
 * @throws {Error} When password reset fails
 */
const processPasswordReset = async (newPassword) => {
  setSubmitButtonState(true);
  const result = await callPasswordResetAPIWrapper(newPassword);

  if (result.success) {
    handlePasswordResetSuccess();
  } else {
    throw new Error(result.error || "Password reset failed");
  }
};

/**
 * Handles password reset errors and displays user-friendly messages
 * @function handlePasswordResetError
 * @param {Error} error - The error object from password reset operation
 * @returns {void}
 */
const handlePasswordResetError = (error) => {
  logResetPasswordStatus("Password reset error", error.message);
  showErrorMessage(error.message || "Password reset error");
};

/**
 * Sets up event listeners for reset password confirmation page
 * Main entry point called by navigation system.
 * @function setupResetPasswordConfirmEventListeners
 * @returns {void}
 * @exports
 */
export const setupResetPasswordConfirmEventListeners = () => {
  // Event listeners set via initializeResetPasswordConfirm as they require token from URL.
};
