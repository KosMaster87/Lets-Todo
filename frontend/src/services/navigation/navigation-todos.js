/**
 * @fileoverview Navigation event handling for individual todo view (create/edit)
 * @description Sets up navigation and action handlers for the todo view
 * @module navigation-todos
 */

import { navigateToView } from "./navigation.js";
import { VIEWS } from "./../../utils/constants.js";
import {
  setupContentEditableHandlers,
  initializePlaceholders,
} from "./../../utils/contenteditable-handler.js";
import { validateTodoContentValues } from "./../crud/todo-validation.js";
import { getTodoContentFromDOM } from "./../crud/todo-content.js";
import { processTodoSave } from "./../crud/todo-save.js";
import { setupTodosActionButtons } from "./../crud/todo-action-setup.js";
import { initializeFormState, resetFormState, resetBookmarkUI } from "./../crud/todo-form.js";

let currentBookmarkState = false;
let currentCompletedState = false;

/**
 * @function setupTodosNavigation
 * @description Sets up all navigation event handlers for the todo view (both new and edit)
 * @returns {void} No return value - performs event handler registration
 */
export function setupTodosNavigation() {
  setupTodosMenuNavigation();
  setupContentEditableHandlers();
  setupTodosActionButtonsWrapper();
  initializeBookmarkState();
  initializePlaceholders();
}

/**
 * @function setupTodosMenuNavigation
 * @description Sets up navigation for the todos menu (cancel and save buttons)
 * @returns {void} No return value - performs event listener registration
 */
function setupTodosMenuNavigation() {
  const cancelBtn = document.getElementById("todosCancelBtn");
  const saveBtn = document.getElementById("todosSaveBtn");

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      navigateToView(VIEWS.DASHBOARD);
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", handleSaveTodo);
  }
}

/**
 * @function setupTodosActionButtonsWrapper
 * @description Sets up action buttons using the specialized todo-action-setup service
 * @returns {void} No return value - performs action button configuration
 */
function setupTodosActionButtonsWrapper() {
  const stateHandlers = createStateHandlers();
  setupTodosActionButtons(
    stateHandlers.bookmarkHandler,
    stateHandlers.completedHandler,
    resetBookmarkState
  );
}

/**
 * @function createStateHandlers
 * @description Creates state update handlers for bookmark and completed states
 * @returns {Object} State handlers configuration object
 */
const createStateHandlers = () => ({
  bookmarkHandler: (state) => {
    currentBookmarkState = state;
  },
  completedHandler: (state) => {
    currentCompletedState = state;
  },
});

/**
 * @function initializeBookmarkState
 * @description Initializes the bookmark and completed states from the form state
 * @returns {void} No return value - performs state initialization
 */
function initializeBookmarkState() {
  const state = initializeFormState();
  currentBookmarkState = state.bookmarkState;
  currentCompletedState = state.completedState;
}

/**
 * @function resetBookmarkState
 * @description Resets bookmark state after delete operation
 * @returns {void} No return value - performs state reset
 */
function resetBookmarkState() {
  const state = resetFormState();
  currentBookmarkState = state.bookmarkState;
  currentCompletedState = state.completedState;
  resetBookmarkUI();
}

/**
 * @function handleSaveTodo
 * @description Handles the save todo action with validation and processing
 * @param {Event} event - The event object from save button click
 * @returns {void} No return value - performs todo save operation
 */
function handleSaveTodo(event) {
  event.preventDefault();

  const domContent = getTodoContentFromDOM();
  if (!isValidTodoContent(domContent)) {
    return;
  }

  processTodoSave(domContent, currentCompletedState, currentBookmarkState);
}

/**
 * @function isValidTodoContent
 * @description Validates todo content from DOM
 * @param {Object|null} domContent - Content object from DOM
 * @returns {boolean} True if content is valid, false otherwise
 */
const isValidTodoContent = (domContent) => {
  return (
    domContent &&
    validateTodoContentValues(
      domContent.title,
      domContent.content,
      domContent.titlePlaceholder,
      domContent.contentPlaceholder
    )
  );
};
