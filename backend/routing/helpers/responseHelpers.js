/**
 * @fileoverview Response helper functions for routing
 * @description Standardized response functions for success and error handling
 * @module routing/helpers/responseHelpers
 */

/**
 * HTTP Status Codes as constants
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * Standardized success response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object} data - Optional additional data
 * @param {number} status - HTTP status code (default: 200)
 * @returns {Object} - Response
 */
export const sendSuccess = (res, message, data = {}, status = HTTP_STATUS.OK) => {
  const response = {
    success: true,
    message,
    ...data,
  };
  return res.status(status).json(response);
};

/**
 * Standardized error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {string} code - Error code for client handling
 * @param {number} status - HTTP status code
 * @returns {Object} - Response
 */
export const sendError = (res, message, code = null, status = HTTP_STATUS.BAD_REQUEST) => {
  const response = {
    success: false,
    error: message,
  };

  if (code) {
    response.code = code;
  }

  return res.status(status).json(response);
};

/**
 * Standardized validation error response
 * @param {Object} res - Express response object
 * @param {string} message - Validation error message
 * @returns {Object} - Response
 */
export const sendValidationError = (res, message) => {
  return sendError(res, message, "VALIDATION_ERROR", HTTP_STATUS.BAD_REQUEST);
};

/**
 * Standardized authentication error response
 * @param {Object} res - Express response object
 * @param {string} message - Auth error message
 * @returns {Object} - Response
 */
export const sendAuthError = (res, message = "Not authenticated") => {
  return sendError(res, message, "AUTH_ERROR", HTTP_STATUS.UNAUTHORIZED);
};

/**
 * Standardized server error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} - Response
 */
export const sendServerError = (res, message = "Internal server error") => {
  return sendError(res, message, "SERVER_ERROR", HTTP_STATUS.INTERNAL_SERVER_ERROR);
};
