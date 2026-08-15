/**
 * @fileoverview Trash Operations Service
 * @description Handles operations related to trash management such as emptying trash,
 * restoring todos, and permanently deleting todos.
 * @module trash-operations
 */

import { emptyTrash, restoreTodo, deleteTodo } from "./../../state/main-state.js";

// ###############################################################
// User Confirmation Utilities
// ###############################################################

/**
 * Shows confirmation dialog for emptying trash
 * @returns {boolean} True if user confirms
 */
const confirmEmptyTrash = () => {
  const message =
    "Do you really want to permanently delete all deleted todos? " +
    "This action cannot be undone.";
  return confirm(message);
};

/**
 * Shows confirmation dialog for restoring todo
 * @returns {boolean} True if user confirms
 */
const confirmRestoreTodo = () => {
  return confirm("Do you want to restore this todo?");
};

/**
 * Shows confirmation dialog for permanent deletion
 * @returns {boolean} True if user confirms
 */
const confirmDeleteForever = () => {
  const message = "Do you want to permanently delete this todo? " + "This action cannot be undone.";
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
    onSuccess?.("Trash was emptied!");
  } catch (error) {
    console.error("Error emptying trash:", error);
    onError?.("Error emptying trash.");
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
    onSuccess?.("Todo was restored!");
  } catch (error) {
    console.error("Error restoring todo:", error);
    onError?.("Error restoring todo.");
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
    onSuccess?.("Todo was permanently deleted!");
  } catch (error) {
    console.error("Error deleting todo forever:", error);
    onError?.("Error permanently deleting todo.");
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
