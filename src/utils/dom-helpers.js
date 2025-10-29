/**
 * @fileoverview DOM manipulation utilities
 * @description Provides helper functions for showing/hiding elements and displaying messages
 * @module dom-helpers
 */

/**
 * Shows DOM element
 */
export const showElement = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = "block";
  }
};

/**
 * Hides DOM element
 */
export const hideElement = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = "none";
  }
};

/**
 * Shows error message
 */
export const showErrorMessage = (
  message,
  errorElementId = "resetPasswordConfirmError"
) => {
  const errorElement = document.getElementById(errorElementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
    errorElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
};

/**
 * Shows success message
 */
export const showSuccessMessage = (
  message,
  successElementId = "resetPasswordConfirmSuccess"
) => {
  const successElement = document.getElementById(successElementId);
  if (successElement) {
    successElement.textContent = message;
    successElement.style.display = "block";
    successElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
};

/**
 * Clears error and success messages
 */
export const clearErrorMessages = (
  errorElementId = "resetPasswordConfirmError",
  successElementId = "resetPasswordConfirmSuccess"
) => {
  const errorElement = document.getElementById(errorElementId);
  const successElement = document.getElementById(successElementId);

  if (errorElement) errorElement.style.display = "none";
  if (successElement) successElement.style.display = "none";
};
