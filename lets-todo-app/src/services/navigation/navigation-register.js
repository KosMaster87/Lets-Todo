/**
 * @fileoverview Navigation Register Module
 * @description Sets up event listeners and handlers for the user registration process
 * @module navigation-register
 */

import { handleNavigationClick, navigateToView } from "./navigation.js";
import { VIEWS, DEBUG_MODE } from "./../../utils/constants.js";
import { validateRegistrationForm } from "./../crud/register-validation.js";
import {
  handleUserRegistration,
  processRegistrationSuccess,
} from "./../crud/register-operations.js";
import {
  updateRegisterLoadingState,
  showRegisterSuccess,
  showRegisterError,
  createRegisterMessageHandler,
} from "./../crud/register-ui-state.js";
import {
  setupCompleteRegisterForm,
  getRegisterFormData,
  FORM_FIELD_IDS,
} from "./../crud/register-form.js";

/**
 * Logs register operation status for debugging
 * @function logRegisterStatus
 * @param {string} type - Message type (success, error, warning, info)
 * @param {string} message - Message to log
 * @param {any} [data=null] - Optional data to log
 * @returns {void}
 */
const logRegisterStatus = (type, message, data = null) => {
  if (!DEBUG_MODE) return;

  const logFunctions = {
    success: console.log,
    error: console.error,
    warning: console.warn,
    info: console.log,
  };

  const logFunction = logFunctions[type] || console.log;
  data ? logFunction(message, data) : logFunction(message);
};

/**
 * Sets up register navigation button click handlers
 * Maps register navigation button clicks to their corresponding views and actions.
 * @function setupRegisterNavigation
 * @returns {void}
 */
const setupRegisterNavigation = () => {
  const registerLinks = [{ id: "registerCancelBtn", view: VIEWS.MAIN_MENU }];

  registerLinks.forEach(({ id, view }) => {
    const element = document.getElementById(id);
    if (element) {
      element.onclick = (e) => handleNavigationClick(e, view);
    }
  });
};

/**
 * Sets up form-specific handlers for the register page
 * Configures complete form setup with validation and submission handling.
 * @function setupRegisterFormHandlers
 * @returns {void}
 */
const setupRegisterFormHandlers = () => {
  setupCompleteRegisterForm(handleRegisterSubmit, {
    formSelector: ".register-menu",
    fieldIds: FORM_FIELD_IDS,
    enableFieldValidation: true,
  });
};

/**
 * Validates form data and shows error if invalid
 * @function validateFormData
 * @param {Object} formData - Form data object to validate
 * @param {string} formData.email - User's email address
 * @param {string} formData.password - User's password
 * @param {string} [formData.confirmPassword] - Password confirmation
 * @returns {boolean} True if validation passes, false otherwise
 */
const validateFormData = (formData) => {
  if (!formData) {
    showRegisterError("Form not available.");
    return false;
  }

  const validation = validateRegistrationForm(formData);
  if (!validation.isValid) {
    showRegisterError(validation.message);
    return false;
  }

  return true;
};

/**
 * Handles register form submission
 * Main coordinator function that orchestrates the registration process.
 * @function handleRegisterSubmit
 * @param {Event} event - Form submission event
 * @returns {void}
 */
const handleRegisterSubmit = (event) => {
  event.preventDefault();

  const formData = getRegisterFormData();

  if (!validateFormData(formData)) {
    return;
  }

  processUserRegistration({
    email: formData.email,
    password: formData.password,
  });
};

/**
 * Handles registration success callback
 * @function handleRegistrationSuccess
 * @param {Object} result - Registration result from API
 * @param {boolean} result.success - Whether registration was successful
 * @param {string} [result.message] - Success message from server
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password
 * @param {Object} messageHandler - Message handler for UI updates
 * @returns {void}
 */
const handleRegistrationSuccess = (result, userData, messageHandler) => {
  logRegisterStatus("success", "Registration successful:", result);
  processRegistrationSuccess(result, userData, messageHandler);
};

/**
 * Handles registration error callback and displays user-friendly messages
 * @function handleRegistrationError
 * @param {Error} error - Registration error object
 * @param {string} error.message - Error message to display
 * @returns {void}
 */
const handleRegistrationError = (error) => {
  logRegisterStatus("error", "Registration failed:", error);
  showRegisterError(error.message);
};

/**
 * Processes user registration using CRUD operations service
 * Creates message handler and coordinates registration workflow with callbacks.
 * @function processUserRegistration
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password
 * @returns {void}
 */
const processUserRegistration = (userData) => {
  const messageHandler = createRegisterMessageHandler({
    successHandler: showRegisterSuccess,
    errorHandler: showRegisterError,
  });

  handleUserRegistration(
    userData,
    (result, userData) => handleRegistrationSuccess(result, userData, messageHandler),
    handleRegistrationError,
    updateRegisterLoadingState
  );
};

/**
 * Sets up register-specific navigation handlers and event listeners
 * Main entry point called by the navigation system for all register-related event listeners.
 * @function setupRegisterEventListeners
 * @returns {void}
 * @exports
 */
export const setupRegisterEventListeners = () => {
  setupRegisterNavigation();
  setupRegisterFormHandlers();
  // Additional register-specific event listeners can be added here
  // For example: password strength indicator, email availability check, etc.
};
