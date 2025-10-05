// lets-todo-app/src/services/navigation-todos-list.js

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
 * Sets up all navigation event handlers for todos list.
 */
export function setupTodosListNavigation() {
  setupFilterButtonNavigation();
  setupCancelButtonNavigation();
  setupTodoActionsNavigationWrapper();
  initializeFilterUI();
}

/**
 * Sets up the filter button to cycle through filter modes and re-render the todos list.
 */
function setupFilterButtonNavigation() {
  const filterBtn = document.getElementById("todosListFilterBtn");
  if (filterBtn) {
    filterBtn.addEventListener("click", handleFilterToggle);
  }
}

/**
 * Initializes the filter UI with default state.
 */
function initializeFilterUI() {
  updateFilterButtonText(todosListFilterMode);
}

/**
 * Handles filter toggle action.
 */
function handleFilterToggle() {
  todosListFilterMode = getNextFilterMode(todosListFilterMode);
  updateFilterButtonText(todosListFilterMode);
  renderTodosListWithFilter(todosListFilterMode);
}

/**
 * Sets up the cancel button to navigate back to the dashboard.
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
 * Sets up event delegation for todo actions using the events service.
 */
function setupTodoActionsNavigationWrapper() {
  const handlers = {
    [TODO_ACTIONS.OPEN]: handleOpenAction,
    [TODO_ACTIONS.BOOKMARK]: handleBookmarkAction,
    [TODO_ACTIONS.DONE]: handleDoneAction,
    [TODO_ACTIONS.SHARE]: handleShareAction,
    [TODO_ACTIONS.COPY]: handleCopyAction,
    [TODO_ACTIONS.DELETE]: handleDeleteAction,
  };

  setupTodoActionsNavigation("todosList", handlers);
}

/**
 * Wrapper functions that connect UI events to CRUD services
 */

function handleOpenAction(todoId) {
  handleOpenTodo(todoId, (error) => {
    console.error("Failed to open todo:", error);
  });
}

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
