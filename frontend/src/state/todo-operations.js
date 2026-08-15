/**
 * @fileoverview Todo Operations Manager - Core CRUD Operations
 * @description Provides core operations for managing todos including add, update, trash, restore, and delete
 * @module todo-operations
 */

import { TodosPersistence, TrashPersistence } from "./data-persistence.js";
import {
  createTodoWithId,
  findTodoById,
  findTrashedTodoById,
  findTodoToDelete,
} from "./todo-helpers.js";
import { TodoServerSync } from "./todo-server-sync.js";
import { debugLog } from "./../utils/logger.js";

export const TodoOperations = {
  /**
   * Adds a todo (with server sync for users)
   * @param {Object} appState - Application state object
   * @param {Object} todo - Todo object
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  async add(appState, todo, notifyListeners) {
    const todoWithId = createTodoWithId(todo);
    this.addTodoLocally(appState, todoWithId, notifyListeners);
    await TodoServerSync.syncTodoToServer(appState, todoWithId, notifyListeners);
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
   * Updates an existing todo (with server sync for users)
   * @param {Object} appState - Application state object
   * @param {string} todoId - Todo ID to update
   * @param {Object} updates - Todo updates
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  async update(appState, todoId, updates, notifyListeners) {
    this.updateTodoLocally(appState, todoId, updates, notifyListeners);
    await TodoServerSync.handleUpdateServerSync(appState, todoId, appState.sessionType);
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
    debugLog(`trashTodo called with ID: ${todoId}, type: ${typeof todoId}`);
    const todo = findTodoById(appState, todoId);
    debugLog(`Found todo:`, todo);

    if (todo) {
      this.moveTodoToTrashLocally(appState, todoId, todo, notifyListeners);
      await TodoServerSync.handleTrashServerSync(todo, todoId, appState.sessionType);
    }
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
    appState.trashedTodos = [...appState.trashedTodos, { ...todo, trashedAt: Date.now() }];

    TodosPersistence.save(appState.todos, appState.sessionType);
    TrashPersistence.save(appState.trashedTodos, appState.sessionType);

    debugLog(
      `Todo ${todoId} moved to trash, notifying ${appState.listeners?.length || 0} listeners`
    );
    notifyListeners();
  },

  /**
   * Restores a todo from trash (with server sync for users)
   * @param {Object} appState - Application state object
   * @param {string} todoId - Todo ID to restore
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  async restore(appState, todoId, notifyListeners) {
    const todo = findTrashedTodoById(appState, todoId);

    if (todo) {
      this.restoreTodoLocally(appState, todoId, todo, notifyListeners);
      await TodoServerSync.handleRestoreServerSync(todo, todoId, appState.sessionType);
    }
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
   * Permanently deletes a todo from trash (with server sync for users)
   * @param {Object} appState - Application state object
   * @param {string} todoId - Todo ID to delete permanently
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  async delete(appState, todoId, notifyListeners) {
    const todoToDelete = findTodoToDelete(appState, todoId);

    if (!todoToDelete) return;

    this.deleteTodoLocally(appState, todoId, notifyListeners);
    await TodoServerSync.handleDeleteServerSync(todoToDelete, todoId, appState.sessionType);
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
   * Empties the entire trash by deleting all trashed todos permanently
   * @param {Object} appState - Application state object
   * @param {Function} notifyListeners - Function to notify state listeners
   */
  async emptyTrash(appState, notifyListeners) {
    debugLog(`Emptying trash with ${appState.trashedTodos.length} todos`);

    await TodoServerSync.handleEmptyTrashServerSync(appState);
    this.emptyTrashLocally(appState, notifyListeners);
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
