/**
 * @fileoverview Reset Password Confirmation Navigation Module
 *
 * Handles password reset confirmation functionality including token validation,
 * password strength checking, form validation, and the actual password reset process.
 * This module manages the complete workflow from token verification to successful password update.
 *
 * Key Features:
 * - Token validation on page load with user feedback
 * - Real-time password strength assessment
 * - Password confirmation matching
 * - API integration for password reset
 * - Loading states and error handling
 * - Automatic redirect after successful reset
 * - Security-focused input validation
 *
 * @module navigation-reset-password-confirm
 * @requires ./navigation.js
 * @requires ./../../utils/constants.js
 * @requires ./../../utils/api-handler.js
 * @since 1.0.0
 */

import { handleNavigationClick } from "./navigation.js";
import { VIEWS } from "./../../utils/constants.js";
import { getApiBase, apiHandler } from "./../../utils/api-handler.js";

let currentToken = null;
let tokenValidationResult = null;

/**
 * Initializes the reset password confirmation page.
 * Called when the page loads to set up token validation and event listeners.
 * @function initializeResetPasswordConfirm
 * @param {string} token - The reset token from URL parameters
 * @returns {void}
 */
export const initializeResetPasswordConfirm = (token) => {
  console.log("🚀 initializeResetPasswordConfirm called with token:", token);
  currentToken = token;

  if (!token) {
    console.log("❌ No token provided");
    showInvalidTokenMessage("Kein Token in der URL gefunden");
    return;
  }

  console.log("✅ Token gefunden, starte Initialisierung...");
  setupResetPasswordConfirmNavigation();
  setupResetPasswordConfirmFormHandlers();
  validateTokenOnLoad();
};

/**
 * Sets up navigation buttons for reset password confirmation.
 * @function setupResetPasswordConfirmNavigation
 * @returns {void}
 */
const setupResetPasswordConfirmNavigation = () => {
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

  const submitBtn = document.getElementById("resetPasswordConfirmSubmitBtn");
  if (submitBtn) {
    submitBtn.onclick = (e) => handlePasswordResetSubmit(e);
  }
};

/**
 * Sets up form event handlers for password input and validation.
 * @function setupResetPasswordConfirmFormHandlers
 * @returns {void}
 */
const setupResetPasswordConfirmFormHandlers = () => {
  const form = document.getElementById("resetPasswordConfirmForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handlePasswordResetSubmit(e);
    });
  }

  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  if (newPasswordInput) {
    newPasswordInput.addEventListener("input", () => {
      checkPasswordStrength();
      clearErrorMessages();
    });
  }

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", () => {
      checkPasswordMatch();
      clearErrorMessages();
    });
  }
};

/**
 * Validates the reset token on page load.
 * @async
 * @function validateTokenOnLoad
 * @returns {Promise<void>}
 */
const validateTokenOnLoad = async () => {
  console.log("🔍 validateTokenOnLoad started for token:", currentToken);
  try {
    const API_BASE = getApiBase();
    const url = `${API_BASE}/validate-reset-token/${currentToken}`;
    console.log("🌐 Calling API:", url);

    const result = await apiHandler(url, "GET");
    console.log("📡 API Result:", result);

    if (result.valid) {
      console.log("✅ Token is valid, showing form");
      tokenValidationResult = result;
      showValidTokenForm(result);
    } else {
      console.log("❌ Token is invalid:", result.error);
      showInvalidTokenMessage(result.error || "Token ist ungültig");
    }
  } catch (error) {
    console.error("💥 Token validation failed:", error);
    showInvalidTokenMessage("Fehler bei der Token-Validierung");
  }
};

/**
 * Shows the password reset form for valid tokens.
 * @function showValidTokenForm
 * @param {Object} tokenResult - Token validation result from API
 * @returns {void}
 */
const showValidTokenForm = (tokenResult) => {
  hideElement("tokenValidationStatus");
  hideElement("invalidTokenMessage");

  showElement("resetPasswordConfirmMenu");
  showElement("resetUserInfo");

  const emailElement = document.getElementById("resetUserEmail");
  if (emailElement) {
    emailElement.textContent = tokenResult.email;
  }

  // Focus auf erstes Passwort-Feld
  const newPasswordInput = document.getElementById("newPassword");
  if (newPasswordInput) {
    newPasswordInput.focus();
  }
};

/**
 * Shows invalid token message and hides form.
 * @function showInvalidTokenMessage
 * @param {string} message - Error message to display
 * @returns {void}
 */
const showInvalidTokenMessage = (message) => {
  hideElement("tokenValidationStatus");
  hideElement("resetPasswordConfirmMenu");

  showElement("invalidTokenMessage");
  console.error("Invalid token:", message);
};

/**
 * Gets password input values from the form.
 * @function getPasswordInputs
 * @returns {{newPassword: string, confirmPassword: string}} Password input values
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
 * Validates password inputs for reset submission.
 * @function validatePasswordInputs
 * @param {string} newPassword - New password value
 * @param {string} confirmPassword - Password confirmation value
 * @returns {boolean} True if validation passes
 */
const validatePasswordInputs = (newPassword, confirmPassword) => {
  if (!newPassword || !confirmPassword) {
    showErrorMessage("Bitte fülle beide Passwort-Felder aus");
    return false;
  }

  if (newPassword.length < 6) {
    showErrorMessage("Passwort muss mindestens 6 Zeichen lang sein");
    return false;
  }

  if (newPassword !== confirmPassword) {
    showErrorMessage("Passwörter stimmen nicht überein");
    return false;
  }

  return true;
};

