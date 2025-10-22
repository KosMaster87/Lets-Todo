/**
 * @fileoverview Navigation event handling for todos list view
 * @module navigation-todos-list
 */

import { VIEWS } from "./../../utils/constants.js";
import { navigateToView } from "./navigation.js";
import {
  TODOS_LIST_FILTER_MODES,
  getNextFilterMode,
  updateFilterButtonText,
  renderTodosListWithFilter,
} from "./../crud/todos-list-filter.js";
import {
  handleOpenTodo,
  handleBookmarkToggle,
  handleToggleDone,
  handleDeleteTodo,
} from "./../crud/todos-list-operations.js";
import {
  handleShareTodo,
  handleCopyTodo,
} from "./../crud/todos-list-sharing.js";
import {
  setupTodoActionsNavigation,
  TODO_ACTIONS,
} from "./../crud/todos-list-events.js";

let todosListFilterMode = TODOS_LIST_FILTER_MODES.ALL;

/**
 * @function setupTodosListNavigation
 * @description Sets up all navigation event handlers for todos list view
 * @returns {void} No return value - performs event handler registration
 */
export function setupTodosListNavigation() {
  setupFilterButtonNavigation();
  setupCancelButtonNavigation();
  setupTodoActionsNavigationWrapper();
  initializeFilterUI();
}

/**
 * @function setupFilterButtonNavigation
 * @description Sets up the filter button to cycle through filter modes and re-render
 * @returns {void} No return value - performs event listener registration
 */
function setupFilterButtonNavigation() {
  const filterBtn = document.getElementById("todosListFilterBtn");
  if (filterBtn) {
    filterBtn.addEventListener("click", handleFilterToggle);
  }
}

/**
 * @function initializeFilterUI
 * @description Initializes the filter UI with default state
 * @returns {void} No return value - performs UI initialization
 */
function initializeFilterUI() {
  updateFilterButtonText(todosListFilterMode);
}

/**
 * @function handleFilterToggle
 * @description Handles filter toggle action and re-renders list
 * @returns {void} No return value - performs filter state update and re-render
 */
function handleFilterToggle() {
  todosListFilterMode = getNextFilterMode(todosListFilterMode);
  updateFilterButtonText(todosListFilterMode);
  renderTodosListWithFilter(todosListFilterMode);
}

/**
 * @function setupCancelButtonNavigation
 * @description Sets up the cancel button to navigate back to dashboard
 * @returns {void} No return value - performs event listener registration
 */
function setupCancelButtonNavigation() {
  const cancelBtn = document.getElementById("todosListCancelBtn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      navigateToView(VIEWS.DASHBOARD);
    });
  }
}

/**
 * @function setupTodoActionsNavigationWrapper
 * @description Sets up event delegation for todo actions using the events service
 * @returns {void} No return value - performs action event delegation setup
 */
function setupTodoActionsNavigationWrapper() {
  const handlers = createActionHandlers();
  setupTodoActionsNavigation("todosList", handlers);
}

/**
 * @function createActionHandlers
 * @description Creates mapping of action types to handler functions
 * @returns {Object} Action handlers configuration object
 */
const createActionHandlers = () => ({
  [TODO_ACTIONS.OPEN]: handleOpenAction,
  [TODO_ACTIONS.BOOKMARK]: handleBookmarkAction,
  [TODO_ACTIONS.DONE]: handleDoneAction,
  [TODO_ACTIONS.SHARE]: handleShareAction,
  [TODO_ACTIONS.COPY]: handleCopyAction,
  [TODO_ACTIONS.DELETE]: handleDeleteAction,
});

/**
 * @section Action Handler Functions
 * @description Wrapper functions that connect UI events to CRUD services
 */

/**
 * @function handleOpenAction
 * @description Handles opening a todo with error handling
 * @param {string} todoId - ID of the todo to open
 * @returns {void} No return value - performs todo opening operation
 */
function handleOpenAction(todoId) {
  handleOpenTodo(todoId, (error) => {
    console.error("Failed to open todo:", error);
  });
}

/**
 * @function handleBookmarkAction
 * @description Handles bookmark toggle with UI refresh and error handling
 * @param {string} todoId - ID of the todo to bookmark/unbookmark
 * @returns {void} No return value - performs bookmark toggle operation
 */
function handleBookmarkAction(todoId) {
  handleBookmarkToggle(
    todoId,
    (newState) => {
      renderTodosListWithFilter(todosListFilterMode);
    },
    (error) => {
      console.error("Failed to toggle bookmark:", error);
    }
  );
}

/**
 * @function handleDoneAction
 * @description Handles done state toggle with UI refresh and error handling
 * @param {string} todoId - ID of the todo to mark done/undone
 * @returns {void} No return value - performs done state toggle operation
 */
function handleDoneAction(todoId) {
  handleToggleDone(
    todoId,
    (newState) => {
      renderTodosListWithFilter(todosListFilterMode);
    },
    (error) => {
      console.error("Failed to toggle done state:", error);
    }
  );
}

/**
 * @function handleShareAction
 * @description Handles todo sharing with success logging and error handling
 * @param {string} todoId - ID of the todo to share
 * @returns {void} No return value - performs todo sharing operation
 */
function handleShareAction(todoId) {
  handleShareTodo(
    todoId,
    (message) => {
      console.log(message);
    },
    (error) => {
      console.error("Failed to share todo:", error);
    }
  );
}

/**
 * @function handleCopyAction
 * @description Handles todo copying with success logging and error handling
 * @param {string} todoId - ID of the todo to copy
 * @returns {void} No return value - performs todo copying operation
 */
function handleCopyAction(todoId) {
  handleCopyTodo(
    todoId,
    (message) => {
      console.log(message);
    },
    (error) => {
      console.error("Failed to copy todo:", error);
    }
  );
}

/**
 * @function handleDeleteAction
 * @description Handles todo deletion with UI refresh and error handling
 * @param {string} todoId - ID of the todo to delete
 * @returns {void} No return value - performs todo deletion operation
 */
function handleDeleteAction(todoId) {
  handleDeleteTodo(
    todoId,
    (message) => {
      renderTodosListWithFilter(todosListFilterMode);
      console.log(message);
    },
    (error) => {
      console.error(error);
    }
  );
}

export { todosListFilterMode };
