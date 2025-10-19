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

/**
 * Handles opening a todo for editing
 * @param {string|number} todoId - Todo ID
 * @param {Function} onError - Error callback
 */
export const handleOpenTodo = (todoId, onError) => {
  if (!isValidTodoId(todoId)) {
    onError?.("Invalid todo ID");
    return;
  }

  const todo = findTodoById(todoId);
  if (!todo) {
    onError?.(`Todo with ID ${todoId} not found`);
    return;
  }

  logTodoAction("Opening", todoId);
  setCurrentTodo(todo);
  navigateToView(VIEWS.TODO_VIEW);
};

/**
 * Handles toggling bookmark state of a todo
 * @param {string|number} todoId - Todo ID
 * @param {Function} onSuccess - Success callback with new state
 * @param {Function} onError - Error callback
 */
export const handleBookmarkToggle = (todoId, onSuccess, onError) => {
  if (!isValidTodoId(todoId)) {
    onError?.("Invalid todo ID");
    return;
  }

  const todo = findTodoById(todoId);
  if (!todo) {
    onError?.(`Todo with ID ${todoId} not found`);
    return;
  }

  if (!updateTodo) {
    onError?.("Update function not available");
    return;
  }

  try {
    const newBookmarkState = !todo.bookmarked;
    updateTodo(todo.id, { bookmarked: newBookmarkState });

    logTodoAction("Toggle bookmark", todoId, { newState: newBookmarkState });
    onSuccess?.(newBookmarkState);
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    onError?.("Failed to toggle bookmark");
  }
};

/**
 * Handles toggling completed state of a todo
 * @param {string|number} todoId - Todo ID
 * @param {Function} onSuccess - Success callback with new state
 * @param {Function} onError - Error callback
 */
export const handleToggleDone = (todoId, onSuccess, onError) => {
  if (!isValidTodoId(todoId)) {
    onError?.("Invalid todo ID");
    return;
  }

  const todo = findTodoById(todoId);
  if (!todo) {
    onError?.(`Todo with ID ${todoId} not found`);
    return;
  }

  if (!updateTodo) {
    onError?.("Update function not available");
    return;
  }

  try {
    const newCompletedState = !todo.completed;
    updateTodo(todo.id, {
      completed: newCompletedState,
      lastModified: new Date().toISOString(),
    });

    logTodoAction("Toggle done", todoId, { newState: newCompletedState });
    onSuccess?.(newCompletedState);
  } catch (error) {
    console.error("Error toggling done state:", error);
    onError?.("Failed to toggle done state");
  }
};

/**
 * Handles moving a todo to trash
 * @param {string|number} todoId - Todo ID
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export const handleDeleteTodo = async (todoId, onSuccess, onError) => {
  if (!isValidTodoId(todoId)) {
    onError?.("No todoId provided for delete");
    return;
  }

  const confirmMessage =
    "Möchten Sie diese Todo wirklich in den Papierkorb verschieben?";
  if (!confirm(confirmMessage)) {
    return;
  }

  try {
    logTodoAction("Delete", todoId);
    await trashTodo(todoId);
    onSuccess?.("Todo moved to trash successfully");
  } catch (error) {
    console.error("Error moving todo to trash:", error);
    onError?.("Error moving todo to trash");
  }
};
