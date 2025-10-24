/**
 * @fileoverview Todos List Utilities Service
 * @module todos-list-utils
 */

import { getTodos } from "./../../state/main-state.js";

// ###############################################################
// Todo Lookup and Validation Utilities
// ###############################################################

/**
 * Validates todo ID parameter
 * @param {string|number} todoId - Todo ID to validate
 * @returns {boolean} True if valid
 */
const validateTodoIdParam = (todoId) => {
  if (!todoId) {
    console.warn("No todoId provided to findTodoById");
    return false;
  }
  return true;
};

/**
 * Searches for todo by ID with flexible matching
 * @param {Array} todos - Array of todos
 * @param {string|number} todoId - Todo ID to find
 * @returns {Object|null} Found todo or null
 */
const searchTodoById = (todos, todoId) => {
  return todos.find((t) => t.id == todoId || t.id === parseInt(todoId, 10));
};

/**
 * Logs error when todo is not found
 * @param {string|number} todoId - Todo ID that wasn't found
 * @param {Array} todos - Array of todos for debugging
 */
const logTodoNotFoundError = (todoId, todos) => {
  console.error(
    "Todo not found:",
    todoId,
    "Available todos:",
    todos.map((t) => ({ id: t.id, type: typeof t.id }))
  );
};

/**
 * Finds a todo by ID, handling both string and number IDs
 * @param {string|number} todoId - Todo ID to search for
 * @returns {Object|null} Found todo or null
 */
export const findTodoById = (todoId) => {
  if (!validateTodoIdParam(todoId)) return null;

  const todos = getTodos();
  const todo = searchTodoById(todos, todoId);

  if (!todo) {
    logTodoNotFoundError(todoId, todos);
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

// ###############################################################
// Todo Content Formatting Utilities
// ###############################################################

/**
 * Gets todo title with fallback
 * @param {Object} todo - Todo object
 * @returns {string} Todo title or default
 */
const getTodoTitle = (todo) => todo.title || "Untitled";

/**
 * Gets todo content with fallback
 * @param {Object} todo - Todo object
 * @returns {string} Todo content or empty string
 */
const getTodoContent = (todo) => todo.content || "";

/**
 * Gets todo content for sharing/copying
 * @param {Object} todo - Todo object
 * @returns {string} Formatted todo content
 */
export const formatTodoContent = (todo) => {
  if (!todo) return "";

  const title = getTodoTitle(todo);
  const content = getTodoContent(todo);

  return `${title}\n\n${content}`;
};

// ###############################################################
// Debug and Logging Utilities
// ###############################################################

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
