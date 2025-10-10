/**
 * @fileoverview Reset Password Navigation Module
 *
 * Handles forgot password functionality including email validation,
 * API communication, and user feedback. Provides a complete
 * password reset request workflow with proper error handling and success states.
 *
 * Key Features:
 * - Email validation with real-time feedback
 * - API integration for reset request
 * - Loading states and user experience optimization
 * - Success/error message handling
 * - Navigation back to login
 *
 * @module navigation-reset-password
 * @requires ./navigation.js
 * @requires ./../../utils/constants.js
 * @requires ./../../utils/api-handler.js
 * @since 1.0.0
 */

import { handleNavigationClick } from "./navigation.js";
import { VIEWS } from "./../../utils/constants.js";
import { getApiBase, apiHandler } from "./../../utils/api-handler.js";

/**
 * Sets up reset password navigation buttons.
 * Maps reset password button clicks to their corresponding views and actions.
 * @function setupResetPasswordNavigation
 * @returns {void}
 */
const setupResetPasswordNavigation = () => {
  const resetPasswordLinks = [
    { id: "resetPasswordCancelBtn", view: VIEWS.LOGIN },
  ];

  resetPasswordLinks.forEach(({ id, view }) => {
    const element = document.getElementById(id);
    if (element) {
      element.onclick = (e) => handleNavigationClick(e, view);
    }
  });

  const resetPasswordSubmitBtn = document.getElementById(
    "resetPasswordSubmitBtn"
  );
  if (resetPasswordSubmitBtn) {
    resetPasswordSubmitBtn.onclick = (e) => handleResetPasswordSubmit(e);
  }
};

/**
 * Sets up reset password form handlers.
 * Handles form validation and submission for password reset requests.
 * @function setupResetPasswordFormHandlers
 * @returns {void}
 */
const setupResetPasswordFormHandlers = () => {
  const form = document.getElementById("resetPasswordForm");
  if (form) {
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput) {
      emailInput.addEventListener("input", clearErrorMessages);
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleResetPasswordSubmit(e);
    });
  }
};

/**
 * Gets reset password form input values and DOM elements.
 * @function getResetPasswordFormInputs
 * @returns {{emailInput: HTMLInputElement, email: string}} Object containing form input and value
 * @throws {Error} When form elements are not found
 */
const getResetPasswordFormInputs = () => {
  const emailInput = document.getElementById("resetEmail");

  if (!emailInput) {
    throw new Error("Form elements not found. Please refresh the page.");
  }

  return {
    emailInput,
    email: emailInput.value.trim(),
  };
};

/**
 * Sets submit button loading state.
 * @function setSubmitButtonState
 * @param {boolean} isLoading - Whether the button should show loading state
 * @returns {void}
 */
const setSubmitButtonState = (isLoading) => {
  const submitBtn = document.getElementById("resetPasswordSubmitBtn");
  if (submitBtn) {
    submitBtn.disabled = isLoading;
    if (isLoading) {
      submitBtn.classList.add("loading");
      submitBtn.querySelector("h3").textContent = "Sende E-Mail...";
    } else {
      submitBtn.classList.remove("loading");
      submitBtn.querySelector("h3").textContent = "Reset-Link senden";
    }
  }
};

/**
 * Calls forgot password API endpoint.
 * @async
 * @function callForgotPasswordAPI
 * @param {string} email - User's email address for password reset
 * @returns {Promise<Object>} API response object
 * @throws {Error} When API request fails
 */
const callForgotPasswordAPI = async (email) => {
  const API_BASE = getApiBase();
  return await apiHandler(`${API_BASE}/forgot-password`, "POST", {
    email,
  });
};

/**
 * Clears reset password form input.
 * @function clearResetPasswordFormInput
 * @param {{emailInput: HTMLInputElement}} inputs - Form input element object
 * @returns {void}
 */
const clearResetPasswordFormInput = (inputs) => {
  inputs.emailInput.value = "";
};

/**
 * Handles successful password reset request.
 * Shows success message and provides instructions to user.
 * @function handleResetPasswordSuccess
 * @param {string} email - Email address where reset link was sent
 * @returns {void}
 */
