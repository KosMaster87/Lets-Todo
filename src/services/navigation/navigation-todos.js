// lets-todo-app/src/services/navigation-todos.js

import { VIEWS } from "./../../utils/constants.js";
import { navigateToView } from "./navigation.js";
import { showMessage } from "./navigation-action-buttons.js";
import {
  validateTodoTitle,
  validateTodoContent,
  validateTodoContentValues,
} from "./../crud/todo-validation.js";
import { getTodoContentFromDOM } from "./../crud/todo-content.js";
import { processTodoSave } from "./../crud/todo-save.js";
import {
  initializeFormState,
  resetFormState,
  resetBookmarkUI,
} from "./../crud/todo-form.js";
import { setupTodosActionButtons } from "./../crud/todo-action-setup.js";

let currentBookmarkState = false;
let currentCompletedState = false;

/**
 * Sets up all navigation event handlers for the todo view (both new and edit).
 */
export function setupTodosNavigation() {
  setupTodosMenuNavigation();
  setupTodosContentEditableHandlers();
  setupTodosActionButtonsWrapper();
  initializeBookmarkState();
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
 * Sets up event handlers for contenteditable title and content fields.
 * Handles validation, input changes, placeholder behavior, and key events.
 */
function setupTodosContentEditableHandlers() {
  const titleElement = document.getElementById("todoDisplayTitle");
  const contentElement = document.getElementById("todoContentDisplay");

  if (titleElement) {
    titleElement.addEventListener("blur", validateTodoTitle);
    titleElement.addEventListener("input", handleContentChange);
    titleElement.addEventListener("focus", handlePlaceholderFocus);
    titleElement.addEventListener("blur", handlePlaceholderBlur);
  }

  if (contentElement) {
    contentElement.addEventListener("blur", validateTodoContent);
    contentElement.addEventListener("input", handleContentChange);
    contentElement.addEventListener("focus", handlePlaceholderFocus);
    contentElement.addEventListener("blur", handlePlaceholderBlur);
    contentElement.addEventListener("keydown", handleKeyDown);
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
 * Handles content change events in the todo contenteditable fields.
 * @param {InputEvent} event - The input event
 */
function handleContentChange(event) {
  // Auto-save functionality could be added here
  // console.log("Content changed:", event.target.textContent);
}

/**
 * Handles placeholder focus events in the todo contenteditable fields.
 * @param {FocusEvent} event - The focus event
 */
function handlePlaceholderFocus(event) {
  const element = event.target;
  if (element.textContent.trim() === "") {
    element.classList.add("focused");
  }
}

/**
 * Handles placeholder blur events in the todo contenteditable fields.
 * @param {FocusEvent} event - The focus event
 */
function handlePlaceholderBlur(event) {
  const element = event.target;
  element.classList.remove("focused");

  if (element.textContent.trim() === "") {
    element.classList.add("empty");
  } else {
    element.classList.remove("empty");
  }
}

/**
 * Handles key down events in the todo contenteditable fields.
 * @param {KeyboardEvent} event - The key down event
 * @returns {void}
 */
function handleKeyDown(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    return; // Normal behavior
  }
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

  if (!validateTodoTitle() || !validateTodoContent()) {
    showMessage("Bitte korrigiere die Eingabefehler.", "error");
    return;
  }

  const domContent = getTodoContentFromDOM();
  if (
    !domContent ||
    !validateTodoContentValues(domContent.title, domContent.content)
  ) {
    return;
  }

  processTodoSave(domContent, currentCompletedState, currentBookmarkState);
}
