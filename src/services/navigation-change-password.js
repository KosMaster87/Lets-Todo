// lets-todo-app/src/services/navigation-change-password.js

import { handleNavigationClick } from "./navigation.js";
import { VIEWS } from "../utils/constants.js";

/**
 * Sets up change password navigation buttons.
 * Maps change password button clicks to their corresponding views and actions.
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

  // Setup change password submit button with form handling
  const changePasswordSubmitBtn = document.getElementById(
    "changePasswordSubmitBtn"
  );
  if (changePasswordSubmitBtn) {
    changePasswordSubmitBtn.onclick = (e) => handleChangePasswordSubmit(e);
  }
};

/**
 * Sets up form-specific handlers for the change password page.
 */
const setupChangePasswordFormHandlers = () => {
  // Setup form submission on Enter key
  const changePasswordForm = document.querySelector(".change-password-menu");
  if (changePasswordForm) {
    changePasswordForm.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleChangePasswordSubmit(e);
      }
    });
  }

  // Setup individual input validation
  const currentPasswordInput = document.getElementById("currentPassword");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  if (currentPasswordInput) {
    currentPasswordInput.addEventListener("blur", validateCurrentPassword);
  }

  if (newPasswordInput) {
    newPasswordInput.addEventListener("blur", validateNewPassword);
  }

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("blur", validateConfirmPassword);
  }
};

/**
 * Handles change password form submission.
 * @param {Event} event - Form submission event
 */
const handleChangePasswordSubmit = (event) => {
  event.preventDefault();

  const currentPassword = document.getElementById("currentPassword")?.value;
  const newPassword = document.getElementById("newPassword")?.value;
  const confirmPassword = document.getElementById("confirmPassword")?.value;

  // Basic validation
  if (!currentPassword || !newPassword || !confirmPassword) {
    showChangePasswordError("Bitte fülle alle Felder aus.");
    return;
  }

  if (newPassword.length < 6) {
    showChangePasswordError(
      "Das neue Passwort muss mindestens 6 Zeichen lang sein."
    );
    return;
  }

  if (newPassword !== confirmPassword) {
    showChangePasswordError("Die neuen Passwörter stimmen nicht überein.");
    return;
  }

  if (currentPassword === newPassword) {
    showChangePasswordError(
      "Das neue Passwort muss sich vom aktuellen unterscheiden."
    );
    return;
  }

  // TODO: Implement actual password change logic
  console.log("Password change attempt:", { currentPassword, newPassword });

  // For now, show a placeholder message
  showChangePasswordError("Passwort-Änderung wird noch implementiert.");
};

/**
 * Validates current password input.
 * @param {Event} event - Blur event
 */
const validateCurrentPassword = (event) => {
  const password = event.target.value;
  if (password && password.length < 6) {
    event.target.setCustomValidity(
      "Passwort muss mindestens 6 Zeichen lang sein"
    );
  } else {
    event.target.setCustomValidity("");
  }
};

/**
 * Validates new password input.
 * @param {Event} event - Blur event
 */
const validateNewPassword = (event) => {
  const password = event.target.value;
  if (password && password.length < 6) {
    event.target.setCustomValidity(
      "Neues Passwort muss mindestens 6 Zeichen lang sein"
    );
  } else {
    event.target.setCustomValidity("");
  }
};

/**
 * Validates password confirmation input.
 * @param {Event} event - Blur event
 */
const validateConfirmPassword = (event) => {
  const confirmPassword = event.target.value;
  const newPassword = document.getElementById("newPassword")?.value;

  if (confirmPassword && newPassword && confirmPassword !== newPassword) {
    event.target.setCustomValidity("Passwörter stimmen nicht überein");
  } else {
    event.target.setCustomValidity("");
  }
};

/**
 * Shows change password error message.
 * @param {string} message - Error message to display
 */
const showChangePasswordError = (message) => {
  // TODO: Implement proper toast/error display system
  alert(message);
};

/**
 * Sets up additional change password-specific navigation handlers.
 * Called by the main navigation system for all change password-related event listeners.
 */
export const setupChangePasswordEventListeners = () => {
  setupChangePasswordNavigation();
  setupChangePasswordFormHandlers();

  // Additional change password-specific event listeners can be added here
  // For example: password strength indicator, show/hide password, etc.
};
