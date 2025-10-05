// lets-todo-app/src/services/navigation-change-password.js

/**
 * @fileoverview Change Password Navigation Module
 *
 * Handles password change functionality including form validation,
 * API communication, and user feedback. Provides a complete
 * password change workflow with proper error handling and success states.
 *
 * Key Features:
 * - Form validation with real-time feedback
 * - Secure API integration with authentication
 * - Loading states and user experience optimization
 * - Success/error message handling
 * - Auto-navigation after successful change
 *
 * @module navigation-change-password
 * @requires ./navigation.js
 * @requires ./../../utils/constants.js
 * @requires ./../../utils/api-handler.js
 * @since 1.0.0
 */

import { handleNavigationClick } from "./navigation.js";
import { VIEWS } from "./../../utils/constants.js";
import { getApiBase, apiHandler } from "./../../utils/api-handler.js";
import { getSession } from "./../../state.js";

/**
 * Sets up change password navigation buttons.
 * Maps change password button clicks to their corresponding views and actions.
 * @function setupChangePasswordNavigation
 * @returns {void}
 */
const setupChangePasswordNavigation = () => {
  const changePasswordLinks = [
    { id: "changePasswordCancelBtn", view: VIEWS.PERSONAL_DATA },
  ];

  changePasswordLinks.forEach(({ id, view }) => {
    const element = document.getElementById(id);
    if (element) {
      element.onclick = (e) => handleNavigationClick(e, view);
    }
  });

  const changePasswordSubmitBtn = document.getElementById(
    "changePasswordSubmitBtn"
  );
  if (changePasswordSubmitBtn) {
    changePasswordSubmitBtn.onclick = (e) => handleChangePasswordSubmit(e);
  }
};

/**
 * Sets up change password form handlers.
 * Handles form validation and submission for password changes.
 * @function setupChangePasswordFormHandlers
 * @returns {void}
 */
const setupChangePasswordFormHandlers = () => {
  const form = document.getElementById("changePasswordForm");
  if (form) {
    const inputs = form.querySelectorAll('input[type="password"]');
    inputs.forEach((input) => {
      input.addEventListener("input", clearErrorMessages);
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleChangePasswordSubmit(e);
    });
  }
};

/**
 * Gets password form input values and DOM elements.
 * @function getPasswordFormInputs
 * @returns {{currentPasswordInput: HTMLInputElement, newPasswordInput: HTMLInputElement, confirmPasswordInput: HTMLInputElement, currentPassword: string, newPassword: string, confirmPassword: string}} Object containing form inputs and their values
 * @throws {Error} When form elements are not found
 */
const getPasswordFormInputs = () => {
  const currentPasswordInput = document.getElementById("currentPassword");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
    throw new Error("Form elements not found. Please refresh the page.");
  }

  return {
    currentPasswordInput,
    newPasswordInput,
    confirmPasswordInput,
    currentPassword: currentPasswordInput.value.trim(),
    newPassword: newPasswordInput.value.trim(),
    confirmPassword: confirmPasswordInput.value.trim(),
  };
};

/**
 * Sets submit button loading state.
 * @function setSubmitButtonState
 * @param {boolean} isLoading - Whether the button should show loading state
 * @returns {void}
 */
const setSubmitButtonState = (isLoading) => {
  const submitBtn = document.getElementById("changePasswordSubmitBtn");
  if (submitBtn) {
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "Changing..." : "Change Password";
  }
};

/**
 * Validates session with server before sensitive operations.
 * @async
 * @function validateSessionWithServer
 * @returns {Promise<boolean>} True if session is valid, false otherwise
 */
const validateSessionWithServer = async () => {
  try {
    const API_BASE = getApiBase();
    const response = await apiHandler(`${API_BASE}/validate-session`, "GET");
    return response.valid === true;
  } catch (error) {
    console.warn("Session validation failed:", error);
    return false;
  }
};

/**
 * Calls change password API endpoint with hybrid session validation.
 * Performs both client-side (fast) and server-side (secure) session checks
 * before executing the password change request for enhanced security.
 * @async
 * @function callChangePasswordAPI
 * @param {string} currentPassword - User's current password for verification
 * @param {string} newPassword - User's new password to be set
 * @returns {Promise<Object>} API response object containing success status and message
 * @throws {Error} When no active session found (client-side check)
 * @throws {Error} When session is expired or invalid (server-side check)
 * @throws {Error} When API request fails or returns error
 */
const callChangePasswordAPI = async (currentPassword, newPassword) => {
  const session = getSession();
  if (!session) {
    throw new Error("No active session found. Please log in again.");
  }

  const isValidSession = await validateSessionWithServer();
  if (!isValidSession) {
    throw new Error("Session expired or invalid. Please log in again.");
  }

  const API_BASE = getApiBase();
  return await apiHandler(`${API_BASE}/change-password`, "PUT", {
    currentPassword,
    newPassword,
  });
};

/**
 * Clears all password form input values.
 * @function clearPasswordFormInputs
 * @param {{currentPasswordInput: HTMLInputElement, newPasswordInput: HTMLInputElement, confirmPasswordInput: HTMLInputElement}} inputs - Form input elements object
 * @returns {void}
 */
