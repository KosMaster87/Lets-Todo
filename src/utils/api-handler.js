// lets-todo-app/src/utils/api-handler.js

/**
 * Centralized API utilities for the Let's Todo App
 * Handles API base URL detection and HTTP request management
 */

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
  // Remove double slashes from URL
  url = url.replace(/([^:]\/)\/+/g, "$1");

  const options = {
    method: method,
    cache: "no-cache",
    credentials: "include", // Include cookies for authentication
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Add body for POST/PUT/PATCH requests
  if (data !== null) {
    options.body = JSON.stringify(data);
  }

  return fetch(url, options)
    .then((response) => {
      if (!response.ok) {
        // Try to extract error message from response
        return response.json().then((err) => Promise.reject(err));
      }
      return response.json();
    })
    .catch((error) => {
      console.error("API Error:", error);
      throw error;
    });
};

/**
 * Simple fetch wrapper for non-JSON responses
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Raw fetch response
 */
export const simpleFetch = (url, options = {}) => {
  // Default options for cookie support
  const defaultOptions = {
    credentials: "include",
    ...options,
  };

  return fetch(url, defaultOptions);
};

/**
 * Helper function to build query parameters
 * @param {Object} params - Parameters object
 * @returns {string} Query string
 */
export const buildQueryString = (params) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  return queryParams.toString();
};
