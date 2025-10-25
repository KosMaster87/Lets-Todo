/**
 * @fileoverview DOM element selectors and validation utilities for todo components
 * @module dom-selectors
 */

/**
 * Gets the todo title element
 * @returns {HTMLElement|null} The title element or null if not found
 */
export const getTodoTitleElement = () => {
  return document.getElementById("todoDisplayTitle");
};

/**
 * Gets the todo content element
 * @returns {HTMLElement|null} The content element or null if not found
 */
export const getTodoContentElement = () => {
  return document.getElementById("todoContentDisplay");
};

/**
 * Gets both todo elements at once
 * @returns {Object} Object with titleElement and contentElement properties
 */
export const getTodoElements = () => {
  return {
    titleElement: getTodoTitleElement(),
    contentElement: getTodoContentElement(),
  };
};

/**
 * Checks if both todo elements exist
 * @returns {boolean} True if both elements exist, false otherwise
 */
export const todoElementsExist = () => {
  const { titleElement, contentElement } = getTodoElements();
  return titleElement !== null && contentElement !== null;
};

/**
 * Gets the current bookmark state from DOM
 * @returns {boolean} True if bookmarked
 */
export const getBookmarkStateFromDOM = () => {
  const bookmarkBtn = document.getElementById("bookmarkViewBtn");
  return bookmarkBtn ? bookmarkBtn.classList.contains("bookmarked") : false;
};

/**
 * Gets the current completed state from DOM
 * @returns {boolean} True if completed
 */
export const getCompletedStateFromDOM = () => {
  const doneBtn = document.getElementById("doneTodoBtn");
  return doneBtn ? doneBtn.classList.contains("completed") : false;
};

// ###############################################################
// View and Button Existence Validation
// ###############################################################

/**
 * Checks for todos view presence in DOM
 * @returns {boolean} True if todos view is active
 */
export const hasTodosView = () => {
  return !!document.querySelector('[data-view="todos"]');
};

/**
 * Checks for todo-view presence in DOM
 * @returns {boolean} True if todo-view is active
 */
export const hasTodoView = () => {
  return !!document.querySelector('[data-view="todo-view"]');
};

/**
 * Checks if we're in a valid todo view
 * @returns {boolean} True if in todos or todo-view
 */
export const isInTodoView = () => {
  return hasTodosView() || hasTodoView();
};

/**
 * Checks if bookmark button exists in DOM
 * @returns {boolean} True if bookmark button is available
 */
export const hasBookmarkButton = () => {
  return !!document.getElementById("bookmarkViewBtn");
};

/**
 * Checks if done button exists in DOM
 * @returns {boolean} True if done button is available
 */
export const hasDoneButton = () => {
  return !!document.getElementById("doneTodoBtn");
};

/**
 * Checks if action buttons are available in DOM
 * @returns {boolean} True if any action buttons are available
 */
export const areActionButtonsAvailable = () => {
  return hasBookmarkButton() || hasDoneButton();
};
