/**
 * @fileoverview Todo Content CRUD Operations
 * @description Functions for managing todo content in the DOM
 * @module todo-content
 */

import { getTodoElements } from "./../../utils/dom-selectors.js";

// ###############################################################
// DOM Element Validation Utilities
// ###############################################################

/**
 * Validates that todo elements exist
 * @param {Object} elements - Todo elements object
 * @returns {boolean} True if elements are valid
 */
const validateTodoElements = (elements) => {
  return elements.titleElement && elements.contentElement;
};

// ###############################################################
// Content Extraction Utilities
// ###############################################################

/**
 * Creates content object from DOM elements
 * @param {HTMLElement} titleElement - Title element
 * @param {HTMLElement} contentElement - Content element
 * @returns {Object} Content object with elements and values
 */
const createContentObject = (titleElement, contentElement) => {
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
 * Gets todo content from DOM elements
 * @returns {Object|null} Content object with elements and values, or null if elements not found
 */
export const getTodoContentFromDOM = () => {
  const elements = getTodoElements();

  if (!validateTodoElements(elements)) {
    return null;
  }

  return createContentObject(elements.titleElement, elements.contentElement);
};

/**
 * Extracts text content from element
 * @param {HTMLElement|null} element - DOM element
 * @returns {string} Text content or empty string
 */
const getElementText = (element) => {
  return element ? element.textContent.trim() : "";
};

/**
 * Logs content extraction for debugging
 * @param {string} title - Title content
 * @param {string} content - Content text
 * @param {HTMLElement} titleElement - Title element
 * @param {HTMLElement} contentElement - Content element
 */
const logContentExtraction = (title, content, titleElement, contentElement) => {
  console.log("getContentForActions called:", {
    title,
    content,
    titleElement,
    contentElement,
  });
};

/**
 * Gets current content for action button handlers
 * @returns {Object} Object with title and content
 */
export const getContentForActions = () => {
  const { titleElement, contentElement } = getTodoElements();

  const title = getElementText(titleElement);
  const content = getElementText(contentElement);

  logContentExtraction(title, content, titleElement, contentElement);

  return { title, content };
};

// ###############################################################
// Content Modification Operations
// ###############################################################

/**
 * Resets title element to default state
 * @param {HTMLElement} titleElement - Title element to reset
 */
const resetTitleElement = (titleElement) => {
  if (titleElement) titleElement.textContent = "Neue Todo";
};

/**
 * Clears content element
 * @param {HTMLElement} contentElement - Content element to clear
 */
const clearContentElement = (contentElement) => {
  if (contentElement) contentElement.textContent = "";
};

/**
 * Clears todo content for delete action
 */
export const clearTodoContent = () => {
  const { titleElement, contentElement } = getTodoElements();

  resetTitleElement(titleElement);
  clearContentElement(contentElement);
};
