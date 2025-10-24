/**
 * @fileoverview Todo List Events Handling
 * @module todos-list-events
 */

// ###############################################################
// Action Constants and Selectors
// ###############################################################

/**
 * Action type constants for better maintainability
 */
export const TODO_ACTIONS = {
  OPEN: "open",
  BOOKMARK: "bookmark",
  DONE: "done",
  SHARE: "share",
  COPY: "copy",
  DELETE: "delete",
};

/**
 * CSS selector mappings for todo actions
 */
const ACTION_SELECTORS = {
  [TODO_ACTIONS.OPEN]: [".todo-title", ".todo-content-display"],
  [TODO_ACTIONS.BOOKMARK]: [".bookmark-view-btn"],
  [TODO_ACTIONS.DONE]: [".done-todo-btn"],
  [TODO_ACTIONS.SHARE]: [".share-todo-btn"],
  [TODO_ACTIONS.COPY]: [".copy-todo-btn"],
  [TODO_ACTIONS.DELETE]: [".delete-todo-btn"],
};

// ###############################################################
// Element Analysis Functions
// ###############################################################

/**
 * Gets the todo ID from a DOM element
 * @param {Element} element - DOM element
 * @returns {string|null} Todo ID or null
 */
export const getTodoIdFromElement = (element) => {
  const todoDisplay = element.closest(".todo-display");
  return todoDisplay?.dataset?.todoId || null;
};

/**
 * Determines which action was triggered based on the clicked element
 * @param {Element} target - Clicked element
 * @returns {string|null} Action type or null
 */
export const getActionFromTarget = (target) => {
  for (const [action, selectors] of Object.entries(ACTION_SELECTORS)) {
    for (const selector of selectors) {
      if (target.closest(selector)) {
        return action;
      }
    }
  }
  return null;
};

// ###############################################################
// Event Handler Creation
// ###############################################################

/**
 * Validates and extracts event data
 * @param {Element} target - Event target element
 * @returns {Object|null} Event data or null if invalid
 */
const validateAndExtractEventData = (target) => {
  const action = getActionFromTarget(target);
  if (!action) return null;

  const todoId = getTodoIdFromElement(target);
  if (!todoId) {
    console.warn("No todo ID found for action:", action);
    return null;
  }

  return { action, todoId };
};

/**
 * Executes handler for given action
 * @param {Object} handlers - Handler functions object
 * @param {string} action - Action type
 * @param {string} todoId - Todo ID
 * @returns {void}
 */
const executeHandler = (handlers, action, todoId) => {
  const handler = handlers[action];
  if (handler && typeof handler === "function") {
    handler(todoId);
  } else {
    console.warn("No handler found for action:", action);
  }
};

/**
 * Creates a unified event handler for all todo actions
 * @param {Object} handlers - Object containing handler functions for each action
 * @returns {Function} Event handler function
 */
export const createTodoActionsHandler = (handlers) => {
  return (event) => {
    const eventData = validateAndExtractEventData(event.target);
    if (!eventData) return;

    executeHandler(handlers, eventData.action, eventData.todoId);
  };
};

// ###############################################################
// Event Setup Functions
// ###############################################################

/**
 * Sets up event delegation for todo actions
 * @param {string} containerId - ID of the todos container
 * @param {Object} handlers - Handler functions for each action
 * @returns {boolean} True if setup was successful
 */
export const setupTodoActionsNavigation = (containerId, handlers) => {
  const container = document.getElementById(containerId);
  if (!container) {
    return false; // Silent fail - container not available yet (probably not in todos-list view)
  }

  const eventHandler = createTodoActionsHandler(handlers);
  container.addEventListener("click", eventHandler);

  return true;
};
