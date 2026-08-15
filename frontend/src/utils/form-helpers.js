/**
 * @fileoverview Form Helper Functions for Password Management
 * @description Utility functions for handling password change form inputs,
 * validation, and user feedback within the application.
 * @module form-helpers
 */

import { VIEWS } from "./constants.js";
import { showSuccessMessage, clearErrorMessages } from "./ui-state-helpers.js";

/**
 * @function getPasswordFormInputs
 * @description Gets password form input values and DOM elements for processing
 * @returns {Object} Form inputs object containing elements and values
 * @throws {Error} Thrown when required form elements are not found in DOM
 */
export const getPasswordFormInputs = () => {
  const inputElements = getRequiredPasswordInputElements();
  validatePasswordInputElements(inputElements);
  const inputValues = extractPasswordInputValues(inputElements);

  return {
    ...inputElements,
    ...inputValues,
  };
};

/**
 * @function getRequiredPasswordInputElements
 * @description Retrieves all required password input elements from DOM
 * @returns {Object} Password input elements object
 */
const getRequiredPasswordInputElements = () => ({
  currentPasswordInput: document.getElementById("currentPassword"),
  newPasswordInput: document.getElementById("newPassword"),
  confirmPasswordInput: document.getElementById("confirmPassword"),
});

/**
 * @function validatePasswordInputElements
 * @description Validates that all required password input elements are present
 * @param {Object} inputElements - Password input elements object
 * @throws {Error} Thrown when any required form elements are not found
 * @returns {void} No return value - performs validation with exception throwing
 */
const validatePasswordInputElements = ({
  currentPasswordInput,
  newPasswordInput,
  confirmPasswordInput,
}) => {
  if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
    throw new Error("Form elements not found. Please refresh the page.");
  }
};

/**
 * @function extractPasswordInputValues
 * @description Extracts and trims password values from input elements
 * @param {Object} inputElements - Password input elements object
 * @returns {Object} Trimmed password values object
 */
const extractPasswordInputValues = ({
  currentPasswordInput,
  newPasswordInput,
  confirmPasswordInput,
}) => ({
  currentPassword: currentPasswordInput.value.trim(),
  newPassword: newPasswordInput.value.trim(),
  confirmPassword: confirmPasswordInput.value.trim(),
});

/**
 * @function clearPasswordFormInputs
 * @description Clears all password form input values for security
 * @param {Object} inputs - Form input elements object
 * @returns {void} No return value - performs form input clearing side effects
 */
export const clearPasswordFormInputs = (inputs) => {
  clearCurrentPasswordInput(inputs.currentPasswordInput);
  clearNewPasswordInput(inputs.newPasswordInput);
  clearConfirmPasswordInput(inputs.confirmPasswordInput);
};

/**
 * @function clearCurrentPasswordInput
 * @description Clears the current password input field
 * @param {HTMLInputElement} currentPasswordInput - Current password input element
 * @returns {void} No return value - performs input clearing side effect
 */
const clearCurrentPasswordInput = (currentPasswordInput) => {
  currentPasswordInput.value = "";
};

/**
 * @function clearNewPasswordInput
 * @description Clears the new password input field
 * @param {HTMLInputElement} newPasswordInput - New password input element
 * @returns {void} No return value - performs input clearing side effect
 */
const clearNewPasswordInput = (newPasswordInput) => {
  newPasswordInput.value = "";
};

/**
 * @function clearConfirmPasswordInput
 * @description Clears the confirm password input field
 * @param {HTMLInputElement} confirmPasswordInput - Confirm password input element
 * @returns {void} No return value - performs input clearing side effect
 */
const clearConfirmPasswordInput = (confirmPasswordInput) => {
  confirmPasswordInput.value = "";
};

/**
 * @function handlePasswordChangeSuccess
 * @description Handles successful password change response with user feedback
 * @param {Event} e - Original form submit event object for navigation context
 * @param {Object} inputs - Form input elements object for clearing form data
 * @param {Function} handleNavigationClick - Navigation function to use
 * @returns {void} No return value - performs success handling and navigation
 */
export const handlePasswordChangeSuccess = (e, inputs, handleNavigationClick) => {
  displaySuccessMessage();
  clearPasswordFormInputs(inputs);
  scheduleNavigationToPersonalData(e, handleNavigationClick);
};

/**
 * @function displaySuccessMessage
 * @description Displays success message to user
 * @returns {void} No return value - performs success message display
 */
const displaySuccessMessage = () => {
  showSuccessMessage("Password changed successfully!");
};

/**
 * @function scheduleNavigationToPersonalData
 * @description Schedules navigation to personal data view after success delay
 * @param {Event} e - Form submit event object for navigation context
 * @param {Function} handleNavigationClick - Navigation function to use
 * @returns {void} No return value - schedules navigation with timeout
 */
const scheduleNavigationToPersonalData = (e, handleNavigationClick) => {
  setTimeout(() => {
    handleNavigationClick(e, VIEWS.PERSONAL_DATA);
  }, 1500);
};

/**
 * @function getChangePasswordForm
 * @description Gets the change password form element from DOM
 * @returns {HTMLFormElement|null} Form element if found, null if not found
 */
export const getChangePasswordForm = () => {
  return document.getElementById("changePasswordForm");
};

/**
 * @function setupPasswordInputEventListeners
 * @description Sets up input event listeners for password fields
 * @param {HTMLFormElement} form - Form element containing password inputs
 * @returns {void} No return value - configures input event listeners
 */
export const setupPasswordInputEventListeners = (form) => {
  const inputs = getPasswordInputs(form);
  attachInputEventListeners(inputs);
};

/**
 * @function getPasswordInputs
 * @description Gets all password input elements from the form
 * @param {HTMLFormElement} form - Form element to search within
 * @returns {NodeList} Collection of password input elements
 */
const getPasswordInputs = (form) => {
  return form.querySelectorAll('input[type="password"]');
};

/**
 * @function attachInputEventListeners
 * @description Attaches input event listeners to clear error messages
 * @param {NodeList} inputs - Collection of input elements
 * @returns {void} No return value - attaches event listeners to inputs
 */
const attachInputEventListeners = (inputs) => {
  inputs.forEach((input) => {
    input.addEventListener("input", clearErrorMessages);
  });
};

/**
 * @function setupFormSubmissionHandler
 * @description Sets up form submission event handler with custom handling
 * @param {HTMLFormElement} form - Form element to attach handler to
 * @param {Function} submitHandler - Custom submit handler function
 * @returns {void} No return value - configures form submission event listener
 */
export const setupFormSubmissionHandler = (form, submitHandler) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitHandler(e);
  });
};
