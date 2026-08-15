/**
 * @fileoverview Todo Form State Management
 * @description Manages state and UI for the todo form (create/edit)
 * @module todo-form
 */

import { getCurrentTodo } from "./../../state/main-state.js";

// ###############################################################
// Form State Management
// ###############################################################

/**
 * Clears form after new todo creation
 * @param {HTMLElement} titleElement - Title DOM element
 * @param {HTMLElement} contentElement - Content DOM element
 */
export const clearFormAfterNewTodo = (titleElement, contentElement) => {
  titleElement.textContent = "New Todo";
  contentElement.textContent = "";
  resetBookmarkUI();
};

/**
 * Gets state values for edit mode
 * @param {Object} todo - Current todo object
 * @returns {Object} Edit mode state values
 */
const getEditModeState = (todo) => ({
  bookmarkState: todo.bookmarked || false,
  completedState: todo.completed || false,
});

/**
 * Gets state values for create mode
 * @returns {Object} Create mode state values
 */
const getCreateModeState = () => ({
  bookmarkState: false,
  completedState: false,
});

/**
 * Initializes bookmark and completion state based on current todo
 * @returns {Object} Object with initialized state values
 */
export const initializeFormState = () => {
  const currentTodo = getCurrentTodo();

  if (currentTodo && currentTodo.id) {
    return getEditModeState(currentTodo);
  }

  return getCreateModeState();
};

/**
 * Resets bookmark and completion state to defaults
 * @returns {Object} Object with reset state values
 */
export const resetFormState = () => ({
  bookmarkState: false,
  completedState: false,
});

// ###############################################################
// UI State Management
// ###############################################################

/**
 * Updates todo status badge in the DOM
 * @param {boolean} completed - Whether todo is completed
 */
export const updateTodoStatusBadge = (completed) => {
  const statusBadge = document.querySelector(".todo-status-badge");
  if (statusBadge) {
    statusBadge.className = "todo-status-badge " + (completed ? "completed" : "pending");
    statusBadge.textContent = completed ? "Done" : "New";
  }
};

/**
 * Resets all bookmark and completion UI elements
 */
export const resetBookmarkUI = () => {
  const bookmarkBtn = document.getElementById("bookmarkViewBtn");
  if (bookmarkBtn) {
    bookmarkBtn.classList.remove("bookmarked");
  }

  const doneBtn = document.getElementById("doneTodoBtn");
  if (doneBtn) {
    doneBtn.classList.remove("completed");
  }

  updateTodoStatusBadge(false);
};

/**
 * Updates bookmark button state
 * @param {HTMLElement} button - Bookmark button element
 * @param {boolean} isBookmarked - Bookmark state
 * @returns {void}
 */
const updateBookmarkButtonState = (button, isBookmarked) => {
  if (isBookmarked) {
    button.classList.add("bookmarked");
  } else {
    button.classList.remove("bookmarked");
  }
};

/**
 * Updates done button state
 * @param {HTMLElement} button - Done button element
 * @param {boolean} isCompleted - Completed state
 * @returns {void}
 */
const updateDoneButtonState = (button, isCompleted) => {
  if (isCompleted) {
    button.classList.add("completed");
  } else {
    button.classList.remove("completed");
  }
};

/**
 * Initializes UI state for buttons based on current todo state
 * @param {boolean} bookmarkState - Current bookmark state
 * @param {boolean} completedState - Current completed state
 * @returns {void}
 */
export const initializeButtonsUI = (bookmarkState, completedState) => {
  const bookmarkBtn = document.getElementById("bookmarkViewBtn");
  const doneBtn = document.getElementById("doneTodoBtn");

  if (bookmarkBtn) {
    updateBookmarkButtonState(bookmarkBtn, bookmarkState);
  }

  if (doneBtn) {
    updateDoneButtonState(doneBtn, completedState);
  }

  updateTodoStatusBadge(completedState);
};
