/**
 * @fileoverview Generic notification system for application-wide user feedback
 * @description Provides functions to show success, error, info, and warning notifications
 * @module notifications
 */

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
} from "./toast-notifications.js";

/**
 * Message types for consistent UI feedback across the application
 */
export const MESSAGE_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
  WARNING: "warning",
};

/**
 * Shows success notification message
 * @param {string} message - Success message to display
 * @param {Function} customHandler - Optional custom message handler
 * @returns {void}
 */
export const showSuccessNotification = (message, customHandler) => {
  if (customHandler && typeof customHandler === "function") {
    customHandler(message, MESSAGE_TYPES.SUCCESS);
    return;
  }

  showSuccessToast(message);
};

/**
 * Shows error notification message
 * @param {string} message - Error message to display
 * @param {Function} customHandler - Optional custom message handler
 * @returns {void}
 */
export const showErrorNotification = (message, customHandler) => {
  if (customHandler && typeof customHandler === "function") {
    customHandler(message, MESSAGE_TYPES.ERROR);
    return;
  }

  showErrorToast(message);
};

/**
 * Shows info notification message
 * @param {string} message - Info message to display
 * @param {Function} customHandler - Optional custom message handler
 * @returns {void}
 */
export const showInfoNotification = (message, customHandler) => {
  if (customHandler && typeof customHandler === "function") {
    customHandler(message, MESSAGE_TYPES.INFO);
    return;
  }

  showInfoToast(message);
};

/**
 * Shows warning notification message
 * @param {string} message - Warning message to display
 * @param {Function} customHandler - Optional custom message handler
 * @returns {void}
 */
export const showWarningNotification = (message, customHandler) => {
  if (customHandler && typeof customHandler === "function") {
    customHandler(message, MESSAGE_TYPES.WARNING);
    return;
  }

  showWarningToast(message);
};
