/**
 * @fileoverview API handler utilities
 * @description Provides standardized API request handling with error management
 * @module api-handler
 */

export const getApiBase = () => {
  const hostname = window.location.hostname;

  if (hostname === "127.0.0.1" || hostname === "localhost") {
    return "http://127.0.0.1:3000/api";
  }

  if (hostname.includes("lets-todo-app-feat.dev2k.org")) {
    return "https://lets-todo-api-feat.dev2k.org/api";
  }

  if (hostname.includes("lets-todo-app-stage.dev2k.org")) {
    return "https://lets-todo-api-stage.dev2k.org/api";
  }

  if (hostname.includes("lets-todo.dev2k.org")) {
    return "https://lets-todo-api.dev2k.org/api";
  }

  return "http://127.0.0.1:3000/api";
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
