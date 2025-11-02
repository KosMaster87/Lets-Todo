/**
 * @fileoverview API handler utilities
 * @description Provides standardized API request handling with error management
 * @module api-handler
 */

/**
 * Get API Base URL based on current environment
 * @returns {string} API Base URL
 */
export const getApiBase = () => {
  const hostname = window.location.hostname;
  // const protocol = window.location.protocol; // Optional: Use if protocol-based URLs are needed

  // Local development
  if (hostname === "127.0.0.1" || hostname === "localhost") {
    return "http://127.0.0.1:3000/api";
  }

  // Feature environment
  if (hostname.includes("lets-todo-feat.dev2k.org")) {
    return "https://lets-todo-api-feat.dev2k.org/api";
  }

  // Staging environment
  if (hostname.includes("lets-todo-stage.dev2k.org")) {
    return "https://lets-todo-api-stage.dev2k.org/api";
  }

  // Production environment
  if (hostname.includes("lets-todo.dev2k.org")) {
    return "https://lets-todo-api.dev2k.org/api";
  }

  // Fallback to local
  return "http://127.0.0.1:3000/api";
};

/**
 * API Handler for HTTP requests with cookie support
 * Standardized fetch wrapper with error handling
 * @param {string} url - API endpoint URL
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {Object|null} data - Request body data (will be JSON stringified)
 * @returns {Promise<Object>} API response data
 */
export const apiHandler = (url, method, data = null) => {
  const cleanedUrl = cleanUrl(url);
  const options = createFetchOptions(method, data);

  return fetch(cleanedUrl, options).then(handleResponse).catch(handleError);
};

/**
 * Clean URL by removing duplicate slashes
 * @param {string} url - URL to clean
 * @returns {string} Cleaned URL
 */
const cleanUrl = (url) => url.replace(/([^:]\/)\/+/g, "$1");

/**
 * Create fetch options object with standard configuration
 * @param {string} method - HTTP method
 * @param {Object|null} data - Request body data
 * @returns {Object} Fetch options object
 */
const createFetchOptions = (method, data) => {
  const options = {
    method,
    cache: "no-cache",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data !== null) {
    options.body = JSON.stringify(data);
  }

  return options;
};

/**
 * Handle fetch response and extract JSON data
 * @param {Response} response - Fetch response object
 * @returns {Promise<Object>} JSON response data
 */
const handleResponse = (response) => {
  if (!response.ok) {
    return response.json().then((err) => Promise.reject(err));
  }
  return response.json();
};

/**
 * Handle fetch errors with selective logging
 * @param {Object} error - Error object
 * @throws {Object} Re-throws the error after optional logging
 */
const handleError = (error) => {
  if (!isUserFacingError(error)) {
    console.error("API Error:", error);
  }
  throw error;
};

/**
 * Check if error is user-facing and should not be logged
 * @param {Object} error - Error object to check
 * @returns {boolean} True if error is user-facing
 */
const isUserFacingError = (error) => {
  const userFacingCodes = [
    "INVALID_CREDENTIALS",
    "EMAIL_ALREADY_EXISTS",
    "MISSING_CREDENTIALS",
  ];

  return (
    (error.code && userFacingCodes.includes(error.code)) ||
    (error.error &&
      error.error.includes("Server error processing reset request"))
  );
};
