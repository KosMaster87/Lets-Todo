/**
 * @fileoverview Todo Server Synchronization Manager
 * @description Manages synchronization of todo items between local state and remote server.
 * @module todo-server-sync
 */

import {
  saveTodoToServer,
  updateTodoOnServer,
  trashTodoOnServer,
  restoreTodoOnServer,
  deleteTodoFromServer,
} from "./../services/api/api-todos.js";
import { TodosPersistence } from "./data-persistence.js";
import {
  shouldSyncToServer,
  shouldSyncTrashToServer,
  validateServerIdForTodo,
  handleInvalidServerId,
  handleInvalidRestoreServerId,
  handleInvalidDeleteServerId,
} from "./todo-helpers.js";

export const TodoServerSync = {
  /**
   * Syncs todo to server for user sessions
   * @param {Object} appState - Application state object
   * @param {Object} todoWithId - Todo to sync
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  async syncTodoToServer(appState, todoWithId, notifyListeners) {
    if (!shouldSyncToServer(appState.sessionType)) return;

    try {
      const serverResponse = await this.saveTodoToServerApi(todoWithId);
      this.processServerResponse(appState, todoWithId, serverResponse, notifyListeners);
    } catch (error) {
      console.warn("Failed to sync todo to server:", error);
    }
  },

  /**
   * Saves todo to server and returns response
   * @param {Object} todoWithId - Todo to save
   * @returns {Promise<Object>} Server response
   */
  async saveTodoToServerApi(todoWithId) {
    return await saveTodoToServer(todoWithId);
  },

  /**
   * Processes server response and updates todo with server ID
   * @param {Object} appState - Application state object
   * @param {Object} todoWithId - Original todo
   * @param {Object} serverResponse - Server response
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  processServerResponse(appState, todoWithId, serverResponse, notifyListeners) {
    if (serverResponse && serverResponse.id) {
      this.updateTodoWithServerId(appState, todoWithId.id, serverResponse.id, notifyListeners);
    }
  },

  /**
   * Updates todo with server ID after successful sync
   * @param {Object} appState - Application state object
   * @param {string} clientId - Client todo ID
   * @param {number} serverId - Server todo ID
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  updateTodoWithServerId(appState, clientId, serverId, notifyListeners) {
    const todoIndex = appState.todos.findIndex((t) => t.id === clientId);
    if (todoIndex !== -1) {
      appState.todos[todoIndex].serverId = serverId;
      appState.todos[todoIndex].lastModified = new Date().toISOString();
      TodosPersistence.save(appState.todos, appState.sessionType);
      notifyListeners();
      console.log(
        `Todo synced to server with server ID: ${serverId}, keeping client ID: ${clientId}`
      );
    }
  },

  /**
   * Handles server sync for updated todo
   * @param {Object} appState - Application state object
   * @param {string} todoId - Todo ID that was updated
   * @param {string} sessionType - Current session type
   */
  async handleUpdateServerSync(appState, todoId, sessionType) {
    if (!shouldSyncToServer(sessionType)) return;

    try {
      const updatedTodo = appState.todos.find((t) => t.id === todoId);
      await this.syncUpdatedTodoToServer(updatedTodo);
    } catch (error) {
      console.warn("Failed to sync update to server:", error);
    }
  },

  /**
   * Syncs updated todo to server
   * @param {Object} updatedTodo - Todo to sync
   */
  async syncUpdatedTodoToServer(updatedTodo) {
    if (updatedTodo && updatedTodo.serverId) {
      await updateTodoOnServer(updatedTodo.serverId, updatedTodo);
      console.log(`Todo updated on server (server ID: ${updatedTodo.serverId})`);
    }
  },

  /**
   * Handles server sync for trashed todo
   * @param {Object} todo - Todo that was trashed
   * @param {string} todoId - Original todo ID
   * @param {string} sessionType - Current session type
   */
  async handleTrashServerSync(todo, todoId, sessionType) {
    if (!shouldSyncToServer(sessionType)) return;

    try {
      const { isValid, serverId } = validateServerIdForTodo(todo, todoId);

      if (!isValid) {
        handleInvalidServerId(todoId);
      } else {
        await this.syncTrashToServer(serverId);
      }
    } catch (error) {
      console.warn("Failed to sync trash to server:", error);
    }
  },

  /**
   * Syncs todo trash to server
   * @param {number} serverIdToUse - Server ID to use
   */
  async syncTrashToServer(serverIdToUse) {
    await trashTodoOnServer(serverIdToUse);
    console.log(`Todo trashed on server (server ID: ${serverIdToUse})`);
  },

  /**
   * Handles server sync for restored todo
   * @param {Object} todo - Todo that was restored
   * @param {string} todoId - Original todo ID
   * @param {string} sessionType - Current session type
   */
  async handleRestoreServerSync(todo, todoId, sessionType) {
    if (!shouldSyncToServer(sessionType)) return;

    try {
      const { isValid, serverId } = validateServerIdForTodo(todo, todoId);

      if (!isValid) {
        handleInvalidRestoreServerId(todoId);
      } else {
        await this.syncRestoreToServer(serverId);
      }
    } catch (error) {
      console.warn("Failed to sync restore to server:", error);
    }
  },

  /**
   * Syncs todo restore to server
   * @param {number} serverId - Server ID to use
   */
  async syncRestoreToServer(serverId) {
    await restoreTodoOnServer(serverId);
    console.log(`Todo restored on server (server ID: ${serverId})`);
  },

  /**
   * Handles server sync for deleted todo
   * @param {Object} todoToDelete - Todo that was deleted
   * @param {string} todoId - Original todo ID
   * @param {string} sessionType - Current session type
   */
  async handleDeleteServerSync(todoToDelete, todoId, sessionType) {
    if (!shouldSyncToServer(sessionType)) {
      console.log("Guest session - no server sync needed");
      return;
    }

    try {
      const { isValid, serverId } = validateServerIdForTodo(todoToDelete, todoId);

      if (!isValid) {
        handleInvalidDeleteServerId(todoId, serverId);
      } else {
        await this.syncDeleteToServer(serverId);
      }
    } catch (error) {
      console.error("Failed to sync delete to server:", error);
    }
  },

  /**
   * Syncs todo deletion to server
   * @param {number} serverId - Server ID to use
   */
  async syncDeleteToServer(serverId) {
    console.log(`Attempting to delete todo ${serverId} on server...`);
    const result = await deleteTodoFromServer(serverId);
    console.log(`Todo deleted on server (server ID: ${serverId}):`, result);
  },

  /**
   * Handles server sync for empty trash operation
   * @param {Object} appState - Application state object
   */
  async handleEmptyTrashServerSync(appState) {
    const { sessionType, trashedTodos } = appState;

    if (!shouldSyncTrashToServer(sessionType, trashedTodos.length)) {
      console.log("Guest session or empty trash - no server sync needed");
      return;
    }

    try {
      await this.deleteAllTrashOnServer(trashedTodos);
    } catch (error) {
      console.error("Failed to delete some todos on server:", error);
    }
  },

  /**
   * Deletes all trashed todos on server
   * @param {Array} trashedTodos - Array of trashed todos
   */
  async deleteAllTrashOnServer(trashedTodos) {
    console.log("Deleting all trash todos on server...");

    const deletePromises = this.createTrashDeletePromises(trashedTodos);
    await Promise.all(deletePromises);

    console.log(`All ${trashedTodos.length} trash todos deleted on server`);
  },

  /**
   * Creates delete promises for all trashed todos
   * @param {Array} trashedTodos - Array of trashed todos
   * @returns {Array} Array of delete promises
   */
  createTrashDeletePromises(trashedTodos) {
    return trashedTodos.map((todo) => {
      const { serverId } = validateServerIdForTodo(todo, todo.id);
      return deleteTodoFromServer(serverId);
    });
  },
};
