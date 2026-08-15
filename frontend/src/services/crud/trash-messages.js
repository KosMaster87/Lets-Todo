/**
 * @fileoverview Trash Messages Service
 * @description Provides user messages for trash operations
 * @module trash-messages
 */

import { showMessage } from "./../../utils/ui-helpers/message-helpers.js";

/**
 * Shows success message for trash operations
 * @param {string} message - Message to display
 */
export const showTrashSuccess = (message) => {
  showMessage(message, "success");
};

/**
 * Shows error message for trash operations
 * @param {string} message - Error message to display
 */
export const showTrashError = (message) => {
  showMessage(message, "error");
};

/**
 * Shows confirmation message for trash operations
 * @param {string} message - Confirmation message to display
 */
export const showTrashInfo = (message) => {
  showMessage(message, "info");
};

/**
 * Predefined success messages for common trash operations
 */
export const TRASH_MESSAGES = {
  EMPTY_SUCCESS: "Trash was emptied!",
  RESTORE_SUCCESS: "Todo was restored!",
  DELETE_SUCCESS: "Todo was permanently deleted!",
  EMPTY_ERROR: "Error emptying trash.",
  RESTORE_ERROR: "Error restoring todo.",
  DELETE_ERROR: "Error permanently deleting todo.",
  INVALID_ID: "Todo-ID missing.",
};
