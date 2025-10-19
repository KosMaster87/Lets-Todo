/**
 * @fileoverview Todo Save Operations
 * @module todo-save
 */

import {
  addTodo,
  updateTodo,
  getCurrentTodo,
} from "./../../state/main-state.js";
import { navigateToView } from "./../navigation/navigation.js";
import { VIEWS } from "./../../utils/constants.js";
import { showMessage } from "./../navigation/navigation-action-buttons.js";
import { clearFormAfterNewTodo } from "./todo-form.js";

/**
 * Creates update object for existing todo
 * @param {string} title - Todo title
 * @param {string} content - Todo content
 * @param {boolean} currentCompletedState - Current completed state
 * @param {boolean} currentBookmarkState - Current bookmark state
 * @returns {Object} Update object
 */
export const createTodoUpdate = (
  title,
  content,
  currentCompletedState,
  currentBookmarkState
) => ({
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
export const createNewTodo = (
  title,
  content,
  currentCompletedState,
  currentBookmarkState
) => ({
  title: title || "Neue Todo",
  content: content,
  created: new Date(),
  completed: currentCompletedState,
  bookmarked: currentBookmarkState,
});

/**
 * Handles successful save navigation
 */
export const handleSuccessfulSave = () => {
  setTimeout(() => {
    navigateToView(VIEWS.DASHBOARD);
  }, 1500);
};

/**
 * Processes the actual todo save logic
 * @param {Object} domContent - DOM content object
 * @param {boolean} currentCompletedState - Current completed state
 * @param {boolean} currentBookmarkState - Current bookmark state
 */
export const processTodoSave = (
  domContent,
  currentCompletedState,
  currentBookmarkState
) => {
  const { titleElement, contentElement, title, content } = domContent;
  const currentTodo = getCurrentTodo();

  try {
    if (currentTodo && currentTodo.id) {
      updateTodo(
        currentTodo.id,
        createTodoUpdate(
          title,
          content,
          currentCompletedState,
          currentBookmarkState
        )
      );
      showMessage("Todo erfolgreich aktualisiert!");
    } else {
      addTodo(
        createNewTodo(
          title,
          content,
          currentCompletedState,
          currentBookmarkState
        )
      );
      showMessage("Neue Todo erfolgreich erstellt!");
      clearFormAfterNewTodo(titleElement, contentElement);
    }
    handleSuccessfulSave();
  } catch (error) {
    showMessage("Fehler beim Speichern des Todos.", "error");
    console.error("Save error:", error);
  }
};