const clearPasswordFormInputs = (inputs) => {
  inputs.currentPasswordInput.value = "";
  inputs.newPasswordInput.value = "";
  inputs.confirmPasswordInput.value = "";
};

/**
 * Handles successful password change response.
 * Shows success message, clears form, and navigates back to personal data.
 * @function handlePasswordChangeSuccess
 * @param {Event} e - Original form submit event
 * @param {{currentPasswordInput: HTMLInputElement, newPasswordInput: HTMLInputElement, confirmPasswordInput: HTMLInputElement}} inputs - Form input elements object
 * @returns {void}
 */
const handlePasswordChangeSuccess = (e, inputs) => {
  showSuccessMessage("Password changed successfully!");
  clearPasswordFormInputs(inputs);
  setTimeout(() => {
    handleNavigationClick(e, VIEWS.PERSONAL_DATA);
  }, 1500);
};

/**
 * Processes password change request and handles API response.
 * @async
 * @function processPasswordChange
 * @param {{currentPassword: string, newPassword: string}} inputs - Password input values
 * @returns {Promise<{success: boolean, inputs: Object}>} Success result with inputs
 * @throws {Error} When password change fails or API returns error
 */
const processPasswordChange = async (inputs) => {
  const result = await callChangePasswordAPI(
    inputs.currentPassword,
    inputs.newPassword
  );

  if (result.success) {
    return { success: true, inputs };
  } else {
    throw new Error(
      result.message || "Failed to change password. Please try again."
    );
  }
};

/**
 * Handles password change errors and displays user-friendly error messages.
 * @function handlePasswordChangeError
 * @param {Error} error - The error object from password change operation
 * @returns {void}
 */
const handlePasswordChangeError = (error) => {
  console.error("Error changing password:", error);
  const message =
    error.message ||
    "An error occurred while changing password. Please try again.";
  showErrorMessage(message);
};

/**
 * Handles change password form submission.
 * Main coordinator function that orchestrates the password change process.
 * @async
 * @function handleChangePasswordSubmit
 * @param {Event} e - Form submit event
 * @returns {Promise<void>}
 */
const handleChangePasswordSubmit = async (e) => {
  e.preventDefault();

  try {
    const inputs = getPasswordFormInputs();
    clearErrorMessages();

    if (
      !validatePasswordChangeInputs(
        inputs.currentPassword,
        inputs.newPassword,
        inputs.confirmPassword
      )
    ) {
      return;
    }

    setSubmitButtonState(true);
    const result = await processPasswordChange(inputs);
    handlePasswordChangeSuccess(e, result.inputs);
  } catch (error) {
    handlePasswordChangeError(error);
  } finally {
    setSubmitButtonState(false);
  }
};

/**
 * Validates password change form inputs.
 * Checks for required fields, password length, confirmation match, and uniqueness.
 * @function validatePasswordChangeInputs
 * @param {string} currentPassword - Current password input value
 * @param {string} newPassword - New password input value
 * @param {string} confirmPassword - Password confirmation input value
 * @returns {boolean} True if all validations pass, false otherwise
 */
const validatePasswordChangeInputs = (
  currentPassword,
  newPassword,
  confirmPassword
) => {
  if (!currentPassword) {
    showErrorMessage("Current password is required.");
    document.getElementById("currentPassword")?.focus();
    return false;
  }

  if (!newPassword) {
    showErrorMessage("New password is required.");
    document.getElementById("newPassword")?.focus();
    return false;
  }

  if (newPassword.length < 8) {
    showErrorMessage("New password must be at least 8 characters long.");
    document.getElementById("newPassword")?.focus();
    return false;
  }

  if (!confirmPassword) {
    showErrorMessage("Please confirm your new password.");
    document.getElementById("confirmPassword")?.focus();
    return false;
  }

  if (newPassword !== confirmPassword) {
    showErrorMessage("New password and confirmation do not match.");
    document.getElementById("confirmPassword")?.focus();
    return false;
  }

  if (currentPassword === newPassword) {
    showErrorMessage("New password must be different from current password.");
    document.getElementById("newPassword")?.focus();
    return false;
  }

  return true;
};

/**
 * Shows error message in the change password form.
 * @function showErrorMessage
 * @param {string} message - Error message to display
 * @returns {void}
 */
const showErrorMessage = (message) => {
  const errorElement = document.getElementById("changePasswordError");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
    errorElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
};

/**
 * Shows success message in the change password form.
 * @function showSuccessMessage
 * @param {string} message - Success message to display
 * @returns {void}
 */
const showSuccessMessage = (message) => {
  const successElement = document.getElementById("changePasswordSuccess");
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
  const errorElement = document.getElementById("changePasswordError");
  const successElement = document.getElementById("changePasswordSuccess");

  if (errorElement) {
    errorElement.style.display = "none";
  }
  if (successElement) {
    successElement.style.display = "none";
  }
};

/**
 * Sets up additional change password-specific navigation handlers.
 * Called by the main navigation system for all change password-related event listeners.
 * @function setupChangePasswordEventListeners
 * @returns {void}
 * @exports
 */
export const setupChangePasswordEventListeners = () => {
  setupChangePasswordNavigation();
  setupChangePasswordFormHandlers();

  // Additional change password-specific event listeners can be added here
  // For example: password strength indicator, show/hide password, etc.
};
