/**
 * @fileoverview Todo Action Setup Module
 * @module todo-action-setup
 */

import { getCurrentTodo, trashTodo } from "./../../state/main-state.js";
import { VIEWS } from "./../../utils/constants.js";
import { navigateToView } from "./../navigation/navigation.js";
import {
  setupActionButtons,
  createBookmarkToggleHandler,
  createCompletedToggleHandler,
  createShareHandler,
  createCopyHandler,
  createDeleteHandler,
  createContentClearHandler,
} from "./../navigation/navigation-action-buttons.js";
import { updateTodoStatusBadge } from "./todo-form.js";
import { getContentForActions, clearTodoContent } from "./todo-content.js";

/**
 * Gets the current todo ID for action handlers
 * @returns {string|null} Current todo ID or null
 */
const getCurrentTodoId = () => {
  const currentTodo = getCurrentTodo();
  return currentTodo ? currentTodo.id : null;
};

/**
 * Handles todo deletion by moving to trash and navigating back
 */
const handleTodoTrash = () => {
  navigateToView(VIEWS.DASHBOARD);
};

/**
 * Creates appropriate delete handler based on context (new todo vs existing todo)
 * @param {Function} resetBookmarkState - Function to reset bookmark state
 * @returns {Function} Appropriate delete handler
 */
const createTodoDeleteHandler = (resetBookmarkState) => {
  const currentTodo = getCurrentTodo();

  if (currentTodo && currentTodo.id) {
    return createDeleteHandler(getCurrentTodoId, trashTodo, handleTodoTrash);
  } else {
    return createContentClearHandler(
      getContentForActions,
      clearTodoContent,
      resetBookmarkState
    );
  }
};

/**
 * Creates action button configuration object
 * @param {boolean} currentBookmarkState - Current bookmark state
 * @param {Function} setBookmarkState - Function to set bookmark state
 * @param {boolean} currentCompletedState - Current completed state
 * @param {Function} setCompletedState - Function to set completed state
 * @param {Function} resetBookmarkState - Function to reset bookmark state
 * @returns {Object} Action button configuration
 */
const createActionButtonConfig = (
  currentBookmarkState,
  setBookmarkState,
  currentCompletedState,
  setCompletedState,
  resetBookmarkState
) => ({
  bookmark: {
    elementId: "bookmarkViewBtn",
    handler: createBookmarkToggleHandler(
      () => currentBookmarkState,
      setBookmarkState,
      "bookmarkViewBtn"
    ),
  },
  done: {
    elementId: "doneTodoBtn",
    handler: createCompletedToggleHandler(
      () => currentCompletedState,
      (state) => {
        setCompletedState(state);
        updateTodoStatusBadge(state);
      },
      "doneTodoBtn"
    ),
  },
  share: {
    elementId: "shareTodoBtn",
    handler: createShareHandler(getContentForActions),
  },
  copy: {
    elementId: "copyTodoBtn",
    handler: createCopyHandler(getContentForActions),
  },
  delete: {
    elementId: "deleteTodoBtn",
    handler: createTodoDeleteHandler(resetBookmarkState),
  },
});

/**
 * Checks if we're in a valid todo view
 * @returns {boolean} True if in todos or todo-view
 */
const isInTodoView = () => {
  const isTodosView = document.querySelector('[data-view="todos"]');
  const isTodoView = document.querySelector('[data-view="todo-view"]');
  return !!(isTodosView || isTodoView);
};

/**
 * Checks if action buttons are available in DOM
 * @returns {boolean} True if buttons are available
 */
const areActionButtonsAvailable = () => {
  const bookmarkBtn = document.getElementById("bookmarkViewBtn");
  const doneBtn = document.getElementById("doneTodoBtn");
  return !!(bookmarkBtn || doneBtn);
};

/**
 * Sets up action buttons for todo views
 * @param {boolean} currentBookmarkState - Current bookmark state
 * @param {Function} setBookmarkState - Function to set bookmark state
 * @param {boolean} currentCompletedState - Current completed state
 * @param {Function} setCompletedState - Function to set completed state
 * @param {Function} resetBookmarkState - Function to reset bookmark state
 */
export const setupTodosActionButtons = (
  currentBookmarkState,
  setBookmarkState,
  currentCompletedState,
  setCompletedState,
  resetBookmarkState
) => {
  if (!isInTodoView()) {
    return;
  }

  if (!areActionButtonsAvailable()) {
    // console.log(
    //   "⏳ Action buttons not yet available in DOM - will retry later"
    // );
    return;
  }

  const actionButtonConfig = createActionButtonConfig(
    currentBookmarkState,
    setBookmarkState,
    currentCompletedState,
    setCompletedState,
    resetBookmarkState
  );

  setupActionButtons(actionButtonConfig);
};
