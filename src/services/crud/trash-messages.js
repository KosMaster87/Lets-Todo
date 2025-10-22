/**
 * @fileoverview Trash Messages Service
 * @module trash-messages
 */

import { showMessage } from "./../navigation/navigation-action-buttons.js";

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
  EMPTY_SUCCESS: "Papierkorb wurde geleert!",
  RESTORE_SUCCESS: "Todo wurde wiederhergestellt!",
  DELETE_SUCCESS: "Todo wurde endgültig gelöscht!",
  EMPTY_ERROR: "Fehler beim Leeren des Papierkorbs.",
  RESTORE_ERROR: "Fehler beim Wiederherstellen des Todos.",
  DELETE_ERROR: "Fehler beim endgültigen Löschen des Todos.",
  INVALID_ID: "Todo-ID fehlt.",
};
