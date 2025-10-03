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

        // Update local todo with server ID
        if (serverResponse && serverResponse.id) {
          const todoIndex = appState.todos.findIndex(
            (t) => t.id === todoWithId.id
          );
          if (todoIndex !== -1) {
            appState.todos[todoIndex].id = serverResponse.id;
            TodosPersistence.save(appState.todos, appState.sessionType);
            notifyListeners();
            console.log(
              `✅ Todo synced to server with ID: ${serverResponse.id}`
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
        if (updatedTodo) {
          await updateTodoOnServer(todoId, updatedTodo);
          console.log("✅ Todo updated on server");
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

    // Convert todoId to number if it's a string (handles both number and string IDs)
    const numericId =
      typeof todoId === "string" ? parseInt(todoId, 10) : todoId;
    console.log(`🔄 Converted ID: ${numericId}, type: ${typeof numericId}`);

    const todo = appState.todos.find(
      (t) => t.id == todoId || t.id === numericId
    );
    console.log(`🔎 Found todo:`, todo);

    if (todo) {
      // Move to trash locally first
      appState.todos = appState.todos.filter(
        (t) => t.id != todoId && t.id !== numericId
      );
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
          await trashTodoOnServer(numericId);
          console.log("✅ Todo trashed on server");
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

    // Convert todoId to handle both string and number types
    const numericId =
      typeof todoId === "string" ? parseInt(todoId, 10) : todoId;

    const todo = appState.trashedTodos.find(
      (t) => t.id == todoId || t.id === numericId
    );
    console.log(`🔎 Found trashed todo:`, todo);

    if (todo) {
      // Restore locally first
      appState.trashedTodos = appState.trashedTodos.filter(
        (t) => t.id != todoId && t.id !== numericId
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
          await restoreTodoOnServer(numericId);
          console.log("✅ Todo restored on server");
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

    // Convert todoId to handle both string and number types
    const numericId =
      typeof todoId === "string" ? parseInt(todoId, 10) : todoId;

    // Delete locally first
    appState.trashedTodos = appState.trashedTodos.filter(
      (t) => t.id != todoId && t.id !== numericId
    );
    TrashPersistence.save(appState.trashedTodos, appState.sessionType);
    notifyListeners();

    // Sync to server if user session
    if (appState.sessionType === "user") {
      console.log(`🌐 Attempting to delete todo ${numericId} on server...`);
      try {
        const { deleteTodoFromServer } = await import(
          "../services/api-todos.js"
        );
        const result = await deleteTodoFromServer(numericId);
        console.log("✅ Todo deleted on server:", result);
      } catch (error) {
        console.error("❌ Failed to sync delete to server:", error);
        // Todo is still deleted locally
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

        // Delete all trashed todos on server
        const deletePromises = appState.trashedTodos.map((todo) => {
          const numericId =
            typeof todo.id === "string" ? parseInt(todo.id, 10) : todo.id;
          return deleteTodoFromServer(numericId);
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