const handleResetPasswordSuccess = (result) => {
  // Use server message if available (includes security-conscious messaging)
  const message =
    result.message ||
    `Reset-Link wurde an ${result.email} gesendet. Bitte überprüfe dein E-Mail-Postfach und folge den Anweisungen.`;

  showSuccessMessage(message);

  // Optionally clear the input
  const inputs = getResetPasswordFormInputs();
  clearResetPasswordFormInput(inputs);
};

/**
 * Processes password reset request and handles API response.
 * @async
 * @function processResetPasswordRequest
 * @param {string} email - Email address for reset request
 * @returns {Promise<{success: boolean, email: string}>} Success result with email
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
 * Handles password reset request errors and displays user-friendly error messages.
 * @function handleResetPasswordError
 * @param {Error} error - The error object from reset password operation
 * @returns {void}
 */
const handleResetPasswordError = (error) => {
  // Only log unexpected errors, not user-facing error messages
  if (
    !error.error ||
    !error.error.includes("Server-Fehler beim Verarbeiten der Reset-Anfrage")
  ) {
    console.error("Error sending reset email:", error);
  }

  // Always show a generic, security-conscious message
  const message =
    "Falls ein Account mit dieser E-Mail existiert, wurde ein Reset-Link gesendet. " +
    "Bitte überprüfe dein E-Mail-Postfach. Falls du keine E-Mail erhältst, versuche es später erneut.";

  showSuccessMessage(message); // Use success message even for errors (security)
};

/**
 * Handles reset password form submission.
 * Main coordinator function that orchestrates the password reset request process.
 * @async
 * @function handleResetPasswordSubmit
 * @param {Event} e - Form submit event
 * @returns {Promise<void>}
 */
const handleResetPasswordSubmit = async (e) => {
  e.preventDefault();

  try {
    const inputs = getResetPasswordFormInputs();
    clearErrorMessages();

    if (!validateResetPasswordInputs(inputs.email)) {
      return;
    }

    setSubmitButtonState(true);
    const result = await processResetPasswordRequest(inputs.email);
    handleResetPasswordSuccess(result);
  } catch (error) {
    handleResetPasswordError(error);
  } finally {
    setSubmitButtonState(false);
  }
};

/**
 * Validates reset password form inputs.
 * Checks for required email field and valid email format.
 * @function validateResetPasswordInputs
 * @param {string} email - Email input value
 * @returns {boolean} True if all validations pass, false otherwise
 */
const validateResetPasswordInputs = (email) => {
  if (!email) {
    showErrorMessage("E-Mail-Adresse ist erforderlich.");
    document.getElementById("resetEmail")?.focus();
    return false;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showErrorMessage("Bitte gib eine gültige E-Mail-Adresse ein.");
    document.getElementById("resetEmail")?.focus();
    return false;
  }

  return true;
};

/**
 * Shows error message in the reset password form.
 * @function showErrorMessage
 * @param {string} message - Error message to display
 * @returns {void}
 */
const showErrorMessage = (message) => {
  const errorElement = document.getElementById("resetPasswordError");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
    errorElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
};

/**
 * Shows success message in the reset password form.
 * @function showSuccessMessage
 * @param {string} message - Success message to display
 * @returns {void}
 */
const showSuccessMessage = (message) => {
  const successElement = document.getElementById("resetPasswordSuccess");
  if (successElement) {
    successElement.textContent = message;
    successElement.style.display = "block";
    successElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
};

/**
 * Clears error and success messages from the form.
 * @function clearErrorMessages
 * @returns {void}
 */
const clearErrorMessages = () => {
  const errorElement = document.getElementById("resetPasswordError");
  const successElement = document.getElementById("resetPasswordSuccess");

  if (errorElement) {
    errorElement.style.display = "none";
  }
  if (successElement) {
    successElement.style.display = "none";
  }
};

/**
 * Sets up additional reset password-specific navigation handlers.
 * Called by the main navigation system for all reset password-related event listeners.
 * @function setupResetPasswordEventListeners
 * @returns {void}
 * @exports
 */
export const setupResetPasswordEventListeners = () => {
  setupResetPasswordNavigation();
  setupResetPasswordFormHandlers();

  // Additional reset password-specific event listeners can be added here
  // For example: email format indicators, rate limiting feedback, etc.
};
