/**
 * @fileoverview Content Validation and Clearing Utilities
 * @description Utility functions to check and clear todo content with user confirmation
 * @module content-helpers
 */

import { showMessage } from "./message-helpers.js";

/**
 * Checks if todo has any meaningful content
 * @param {string} title - Todo title
 * @param {string} content - Todo content
 * @param {HTMLElement} titleElement - Title DOM element
 * @param {HTMLElement} contentElement - Content DOM element
 * @returns {boolean} True if todo has content
 */
export const hasAnyTodoContent = (
  title,
  content,
  titleElement,
  contentElement
) => {
  return (
    title ||
    content ||
    (titleElement && titleElement.textContent.trim() !== "New Todo") ||
    (contentElement && contentElement.textContent.trim() !== "")
  );
};

/**
 * Gets confirmation message based on content state
 * @param {boolean} hasContent - Whether todo has content
 * @returns {string} Confirmation message
 */
const getConfirmationMessage = (hasContent) => {
  return hasContent
    ? "Do you really want to delete the content of this todo?"
    : "Do you want to reset the todo?";
};

/**
 * Gets success message based on content state
 * @param {boolean} hasContent - Whether todo has content
 * @returns {string} Success message
 */
const getSuccessMessage = (hasContent) => {
  return hasContent ? "Content deleted!" : "Todo reset!";
};

/**
 * Executes content clearing with callback
 * @param {Function} clearContentCallback - Function to clear content
 * @param {Function} onDeleteCallback - Optional callback after deletion
 * @param {boolean} hasContent - Whether todo has content
 * @returns {void}
 */
const executeContentClear = (
  clearContentCallback,
  onDeleteCallback,
  hasContent
) => {
  clearContentCallback();
  showMessage(getSuccessMessage(hasContent));

  if (onDeleteCallback) {
    onDeleteCallback();
  }
};

/**
 * Handles content clearing with user confirmation
 * @param {Function} clearContentCallback - Function to clear content
 * @param {Function} onDeleteCallback - Optional callback after deletion
 * @param {boolean} hasContent - Whether todo has content
 * @returns {void}
 */
export const handleContentClear = (
  clearContentCallback,
  onDeleteCallback,
  hasContent
) => {
  const confirmMessage = getConfirmationMessage(hasContent);

  if (confirm(confirmMessage)) {
    executeContentClear(clearContentCallback, onDeleteCallback, hasContent);
  }
};
