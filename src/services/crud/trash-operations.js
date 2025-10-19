/**
 * @fileoverview Trash Operations Service
 * @module trash-operations
 */

import {
  emptyTrash,
  restoreTodo,
  deleteTodo,
} from "./../../state/main-state.js";

/**
 * Handles emptying the entire trash
 * @param {Function} onSuccess - Callback function for successful empty
 * @param {Function} onError - Callback function for errors
 */
export const handleEmptyTrash = async (onSuccess, onError) => {
  const confirmMessage =
    "Möchten Sie wirklich alle gelöschten Todos endgültig löschen? " +
    "Diese Aktion kann nicht rückgängig gemacht werden.";

  if (!confirm(confirmMessage)) {
    return;
  }

  try {
    await emptyTrash();
    onSuccess?.("Papierkorb wurde geleert!");
  } catch (error) {
    console.error("Error emptying trash:", error);
    onError?.("Fehler beim Leeren des Papierkorbs.");
  }
};

/**
 * Handles restoring a single todo from trash
 * @param {string} todoId - ID of the todo to restore
 * @param {Function} onSuccess - Callback function for successful restore
 * @param {Function} onError - Callback function for errors
 */
export const handleRestoreTodo = (todoId, onSuccess, onError) => {
  if (!todoId) {
    onError?.("Todo-ID fehlt.");
    return;
  }

  const confirmMessage = "Möchten Sie dieses Todo wiederherstellen?";

  if (!confirm(confirmMessage)) {
    return;
  }

  try {
    restoreTodo(todoId);
    onSuccess?.("Todo wurde wiederhergestellt!");
  } catch (error) {
    console.error("Error restoring todo:", error);
    onError?.("Fehler beim Wiederherstellen des Todos.");
  }
};

/**
 * Handles permanently deleting a todo
 * @param {string} todoId - ID of the todo to delete forever
 * @param {Function} onSuccess - Callback function for successful deletion
 * @param {Function} onError - Callback function for errors
 */
export const handleDeleteForever = async (todoId, onSuccess, onError) => {
  if (!todoId) {
    onError?.("Todo-ID fehlt.");
    return;
  }

  const confirmMessage =
    "Möchten Sie dieses Todo endgültig löschen? " +
    "Diese Aktion kann nicht rückgängig gemacht werden.";

  if (!confirm(confirmMessage)) {
    return;
  }

  try {
    await deleteTodo(todoId);
    onSuccess?.("Todo wurde endgültig gelöscht!");
  } catch (error) {
    console.error("Error deleting todo forever:", error);
    onError?.("Fehler beim endgültigen Löschen des Todos.");
  }
};
