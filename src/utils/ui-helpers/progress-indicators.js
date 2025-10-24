/**
 * @fileoverview UI Progress Indicators and State Management Utilities
 * @module progress-indicators
 */

import { showInfoNotification } from "./../notifications.js";

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

/**
 * Creates loading spinner HTML
 * @param {string} message - Loading message
 * @returns {string} HTML for loading spinner
 */
export const createLoadingSpinner = (message = "Loading...") => {
  return `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <div class="loading-text">${message}</div>
    </div>
  `;
};

/**
 * Shows progress indicator in specified container
 * @param {string} containerId - Container element ID
 * @param {number} progress - Progress percentage
 * @param {string} status - Status message
 * @returns {void}
 */
export const showProgressIndicator = (containerId, progress, status) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Remove existing progress indicator
  removeProgressIndicator(containerId);

  // Create and add new progress indicator
  const progressHtml = createProgressIndicator(progress, status);
  const progressDiv = document.createElement("div");
  progressDiv.id = "personalDataProgress";
  progressDiv.innerHTML = progressHtml;

  container.appendChild(progressDiv);
};

/**
 * Updates existing progress indicator
 * @param {number} progress - Progress percentage
 * @param {string} status - Status message
 * @returns {void}
 */
export const updateProgressIndicator = (progress, status) => {
  const progressDiv = document.getElementById("personalDataProgress");
  if (!progressDiv) return;

  const progressFill = progressDiv.querySelector(".progress-fill");
  const progressText = progressDiv.querySelector(".progress-text");

  if (progressFill) progressFill.style.width = `${progress}%`;
  if (progressText) progressText.textContent = status;
};
