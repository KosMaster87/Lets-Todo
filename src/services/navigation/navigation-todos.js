// lets-todo-app/src/services/navigation-todos.js

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
import {
  initializeFormState,
  resetFormState,
  resetBookmarkUI,
} from "./../crud/todo-form.js";

let currentBookmarkState = false;
let currentCompletedState = false;

/**
 * Sets up all navigation event handlers for the todo view (both new and edit).
 */
export function setupTodosNavigation() {
  setupTodosMenuNavigation();
  setupContentEditableHandlers();
  setupTodosActionButtonsWrapper();
  initializeBookmarkState();
  initializePlaceholders();
}

/**
 * Sets up navigation for the todos menu (cancel and save buttons).
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
 * Sets up action buttons using the specialized todo-action-setup service.
 */
function setupTodosActionButtonsWrapper() {
  setupTodosActionButtons(
    currentBookmarkState,
    (state) => {
      currentBookmarkState = state;
    },
    currentCompletedState,
    (state) => {
      currentCompletedState = state;
    },
    resetBookmarkState
  );
}

/**
 * Initializes the bookmark and completed states from the form state.
 */
function initializeBookmarkState() {
  const state = initializeFormState();
  currentBookmarkState = state.bookmarkState;
  currentCompletedState = state.completedState;
}

/**
 * Resets bookmark state after delete
 */
function resetBookmarkState() {
  const state = resetFormState();
  currentBookmarkState = state.bookmarkState;
  currentCompletedState = state.completedState;
  resetBookmarkUI();
}

/**
 * Handles the save todo action
 * @param {Event} event - The event object
 * @returns {void}
 */
function handleSaveTodo(event) {
  event.preventDefault();

  const domContent = getTodoContentFromDOM();
  if (
    !domContent ||
    !validateTodoContentValues(
      domContent.title,
      domContent.content,
      domContent.titlePlaceholder,
      domContent.contentPlaceholder
    )
  ) {
    return;
  }

  processTodoSave(domContent, currentCompletedState, currentBookmarkState);
}
