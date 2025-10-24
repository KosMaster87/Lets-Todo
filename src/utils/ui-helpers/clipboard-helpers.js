/**
 * @fileoverview Clipboard and Copy Utilities
 * @module clipboard-helpers
 */

import { showMessage } from "./message-helpers.js";

/**
 * Creates a temporary textarea for fallback copy operations
 * @param {string} text - Text to copy
 * @returns {HTMLTextAreaElement} Configured textarea element
 */
export const createCopyTextArea = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.cssText = "position: fixed; left: -999999px; top: -999999px;";
  return textArea;
};

/**
 * Adds textarea to DOM for copying
 * @param {HTMLTextAreaElement} textArea - Textarea element
 * @returns {void}
 */
const addTextAreaToDOM = (textArea) => {
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
};

/**
 * Removes textarea from DOM
 * @param {HTMLTextAreaElement} textArea - Textarea element
 * @returns {void}
 */
const removeTextAreaFromDOM = (textArea) => {
  document.body.removeChild(textArea);
};

/**
 * Restores focus to previously active element
 * @param {Element} activeElement - Previously active element
 * @returns {void}
 */
const restoreFocus = (activeElement) => {
  if (activeElement && activeElement.focus) {
    activeElement.focus();
  }
};

/**
 * Executes legacy copy command
 * @returns {boolean} True if copy succeeded
 */
const executeCopyCommand = () => {
  try {
    document.execCommand("copy");
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Fallback copy function for older browsers
 * @param {string} text - Text to copy
 * @returns {void}
 */
export const fallbackCopy = (text) => {
  const activeElement = document.activeElement;
  const textArea = createCopyTextArea(text);

  addTextAreaToDOM(textArea);

  const copySuccess = executeCopyCommand();
  const message = copySuccess ? "Todo copied to clipboard!" : "Copy failed.";

  removeTextAreaFromDOM(textArea);
  restoreFocus(activeElement);
  showMessage(message);
};

/**
 * Fallback share function
 * @param {string} text - Text to share
 * @returns {void}
 */
export const fallbackShare = (text) => {
  fallbackCopy(text);
  showMessage("Todo copied - ready to share!");
};
