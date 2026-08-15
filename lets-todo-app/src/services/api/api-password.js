/**
 * @fileoverview Unified Password API Services
 * @description Provides functions for password change and reset operations
 * @module password-api
 */

import { getApiBase, apiHandler } from "./api-handler.js";
import { getSession } from "../../state/main-state.js";
import { DEBUG_MODE } from "../../utils/constants.js";

/**
 * @function logPasswordOperation
 * @description Logs password operation status for debugging purposes
 * @param {string} type - Message type determining log function
 * @param {string} message - Primary message to log to console
 * @param {any} [data=null] - Optional additional data to include in log output
 * @returns {void} No return value - performs console logging side effect
 */
const logPasswordOperation = (type, message, data = null) => {
  if (!DEBUG_MODE) return;

  const logFunction = getLogFunction(type);
  executeLogOperation(logFunction, message, data);
};

/**
 * @function getLogFunction
 * @description Gets appropriate console function based on log type
 * @param {string} type - Message type to determine console function
 * @returns {Function} Console function corresponding to the message type
 */
const getLogFunction = (type) => {
  const logMapping = {
    success: console.log,
    error: console.error,
    warning: console.warn,
    info: console.log,
  };
  return logMapping[type] || console.log;
};

/**
 * @function executeLogOperation
 * @description Executes the actual logging operation with optional data
 * @param {Function} logFunction - Console function to use for logging
 * @param {string} message - Primary message to log
 * @param {any} [data] - Optional additional data to include
 * @returns {void} No return value - performs console logging side effect
 */
const executeLogOperation = (logFunction, message, data) => {
  data ? logFunction(message, data) : logFunction(message);
};

// #################################################################
// SESSION VALIDATION
// #################################################################

/**
 * @function validateSessionWithServer
 * @async
 * @description Validates current user session with server before password operations
 * @returns {Promise<boolean>} Promise resolving to session validity status
 */
export const validateSessionWithServer = async () => {
  try {
    const response = await performSessionValidation();
    return response.valid === true;
  } catch (error) {
    handleSessionValidationError(error);
    return false;
  }
};

/**
 * @function performSessionValidation
 * @async
 * @description Performs actual session validation API call
 * @returns {Promise<Object>} Promise resolving to session validation response
 */
const performSessionValidation = async () => {
  const API_BASE = getApiBase();
  return await apiHandler(`${API_BASE}/validate-session`, "GET");
};

/**
 * @function handleSessionValidationError
 * @description Handles session validation errors with appropriate logging
 * @param {Error} error - Error object from session validation failure
 * @returns {void} No return value - performs error logging side effect
 */
const handleSessionValidationError = (error) => {
  logPasswordOperation("warning", "Session validation failed:", error);
};

// #################################################################
// PASSWORD CHANGE API
// #################################################################

/**
 * @function callChangePasswordAPI
 * @async
 * @description Calls change password API endpoint with comprehensive validation
 * @param {string} currentPassword - Current password for server verification
 * @param {string} newPassword - New password to be set for the user account
 * @returns {Promise<Object>} Promise resolving to API response object
 * @throws {Error} Thrown when session validation fails or API request fails
 */
export const callChangePasswordAPI = async (currentPassword, newPassword) => {
  validateActiveSession();
  await ensureValidSession();
  return await executePasswordChangeRequest(currentPassword, newPassword);
};

/**
 * @function validateActiveSession
 * @description Validates that an active session exists before API call
 * @throws {Error} Thrown when no active session is found
 * @returns {void} No return value - performs session presence validation
 */
const validateActiveSession = () => {
  const session = getSession();
  if (!session) {
    throw new Error("No active session found. Please log in again.");
  }
};

/**
 * @function ensureValidSession
 * @async
 * @description Ensures session is valid with server before proceeding
 * @throws {Error} Thrown when session validation fails
 * @returns {Promise<void>} Promise that resolves if session is valid
 */
