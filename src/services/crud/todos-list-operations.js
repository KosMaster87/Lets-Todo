/**
 * @fileoverview Todos List Operations Service
 * @module todos-list-operations
 */

import {
  setCurrentTodo,
  updateTodo,
  trashTodo,
} from "./../../state/main-state.js";
import { VIEWS } from "./../../utils/constants.js";
import { navigateToView } from "./../navigation/navigation.js";
import {
  findTodoById,
  isValidTodoId,
  logTodoAction,
} from "./todos-list-utils.js";

// ###############################################################
// Todo Navigation Operations
// ###############################################################

/**
 * Validates todo ID and retrieves todo
 * @param {string|number} todoId - Todo ID
 * @param {Function} onError - Error callback
 * @returns {Object|null} Todo object or null if invalid
 */
const validateAndGetTodo = (todoId, onError) => {
  if (!isValidTodoId(todoId)) {
    onError?.("Invalid todo ID");
    return null;
  }

  const todo = findTodoById(todoId);
  if (!todo) {
    onError?.(`Todo with ID ${todoId} not found`);
    return null;
  }

  return todo;
};

/**
 * Handles opening a todo for editing
 * @param {string|number} todoId - Todo ID
 * @param {Function} onError - Error callback
 * @returns {void}
 */
export const handleOpenTodo = (todoId, onError) => {
  const todo = validateAndGetTodo(todoId, onError);
  if (!todo) return;

  logTodoAction("Opening", todoId);
  setCurrentTodo(todo);
  navigateToView(VIEWS.TODO_VIEW);
};

// ###############################################################
// Todo State Toggle Operations
// ###############################################################

/**
 * Validates update function availability
 * @param {Function} onError - Error callback
 * @returns {boolean} True if update function is available
 */
const validateUpdateFunction = (onError) => {
  if (!updateTodo) {
    onError?.("Update function not available");
    return false;
  }
  return true;
};

/**
 * Executes bookmark toggle operation
 * @param {Object} todo - Todo object
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {void}
 */
const executeBookmarkToggle = (todo, onSuccess, onError) => {
  try {
    const newBookmarkState = !todo.bookmarked;
    updateTodo(todo.id, { bookmarked: newBookmarkState });

    logTodoAction("Toggle bookmark", todo.id, { newState: newBookmarkState });
    onSuccess?.(newBookmarkState);
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    onError?.("Failed to toggle bookmark");
  }
};

/**
 * Handles toggling bookmark state of a todo
 * @param {string|number} todoId - Todo ID
 * @param {Function} onSuccess - Success callback with new state
 * @param {Function} onError - Error callback
 * @returns {void}
 */
export const handleBookmarkToggle = (todoId, onSuccess, onError) => {
  const todo = validateAndGetTodo(todoId, onError);
  if (!todo) return;

  if (!validateUpdateFunction(onError)) return;

  executeBookmarkToggle(todo, onSuccess, onError);
};

/**
 * Creates update object for done state toggle
 * @param {boolean} newCompletedState - New completed state
 * @returns {Object} Update object
 */
const createDoneUpdateObject = (newCompletedState) => ({
  completed: newCompletedState,
  lastModified: new Date().toISOString(),
});

/**
 * Executes done state toggle operation
 * @param {Object} todo - Todo object
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {void}
 */
const executeDoneToggle = (todo, onSuccess, onError) => {
  try {
    const newCompletedState = !todo.completed;
    const updateObject = createDoneUpdateObject(newCompletedState);
    updateTodo(todo.id, updateObject);

    logTodoAction("Toggle done", todo.id, { newState: newCompletedState });
    onSuccess?.(newCompletedState);
  } catch (error) {
    console.error("Error toggling done state:", error);
    onError?.("Failed to toggle done state");
  }
};

/**
 * Handles toggling completed state of a todo
 * @param {string|number} todoId - Todo ID
 * @param {Function} onSuccess - Success callback with new state
 * @param {Function} onError - Error callback
 * @returns {void}
 */
export const handleToggleDone = (todoId, onSuccess, onError) => {
  const todo = validateAndGetTodo(todoId, onError);
  if (!todo) return;

  if (!validateUpdateFunction(onError)) return;

  executeDoneToggle(todo, onSuccess, onError);
};

// ###############################################################
// Todo Deletion Operations
// ###############################################################

/**
 * Shows confirmation dialog for delete operation
 * @returns {boolean} True if user confirmed deletion
 */
const confirmDeleteOperation = () => {
  const confirmMessage =
    "Möchten Sie diese Todo wirklich in den Papierkorb verschieben?";
  return confirm(confirmMessage);
};

/**
 * Executes todo deletion operation
 * @param {string|number} todoId - Todo ID
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {Promise<void>}
 */
const executeDeleteOperation = async (todoId, onSuccess, onError) => {
  try {
    logTodoAction("Delete", todoId);
    await trashTodo(todoId);
    onSuccess?.("Todo moved to trash successfully");
  } catch (error) {
    console.error("Error moving todo to trash:", error);
    onError?.("Error moving todo to trash");
  }
};

/**
 * Handles moving a todo to trash
 * @param {string|number} todoId - Todo ID
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {Promise<void>}
 */
export const handleDeleteTodo = async (todoId, onSuccess, onError) => {
  if (!isValidTodoId(todoId)) {
    onError?.("No todoId provided for delete");
    return;
  }

  if (!confirmDeleteOperation()) return;

  await executeDeleteOperation(todoId, onSuccess, onError);
};
