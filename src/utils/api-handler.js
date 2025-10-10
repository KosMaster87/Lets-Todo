// lets-todo-app/src/utils/api-handler.js

/**
 * Get API Base URL based on current environment
 * @returns {string} API Base URL
 */
export const getApiBase = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // Local development
  if (hostname === "127.0.0.1" || hostname === "localhost") {
    return "http://127.0.0.1:3000/api";
  }

  // Production/VPS
  if (hostname.includes("lets-todo-app-feat.dev2k.org")) {
    return "https://lets-todo-api-feat.dev2k.org/api";
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
  url = url.replace(/([^:]\/)\/+/g, "$1");

  const options = {
    method: method,
    cache: "no-cache",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data !== null) {
    options.body = JSON.stringify(data);
  }

  return fetch(url, options)
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => Promise.reject(err));
      }
      return response.json();
    })
    .catch((error) => {
      // Only log unexpected errors, not user-facing error messages
      const isUserFacingError =
        (error.code &&
          [
            "INVALID_CREDENTIALS",
            "EMAIL_ALREADY_EXISTS",
            "MISSING_CREDENTIALS",
          ].includes(error.code)) ||
        (error.error &&
          error.error.includes(
            "Server-Fehler beim Verarbeiten der Reset-Anfrage"
          ));

      if (!isUserFacingError) {
        console.error("API Error:", error);
      }
      throw error;
    });
};
