// lets-todo-app/src/services/navigation-register.js

import { handleNavigationClick, navigateToView } from "./navigation.js";
import { VIEWS } from "./../../utils/constants.js";
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
 * Sets up register navigation buttons.
 * Maps register button clicks to their corresponding views and actions.
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
 * Sets up form-specific handlers for the register page using CRUD services.
 */
const setupRegisterFormHandlers = () => {
  setupCompleteRegisterForm(handleRegisterSubmit, {
    formSelector: ".register-menu",
    fieldIds: FORM_FIELD_IDS,
    enableFieldValidation: true,
  });
};

/**
 * Handles register form submission using CRUD services.
 * @param {Event} event - Form submission event
 */
const handleRegisterSubmit = (event) => {
  event.preventDefault();

  const formData = getRegisterFormData();
  if (!formData) {
    showRegisterError("Formular nicht verfügbar.");
    return;
  }

  const validation = validateRegistrationForm(formData);
  if (!validation.isValid) {
    showRegisterError(validation.message);
    return;
  }

  processUserRegistration({
    email: formData.email,
    password: formData.password,
  });
};

/**
 * Processes user registration using CRUD operations service
 * @param {Object} userData - User registration data
 */
const processUserRegistration = (userData) => {
  const messageHandler = createRegisterMessageHandler({
    successHandler: showRegisterSuccess,
    errorHandler: showRegisterError,
  });

  handleUserRegistration(
    userData,
    (result, userData) => {
      processRegistrationSuccess(result, userData, messageHandler);
    },
    (error) => {
      showRegisterError(error.message);
    },
    (isLoading) => {
      updateRegisterLoadingState(isLoading);
    }
  );
};

// All validation and UI state logic has been moved to CRUD services

/**
 * Sets up additional register-specific navigation handlers.
 * Called by the main navigation system for all register-related event listeners.
 */
export const setupRegisterEventListeners = () => {
  setupRegisterNavigation();
  setupRegisterFormHandlers();

  // Additional register-specific event listeners can be added here
  // For example: password strength indicator, email availability check, etc.
};
