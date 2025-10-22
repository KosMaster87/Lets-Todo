/**
 * @fileoverview DOM element selectors for todo components
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
