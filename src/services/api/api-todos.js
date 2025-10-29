/**
 * @fileoverview Todo API services
 * @description Functions to interact with the backend Todo API
 * @module api-todos
 */

import { getApiBase, apiHandler } from "./api-handler.js";
import { DEBUG_MODE } from "./../../utils/constants.js";

/**
 * Logs API operation status messages
 * @param {string} type - Message type (sync, success, error, etc.)
 * @param {string} operation - Operation name
 * @param {any} data - Optional data to log
 */
const logApiStatus = (type, operation, data = null) => {
  if (!DEBUG_MODE) return;

  const messages = {
    sync: `🔄 Syncing ${operation}...`,
    success: `✅ ${operation} successful`,
    error: `❌ Failed to ${operation}`,
  };

  if (type === "error" && data) {
    console.error(messages[type], data);
  } else if (type === "success" && data) {
    console.log(messages[type], data);
  } else {
    console.log(messages[type]);
  }
};

/**
 * Syncs all todos and trash with server
 * Used when user logs in to sync their data
 * @param {Array} localTodos - Local todos to sync (ignored for now)
 * @param {Array} localTrash - Local trash to sync (ignored for now)
 * @returns {Promise<Object>} Object with todos and trashedTodos arrays
 */
export const syncTodosWithServer = async (localTodos = [], localTrash = []) => {
  logApiStatus("sync", "todos with server");

  try {
    const { serverTodos, serverTrash } = await fetchServerData();
    return createSyncResponse(serverTodos, serverTrash);
  } catch (error) {
    return createFallbackResponse(localTodos, localTrash, error);
  }
};

/**
 * Fetches todos and trash data from server concurrently
 * @returns {Promise<Object>} Object with serverTodos and serverTrash arrays
 */
const fetchServerData = async () => {
  const [serverTodos, serverTrash] = await Promise.all([
    loadTodosFromServer(),
    loadTrashedTodosFromServer(),
  ]);
  return { serverTodos, serverTrash };
};

/**
 * Loads all todos for current user from server
 * @returns {Promise<Array>} Array of todos
 */
export const loadTodosFromServer = async () => {
  try {
    const API_BASE = getApiBase();
    const endpoint = `${API_BASE}/todos`;
    const todos = await apiHandler(endpoint, "GET");
    return todos;
  } catch (error) {
    logApiStatus("error", "load todos from server", error);
    return [];
  }
};

/**
 * Loads trashed todos from server
 * @returns {Promise<Array>} Array of trashed todos
 */
export const loadTrashedTodosFromServer = async () => {
  try {
    const API_BASE = getApiBase();
    const endpoint = `${API_BASE}/todos/trash`;
    const trashedTodos = await apiHandler(endpoint, "GET");
    return trashedTodos;
  } catch (error) {
    logApiStatus("error", "load trashed todos from server", error);
    return [];
  }
};

/**
 * Creates successful sync response object
 * @param {Array} serverTodos - Todos from server
 * @param {Array} serverTrash - Trashed todos from server
 * @returns {Object} Sync response object
 */
const createSyncResponse = (serverTodos, serverTrash) => {
  const data = `${serverTodos.length} todos, ${serverTrash.length} trashed`;
  logApiStatus("success", "Sync complete:", data);

  return {
    todos: serverTodos,
    trashedTodos: serverTrash,
  };
};

/**
 * Creates fallback response when sync fails
 * @param {Array} localTodos - Local todos to fall back to
 * @param {Array} localTrash - Local trash to fall back to
 * @param {Error} error - Sync error
 * @returns {Object} Fallback response object
 */
const createFallbackResponse = (localTodos, localTrash, error) => {
  logApiStatus("error", "todo sync", error);
  return {
    todos: localTodos,
    trashedTodos: localTrash,
  };
};

/**
 * Saves a todo to server
 * @param {Object} todo - Todo object to save
 * @returns {Promise<Object>} Server response with todo data
 */
export const saveTodoToServer = async (todo) => {
  try {
    const API_BASE = getApiBase();
    const endpoint = `${API_BASE}/todos`;
    const serverTodo = transformTodoForServer(todo);
    const result = await apiHandler(endpoint, "POST", serverTodo);
    logApiStatus("success", "Todo saved to server:", result);
    return result;
  } catch (error) {
    logApiStatus("error", "save todo to server", error);
    throw error;
  }
};

/**
 * Transforms todo object from frontend format to backend format
 * @param {Object} todo - Todo object in frontend format
 * @returns {Object} Todo object in backend format
 */
const transformTodoForServer = (todo) => ({
  title: todo.title,
  description: todo.content, // Frontend uses 'content', backend uses 'description'
  completed: todo.completed ? 1 : 0,
});

/**
 * Updates a todo on server
 * @param {string} todoId - Todo ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Server response
 */
export const updateTodoOnServer = async (todoId, updates) => {
  try {
    const API_BASE = getApiBase();
    const endpoint = `${API_BASE}/todos/${todoId}`;
    const serverUpdates = transformUpdatesForServer(updates);
    const result = await apiHandler(endpoint, "PATCH", serverUpdates);
    logApiStatus("success", "Todo updated on server:", result);
    return result;
  } catch (error) {
    logApiStatus("error", "update todo on server", error);
    throw error;
  }
};

/**
 * Transforms updates from frontend format to backend format
 * @param {Object} updates - Updates in frontend format
 * @returns {Object} Updates in backend format
 */
const transformUpdatesForServer = (updates) => {
  const serverUpdates = {};
  if (updates.title !== undefined) serverUpdates.title = updates.title;
  if (updates.content !== undefined)
    serverUpdates.description = updates.content;
  if (updates.completed !== undefined)
    serverUpdates.completed = updates.completed ? 1 : 0;
  return serverUpdates;
};

/**
 * Moves a todo to trash on server
 * @param {string} todoId - Todo ID to trash
 * @returns {Promise<Object>} Server response
 */
export const trashTodoOnServer = async (todoId) => {
  try {
    const API_BASE = getApiBase();
    const endpoint = `${API_BASE}/todos/${todoId}/trash`;
    const result = await apiHandler(endpoint, "POST");
    logApiStatus("success", "Todo trashed on server:", result);
    return result;
  } catch (error) {
    logApiStatus("error", "trash todo on server", error);
    throw error;
  }
};

/**
 * Restores a todo from trash on server
 * @param {string} todoId - Todo ID to restore
 * @returns {Promise<Object>} Server response
 */
export const restoreTodoOnServer = async (todoId) => {
  try {
    const API_BASE = getApiBase();
    const endpoint = `${API_BASE}/todos/${todoId}/restore`;
    const result = await apiHandler(endpoint, "POST");
    logApiStatus("success", "Todo restored on server:", result);
    return result;
  } catch (error) {
    logApiStatus("error", "restore todo on server", error);
    throw error;
  }
};

/**
 * Deletes a todo from server
 * @param {string} todoId - Todo ID to delete
 * @returns {Promise<Object>} Server response
 */
export const deleteTodoFromServer = async (todoId) => {
  try {
    const API_BASE = getApiBase();
    const endpoint = `${API_BASE}/todos/${todoId}`;
    const result = await apiHandler(endpoint, "DELETE");
    logApiStatus("success", "Todo deleted from server:", result);
    return result;
  } catch (error) {
    logApiStatus("error", "delete todo from server", error);
    throw error;
  }
};
