/**
 * @fileoverview Todo Content CRUD Operations
 * @module todo-content
 */

import { getTodoElements } from "./../../utils/dom-selectors.js";

/**
 * Gets todo content from DOM elements
 * @returns {Object|null} Content object with elements and values, or null if elements not found
 */
export const getTodoContentFromDOM = () => {
  const { titleElement, contentElement } = getTodoElements();

  if (!titleElement || !contentElement) {
    return null;
  }

  return {
    titleElement,
    contentElement,
    title: titleElement.textContent.trim(),
    content: contentElement.textContent.trim(),
    titlePlaceholder: titleElement.getAttribute("data-placeholder"),
    contentPlaceholder: contentElement.getAttribute("data-placeholder"),
  };
};

/**
 * Gets current content for action button handlers
 * @returns {Object} Object with title and content
 */
export const getContentForActions = () => {
  const { titleElement, contentElement } = getTodoElements();

  const title = titleElement ? titleElement.textContent.trim() : "";
  const content = contentElement ? contentElement.textContent.trim() : "";

  console.log("getContentForActions called:", {
    title,
    content,
    titleElement,
    contentElement,
  });

  return { title, content };
};

/**
 * Clears todo content for delete action
 */
export const clearTodoContent = () => {
  const { titleElement, contentElement } = getTodoElements();

  if (titleElement) titleElement.textContent = "Neue Todo";
  if (contentElement) contentElement.textContent = "";
};
