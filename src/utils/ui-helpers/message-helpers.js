/**
 * @fileoverview Message Display Utilities
 * @description Utility functions for displaying styled messages to users
 * @module message-helpers
 */

import { DEBUG_MODE } from "../constants.js";

/**
 * Logs action button operation status
 * @param {string} type - Message type (success, warning, info)
 * @param {string} message - Message to log
 * @param {any} data - Optional data to log
 * @returns {void}
 */
export const logActionStatus = (type, message, data = null) => {
  if (!DEBUG_MODE) return;

  const logFunctions = {
    success: console.log,
    warning: console.warn,
    info: console.log,
    error: console.error,
  };

  const logFunction = logFunctions[type] || console.log;
  data ? logFunction(message, data) : logFunction(message);
};

/**
 * Gets background color for message type
 * @param {string} type - Message type
 * @returns {string} Background color CSS value
 */
const getMessageBackgroundColor = (type) => {
  return type === "error" ? "rgba(244, 67, 54, 0.9)" : "rgba(76, 175, 80, 0.9)";
};

/**
 * Creates styled message element
 * @param {string} message - Message text
 * @param {string} type - Message type
 * @returns {HTMLDivElement} Styled message element
 */
export const createMessageElement = (message, type) => {
  const messageDiv = document.createElement("div");
  messageDiv.textContent = message;

  const backgroundColor = getMessageBackgroundColor(type);

  messageDiv.style.cssText = `
    position: fixed; top: 20px; right: 20px;
    background: ${backgroundColor}; color: white;
    padding: 1rem; border-radius: 0.5rem; z-index: 1000;
    font-size: 0.9rem; max-width: 300px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `;

  return messageDiv;
};

/**
 * Adds message element to DOM
 * @param {HTMLElement} messageDiv - Message element to add
 * @returns {void}
 */
const addMessageToDOM = (messageDiv) => {
  document.body.appendChild(messageDiv);
};

/**
 * Removes message element from DOM after delay
 * @param {HTMLElement} messageDiv - Message element to remove
 * @param {number} delay - Delay in milliseconds
 * @returns {void}
 */
const removeMessageAfterDelay = (messageDiv, delay = 3000) => {
  setTimeout(() => {
    if (document.body.contains(messageDiv)) {
      document.body.removeChild(messageDiv);
    }
  }, delay);
};

/**
 * Shows a message to the user
 * @param {string} message - Message to display
 * @param {string} type - Message type (success, error, info)
 * @returns {void}
 */
export const showMessage = (message, type = "success") => {
  logActionStatus("info", `Action message (${type}): ${message}`);

  const messageDiv = createMessageElement(message, type);
  addMessageToDOM(messageDiv);
  removeMessageAfterDelay(messageDiv);
};
