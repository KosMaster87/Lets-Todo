// lets-todo-app/src/services/api-todos.js

import { getApiBase, apiHandler } from "./../utils/api-handler.js";

/**
 * Loads all todos for current user from server
 * @returns {Promise<Array>} Array of todos
 */
export const loadTodosFromServer = async () => {
  const API_BASE = getApiBase();

  try {
    const todos = await apiHandler(`${API_BASE}/todos`, "GET");
    console.log(`✅ Loaded ${todos.length} todos from server`);
    return todos;
  } catch (error) {
    console.error("❌ Failed to load todos from server:", error);
    return [];
  }
};

/**
 * Saves a todo to server
 * @param {Object} todo - Todo object to save
 * @returns {Promise<Object>} Server response with todo data
 */
export const saveTodoToServer = async (todo) => {
  const API_BASE = getApiBase();

  try {
    const result = await apiHandler(`${API_BASE}/todos`, "POST", {
      title: todo.title,
      description: todo.content, // Frontend uses 'content', backend uses 'description'
      completed: todo.completed ? 1 : 0,
    });

    console.log("✅ Todo saved to server:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to save todo to server:", error);
    throw error;
  }
};

/**
 * Updates a todo on server
 * @param {string} todoId - Todo ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Server response
 */
export const updateTodoOnServer = async (todoId, updates) => {
  const API_BASE = getApiBase();

  try {
    // Convert frontend format to backend format
    const serverUpdates = {};
    if (updates.title !== undefined) serverUpdates.title = updates.title;
    if (updates.content !== undefined)
      serverUpdates.description = updates.content;
    if (updates.completed !== undefined)
      serverUpdates.completed = updates.completed ? 1 : 0;

    const result = await apiHandler(
      `${API_BASE}/todos/${todoId}`,
      "PATCH",
      serverUpdates
    );

    console.log("✅ Todo updated on server:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to update todo on server:", error);
    throw error;
  }
};

/**
 * Deletes a todo from server
 * @param {string} todoId - Todo ID to delete
 * @returns {Promise<Object>} Server response
 */
export const deleteTodoFromServer = async (todoId) => {
  const API_BASE = getApiBase();

  try {
    const result = await apiHandler(`${API_BASE}/todos/${todoId}`, "DELETE");

    console.log("✅ Todo deleted from server:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to delete todo from server:", error);
    throw error;
  }
};

/**
 * Loads trashed todos from server
 * @returns {Promise<Array>} Array of trashed todos
 */
export const loadTrashedTodosFromServer = async () => {
  const API_BASE = getApiBase();

  try {
    const trashedTodos = await apiHandler(`${API_BASE}/todos/trash`, "GET");
    console.log(`✅ Loaded ${trashedTodos.length} trashed todos from server`);
    return trashedTodos;
  } catch (error) {
    console.error("❌ Failed to load trashed todos from server:", error);
    return [];
  }
};

/**
 * Moves a todo to trash on server
 * @param {string} todoId - Todo ID to trash
 * @returns {Promise<Object>} Server response
 */
export const trashTodoOnServer = async (todoId) => {
  const API_BASE = getApiBase();

  try {
    const result = await apiHandler(
      `${API_BASE}/todos/${todoId}/trash`,
      "POST"
    );
    console.log("✅ Todo trashed on server:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to trash todo on server:", error);
    throw error;
  }
};

/**
 * Restores a todo from trash on server
 * @param {string} todoId - Todo ID to restore
 * @returns {Promise<Object>} Server response
 */
export const restoreTodoOnServer = async (todoId) => {
  const API_BASE = getApiBase();

  try {
    const result = await apiHandler(
      `${API_BASE}/todos/${todoId}/restore`,
      "POST"
    );
    console.log("✅ Todo restored on server:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to restore todo on server:", error);
    throw error;
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
  try {
    console.log("🔄 Syncing todos with server...");

    const [serverTodos, serverTrash] = await Promise.all([
      loadTodosFromServer(),
      loadTrashedTodosFromServer(),
    ]);

    console.log(
      `✅ Sync complete: ${serverTodos.length} todos, ${serverTrash.length} trashed`
    );
    return {
      todos: serverTodos,
      trashedTodos: serverTrash,
    };
  } catch (error) {
    console.error("❌ Todo sync failed:", error);
    return {
      todos: localTodos,
      trashedTodos: localTrash,
    };
  }
};
