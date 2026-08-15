/**
 * @fileoverview Todo Save Operations
 * @description Handles the logic for saving and updating todos in the application.
 * @module todo-save
 */

import { addTodo, updateTodo, getCurrentTodo } from "./../../state/main-state.js";
import { navigateToView } from "./../navigation/navigation.js";
import { VIEWS } from "./../../utils/constants.js";
import { showMessage } from "./../../utils/ui-helpers/message-helpers.js";
import { clearFormAfterNewTodo } from "./todo-form.js";

// ###############################################################
// Todo Object Creation
// ###############################################################

/**
 * Creates update object for existing todo
 * @param {string} title - Todo title
 * @param {string} content - Todo content
 * @param {boolean} currentCompletedState - Current completed state
 * @param {boolean} currentBookmarkState - Current bookmark state
 * @returns {Object} Update object
 */
export const createTodoUpdate = (title, content, currentCompletedState, currentBookmarkState) => ({
  title: title || "Neue Todo",
  content: content,
  lastModified: new Date().toISOString(),
  completed: currentCompletedState,
  bookmarked: currentBookmarkState,
});

/**
 * Creates new todo object
 * @param {string} title - Todo title
 * @param {string} content - Todo content
 * @param {boolean} currentCompletedState - Current completed state
 * @param {boolean} currentBookmarkState - Current bookmark state
 * @returns {Object} New todo object
 */
export const createNewTodo = (title, content, currentCompletedState, currentBookmarkState) => ({
  title: title || "Neue Todo",
  content: content,
  created: new Date(),
  completed: currentCompletedState,
  bookmarked: currentBookmarkState,
});

// ###############################################################
// Save Process Management
// ###############################################################

/**
 * Handles successful save navigation
 */
export const handleSuccessfulSave = () => {
  setTimeout(() => {
    navigateToView(VIEWS.DASHBOARD);
  }, 1500);
};

/**
 * Handles updating existing todo
 * @param {Object} currentTodo - Current todo object
 * @param {string} title - Todo title
 * @param {string} content - Todo content
 * @param {boolean} completedState - Completed state
 * @param {boolean} bookmarkState - Bookmark state
 * @returns {void}
 */
const handleTodoUpdate = (currentTodo, title, content, completedState, bookmarkState) => {
  updateTodo(currentTodo.id, createTodoUpdate(title, content, completedState, bookmarkState));
  showMessage("Todo erfolgreich aktualisiert!");
};

/**
 * Handles creating new todo
 * @param {string} title - Todo title
 * @param {string} content - Todo content
 * @param {boolean} completedState - Completed state
 * @param {boolean} bookmarkState - Bookmark state
 * @param {HTMLElement} titleElement - Title DOM element
 * @param {HTMLElement} contentElement - Content DOM element
 * @returns {void}
 */
const handleTodoCreation = (
  title,
  content,
  completedState,
  bookmarkState,
  titleElement,
  contentElement
) => {
  addTodo(createNewTodo(title, content, completedState, bookmarkState));
  showMessage("Neue Todo erfolgreich erstellt!");
  clearFormAfterNewTodo(titleElement, contentElement);
};

/**
 * Handles save operation errors
 * @param {Error} error - Error object
 * @returns {void}
 */
const handleSaveError = (error) => {
  showMessage("Fehler beim Speichern des Todos.", "error");
  console.error("Save error:", error);
};

/**
 * Executes save operation based on todo state
 * @param {Object} currentTodo - Current todo object
 * @param {Object} domContent - DOM content object
 * @param {boolean} completedState - Completed state
 * @param {boolean} bookmarkState - Bookmark state
 * @returns {void}
 */
const executeSaveOperation = (currentTodo, domContent, completedState, bookmarkState) => {
  const { titleElement, contentElement, title, content } = domContent;

  if (currentTodo && currentTodo.id) {
    handleTodoUpdate(currentTodo, title, content, completedState, bookmarkState);
  } else {
    handleTodoCreation(title, content, completedState, bookmarkState, titleElement, contentElement);
  }
};

/**
 * Processes the actual todo save logic
 * @param {Object} domContent - DOM content object
 * @param {boolean} currentCompletedState - Current completed state
 * @param {boolean} currentBookmarkState - Current bookmark state
 * @returns {void}
 */
export const processTodoSave = (domContent, currentCompletedState, currentBookmarkState) => {
  const currentTodo = getCurrentTodo();

  try {
    executeSaveOperation(currentTodo, domContent, currentCompletedState, currentBookmarkState);
    handleSuccessfulSave();
  } catch (error) {
    handleSaveError(error);
  }
};