const ensureValidSession = async () => {
  const isValidSession = await validateSessionWithServer();
  if (!isValidSession) {
    throw new Error("Session expired or invalid. Please log in again.");
  }
};

/**
 * @function executePasswordChangeRequest
 * @async
 * @description Executes the actual password change API request
 * @param {string} currentPassword - Current password for verification
 * @param {string} newPassword - New password to be set
 * @returns {Promise<Object>} Promise resolving to API response object
 */
const executePasswordChangeRequest = async (currentPassword, newPassword) => {
  const API_BASE = getApiBase();
  return await apiHandler(`${API_BASE}/change-password`, "PUT", {
    currentPassword,
    newPassword,
  });
};

/**
 * @function processPasswordChange
 * @async
 * @description Orchestrates password change API call and validates response
 * @param {Object} inputs - Password input values object
 * @param {string} inputs.currentPassword - Current password for verification
 * @param {string} inputs.newPassword - New password to be set
 * @returns {Promise<Object>} Promise resolving to success result object
 * @throws {Error} Thrown when password change fails or returns unsuccessful result
 */
export const processPasswordChange = async (inputs) => {
  const result = await callChangePasswordAPI(
    inputs.currentPassword,
    inputs.newPassword
  );

  validatePasswordChangeResult(result);
  return { success: true, inputs };
};

/**
 * @function validatePasswordChangeResult
 * @description Validates the password change API response for success
 * @param {Object} result - API response object
 * @param {boolean} [result.success] - Success flag from API response
 * @param {string} [result.message] - Message from API response
 * @throws {Error} Thrown when API response indicates failure
 * @returns {void} No return value - performs result validation with exception throwing
 */
const validatePasswordChangeResult = (result) => {
  if (!result.success) {
    const errorMessage =
      result.message || "Failed to change password. Please try again.";
    throw new Error(errorMessage);
  }
};

// #################################################################
// PASSWORD RESET API
// #################################################################

/**
 * @function callTokenValidationAPI
 * @async
 * @description Calls token validation API to verify reset token validity
 * @param {string} token - Reset token to validate
 * @returns {Promise<Object>} Promise resolving to token validation response
 * @throws {Error} Thrown when API request fails
 */
export const callTokenValidationAPI = async (token) => {
  const API_BASE = getApiBase();
  const url = `${API_BASE}/validate-reset-token/${token}`;
  return await apiHandler(url, "GET");
};

/**
 * @function callPasswordResetAPI
 * @async
 * @description Calls password reset API to set new password with token
 * @param {string} token - Valid reset token
 * @param {string} newPassword - New password to be set
 * @returns {Promise<Object>} Promise resolving to password reset response
 * @throws {Error} Thrown when API request fails
 */
export const callPasswordResetAPI = async (token, newPassword) => {
  const API_BASE = getApiBase();
  return await apiHandler(`${API_BASE}/reset-password`, "POST", {
    token: token,
    newPassword: newPassword,
  });
};

// #################################################################
// ERROR HANDLING
// #################################################################

/**
 * @function handlePasswordChangeError
 * @description Handles password change errors with logging and user feedback
 * @param {Error} error - Error object from failed password change operation
 * @param {Function} showErrorMessage - Function to display error message to user
 * @returns {void} No return value - performs error handling side effects
 */
export const handlePasswordChangeError = (error, showErrorMessage) => {
  logPasswordOperation("error", "Error changing password:", error);
  const message =
    error.message ||
    "An error occurred while changing password. Please try again.";
  showErrorMessage(message);
};

/**
 * @function handlePasswordResetError
 * @description Handles password reset errors with logging and user feedback
 * @param {Error} error - Error object from failed password reset operation
 * @param {Function} showErrorMessage - Function to display error message to user
 * @returns {void} No return value - performs error handling side effects
 */
export const handlePasswordResetError = (error, showErrorMessage) => {
  logPasswordOperation("error", "Error resetting password:", error);
  const message =
    error.message ||
    "An error occurred while resetting password. Please try again.";
  showErrorMessage(message);
};
