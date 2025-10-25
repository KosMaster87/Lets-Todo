/**
 * @fileoverview Trash Operations Service
 * @module trash-operations
 */

import {
  emptyTrash,
  restoreTodo,
  deleteTodo,
} from "./../../state/main-state.js";

// ###############################################################
// User Confirmation Utilities
// ###############################################################

/**
 * Shows confirmation dialog for emptying trash
 * @returns {boolean} True if user confirms
 */
const confirmEmptyTrash = () => {
  const message =
    "Möchten Sie wirklich alle gelöschten Todos endgültig löschen? " +
    "Diese Aktion kann nicht rückgängig gemacht werden.";
  return confirm(message);
};

/**
 * Shows confirmation dialog for restoring todo
 * @returns {boolean} True if user confirms
 */
const confirmRestoreTodo = () => {
  return confirm("Möchten Sie dieses Todo wiederherstellen?");
};

/**
 * Shows confirmation dialog for permanent deletion
 * @returns {boolean} True if user confirms
 */
const confirmDeleteForever = () => {
  const message =
    "Möchten Sie dieses Todo endgültig löschen? " +
    "Diese Aktion kann nicht rückgängig gemacht werden.";
  return confirm(message);
};

// ###############################################################
// Trash Operation Execution
// ###############################################################

/**
 * Executes empty trash operation
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {Promise<void>}
 */
const executeEmptyTrash = async (onSuccess, onError) => {
  try {
    await emptyTrash();
    onSuccess?.("Papierkorb wurde geleert!");
  } catch (error) {
    console.error("Error emptying trash:", error);
    onError?.("Fehler beim Leeren des Papierkorbs.");
  }
};

/**
 * Handles emptying the entire trash
 * @param {Function} onSuccess - Callback function for successful empty
 * @param {Function} onError - Callback function for errors
 */
export const handleEmptyTrash = async (onSuccess, onError) => {
  if (!confirmEmptyTrash()) return;
  await executeEmptyTrash(onSuccess, onError);
};

/**
 * Validates todo ID parameter
 * @param {string} todoId - Todo ID to validate
 * @param {Function} onError - Error callback
 * @returns {boolean} True if valid
 */
const validateTodoId = (todoId, onError) => {
  if (!todoId) {
    onError?.("Todo-ID fehlt.");
    return false;
  }
  return true;
};

/**
 * Executes restore todo operation
 * @param {string} todoId - Todo ID to restore
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
const executeRestoreTodo = (todoId, onSuccess, onError) => {
  try {
    restoreTodo(todoId);
    onSuccess?.("Todo wurde wiederhergestellt!");
  } catch (error) {
    console.error("Error restoring todo:", error);
    onError?.("Fehler beim Wiederherstellen des Todos.");
  }
};

/**
 * Handles restoring a single todo from trash
 * @param {string} todoId - ID of the todo to restore
 * @param {Function} onSuccess - Callback function for successful restore
 * @param {Function} onError - Callback function for errors
 */
export const handleRestoreTodo = (todoId, onSuccess, onError) => {
  if (!validateTodoId(todoId, onError)) return;
  if (!confirmRestoreTodo()) return;
  executeRestoreTodo(todoId, onSuccess, onError);
};

/**
 * Executes permanent delete operation
 * @param {string} todoId - Todo ID to delete
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {Promise<void>}
 */
const executeDeleteForever = async (todoId, onSuccess, onError) => {
  try {
    await deleteTodo(todoId);
    onSuccess?.("Todo wurde endgültig gelöscht!");
  } catch (error) {
    console.error("Error deleting todo forever:", error);
    onError?.("Fehler beim endgültigen Löschen des Todos.");
  }
};

/**
 * Handles permanently deleting a todo
 * @param {string} todoId - ID of the todo to delete forever
 * @param {Function} onSuccess - Callback function for successful deletion
 * @param {Function} onError - Callback function for errors
 */
export const handleDeleteForever = async (todoId, onSuccess, onError) => {
  if (!validateTodoId(todoId, onError)) return;
  if (!confirmDeleteForever()) return;
  await executeDeleteForever(todoId, onSuccess, onError);
};
