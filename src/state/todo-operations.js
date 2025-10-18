// lets-todo-app/src/state/todo-operations.js

import { TodosPersistence, TrashPersistence } from "./data-persistence.js";
import {
  saveTodoToServer,
  updateTodoOnServer,
  trashTodoOnServer,
  restoreTodoOnServer,
  deleteTodoFromServer,
} from "./../services/api-todos.js";

/**
 * Todo Operations Manager
 * Handles all CRUD operations for todos and trash management
 * Extracted from state.js for better modularity
 */

/**
 * Generates a unique ID
 * @returns {string} Unique ID
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const TodoOperations = {
  /**
   * Checks if server sync is needed for current session
   * @param {string} sessionType - Current session type
   * @returns {boolean} True if sync needed
   */
  shouldSyncToServer: (sessionType) => sessionType === "user",

  /**
   * Adds a todo (with server sync for users)
   * @param {Object} appState - Application state object
   * @param {Object} todo - Todo object
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  async add(appState, todo, notifyListeners) {
    const todoWithId = this.createTodoWithId(todo);
    this.addTodoLocally(appState, todoWithId, notifyListeners);
    await this.syncTodoToServer(appState, todoWithId, notifyListeners);
  },

  /**
   * Creates todo with ID and timestamps
   * @param {Object} todo - Original todo object
   * @returns {Object} Todo with ID and timestamps
   */
  createTodoWithId(todo) {
    return {
      ...todo,
      id: todo.id || generateId(),
      created: todo.created || new Date().toISOString(),
      lastModified: todo.lastModified || new Date().toISOString(),
    };
  },

  /**
   * Adds todo to local state and persistence
   * @param {Object} appState - Application state object
   * @param {Object} todoWithId - Todo with ID and timestamps
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  addTodoLocally(appState, todoWithId, notifyListeners) {
    appState.todos = [...appState.todos, todoWithId];
    TodosPersistence.save(appState.todos, appState.sessionType);
    notifyListeners();
  },

  /**
   * Syncs todo to server for user sessions
   * @param {Object} appState - Application state object
   * @param {Object} todoWithId - Todo to sync
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  async syncTodoToServer(appState, todoWithId, notifyListeners) {
    if (!this.shouldSyncToServer(appState.sessionType)) return;

    try {
      const serverResponse = await this.saveTodoToServerApi(todoWithId);
      this.processServerResponse(
        appState,
        todoWithId,
        serverResponse,
        notifyListeners
      );
    } catch (error) {
      console.warn("⚠️ Failed to sync todo to server:", error);
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
      this.updateTodoWithServerId(
        appState,
        todoWithId.id,
        serverResponse.id,
        notifyListeners
      );
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
        `✅ Todo synced to server with server ID: ${serverId}, keeping client ID: ${clientId}`
      );
    }
  },

  // #################################################

  /**
   * Updates an existing todo (with server sync for users)
   * @param {Object} appState - Application state object
   * @param {string} todoId - Todo ID to update
   * @param {Object} updates - Todo updates
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  async update(appState, todoId, updates, notifyListeners) {
    this.updateTodoLocally(appState, todoId, updates, notifyListeners);
    await this.handleUpdateServerSync(appState, todoId, appState.sessionType);
  },

  /**
   * Updates todo in local state and persistence
   * @param {Object} appState - Application state object
   * @param {string} todoId - Todo ID to update
   * @param {Object} updates - Todo updates
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  updateTodoLocally(appState, todoId, updates, notifyListeners) {
    appState.todos = appState.todos.map((todo) =>
      todo.id === todoId ? { ...todo, ...updates } : todo
    );
    TodosPersistence.save(appState.todos, appState.sessionType);
    notifyListeners();
  },

  /**
   * Handles server sync for updated todo
   * @param {Object} appState - Application state object
   * @param {string} todoId - Todo ID that was updated
   * @param {string} sessionType - Current session type
   */
  async handleUpdateServerSync(appState, todoId, sessionType) {
    if (!this.shouldSyncToServer(sessionType)) return;

    try {
      const updatedTodo = this.findUpdatedTodo(appState, todoId);
      await this.syncUpdatedTodoToServer(updatedTodo);
    } catch (error) {
      console.warn("⚠️ Failed to sync update to server:", error);
      // Todo is still updated locally
    }
  },

  /**
   * Finds updated todo by ID
   * @param {Object} appState - Application state object
   * @param {string} todoId - Todo ID to find
   * @returns {Object|undefined} Found todo or undefined
   */
  findUpdatedTodo: (appState, todoId) =>
    appState.todos.find((t) => t.id === todoId),

  /**
   * Syncs updated todo to server
   * @param {Object} updatedTodo - Todo to sync
   */
  async syncUpdatedTodoToServer(updatedTodo) {
    if (updatedTodo && updatedTodo.serverId) {
      await updateTodoOnServer(updatedTodo.serverId, updatedTodo);
      console.log(
        `✅ Todo updated on server (server ID: ${updatedTodo.serverId})`
      );
    }
  },

  // #################################################

  /**
   * Removes a todo from the todos list (local operation only)
   * @param {Object} appState - Application state object
   * @param {string} todoId - Todo ID to remove
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  remove(appState, todoId, notifyListeners) {
    appState.todos = appState.todos.filter((todo) => todo.id !== todoId);
    TodosPersistence.save(appState.todos, appState.sessionType);
    notifyListeners();
  },

  // #################################################

  /**
   * Moves a todo to trash (with server sync for users)
   * @param {Object} appState - Application state object
   * @param {string} todoId - Todo ID to trash
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  async trash(appState, todoId, notifyListeners) {
    console.log(
      `🔍 trashTodo called with ID: ${todoId}, type: ${typeof todoId}`
    );
    const todo = this.findTodoById(appState, todoId);
    console.log(`🔎 Found todo:`, todo);

    if (todo) {
      this.moveTodoToTrashLocally(appState, todoId, todo, notifyListeners);
      await this.handleTrashServerSync(todo, todoId, appState.sessionType);
    }
  },

  /**
   * Finds todo using flexible ID matching
   * @param {Object} appState - Application state object
   * @param {string} todoId - Todo ID to find
   * @returns {Object|undefined} Found todo or undefined
   */
  findTodoById(appState, todoId) {
    const todo = appState.todos.find((t) => t.id == todoId);
    return todo;
  },

  /**
   * Moves todo to trash in local state
   * @param {Object} appState - Application state object
   * @param {string} todoId - Todo ID to trash
   * @param {Object} todo - Todo object to trash
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  moveTodoToTrashLocally(appState, todoId, todo, notifyListeners) {
    appState.todos = appState.todos.filter((t) => t.id != todoId);
    appState.trashedTodos = [
      ...appState.trashedTodos,
      { ...todo, trashedAt: Date.now() },
    ];

    TodosPersistence.save(appState.todos, appState.sessionType);
    TrashPersistence.save(appState.trashedTodos, appState.sessionType);

    console.log(
      `🗑️ Todo ${todoId} moved to trash, notifying ${
        appState.listeners?.length || 0
      } listeners`
    );
    notifyListeners();
  },

  /**
   * Handles server sync for trashed todo
   * @param {Object} todo - Todo that was trashed
   * @param {string} todoId - Original todo ID
   * @param {string} sessionType - Current session type
   */
  async handleTrashServerSync(todo, todoId, sessionType) {
    if (!this.shouldSyncToServer(sessionType)) return;

    try {
      const { isValid, serverId } = this.validateServerIdForTodo(todo, todoId);

      if (!isValid) {
        this.handleInvalidServerId(todoId);
      } else {
        await this.syncTrashToServer(serverId);
      }
    } catch (error) {
      console.warn("⚠️ Failed to sync trash to server:", error);
      // Todo is still trashed locally
    }
  },

  /**
   * Validates and determines server ID for todo operations
   * @param {Object} todo - Todo object
   * @param {string} todoId - Original todo ID
   * @returns {Object} Object with isValid flag and serverId
   */
  validateServerIdForTodo: (todo, todoId) => {
    const serverId =
      todo.serverId ||
      (typeof todoId === "string" ? parseInt(todoId, 10) : todoId);
    return {
      isValid: !isNaN(serverId),
      serverId: serverId,
    };
  },

  /**
   * Handles invalid server ID scenario
   * @param {string} todoId - Original todo ID
   */
  handleInvalidServerId(todoId) {
    console.warn(
      `⚠️ Cannot trash todo on server: no valid server ID for client ID: ${todoId}`
    );
    console.log(
      "ℹ️ Todo has been trashed locally, but server sync was skipped"
    );
  },

  /**
   * Syncs todo trash to server
   * @param {number} serverIdToUse - Server ID to use
   */
  async syncTrashToServer(serverIdToUse) {
    await trashTodoOnServer(serverIdToUse);
    console.log(`✅ Todo trashed on server (server ID: ${serverIdToUse})`);
  },

  // #################################################

  /**
   * Restores a todo from trash (with server sync for users)
   * @param {Object} appState - Application state object
   * @param {string} todoId - Todo ID to restore
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  async restore(appState, todoId, notifyListeners) {
    const todo = this.findTrashedTodoById(appState, todoId);

    if (todo) {
      this.restoreTodoLocally(appState, todoId, todo, notifyListeners);
      await this.handleRestoreServerSync(todo, todoId, appState.sessionType);
    }
  },

  /**
   * Finds trashed todo using flexible ID matching
   * @param {Object} appState - Application state object
   * @param {string} todoId - Todo ID to find
   * @returns {Object|undefined} Found trashed todo or undefined
   */
  findTrashedTodoById(appState, todoId) {
    console.log(
      `🔍 restoreTodo called with ID: ${todoId}, type: ${typeof todoId}`
    );
    const todo = appState.trashedTodos.find((t) => t.id == todoId);
    console.log(`🔎 Found trashed todo:`, todo);
    return todo;
  },

  /**
   * Restores todo to active list in local state
   * @param {Object} appState - Application state object
   * @param {string} todoId - Todo ID to restore
   * @param {Object} todo - Todo object to restore
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  restoreTodoLocally(appState, todoId, todo, notifyListeners) {
    appState.trashedTodos = appState.trashedTodos.filter((t) => t.id != todoId);
    appState.todos = [...appState.todos, { ...todo, trashedAt: undefined }];

    TodosPersistence.save(appState.todos, appState.sessionType);
    TrashPersistence.save(appState.trashedTodos, appState.sessionType);
    notifyListeners();
  },

  /**
   * Handles server sync for restored todo
   * @param {Object} todo - Todo that was restored
   * @param {string} todoId - Original todo ID
   * @param {string} sessionType - Current session type
   */
  async handleRestoreServerSync(todo, todoId, sessionType) {
    if (!this.shouldSyncToServer(sessionType)) return;

    try {
      const { isValid, serverId } = this.validateServerIdForTodo(todo, todoId);

      if (!isValid) {
        this.handleInvalidRestoreServerId(todoId);
      } else {
        await this.syncRestoreToServer(serverId);
      }
    } catch (error) {
      console.warn("⚠️ Failed to sync restore to server:", error);
      // Todo is still restored locally
    }
  },

  /**
   * Handles invalid server ID for restore operation
   * @param {string} todoId - Original todo ID
   */
  handleInvalidRestoreServerId(todoId) {
    console.warn(
      `⚠️ Cannot restore todo on server: no valid server ID for client ID: ${todoId}`
    );
    console.log(
      "ℹ️ Todo has been restored locally, but server sync was skipped"
    );
  },

  /**
   * Syncs todo restore to server
   * @param {number} serverId - Server ID to use
   */
  async syncRestoreToServer(serverId) {
    await restoreTodoOnServer(serverId);
    console.log(`✅ Todo restored on server (server ID: ${serverId})`);
  },

  // #################################################

  /**
   * Permanently deletes a todo from trash (with server sync for users)
   * @param {Object} appState - Application state object
   * @param {string} todoId - Todo ID to delete permanently
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  async delete(appState, todoId, notifyListeners) {
    const todoToDelete = this.findTodoToDelete(appState, todoId);

    if (!todoToDelete) return;

    this.deleteTodoLocally(appState, todoId, notifyListeners);
    await this.handleDeleteServerSync(
      todoToDelete,
      todoId,
      appState.sessionType
    );
  },

  /**
   * Finds todo to delete and validates it exists
   * @param {Object} appState - Application state object
   * @param {string} todoId - Todo ID to find
   * @returns {Object|null} Found todo or null if not found
   */
  findTodoToDelete(appState, todoId) {
    console.log(
      `🔍 deleteTodo called with ID: ${todoId}, type: ${typeof todoId}`
    );
    const todoToDelete = appState.trashedTodos.find((t) => t.id == todoId);

    if (!todoToDelete) {
      console.warn(`⚠️ Todo with ID ${todoId} not found in trash`);
      return null;
    }

    return todoToDelete;
  },

  /**
   * Deletes todo from local trash
   * @param {Object} appState - Application state object
   * @param {string} todoId - Todo ID to delete
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  deleteTodoLocally(appState, todoId, notifyListeners) {
    appState.trashedTodos = appState.trashedTodos.filter((t) => t.id != todoId);
    TrashPersistence.save(appState.trashedTodos, appState.sessionType);
    notifyListeners();
  },

  /**
   * Handles server sync for deleted todo
   * @param {Object} todoToDelete - Todo that was deleted
   * @param {string} todoId - Original todo ID
   * @param {string} sessionType - Current session type
   */
  async handleDeleteServerSync(todoToDelete, todoId, sessionType) {
    if (!this.shouldSyncToServer(sessionType)) {
      console.log("👤 Guest session - no server sync needed");
      return;
    }

    try {
      const { isValid, serverId } = this.validateServerIdForTodo(
        todoToDelete,
        todoId
      );

      if (!isValid) {
        this.handleInvalidDeleteServerId(todoId, serverId);
      } else {
        await this.syncDeleteToServer(serverId);
      }
    } catch (error) {
      console.error("❌ Failed to sync delete to server:", error);
      // Todo is still deleted locally
    }
  },

  /**
   * Handles invalid server ID for delete operation
   * @param {string} todoId - Original todo ID
   * @param {number} serverIdToUse - Invalid server ID
   */
  handleInvalidDeleteServerId(todoId, serverIdToUse) {
    console.warn(
      `⚠️ Cannot delete todo on server: invalid server ID (${serverIdToUse}) for client ID: ${todoId}`
    );
    console.log(
      "ℹ️ Todo has been deleted locally, but server sync was skipped"
    );
  },

  /**
   * Syncs todo deletion to server
   * @param {number} serverId - Server ID to use
   */
  async syncDeleteToServer(serverId) {
    console.log(`🌐 Attempting to delete todo ${serverId} on server...`);
    const result = await deleteTodoFromServer(serverId);
    console.log(`✅ Todo deleted on server (server ID: ${serverId}):`, result);
  },

  // #################################################

  /**
   * Empties the entire trash by deleting all trashed todos permanently
   * @param {Object} appState - Application state object
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  async emptyTrash(appState, notifyListeners) {
    console.log(`🗑️ Emptying trash with ${appState.trashedTodos.length} todos`);

    await this.handleEmptyTrashServerSync(appState);
    this.emptyTrashLocally(appState, notifyListeners);
  },

  /**
   * Handles server sync for empty trash operation
   * @param {Object} appState - Application state object
   */
  async handleEmptyTrashServerSync(appState) {
    const { sessionType, trashedTodos } = appState;

    if (!this.shouldSyncTrashToServer(sessionType, trashedTodos.length)) {
      console.log("👤 Guest session or empty trash - no server sync needed");
      return;
    }

    try {
      await this.deleteAllTrashOnServer(trashedTodos);
    } catch (error) {
      console.error("❌ Failed to delete some todos on server:", error);
      // Continue with local empty anyway
    }
  },

  /**
   * Checks if trash should be synced to server
   * @param {string} sessionType - Current session type
   * @param {number} trashCount - Number of trashed todos
   * @returns {boolean} True if server sync needed
   */
  shouldSyncTrashToServer: (sessionType, trashCount) =>
    sessionType === "user" && trashCount > 0,

  /**
   * Deletes all trashed todos on server
   * @param {Array} trashedTodos - Array of trashed todos
   */
  async deleteAllTrashOnServer(trashedTodos) {
    console.log("🌐 Deleting all trash todos on server...");

    const deletePromises = this.createTrashDeletePromises(trashedTodos);
    await Promise.all(deletePromises);

    console.log(`✅ All ${trashedTodos.length} trash todos deleted on server`);
  },

  /**
   * Creates delete promises for all trashed todos
   * @param {Array} trashedTodos - Array of trashed todos
   * @returns {Array} Array of delete promises
   */
  createTrashDeletePromises(trashedTodos) {
    return trashedTodos.map((todo) => {
      const { serverId } = this.validateServerIdForTodo(todo, todo.id);
      return deleteTodoFromServer(serverId);
    });
  },

  /**
   * Empties trash locally
   * @param {Object} appState - Application state object
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  emptyTrashLocally(appState, notifyListeners) {
    appState.trashedTodos = [];
    TrashPersistence.save(appState.trashedTodos, appState.sessionType);
    notifyListeners();
  },

  // #################################################

  /**
   * Sets todos array and saves to storage
   * @param {Object} appState - Application state object
   * @param {Array} todos - New todos array
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  setTodos(appState, todos, notifyListeners) {
    appState.todos = [...todos];
    TodosPersistence.save(appState.todos, appState.sessionType);
    notifyListeners();
  },

  // #################################################

  /**
   * Sets trashed todos array and saves to storage
   * @param {Object} appState - Application state object
   * @param {Array} trashedTodos - New trashed todos array
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  setTrashedTodos(appState, trashedTodos, notifyListeners) {
    appState.trashedTodos = [...trashedTodos];
    TrashPersistence.save(appState.trashedTodos, appState.sessionType);
    notifyListeners();
  },

  // #################################################

  /**
   * Sets the current todo (no storage operation)
   * @param {Object} appState - Application state object
   * @param {Object|null} todo - Current todo
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  setCurrentTodo(appState, todo, notifyListeners) {
    appState.currentTodo = todo;
    notifyListeners();
  },
};
