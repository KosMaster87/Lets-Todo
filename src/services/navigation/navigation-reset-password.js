/**
 * @fileoverview Reset password navigation module
 * @description Handles navigation and form submission for password reset
 * @module navigation-reset-password
 */

import { handleNavigationClick } from "./navigation.js";
import { VIEWS, DEBUG_MODE } from "./../../utils/constants.js";
import { getApiBase, apiHandler } from "./../api/api-handler.js";
import {
  showErrorMessage,
  showSuccessMessage,
  clearErrorMessages,
} from "./../../utils/dom-helpers.js";
import { setSubmitButtonState } from "./../../utils/ui-state-helpers.js";

/**
 * Logs reset password status for debugging
 * @function logResetPasswordStatus
 * @param {string} action - The action being performed
 * @param {string} [details=''] - Additional details about the action
 * @returns {void}
 */
const logResetPasswordStatus = (action, details = "") => {
  if (DEBUG_MODE) {
    console.log(`[Reset Password] ${action}${details ? ": " + details : ""}`);
  }
};

/**
 * Sets up reset password navigation buttons and handlers
 * @function setupResetPasswordNavigation
 * @returns {void}
 */
const setupResetPasswordNavigation = () => {
  setupCancelButton();
  setupSubmitButton();
};

/**
 * Sets up cancel button navigation handler
 * @function setupCancelButton
 * @returns {void}
 */
const setupCancelButton = () => {
  const resetPasswordLinks = [
    { id: "resetPasswordCancelBtn", view: VIEWS.LOGIN },
  ];

  resetPasswordLinks.forEach(({ id, view }) => {
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
  const resetPasswordSubmitBtn = document.getElementById(
    "resetPasswordSubmitBtn"
  );
  if (resetPasswordSubmitBtn) {
    resetPasswordSubmitBtn.onclick = (e) => handleResetPasswordSubmit(e);
  }
};

/**
 * Sets up form event handlers and validation
 * @function setupResetPasswordFormHandlers
 * @returns {void}
 */
const setupResetPasswordFormHandlers = () => {
  setupEmailInputHandler();
  setupFormSubmissionHandler();
};

/**
 * Sets up email input change handler to clear messages
 * @function setupEmailInputHandler
 * @returns {void}
 */
const setupEmailInputHandler = () => {
  const form = document.getElementById("resetPasswordForm");
  if (form) {
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput) {
      emailInput.addEventListener("input", clearErrorMessages);
    }
  }
};

/**
 * Sets up form submission handler with preventDefault
 * @function setupFormSubmissionHandler
 * @returns {void}
 */
const setupFormSubmissionHandler = () => {
  const form = document.getElementById("resetPasswordForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleResetPasswordSubmit(e);
    });
  }
};

/**
 * Gets reset password form input values and DOM elements
 * @function getResetPasswordFormInputs
 * @returns {{emailInput: HTMLInputElement, email: string}} Object containing form input element and trimmed email value
 * @throws {Error} When form elements are not found
 */
const getResetPasswordFormInputs = () => {
  const emailInput = document.getElementById("resetEmail");

  if (!emailInput) {
    throw new Error("Form not available.");
  }

  return {
    emailInput,
    email: emailInput.value.trim(),
  };
};

/**
 * Sets reset password button loading state
 * @function setResetPasswordButtonState
 * @param {boolean} isLoading - Whether the button should show loading state
 * @returns {void}
 */
const setResetPasswordButtonState = (isLoading) => {
  setSubmitButtonState(
    isLoading,
    "resetPasswordSubmitBtn",
    "Sending Email...",
    "Send Reset Link"
  );
};

/**
 * Calls forgot password API endpoint
 * @async
 * @function callForgotPasswordAPI
 * @param {string} email - User's email address for password reset
 * @returns {Promise<Object>} API response object
 * @throws {Error} When API request fails
 */
const callForgotPasswordAPI = async (email) => {
  const API_BASE = getApiBase();
  return await apiHandler(`${API_BASE}/forgot-password`, "POST", { email });
};

/**
 * Clears reset password form input field
 * @function clearResetPasswordFormInput
 * @param {{emailInput: HTMLInputElement}} inputs - Object containing form input element
 * @returns {void}
 */
