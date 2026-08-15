/**
 * @fileoverview Registration Operations and Error Handling
 * @description Manages user registration process, error handling, and success navigation
 * @module register-operations
 */

import { registerUser } from "./../api/api-auth.js";
import { navigateToView } from "./../navigation/navigation.js";
import { VIEWS } from "./../../utils/constants.js";

// ###############################################################
// Registration Error Constants
// ###############################################################

/**
 * Registration error types for better error handling
 */
export const REGISTRATION_ERRORS = {
  USER_EXISTS: "already exists",
  NETWORK_ERROR: "network",
  VALIDATION_ERROR: "validation",
  UNKNOWN_ERROR: "unknown",
};

// ###############################################################
// Registration Process Management
// ###############################################################

/**
 * Executes registration API call
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Registration result
 */
const executeRegistration = async (userData) => {
  return await registerUser(userData);
};

/**
 * Handles registration success workflow
 * @param {Object} result - Registration result
 * @param {Object} userData - User data
 * @param {Function} onSuccess - Success callback
 * @param {Function} onLoading - Loading callback
 */
const handleRegistrationResult = (result, userData, onSuccess, onLoading) => {
  onLoading?.(false);
  onSuccess?.(result, userData);
};

/**
 * Handles registration error workflow
 * @param {Object} error - Registration error
 * @param {Function} onError - Error callback
 * @param {Function} onLoading - Loading callback
 */
const handleRegistrationError = (error, onError, onLoading) => {
  onLoading?.(false);

  const processedError = processRegistrationError(error);
  onError?.(processedError);

  // Only log unexpected errors, not user-facing registration errors
  if (!shouldSuppressErrorLogging(error)) {
    console.error("Registration error:", error);
  }
};

/**
 * Checks if error logging should be suppressed
 * @param {Object} error - Error object
 * @returns {boolean} True if logging should be suppressed
 */
const shouldSuppressErrorLogging = (error) => {
  return error.code && ["EMAIL_ALREADY_EXISTS", "MISSING_CREDENTIALS"].includes(error.code);
};

/**
 * Processes user registration with error handling
 * @param {Object} userData - User registration data
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @param {Function} onLoading - Loading state callback
 */
export const handleUserRegistration = async (userData, onSuccess, onError, onLoading) => {
  try {
    onLoading?.(true);
    const result = await executeRegistration(userData);
    handleRegistrationResult(result, userData, onSuccess, onLoading);
  } catch (error) {
    handleRegistrationError(error, onError, onLoading);
  }
};

// ###############################################################
// Error Processing and Classification
// ###############################################################

/**
 * Gets default error message
 * @returns {string} Default error message
 */
const getDefaultErrorMessage = () => {
  return "Registration failed. Please try again.";
};

/**
 * Processes email already exists error
 * @param {Object} error - Error object
 * @returns {Object} Processed error info
 */
const processEmailExistsError = (error) => ({
  type: REGISTRATION_ERRORS.USER_EXISTS,
  message: error.error, // Use server message directly
});

/**
 * Processes missing credentials error
 * @param {Object} error - Error object
 * @returns {Object} Processed error info
 */
const processMissingCredentialsError = (error) => ({
  type: REGISTRATION_ERRORS.VALIDATION_ERROR,
  message: error.error,
});

/**
 * Processes unknown coded error
 * @param {Object} error - Error object
 * @returns {Object} Processed error info
 */
const processUnknownCodedError = (error) => ({
  type: REGISTRATION_ERRORS.UNKNOWN_ERROR,
  message: error.error || getDefaultErrorMessage(),
});

/**
 * Processes error with code
 * @param {Object} error - Error object with code
 * @returns {Object} Processed error info
 */
const processCodedError = (error) => {
  switch (error.code) {
    case "EMAIL_ALREADY_EXISTS":
      return processEmailExistsError(error);
    case "MISSING_CREDENTIALS":
      return processMissingCredentialsError(error);
    default:
      return processUnknownCodedError(error);
  }
};

/**
 * Processes error without code
 * @param {Object} error - Error object
 * @returns {Object} Processed error info
 */
const processGenericError = (error) => {
  if (error.error) {
    return {
      type: REGISTRATION_ERRORS.VALIDATION_ERROR,
      message: error.error,
    };
  }

  return {
    type: REGISTRATION_ERRORS.UNKNOWN_ERROR,
    message: getDefaultErrorMessage(),
  };
};

/**
 * Processes registration errors to user-friendly messages
 * @param {Object} error - Raw error object
 * @returns {Object} Processed error with type and message
 */
export const processRegistrationError = (error) => {
  const errorInfo = error.code ? processCodedError(error) : processGenericError(error);

  return {
    ...errorInfo,
    originalError: error,
  };
};

// ###############################################################
// Registration Success Handling
// ###############################################################

/**
 * Gets default success message
 * @returns {string} Default success message
 */
const getDefaultSuccessMessage = () => {
  return "Registration successful! You can now log in.";
};

/**
 * Shows success message to user
 * @param {Function} onMessage - Message callback
 * @param {string} message - Success message
 */
const showSuccessMessage = (onMessage, message) => {
  onMessage?.(message, "success");
};

/**
 * Determines target view after registration
 * @param {Object} result - Registration result
 * @returns {string} Target view constant
 */
const getRegistrationTargetView = (result) => {
  // TODO: Future enhancements can be added here:
  // Auto-login, email verification, or profile setup flow
  // if (result.autoLogin) return VIEWS.DASHBOARD;
  // if (result.requiresEmailVerification) return VIEWS.EMAIL_VERIFICATION;
  // if (result.requiresProfileSetup) return VIEWS.PROFILE_SETUP;

  return VIEWS.LOGIN;
};

/**
 * Handles successful registration workflow
 * @param {Object} result - Registration API result
 * @param {Object} userData - Original user data
 * @param {Function} onMessage - Message callback
 */
export const handleRegistrationSuccess = (result, userData, onMessage) => {
  // TODO: Future enhancements can be added here:
  // Personalized success message
  // const welcomeMessage = `Welcome ${result.username || userData.email}! Registration successful.`;
  // Analytics tracking, etc.

  const successMessage = getDefaultSuccessMessage();
  showSuccessMessage(onMessage, successMessage);

  return getRegistrationTargetView(result);
};

// ###############################################################
// Registration Success Navigation
// ###############################################################

/**
 * Executes delayed navigation
 * @param {string} targetView - Target view to navigate to
 * @param {number} delay - Delay in milliseconds
 */
const executeDelayedNavigation = (targetView, delay) => {
  setTimeout(() => {
    navigateToView(targetView);
  }, delay);
};

/**
 * Handles registration success with navigation
 * @param {Object} result - Registration result
 * @param {Object} userData - User data
 * @param {Function} onMessage - Message callback
 * @param {number} delay - Navigation delay in ms
 */
export const processRegistrationSuccess = (result, userData, onMessage, delay = 2000) => {
  const targetView = handleRegistrationSuccess(result, userData, onMessage);
  executeDelayedNavigation(targetView, delay);
};
