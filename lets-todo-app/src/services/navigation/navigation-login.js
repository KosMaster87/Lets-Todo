/**
 * @fileoverview Navigation Login Module
 * @description Handles navigation events and form submissions for the login page
 * @module navigation-login
 */

import { handleNavigationClick, navigateToView } from "./navigation.js";
import { VIEWS, DEBUG_MODE } from "./../../utils/constants.js";
import { loginUser } from "./../api/api-auth.js";
import { showSuccessToast, showErrorToast } from "./../../utils/toast-notifications.js";

/**
 * @function logLoginStatus
 * @description Logs login operation status with type-specific console output for debugging purposes
 * @param {string} type - Message type determining log function (success, error, warning, info)
 * @param {string} message - Primary message to log to console
 * @param {any} [data=null] - Optional additional data to include in log output
 * @returns {void} No return value - performs console logging side effect
 */
const logLoginStatus = (type, message, data = null) => {
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
 * @function setupLoginNavigation
 * @description Sets up click event handlers for login navigation buttons including cancel, forgot password, and form submission
 * @returns {void} No return value - configures DOM event listeners as side effect
 */
const setupLoginNavigation = () => {
  const loginLinks = [
    { id: "loginCancelBtn", view: VIEWS.MAIN_MENU },
    { id: "loginForgotPasswordBtn", view: VIEWS.RESET_PASSWORD },
  ];

  loginLinks.forEach(({ id, view }) => {
    const element = document.getElementById(id);
    if (element) {
      element.onclick = (e) => handleNavigationClick(e, view);
    }
  });

  const loginSubmitBtn = document.getElementById("loginSubmitBtn");
  if (loginSubmitBtn) {
    loginSubmitBtn.onclick = (e) => handleLoginSubmit(e);
  }
};

/**
 * @function setupLoginFormHandlers
 * @description Sets up form-specific event handlers including Enter key submission, email validation, and password validation
 * @returns {void} No return value - configures form event listeners and validation handlers as side effects
 */
const setupLoginFormHandlers = () => {
  const loginForm = document.querySelector(".login-menu");
  if (loginForm) {
    loginForm.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleLoginSubmit(e);
      }
    });
  }

  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");

  if (emailInput) {
    emailInput.addEventListener("blur", validateEmail);
  }

  if (passwordInput) {
    passwordInput.addEventListener("blur", validatePassword);
  }
};

/**
 * @function getLoginFormInputs
 * @description Gets login form input values from DOM elements
 * @returns {Object} Form input values object
 * @returns {string} returns.email - Email input value from loginEmail field
 * @returns {string} returns.password - Password input value from loginPassword field
 * @returns {boolean} returns.remember - Remember me checkbox state from loginRemember field
 */
const getLoginFormInputs = () => ({
  email: document.getElementById("loginEmail")?.value,
  password: document.getElementById("loginPassword")?.value,
  remember: document.getElementById("loginRemember")?.checked,
});

/**
 * @function validateLoginInputs
 * @description Validates login form inputs for completeness and email format, shows error messages for invalid inputs
 * @param {string} email - Email input value to validate
 * @param {string} password - Password input value to check for presence
 * @returns {boolean} True if all inputs are valid, false if validation fails
 */
const validateLoginInputs = (email, password) => {
  if (!email || !password) {
    showLoginError("Please fill in all fields.");
    return false;
  }

  if (!isValidEmail(email)) {
    showLoginError("Please enter a valid email address.");
    return false;
  }

  return true;
};

/**
 * @function handleLoginSubmit
 * @description Handles login form submission by preventing default, extracting form data, validating inputs, and initiating login process
 * @param {Event} event - Form submission or click event object
 * @param {HTMLElement} event.target - Event target element
 * @returns {void} No return value - performs form processing and login initiation side effects
 */
const handleLoginSubmit = (event) => {
  event.preventDefault();

  const { email, password, remember } = getLoginFormInputs();

  if (!validateLoginInputs(email, password)) {
    return;
  }

  handleUserLogin({ email, password, remember });
};

/**
 * @function validateEmail
 * @description Validates email input on blur event and sets custom validity message for invalid emails
 * @param {Event} event - Blur event object from email input field
 * @param {HTMLInputElement} event.target - Email input element that triggered the blur event
 * @returns {void} No return value - performs input validation and custom validity setting side effects
 */
const validateEmail = (event) => {
  const email = event.target.value;
  const errorMessage = email && !isValidEmail(email) ? "Invalid email address" : "";
  event.target.setCustomValidity(errorMessage);
};

/**
 * @function validatePassword
 * @description Validates password input on blur event and sets custom validity message for passwords shorter than 6 characters
 * @param {Event} event - Blur event object from password input field
 * @param {HTMLInputElement} event.target - Password input element that triggered the blur event
 * @returns {void} No return value - performs password validation and custom validity setting side effects
 */
const validatePassword = (event) => {
  const password = event.target.value;
  const errorMessage =
    password && password.length < 6 ? "Password must be at least 6 characters long" : "";
  event.target.setCustomValidity(errorMessage);
};

