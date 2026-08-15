/**
 * @fileoverview Todo Helper Functions
 * @description Utility functions for managing todos in the application state
 * @module todo-helpers
 */

import { debugLog } from "./../utils/logger.js";

/**
 * Generates a unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Checks if server sync is needed for current session
 * @param {string} sessionType - Current session type
 * @returns {boolean} True if sync needed
 */
export const shouldSyncToServer = (sessionType) => sessionType === "user";

/**
 * Checks if trash should be synced to server
 * @param {string} sessionType - Current session type
 * @param {number} trashCount - Number of trashed todos
 * @returns {boolean} True if server sync needed
 */
export const shouldSyncTrashToServer = (sessionType, trashCount) =>
  sessionType === "user" && trashCount > 0;

/**
 * Creates todo with ID and timestamps
 * @param {Object} todo - Original todo object
 * @returns {Object} Todo with ID and timestamps
 */
export const createTodoWithId = (todo) => ({
  ...todo,
  id: todo.id || generateId(),
  created: todo.created || new Date().toISOString(),
  lastModified: todo.lastModified || new Date().toISOString(),
});

/**
 * Finds todo using flexible ID matching
 * @param {Object} appState - Application state object
 * @param {string} todoId - Todo ID to find
 * @returns {Object|undefined} Found todo or undefined
 */
export const findTodoById = (appState, todoId) => {
  return appState.todos.find((t) => t.id == todoId);
};

/**
 * Finds trashed todo using flexible ID matching
 * @param {Object} appState - Application state object
 * @param {string} todoId - Todo ID to find
 * @returns {Object|undefined} Found trashed todo or undefined
 */
export const findTrashedTodoById = (appState, todoId) => {
  debugLog(`Finding trashed todo with ID: ${todoId}, type: ${typeof todoId}`);
  const todo = appState.trashedTodos.find((t) => t.id == todoId);
  debugLog(`Found trashed todo:`, todo);
  return todo;
};

/**
 * Finds updated todo by ID
 * @param {Object} appState - Application state object
 * @param {string} todoId - Todo ID to find
 * @returns {Object|undefined} Found todo or undefined
 */
export const findUpdatedTodo = (appState, todoId) => appState.todos.find((t) => t.id === todoId);

/**
 * Finds todo to delete and validates it exists
 * @param {Object} appState - Application state object
 * @param {string} todoId - Todo ID to find
 * @returns {Object|null} Found todo or null if not found
 */
export const findTodoToDelete = (appState, todoId) => {
  debugLog(`Finding todo to delete with ID: ${todoId}, type: ${typeof todoId}`);
  const todoToDelete = appState.trashedTodos.find((t) => t.id == todoId);

  if (!todoToDelete) {
    console.warn(`Todo with ID ${todoId} not found in trash`);
    return null;
  }

  return todoToDelete;
};

/**
 * Validates and determines server ID for todo operations
 * @param {Object} todo - Todo object
 * @param {string} todoId - Original todo ID
 * @returns {Object} Object with isValid flag and serverId
 */
export const validateServerIdForTodo = (todo, todoId) => {
  const serverId = todo.serverId || (typeof todoId === "string" ? parseInt(todoId, 10) : todoId);
  return {
    isValid: !isNaN(serverId),
    serverId: serverId,
  };
};

/**
 * Handles invalid server ID scenario for trash operation
 * @param {string} todoId - Original todo ID
 */
export const handleInvalidServerId = (todoId) => {
  console.warn(`Cannot trash todo on server: no valid server ID for client ID: ${todoId}`);
  debugLog("ℹTodo has been trashed locally, but server sync was skipped");
};

/**
 * Handles invalid server ID for restore operation
 * @param {string} todoId - Original todo ID
 */
export const handleInvalidRestoreServerId = (todoId) => {
  console.warn(`Cannot restore todo on server: no valid server ID for client ID: ${todoId}`);
  debugLog("ℹTodo has been restored locally, but server sync was skipped");
};

/**
 * Handles invalid server ID for delete operation
 * @param {string} todoId - Original todo ID
 * @param {number} serverIdToUse - Invalid server ID
 */
export const handleInvalidDeleteServerId = (todoId, serverIdToUse) => {
  console.warn(
    `Cannot delete todo on server: invalid server ID (${serverIdToUse}) for client ID: ${todoId}`
  );
  debugLog("ℹTodo has been deleted locally, but server sync was skipped");
};
