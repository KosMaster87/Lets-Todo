// lets-todo-app/src/services/crud/register-operations.js

import { registerUser } from "./../api-auth.js";
import { navigateToView } from "./../navigation/navigation.js";
import { VIEWS } from "./../../utils/constants.js";

/**
 * Registration error types for better error handling
 */
export const REGISTRATION_ERRORS = {
  USER_EXISTS: "already exists",
  NETWORK_ERROR: "network",
  VALIDATION_ERROR: "validation",
  UNKNOWN_ERROR: "unknown",
};

/**
 * Processes user registration with error handling
 * @param {Object} userData - User registration data
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @param {Function} onLoading - Loading state callback
 */
export const handleUserRegistration = async (
  userData,
  onSuccess,
  onError,
  onLoading
) => {
  try {
    onLoading?.(true);

    const result = await registerUser(userData);

    onLoading?.(false);
    onSuccess?.(result, userData);
  } catch (error) {
    onLoading?.(false);

    const processedError = processRegistrationError(error);
    onError?.(processedError);

    console.error("Registration error:", error);
  }
};

/**
 * Processes registration errors to user-friendly messages
 * @param {Object} error - Raw error object
 * @returns {Object} Processed error with type and message
 */
export const processRegistrationError = (error) => {
  let errorType = REGISTRATION_ERRORS.UNKNOWN_ERROR;
  let errorMessage = "Registrierung fehlgeschlagen. Bitte versuche es erneut.";

  if (error.error) {
    if (error.error.includes("already exists")) {
      errorType = REGISTRATION_ERRORS.USER_EXISTS;
      errorMessage = "Diese E-Mail-Adresse ist bereits registriert.";
    } else {
      errorType = REGISTRATION_ERRORS.VALIDATION_ERROR;
      errorMessage = error.error;
    }
  }

  return {
    type: errorType,
    message: errorMessage,
    originalError: error,
  };
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
  // const welcomeMessage = `Willkommen ${result.username || userData.email}! Registrierung erfolgreich.`;
  // onMessage?.(welcomeMessage, "success");

  // Analytics tracking
  // analytics.track('user_registered', {
  //   userId: result.userId,
  //   email: userData.email,
  //   registrationDate: result.createdAt,
  //   userType: result.accountType || 'free'
  // });

  // Auto-login functionality
  // if (result.autoLogin) {
  //   setSession({
  //     sessionType: "user",
  //     userId: result.userId,
  //     userEmail: userData.email,
  //     sessionId: `user_${result.userId}`,
  //   });
  //   return VIEWS.DASHBOARD; // Direct to dashboard
  // }

  // Email verification or profile setup flow
  // if (result.requiresEmailVerification) {
  //   return VIEWS.EMAIL_VERIFICATION;
  // } else if (result.requiresProfileSetup) {
  //   return VIEWS.PROFILE_SETUP;
  // }

  // Default success flow
  const successMessage =
    "Registrierung erfolgreich! Du kannst dich jetzt anmelden.";
  onMessage?.(successMessage, "success");

  return VIEWS.LOGIN;
};

/**
 * Handles registration success with navigation
 * @param {Object} result - Registration result
 * @param {Object} userData - User data
 * @param {Function} onMessage - Message callback
 * @param {number} delay - Navigation delay in ms
 */
export const processRegistrationSuccess = (
  result,
  userData,
  onMessage,
  delay = 2000
) => {
  const targetView = handleRegistrationSuccess(result, userData, onMessage);

  // Navigate after delay to show success message
  setTimeout(() => {
    navigateToView(targetView);
  }, delay);
};