/**
 * Checks and displays password strength indicator.
 * @function checkPasswordStrength
 * @returns {void}
 */
const checkPasswordStrength = () => {
  const { newPassword } = getPasswordInputs();
  const strengthContainer = document.getElementById("passwordStrength");
  const strengthFill = document.getElementById("strengthFill");
  const strengthText = document.getElementById("strengthText");

  if (!newPassword) {
    hideElement("passwordStrength");
    return;
  }

  showElement("passwordStrength");

  const strength = calculatePasswordStrength(newPassword);

  if (strengthFill) {
    strengthFill.className = `strength-fill ${strength.class}`;
  }

  if (strengthText) {
    strengthText.textContent = strength.text;
  }
};

/**
 * Calculates password strength based on various criteria.
 * @function calculatePasswordStrength
 * @param {string} password - Password to analyze
 * @returns {{class: string, text: string}} Strength assessment
 */
const calculatePasswordStrength = (password) => {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { class: "weak", text: "Schwach" };
  if (score <= 2) return { class: "fair", text: "Mäßig" };
  if (score <= 3) return { class: "good", text: "Gut" };
  return { class: "strong", text: "Stark" };
};

/**
 * Checks if password confirmation matches new password.
 * @function checkPasswordMatch
 * @returns {void}
 */
const checkPasswordMatch = () => {
  const { newPassword, confirmPassword } = getPasswordInputs();
  const confirmInput = document.getElementById("confirmPassword");

  if (!confirmPassword || !newPassword) return;

  if (confirmInput) {
    if (newPassword === confirmPassword) {
      confirmInput.style.borderColor = "#28a745";
    } else {
      confirmInput.style.borderColor = "#dc3545";
    }
  }
};

/**
 * Sets submit button loading state.
 * @function setSubmitButtonState
 * @param {boolean} isLoading - Whether button should show loading state
 * @returns {void}
 */
const setSubmitButtonState = (isLoading) => {
  const submitBtn = document.getElementById("resetPasswordConfirmSubmitBtn");
  if (submitBtn) {
    submitBtn.disabled = isLoading;
    const btnText = submitBtn.querySelector("h3");
    if (btnText) {
      btnText.textContent = isLoading
        ? "Wird gespeichert..."
        : "Passwort speichern";
    }
    if (isLoading) {
      submitBtn.classList.add("loading");
    } else {
      submitBtn.classList.remove("loading");
    }
  }
};

/**
 * Calls the password reset API endpoint.
 * @async
 * @function callPasswordResetAPI
 * @param {string} newPassword - New password to set
 * @returns {Promise<Object>} API response
 */
const callPasswordResetAPI = async (newPassword) => {
  const API_BASE = getApiBase();
  return await apiHandler(`${API_BASE}/reset-password`, "POST", {
    token: currentToken,
    newPassword: newPassword,
  });
};

/**
 * Handles successful password reset.
 * @function handlePasswordResetSuccess
 * @returns {void}
 */
const handlePasswordResetSuccess = () => {
  showSuccessMessage(
    "Passwort wurde erfolgreich geändert! Du wirst zum Login weitergeleitet..."
  );

  // Nach 3 Sekunden zum Login weiterleiten
  setTimeout(() => {
    handleNavigationClick({ preventDefault: () => {} }, VIEWS.LOGIN);
  }, 3000);
};

/**
 * Handles password reset form submission.
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

    if (!validatePasswordInputs(newPassword, confirmPassword)) {
      return;
    }

    setSubmitButtonState(true);
    const result = await callPasswordResetAPI(newPassword);

    if (result.success) {
      handlePasswordResetSuccess();
    } else {
      throw new Error(result.error || "Passwort-Reset fehlgeschlagen");
    }
  } catch (error) {
    console.error("Password reset error:", error);
    showErrorMessage(error.message || "Fehler beim Zurücksetzen des Passworts");
  } finally {
    setSubmitButtonState(false);
  }
};

/**
 * Shows error message in the form.
 * @function showErrorMessage
 * @param {string} message - Error message to display
 * @returns {void}
 */
const showErrorMessage = (message) => {
  const errorElement = document.getElementById("resetPasswordConfirmError");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
    errorElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
};

/**
 * Shows success message in the form.
 * @function showSuccessMessage
 * @param {string} message - Success message to display
 * @returns {void}
 */
const showSuccessMessage = (message) => {
  const successElement = document.getElementById("resetPasswordConfirmSuccess");
  if (successElement) {
    successElement.textContent = message;
    successElement.style.display = "block";
    successElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
};

/**
 * Clears error and success messages.
 * @function clearErrorMessages
 * @returns {void}
 */
const clearErrorMessages = () => {
  const errorElement = document.getElementById("resetPasswordConfirmError");
  const successElement = document.getElementById("resetPasswordConfirmSuccess");

  if (errorElement) errorElement.style.display = "none";
  if (successElement) successElement.style.display = "none";
};

/**
 * Shows a DOM element.
 * @function showElement
 * @param {string} elementId - ID of element to show
 * @returns {void}
 */
const showElement = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = "block";
  }
};

/**
 * Hides a DOM element.
 * @function hideElement
 * @param {string} elementId - ID of element to hide
 * @returns {void}
 */
const hideElement = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = "none";
  }
};

/**
 * Sets up event listeners for reset password confirmation page.
 * Main entry point called by navigation system.
 * @function setupResetPasswordConfirmEventListeners
 * @returns {void}
 * @exports
 */
export const setupResetPasswordConfirmEventListeners = () => {
  // Event listeners werden über initializeResetPasswordConfirm gesetzt
  // da sie den Token aus der URL benötigen
};