/**
 * @function isValidEmail
 * @description Checks if email format is valid using regular expression pattern matching
 * @param {string} email - Email address string to validate
 * @returns {boolean} True if email matches valid format pattern, false otherwise
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * @function handleLoginSuccess
 * @description Handles successful login response by resetting loading state, showing success message, and navigating to main menu
 * @param {Object} result - Login result object from API response
 * @param {string} [result.token] - Authentication token from successful login
 * @param {Object} [result.user] - User data object from login response
 * @returns {void} No return value - performs UI updates and navigation side effects
 */
const handleLoginSuccess = (result) => {
  showLoginLoading(false);
  showLoginSuccess("Login successful! Welcome back!");
  setTimeout(() => {
    navigateToView(VIEWS.MAIN_MENU);
  }, 1500);
};

/**
 * @function handleLoginError
 * @description Handles login error response by resetting loading state, logging error details, and showing user-friendly error message
 * @param {Error} error - Error object from failed login operation
 * @param {string} [error.error] - Specific error message from API response
 * @param {string} [error.message] - General error message from error object
 * @returns {void} No return value - performs UI updates and error display side effects
 */
const handleLoginError = (error) => {
  showLoginLoading(false);
  logLoginStatus("error", "Login failed:", error);

  let errorMessage = "Login failed. Please check your credentials.";

  if (error.error) {
    errorMessage = error.error;
  } else if (error.message) {
    errorMessage = error.message;
  }

  showLoginError(errorMessage);
};

/**
 * @function handleUserLogin
 * @async
 * @description Handle user login using centralized API service with loading state management and comprehensive error handling
 * @param {Object} userData - User login data object
 * @param {string} userData.email - User email address for authentication
 * @param {string} userData.password - User password for authentication
 * @param {boolean} userData.remember - Remember me flag for session persistence
 * @returns {Promise<void>} Promise that resolves when login operation completes successfully or rejects with error
 * @throws {Error} Thrown when login API call fails
 */
const handleUserLogin = async (userData) => {
  try {
    showLoginLoading(true);
    const result = await loginUser(userData);
    handleLoginSuccess(result);
  } catch (error) {
    handleLoginError(error);
  }
};

/**
 * @function updateLoginButtonContent
 * @description Updates login button content text based on loading state, modifying h3 and p elements within button
 * @param {HTMLElement} btnContent - Button content container element containing h3 and p elements
 * @param {boolean} isLoading - Loading state flag determining button text content
 * @returns {void} No return value - performs DOM text content updates as side effects
 */
const updateLoginButtonContent = (btnContent, isLoading) => {
  const h3 = btnContent.querySelector("h3");
  const p = btnContent.querySelector("p");

  if (h3) {
    h3.textContent = isLoading ? "Logging in..." : "Log In";
  }
  if (p) {
    p.textContent = isLoading ? "Please wait..." : "Sign in to your account";
  }
};

/**
 * @function updateLoginButtonVisual
 * @description Updates login button visual state including opacity and icon animation based on loading state
 * @param {HTMLElement} submitBtn - Submit button element to update opacity
 * @param {HTMLElement} btnIcon - Button icon element to apply spinning animation
 * @param {boolean} isLoading - Loading state flag determining visual appearance
 * @returns {void} No return value - performs DOM style updates as side effects
 */
const updateLoginButtonVisual = (submitBtn, btnIcon, isLoading) => {
  submitBtn.style.opacity = isLoading ? "0.7" : "1";
  if (btnIcon) {
    btnIcon.style.animation = isLoading ? "spin 1s linear infinite" : "";
  }
};

/**
 * @function showLoginLoading
 * @description Shows login loading state by updating button disabled state, content text, and visual appearance
 * @param {boolean} isLoading - Loading state flag to determine button appearance and functionality
 * @returns {void} No return value - performs comprehensive button state updates as side effects
 */
const showLoginLoading = (isLoading) => {
  const submitBtn = document.getElementById("loginSubmitBtn");
  if (!submitBtn) return;

  const btnContent = submitBtn.querySelector(".btn-content");
  const btnIcon = submitBtn.querySelector(".btn-icon");

  submitBtn.disabled = isLoading;

  if (btnContent) {
    updateLoginButtonContent(btnContent, isLoading);
  }

  updateLoginButtonVisual(submitBtn, btnIcon, isLoading);
};

/**
 * @function showLoginSuccess
 * @description Shows login success message using toast notification system
 * @param {string} message - Success message text to display in toast notification
 * @returns {void} No return value - triggers toast notification display side effect
 */
const showLoginSuccess = (message) => {
  showSuccessToast(message);
};

/**
 * @function showLoginError
 * @description Shows login error message using toast notification system
 * @param {string} message - Error message text to display in toast notification
 * @returns {void} No return value - triggers error toast notification display side effect
 */
const showLoginError = (message) => {
  showErrorToast(message);
};

/**
 * @function setupLoginEventListeners
 * @exports
 * @description Sets up comprehensive login-specific navigation handlers including navigation buttons, form handlers, and validation
 * @returns {void} No return value - configures all login page event listeners as side effects
 */
export const setupLoginEventListeners = () => {
  setupLoginNavigation();
  setupLoginFormHandlers();
  // Additional login-specific event listeners can be added here.
  // For example: password visibility toggle, forgot password, etc.
};
