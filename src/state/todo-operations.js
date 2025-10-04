// lets-todo-app/src/state/todo-operations.js

import { TodosPersistence, TrashPersistence } from "./data-persistence.js";

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
   * Adds a todo (with server sync for users)
   * @param {Object} appState - Application state object
   * @param {Object} todo - Todo object
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  async add(appState, todo, notifyListeners) {
    // Ensure todo has an ID
    const todoWithId = {
      ...todo,
      id: todo.id || generateId(),
      created: todo.created || new Date().toISOString(),
      lastModified: todo.lastModified || new Date().toISOString(),
    };

    // Add to local state first
    appState.todos = [...appState.todos, todoWithId];
    TodosPersistence.save(appState.todos, appState.sessionType);
    notifyListeners();

    // Sync to server if user session
    if (appState.sessionType === "user") {
      try {
        const { saveTodoToServer } = await import("../services/api-todos.js");
        const serverResponse = await saveTodoToServer(todoWithId);

        // Store server ID separately, keep our generated ID as primary
        if (serverResponse && serverResponse.id) {
          const todoIndex = appState.todos.findIndex(
            (t) => t.id === todoWithId.id
          );
          if (todoIndex !== -1) {
            // Keep our generated ID, store server ID separately
            appState.todos[todoIndex].serverId = serverResponse.id;
            appState.todos[todoIndex].lastModified = new Date().toISOString();
            TodosPersistence.save(appState.todos, appState.sessionType);
            notifyListeners();
            console.log(
              `✅ Todo synced to server with server ID: ${serverResponse.id}, keeping client ID: ${todoWithId.id}`
            );
          }
        }
      } catch (error) {
        console.warn("⚠️ Failed to sync todo to server:", error);
        // Todo is still saved locally
      }
    }
  },

  /**
   * Updates an existing todo (with server sync for users)
   * @param {Object} appState - Application state object
   * @param {string} todoId - Todo ID to update
   * @param {Object} updates - Todo updates
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  async update(appState, todoId, updates, notifyListeners) {
    // Update locally first
    appState.todos = appState.todos.map((todo) =>
      todo.id === todoId ? { ...todo, ...updates } : todo
    );
    TodosPersistence.save(appState.todos, appState.sessionType);
    notifyListeners();

    // Sync to server if user session
    if (appState.sessionType === "user") {
      try {
        const { updateTodoOnServer } = await import("../services/api-todos.js");
        const updatedTodo = appState.todos.find((t) => t.id === todoId);
        if (updatedTodo && updatedTodo.serverId) {
          // Use serverId for server communication
          await updateTodoOnServer(updatedTodo.serverId, updatedTodo);
          console.log(
            `✅ Todo updated on server (server ID: ${updatedTodo.serverId})`
          );
        }
      } catch (error) {
        console.warn("⚠️ Failed to sync update to server:", error);
        // Todo is still updated locally
      }
    }
  },

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

    // Find todo using flexible ID matching
    const todo = appState.todos.find((t) => t.id == todoId);
    console.log(`🔎 Found todo:`, todo);

    if (todo) {
      // Move to trash locally first
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

      // Sync to server if user session
      if (appState.sessionType === "user") {
        try {
          const { trashTodoOnServer } = await import(
            "../services/api-todos.js"
          );
          // Use serverId for server communication
          const serverIdToUse =
            todo.serverId ||
            (typeof todoId === "string" ? parseInt(todoId, 10) : todoId);

          if (isNaN(serverIdToUse)) {
            console.warn(
              `⚠️ Cannot trash todo on server: no valid server ID for client ID: ${todoId}`
            );
            console.log(
              "ℹ️ Todo has been trashed locally, but server sync was skipped"
            );
          } else {
            await trashTodoOnServer(serverIdToUse);
            console.log(
              `✅ Todo trashed on server (server ID: ${serverIdToUse})`
            );
          }
        } catch (error) {
          console.warn("⚠️ Failed to sync trash to server:", error);
          // Todo is still trashed locally
        }
      }
    }
  },

  /**
   * Restores a todo from trash (with server sync for users)
   * @param {Object} appState - Application state object
   * @param {string} todoId - Todo ID to restore
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  async restore(appState, todoId, notifyListeners) {
    console.log(
      `🔍 restoreTodo called with ID: ${todoId}, type: ${typeof todoId}`
    );

    // Find todo using flexible ID matching
    const todo = appState.trashedTodos.find((t) => t.id == todoId);
    console.log(`🔎 Found trashed todo:`, todo);

    if (todo) {
      // Restore locally first
      appState.trashedTodos = appState.trashedTodos.filter(
        (t) => t.id != todoId
      );
      appState.todos = [...appState.todos, { ...todo, trashedAt: undefined }];

      TodosPersistence.save(appState.todos, appState.sessionType);
      TrashPersistence.save(appState.trashedTodos, appState.sessionType);
      notifyListeners();

      // Sync to server if user session
      if (appState.sessionType === "user") {
        try {
          const { restoreTodoOnServer } = await import(
            "../services/api-todos.js"
          );
          // Use serverId for server communication
          const serverIdToUse =
            todo.serverId ||
            (typeof todoId === "string" ? parseInt(todoId, 10) : todoId);

          if (isNaN(serverIdToUse)) {
            console.warn(
              `⚠️ Cannot restore todo on server: no valid server ID for client ID: ${todoId}`
            );
            console.log(
              "ℹ️ Todo has been restored locally, but server sync was skipped"
            );
          } else {
            await restoreTodoOnServer(serverIdToUse);
            console.log(
              `✅ Todo restored on server (server ID: ${serverIdToUse})`
            );
          }
        } catch (error) {
          console.warn("⚠️ Failed to sync restore to server:", error);
          // Todo is still restored locally
        }
      }
    }
  },

  /**
   * Permanently deletes a todo from trash (with server sync for users)
   * @param {Object} appState - Application state object
   * @param {string} todoId - Todo ID to delete permanently
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  async delete(appState, todoId, notifyListeners) {
    console.log(
      `🔍 deleteTodo called with ID: ${todoId}, type: ${typeof todoId}`
    );

    // Find the todo BEFORE deleting to get its serverId
    const todoToDelete = appState.trashedTodos.find((t) => t.id == todoId);

    if (!todoToDelete) {
      console.warn(`⚠️ Todo with ID ${todoId} not found in trash`);
      return;
    }

    // Delete locally first
    appState.trashedTodos = appState.trashedTodos.filter((t) => t.id != todoId);
    TrashPersistence.save(appState.trashedTodos, appState.sessionType);
    notifyListeners();

    // Sync to server if user session
    if (appState.sessionType === "user") {
      // Use serverId for server communication, fallback to original logic for old todos
      const serverIdToUse =
        todoToDelete.serverId ||
        (typeof todoId === "string" ? parseInt(todoId, 10) : todoId);

      // Check if serverIdToUse is valid before making server request
      if (isNaN(serverIdToUse)) {
        console.warn(
          `⚠️ Cannot delete todo on server: invalid server ID (${serverIdToUse}) for client ID: ${todoId}`
        );
        console.log(
          "ℹ️ Todo has been deleted locally, but server sync was skipped"
        );
      } else {
        console.log(
          `🌐 Attempting to delete todo ${serverIdToUse} on server...`
        );
        try {
          const { deleteTodoFromServer } = await import(
            "../services/api-todos.js"
          );
          const result = await deleteTodoFromServer(serverIdToUse);
          console.log(
            `✅ Todo deleted on server (server ID: ${serverIdToUse}):`,
            result
          );
        } catch (error) {
          console.error("❌ Failed to sync delete to server:", error);
          // Todo is still deleted locally
        }
      }
    } else {
      console.log("👤 Guest session - no server sync needed");
    }
  },

  /**
   * Empties the entire trash by deleting all trashed todos permanently
   * @param {Object} appState - Application state object
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  async emptyTrash(appState, notifyListeners) {
    console.log(`🗑️ Emptying trash with ${appState.trashedTodos.length} todos`);

    // For user sessions, delete each todo on server before emptying locally
    if (appState.sessionType === "user" && appState.trashedTodos.length > 0) {
      console.log("🌐 Deleting all trash todos on server...");

      try {
        const { deleteTodoFromServer } = await import(
          "../services/api-todos.js"
        );

        // Delete all trashed todos on server using serverId
        const deletePromises = appState.trashedTodos.map((todo) => {
          const serverIdToUse =
            todo.serverId ||
            (typeof todo.id === "string" ? parseInt(todo.id, 10) : todo.id);
          return deleteTodoFromServer(serverIdToUse);
        });

        await Promise.all(deletePromises);
        console.log(
          `✅ All ${appState.trashedTodos.length} trash todos deleted on server`
        );
      } catch (error) {
        console.error("❌ Failed to delete some todos on server:", error);
        // Continue with local empty anyway
      }
    } else {
      console.log("👤 Guest session or empty trash - no server sync needed");
    }

    // Empty locally
    appState.trashedTodos = [];
    TrashPersistence.save(appState.trashedTodos, appState.sessionType);
    notifyListeners();
  },

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
