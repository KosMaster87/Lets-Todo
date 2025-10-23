/**
 * @fileoverview Personal Data UI State Management - Progress Indicators
 * @module personal-data-ui-state
 */

import { showInfoNotification } from "./../../utils/notifications.js";

/**
 * Creates a progress indicator for upload operations
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} status - Status message
 * @returns {string} HTML for progress indicator
 */
export const createProgressIndicator = (progress, status) => {
  return `
    <div class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <div class="progress-text">${status}</div>
    </div>
  `;
};

/**
 * Removes progress indicator from container
 * @param {string} containerId - Container element ID
 * @returns {void}
 */
export const removeProgressIndicator = (containerId) => {
  const container = document.getElementById(containerId);
  const progressDiv = document.getElementById("personalDataProgress");

  if (container && progressDiv) {
    container.removeChild(progressDiv);
  }
};

/**
 * Shows file selection dialog info
 * @param {Array} supportedFormats - Array of supported file formats
 * @param {Function} onMessage - Message callback
 * @returns {void}
 */
export const showFileSelectionInfo = (supportedFormats, onMessage) => {
  const formatList = supportedFormats.join(", ").toUpperCase();
  const message = `Please select a file. Supported formats: ${formatList}`;

  showInfoNotification(message, onMessage);
};
