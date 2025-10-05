// lets-todo-app/src/services/crud/todos-list-utils.js

import { getTodos } from "./../../state.js";

/**
 * Finds a todo by ID, handling both string and number IDs
 * @param {string|number} todoId - Todo ID to search for
 * @returns {Object|null} Found todo or null
 */
export const findTodoById = (todoId) => {
  if (!todoId) {
    console.warn("No todoId provided to findTodoById");
    return null;
  }

  const todos = getTodos();
  const todo = todos.find(
    (t) => t.id == todoId || t.id === parseInt(todoId, 10)
  );

  if (!todo) {
    console.error(
      "Todo not found:",
      todoId,
      "Available todos:",
      todos.map((t) => ({ id: t.id, type: typeof t.id }))
    );
  }

  return todo;
};

/**
 * Validates that a todo ID is provided and valid
 * @param {string|number} todoId - Todo ID to validate
 * @returns {boolean} True if valid
 */
export const isValidTodoId = (todoId) => {
  return todoId !== null && todoId !== undefined && todoId !== "";
};

/**
 * Gets todo content for sharing/copying
 * @param {Object} todo - Todo object
 * @returns {string} Formatted todo content
 */
export const formatTodoContent = (todo) => {
  if (!todo) return "";

  const title = todo.title || "Untitled";
  const content = todo.content || "";

  return `${title}\n\n${content}`;
};

/**
 * TODO: Remove all logTodoAction() later // calls --- IGNORE ---
 * Just for debugging purposes
 * Logs todo action with consistent format
 * @param {string} action - Action being performed
 * @param {string|number} todoId - Todo ID
 * @param {Object} extra - Additional data to log
 */
export const logTodoAction = (action, todoId, extra = {}) => {
  // console.log(`${action} todo:`, todoId, extra);
};
