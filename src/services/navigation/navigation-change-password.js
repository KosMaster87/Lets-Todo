/**
 * @fileoverview Change Password Navigation Module
 * @description Manages navigation and form handling for the change password view
 * @module navigation-change-password
 */

import { handleNavigationClick } from "./navigation.js";
import { VIEWS } from "./../../utils/constants.js";
import { validatePasswordChangeInputs } from "./../../utils/password-validation.js";
import {
  setChangePasswordButtonState,
  clearErrorMessages,
  showErrorMessage,
} from "./../../utils/ui-state-helpers.js";
import {
  processPasswordChange,
  handlePasswordChangeError,
} from "../api/api-password.js";
import {
  getPasswordFormInputs,
  handlePasswordChangeSuccess,
  getChangePasswordForm,
  setupPasswordInputEventListeners,
  setupFormSubmissionHandler,
} from "./../../utils/form-helpers.js";

/**
 * @function setupChangePasswordNavigation
 * @description Sets up click event handlers for change password navigation buttons
 * @returns {void} No return value - orchestrates navigation setup as side effects
 */
const setupChangePasswordNavigation = () => {
  const navigationLinks = getChangePasswordNavigationLinks();
  setupStandardNavigationButtons(navigationLinks);
  setupSubmitButton();
};

/**
 * @function getChangePasswordNavigationLinks
 * @description Returns configuration array for change password navigation buttons
 * @returns {Array<Object>} Array of navigation link configuration objects
 */
const getChangePasswordNavigationLinks = () => [
  { id: "changePasswordCancelBtn", view: VIEWS.PERSONAL_DATA },
];

/**
 * @function setupStandardNavigationButtons
 * @description Sets up click event handlers for standard navigation buttons
 * @param {Array<Object>} navigationLinks - Array of navigation link configurations
 * @returns {void} No return value - configures navigation button event listeners
 */
const setupStandardNavigationButtons = (navigationLinks) => {
  navigationLinks.forEach(({ id, view }) => {
    const element = document.getElementById(id);
    if (element) {
      element.onclick = (e) => handleNavigationClick(e, view);
    }
  });
};

/**
 * @function setupSubmitButton
 * @description Sets up click event handler for change password submit button
 * @returns {void} No return value - configures submit button event listener
 */
const setupSubmitButton = () => {
  const submitBtn = document.getElementById("changePasswordSubmitBtn");
  if (submitBtn) {
    submitBtn.onclick = (e) => handleChangePasswordSubmit(e);
  }
};

/**
 * @function setupChangePasswordFormHandlers
 * @description Sets up form-specific event handlers for password change form
 * @returns {void} No return value - orchestrates form event listener configuration
 */
const setupChangePasswordFormHandlers = () => {
  const form = getChangePasswordForm();
  if (!form) return;

  setupPasswordInputEventListeners(form);
  setupFormSubmissionHandler(form, handleChangePasswordSubmit);
};

/**
 * @function handleChangePasswordSubmit
 * @async
 * @description Handles change password form submission with validation and processing
 * @param {Event} e - Form submit event object from password change form
 * @returns {Promise<void>} Promise that resolves when operation completes
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
        inputs.confirmPassword,
        showErrorMessage
      )
    ) {
      return;
    }

    setChangePasswordButtonState(true);
    const result = await processPasswordChange(inputs);
    handlePasswordChangeSuccess(e, result.inputs, handleNavigationClick);
  } catch (error) {
    handlePasswordChangeError(error, showErrorMessage);
  } finally {
    setChangePasswordButtonState(false);
  }
};

/**
 * @function setupChangePasswordEventListeners
 * @exports
 * @description Sets up comprehensive change password navigation and form handlers
 * @returns {void} No return value - configures all change password event listeners
 */
export const setupChangePasswordEventListeners = () => {
  setupChangePasswordNavigation();
  setupChangePasswordFormHandlers();
};
