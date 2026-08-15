/**
 * @fileoverview Password DOM manipulation and UI utilities
 * @description Functions for updating password strength indicators and managing focus
 * @module password-dom
 */

import { calculatePasswordStrength } from "./password-strength.js";

/**
 * @function updateStrengthDisplay
 * @description Updates password strength visual indicators in the DOM
 * @param {Object} strength - Strength object with class and text properties
 * @returns {void} No return value - performs DOM manipulation side effect
 */
export const updateStrengthDisplay = (strength) => {
  const strengthFill = document.getElementById("strengthFill");
  const strengthText = document.getElementById("strengthText");

  if (strengthFill) {
    strengthFill.className = `strength-fill ${strength.class}`;
  }

  if (strengthText) {
    strengthText.textContent = strength.text;
  }
};

/**
 * @function checkPasswordStrength
 * @description Checks password strength and updates UI display accordingly
 * @param {Function} getPasswordInputs - Function to retrieve password input values
 * @param {Function} showElement - Function to show DOM elements
 * @param {Function} hideElement - Function to hide DOM elements
 * @returns {void} No return value - performs UI update side effect
 */
export const checkPasswordStrength = (getPasswordInputs, showElement, hideElement) => {
  const { newPassword } = getPasswordInputs();

  if (!newPassword) {
    hideElement("passwordStrength");
    return;
  }

  showElement("passwordStrength");
  const strength = calculatePasswordStrength(newPassword);
  updateStrengthDisplay(strength);
};

/**
 * @function checkPasswordMatch
 * @description Checks if passwords match and updates visual feedback
 * @param {Function} getPasswordInputs - Function to retrieve password input values
 * @returns {void} No return value - performs visual feedback side effect
 */
export const checkPasswordMatch = (getPasswordInputs) => {
  const { newPassword, confirmPassword } = getPasswordInputs();
  const confirmInput = document.getElementById("confirmPassword");

  if (!confirmPassword || !newPassword || !confirmInput) return;

  const isMatch = newPassword === confirmPassword;
  confirmInput.style.borderColor = isMatch ? "#28a745" : "#dc3545";
};

/**
 * @function focusPasswordInput
 * @description Generic function to focus password input fields by ID
 * @param {string} inputId - ID of the input element to focus
 * @returns {void} No return value - performs DOM focus side effect
 */
export const focusPasswordInput = (inputId) => {
  document.getElementById(inputId)?.focus();
};

/**
 * @function focusCurrentPasswordInput
 * @description Focuses the current password input field
 * @returns {void} No return value - performs DOM focus side effect
 */
export const focusCurrentPasswordInput = () => {
  focusPasswordInput("currentPassword");
};

/**
 * @function focusNewPasswordInput
 * @description Focuses the new password input field
 * @returns {void} No return value - performs DOM focus side effect
 */
export const focusNewPasswordInput = () => {
  focusPasswordInput("newPassword");
};

/**
 * @function focusConfirmPasswordInput
 * @description Focuses the confirm password input field
 * @returns {void} No return value - performs DOM focus side effect
 */
export const focusConfirmPasswordInput = () => {
  focusPasswordInput("confirmPassword");
};
