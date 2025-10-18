// lets-todo-app/src/services/api-todos.js

import { getApiBase, apiHandler } from "./../utils/api-handler.js";

/**
 * Syncs all todos and trash with server
 * Used when user logs in to sync their data
 * @param {Array} localTodos - Local todos to sync (ignored for now)
 * @param {Array} localTrash - Local trash to sync (ignored for now)
 * @returns {Promise<Object>} Object with todos and trashedTodos arrays
 */
export const syncTodosWithServer = async (localTodos = [], localTrash = []) => {
  console.log("🔄 Syncing todos with server...");

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
 * Creates successful sync response object
 * @param {Array} serverTodos - Todos from server
 * @param {Array} serverTrash - Trashed todos from server
 * @returns {Object} Sync response object
 */
const createSyncResponse = (serverTodos, serverTrash) => {
  console.log(
    `✅ Sync complete: ${serverTodos.length} todos, ${serverTrash.length} trashed`
  );

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
  console.error("❌ Todo sync failed:", error);
  return {
    todos: localTodos,
    trashedTodos: localTrash,
  };
};

// #################################################

/**
 * Loads all todos for current user from server
 * @returns {Promise<Array>} Array of todos
 */
export const loadTodosFromServer = async () => {
  try {
    const endpoint = createTodosEndpoint();
    const todos = await apiHandler(endpoint, "GET");
    return handleTodosLoadSuccess(todos);
  } catch (error) {
    return handleTodosLoadError(error);
  }
};

/**
 * Creates todos API endpoint URL
 * @returns {string} Full API endpoint URL for todos
 */
const createTodosEndpoint = () => {
  const API_BASE = getApiBase();
  return `${API_BASE}/todos`;
};

/**
 * Handles successful todos loading response
 * @param {Array} todos - Todos array from server
 * @returns {Array} Todos array
 */
const handleTodosLoadSuccess = (todos) => {
  return todos;
};

/**
 * Handles todos loading error
 * @param {Error} error - Load error
 * @returns {Array} Empty array as fallback
 */
const handleTodosLoadError = (error) => {
  console.error("❌ Failed to load todos from server:", error);
  return [];
};

// #################################################

/**
 * Loads trashed todos from server
 * @returns {Promise<Array>} Array of trashed todos
 */
export const loadTrashedTodosFromServer = async () => {
  try {
    const endpoint = createTrashEndpoint();
    const trashedTodos = await apiHandler(endpoint, "GET");
    return handleTrashLoadSuccess(trashedTodos);
  } catch (error) {
    return handleTrashLoadError(error);
  }
};

/**
 * Creates trash todos API endpoint URL
 * @returns {string} Full API endpoint URL for trashed todos
 */
const createTrashEndpoint = () => {
  const API_BASE = getApiBase();
  return `${API_BASE}/todos/trash`;
};

/**
 * Handles successful trashed todos loading response
 * @param {Array} trashedTodos - Trashed todos array from server
 * @returns {Array} Trashed todos array
 */
const handleTrashLoadSuccess = (trashedTodos) => {
  return trashedTodos;
};

/**
 * Handles trashed todos loading error
 * @param {Error} error - Load error
 * @returns {Array} Empty array as fallback
 */
const handleTrashLoadError = (error) => {
  console.error("❌ Failed to load trashed todos from server:", error);
  return [];
};

// #################################################

/**
 * Saves a todo to server
 * @param {Object} todo - Todo object to save
 * @returns {Promise<Object>} Server response with todo data
 */
export const saveTodoToServer = async (todo) => {
  try {
    const endpoint = createTodosEndpoint();
    const serverTodo = transformTodoForServer(todo);
    const result = await apiHandler(endpoint, "POST", serverTodo);
    return handleSaveSuccess(result);
  } catch (error) {
    handleSaveError(error);
  }
};

/**
 * Transforms todo object from frontend format to backend format
 * @param {Object} todo - Todo object in frontend format
 * @returns {Object} Todo object in backend format
 */
const transformTodoForServer = (todo) => {
  return {
    title: todo.title,
    description: todo.content, // Frontend uses 'content', backend uses 'description'
    completed: todo.completed ? 1 : 0,
  };
};

/**
 * Handles successful todo save response
 * @param {Object} result - Server response
 * @returns {Object} Server response
 */
const handleSaveSuccess = (result) => {
  console.log("✅ Todo saved to server:", result);
  return result;
};

/**
 * Handles todo save error
 * @param {Error} error - Save error
 * @throws {Error} Re-throws the error for caller handling
 */
const handleSaveError = (error) => {
  console.error("❌ Failed to save todo to server:", error);
  throw error;
};

// #################################################

/**
 * Updates a todo on server
 * @param {string} todoId - Todo ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Server response
 */
export const updateTodoOnServer = async (todoId, updates) => {
  try {
    const endpoint = createUpdateEndpoint(todoId);
    const serverUpdates = transformUpdatesForServer(updates);
    const result = await apiHandler(endpoint, "PATCH", serverUpdates);
    return handleUpdateSuccess(result);
  } catch (error) {
    handleUpdateError(error);
  }
};

/**
 * Creates update endpoint URL for specific todo
 * @param {string} todoId - Todo ID
 * @returns {string} Full API endpoint URL for todo update
 */
const createUpdateEndpoint = (todoId) => {
  const API_BASE = getApiBase();
  return `${API_BASE}/todos/${todoId}`;
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
 * Handles successful todo update response
 * @param {Object} result - Server response
 * @returns {Object} Server response
 */
const handleUpdateSuccess = (result) => {
  console.log("✅ Todo updated on server:", result);
  return result;
};

/**
 * Handles todo update error
 * @param {Error} error - Update error
 * @throws {Error} Re-throws the error for caller handling
 */
const handleUpdateError = (error) => {
  console.error("❌ Failed to update todo on server:", error);
  throw error;
};

// #################################################

/**
 * Moves a todo to trash on server
 * @param {string} todoId - Todo ID to trash
 * @returns {Promise<Object>} Server response
 */
export const trashTodoOnServer = async (todoId) => {
  try {
    const endpoint = createTrashTodoEndpoint(todoId);
    const result = await apiHandler(endpoint, "POST");
    return handleTrashTodoSuccess(result);
  } catch (error) {
    handleTrashTodoError(error);
  }
};

/**
 * Creates trash endpoint URL for specific todo
 * @param {string} todoId - Todo ID
 * @returns {string} Full API endpoint URL for trashing todo
 */
const createTrashTodoEndpoint = (todoId) => {
  const API_BASE = getApiBase();
  return `${API_BASE}/todos/${todoId}/trash`;
};

/**
 * Handles successful todo trash response
 * @param {Object} result - Server response
 * @returns {Object} Server response
 */
const handleTrashTodoSuccess = (result) => {
  console.log("✅ Todo trashed on server:", result);
  return result;
};

/**
 * Handles todo trash error
 * @param {Error} error - Trash error
 * @throws {Error} Re-throws the error for caller handling
 */
const handleTrashTodoError = (error) => {
  console.error("❌ Failed to trash todo on server:", error);
  throw error;
};

// #################################################

/**
 * Restores a todo from trash on server
 * @param {string} todoId - Todo ID to restore
 * @returns {Promise<Object>} Server response
 */
export const restoreTodoOnServer = async (todoId) => {
  try {
    const endpoint = createRestoreEndpoint(todoId);
    const result = await apiHandler(endpoint, "POST");
    return handleRestoreSuccess(result);
  } catch (error) {
    handleRestoreError(error);
  }
};

/**
 * Creates restore endpoint URL for specific todo
 * @param {string} todoId - Todo ID
 * @returns {string} Full API endpoint URL for restoring todo
 */
const createRestoreEndpoint = (todoId) => {
  const API_BASE = getApiBase();
  return `${API_BASE}/todos/${todoId}/restore`;
};

/**
 * Handles successful todo restore response
 * @param {Object} result - Server response
 * @returns {Object} Server response
 */
const handleRestoreSuccess = (result) => {
  console.log("✅ Todo restored on server:", result);
  return result;
};

/**
 * Handles todo restore error
 * @param {Error} error - Restore error
 * @throws {Error} Re-throws the error for caller handling
 */
const handleRestoreError = (error) => {
  console.error("❌ Failed to restore todo on server:", error);
  throw error;
};

// #################################################

/**
 * Deletes a todo from server
 * @param {string} todoId - Todo ID to delete
 * @returns {Promise<Object>} Server response
 */
export const deleteTodoFromServer = async (todoId) => {
  try {
    const endpoint = createDeleteEndpoint(todoId);
    const result = await apiHandler(endpoint, "DELETE");
    return handleDeleteSuccess(result);
  } catch (error) {
    handleDeleteError(error);
  }
};

/**
 * Creates delete endpoint URL for specific todo
 * @param {string} todoId - Todo ID
 * @returns {string} Full API endpoint URL for todo deletion
 */
const createDeleteEndpoint = (todoId) => {
  const API_BASE = getApiBase();
  return `${API_BASE}/todos/${todoId}`;
};

/**
 * Handles successful todo deletion response
 * @param {Object} result - Server response
 * @returns {Object} Server response
 */
const handleDeleteSuccess = (result) => {
  console.log("✅ Todo deleted from server:", result);
  return result;
};

/**
 * Handles todo deletion error
 * @param {Error} error - Delete error
 * @throws {Error} Re-throws the error for caller handling
 */
const handleDeleteError = (error) => {
  console.error("❌ Failed to delete todo from server:", error);
  throw error;
};
