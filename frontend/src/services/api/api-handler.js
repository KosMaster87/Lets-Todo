/**
 * @fileoverview API handler utilities
 * @description Provides standardized API request handling with error management
 * @module api-handler
 */

export const getApiBase = () => {
  const hostname = window.location.hostname;

  const apiBaseByHostname = {
    "lets-todo-staging.dev2ksoftware.com": "https://lets-todo-api-staging.dev2ksoftware.com/api",
    "lets-todo.dev2ksoftware.com": "https://lets-todo-api.dev2ksoftware.com/api",
  };

  return apiBaseByHostname[hostname] || "http://127.0.0.1:3000/api";
};

export const apiHandler = (url, method, data = null) => {
  const cleanedUrl = cleanUrl(url);
  const options = createFetchOptions(method, data);

  return fetch(cleanedUrl, options).then(handleResponse).catch(handleError);
};

const cleanUrl = (url) => url.replace(/([^:]\/)\/+/g, "$1");

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

const handleResponse = (response) => {
  if (!response.ok) {
    return response.json().then((err) => Promise.reject(err));
  }
  return response.json();
};

const handleError = (error) => {
  if (!isUserFacingError(error)) {
  }
  throw error;
};

const isUserFacingError = (error) => {
  const userFacingCodes = ["INVALID_CREDENTIALS", "EMAIL_ALREADY_EXISTS", "MISSING_CREDENTIALS"];

  return (
    (error.code && userFacingCodes.includes(error.code)) ||
    (error.error && error.error.includes("Server error processing reset request"))
  );
};