const clearResetPasswordFormInput = (inputs) => {
  inputs.emailInput.value = "";
};

/**
 * Handles successful password reset request
 * @function handleResetPasswordSuccess
 * @param {Object} result - Result object from password reset API
 * @param {string} result.message - Success message from server
 * @param {string} result.email - Email address where reset link was sent
 * @returns {void}
 */
const handleResetPasswordSuccess = (result) => {
  const message =
    result.message ||
    `Reset link sent to ${result.email}. Please check your email inbox and follow the instructions.`;

  showSuccessMessage(message, "resetPasswordSuccess");
  clearFormInput();
};

/**
 * Clears form input after successful submission
 * @function clearFormInput
 * @returns {void}
 */
const clearFormInput = () => {
  const inputs = getResetPasswordFormInputs();
  clearResetPasswordFormInput(inputs);
};

/**
 * Processes password reset request and handles API response
 * @async
 * @function processResetPasswordRequest
 * @param {string} email - Email address for reset request
 * @returns {Promise<{success: boolean, email: string, message: string}>} Success result with email and message
 * @throws {Error} When password reset request fails or API returns error
 */
const processResetPasswordRequest = async (email) => {
  const result = await callForgotPasswordAPI(email);

  if (result.success) {
    return { success: true, email, message: result.message };
  } else {
    throw new Error(
      result.message || "Failed to send reset email. Please try again."
    );
  }
};

/**
 * Handles password reset request errors and displays user-friendly messages
 * @function handleResetPasswordError
 * @param {Error} error - The error object from reset password operation
 * @returns {void}
 */
const handleResetPasswordError = (error) => {
  logResetPasswordStatus("Reset password error", error.message);

  const message =
    "If an account with this email exists, a reset link has been sent. " +
    "Please check your email inbox. If you don't receive an email, try again later.";

  showSuccessMessage(message, "resetPasswordSuccess");
};

/**
 * Handles reset password form submission
 * @async
 * @function handleResetPasswordSubmit
 * @param {Event} e - Form submit event
 * @returns {Promise<void>}
 */
const handleResetPasswordSubmit = async (e) => {
  e.preventDefault();

  try {
    const inputs = getResetPasswordFormInputs();
    clearErrorMessages("resetPasswordError", "resetPasswordSuccess");

    if (!validateResetPasswordInputs(inputs.email)) return;

    await processResetPasswordSubmission(inputs.email);
  } catch (error) {
    handleResetPasswordError(error);
  } finally {
    setResetPasswordButtonState(false);
  }
};

/**
 * Processes reset password submission with loading state
 * @async
 * @function processResetPasswordSubmission
 * @param {string} email - Email address for reset request
 * @returns {Promise<void>}
 */
const processResetPasswordSubmission = async (email) => {
  setResetPasswordButtonState(true);
  const result = await processResetPasswordRequest(email);
  handleResetPasswordSuccess(result);
};

/**
 * Validates reset password form inputs
 * @function validateResetPasswordInputs
 * @param {string} email - Email input value to validate
 * @returns {boolean} True if all validations pass, false otherwise
 */
const validateResetPasswordInputs = (email) => {
  if (!email) {
    showErrorMessage("Email address is required.", "resetPasswordError");
    focusEmailInput();
    return false;
  }

  if (!isValidEmail(email)) {
    showErrorMessage(
      "Please enter a valid email address.",
      "resetPasswordError"
    );
    focusEmailInput();
    return false;
  }

  return true;
};

/**
 * Checks if email format is valid using regex
 * @function isValidEmail
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid, false otherwise
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Focuses on email input field for better UX
 * @function focusEmailInput
 * @returns {void}
 */
const focusEmailInput = () => {
  document.getElementById("resetEmail")?.focus();
};

/**
 * Sets up reset password event listeners and handlers
 * Called by the main navigation system for all reset password-related event listeners.
 * @function setupResetPasswordEventListeners
 * @returns {void}
 * @exports
 */
export const setupResetPasswordEventListeners = () => {
  setupResetPasswordNavigation();
  setupResetPasswordFormHandlers();
  // Additional reset password-specific event listeners can be added here.
  // For example: email format indicators, rate limiting feedback, etc.
};
