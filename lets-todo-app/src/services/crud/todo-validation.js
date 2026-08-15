/**
 * @fileoverview Todo Validation Utilities
 * @description Provides functions to validate todo titles and content
 * @module todo-validation
 */

import { showMessage } from "./../../utils/ui-helpers/message-helpers.js";
import { getTodoTitleElement, getTodoContentElement } from "./../../utils/dom-selectors.js";

// ###############################################################
// DOM Element Validation
// ###############################################################

/**
 * Validates todo title from DOM element
 * @returns {boolean} True if valid, false otherwise
 */
export const validateTodoTitle = () => {
  const titleElement = getTodoTitleElement();
  if (!titleElement) return true;

  const title = titleElement.textContent.trim();
  return validateTitleValue(title);
};

/**
 * Validates todo content from DOM element
 * @returns {boolean} True if valid, false otherwise
 */
export const validateTodoContent = () => {
  const contentElement = getTodoContentElement();
  if (!contentElement) return true;

  const content = contentElement.textContent.trim();
  return validateContentValue(content);
};

// ###############################################################
// Content Value Validation
// ###############################################################

/**
 * Validates that content is not empty
 * @param {string} title - Todo title
 * @param {string} content - Todo content
 * @returns {boolean} True if content exists
 */
const validateContentExists = (title, content) => {
  if (!title && !content) {
    showMessage("Title or content cannot be empty.", "error");
    return false;
  }
  return true;
};

/**
 * Validates title is not placeholder text
 * @param {string} title - Todo title
 * @param {string} titlePlaceholder - Title placeholder text
 * @returns {boolean} True if title is valid
 */
const validateTitleNotPlaceholder = (title, titlePlaceholder) => {
  if (isPlaceholderText(title, titlePlaceholder)) {
    showMessage("Please enter a real title for your todo.", "error");
    return false;
  }
  return true;
};

/**
 * Validates content is not placeholder text
 * @param {string} content - Todo content
 * @param {string} contentPlaceholder - Content placeholder text
 * @returns {boolean} True if content is valid
 */
const validateContentNotPlaceholder = (content, contentPlaceholder) => {
  if (isPlaceholderText(content, contentPlaceholder)) {
    showMessage("Please enter real content for your todo.", "error");
    return false;
  }
  return true;
};

/**
 * Validates todo content values directly
 * @param {string} title - Todo title
 * @param {string} content - Todo content
 * @param {string} titlePlaceholder - Title placeholder text
 * @param {string} contentPlaceholder - Content placeholder text
 * @returns {boolean} True if valid, false otherwise
 */
export const validateTodoContentValues = (title, content, titlePlaceholder, contentPlaceholder) => {
  if (!validateContentExists(title, content)) return false;
  if (!validateTitleNotPlaceholder(title, titlePlaceholder)) return false;
  if (!validateContentNotPlaceholder(content, contentPlaceholder)) return false;
  return true;
};

// ###############################################################
// Validation Helper Functions
// ###############################################################

/**
 * Checks if text matches static placeholders
 * @param {string} trimmedText - Trimmed text to check
 * @returns {boolean} True if matches static placeholder
 */
const isStaticPlaceholder = (trimmedText) => {
  const staticPlaceholders = ["Neue Todo"];
  return staticPlaceholders.includes(trimmedText);
};

/**
 * Checks if text matches provided placeholder
 * @param {string} trimmedText - Trimmed text to check
 * @param {string} placeholder - Placeholder to compare against
 * @returns {boolean} True if matches provided placeholder
 */
const isProvidedPlaceholder = (trimmedText, placeholder) => {
  return placeholder && trimmedText === placeholder;
};

/**
 * Determines if the given text is considered placeholder text
 * @param {string} text - The text to check
 * @param {string} [placeholder] - An optional placeholder to compare against
 * @returns {boolean} True if the text is a placeholder, false otherwise
 */
const isPlaceholderText = (text, placeholder) => {
  if (!text) return false;

  const trimmedText = text.trim();
  return isStaticPlaceholder(trimmedText) || isProvidedPlaceholder(trimmedText, placeholder);
};

// ###############################################################
// Length Constraint Validation
// ###############################################################

/**
 * Validates title value with length constraints
 * @param {string} title - Title to validate
 * @returns {boolean} True if valid, false otherwise
 */
const validateTitleValue = (title) => {
  if (title.length === 0) {
    showMessage("Please enter a title for your todo.", "error");
    return false;
  }

  if (title.length > 100) {
    showMessage("Title may be a maximum of 100 characters long.", "error");
    return false;
  }

  return true;
};

/**
 * Validates content value with length constraints
 * @param {string} content - Content to validate
 * @returns {boolean} True if valid, false otherwise
 */
const validateContentValue = (content) => {
  if (content.length === 0) {
    showMessage("Please enter content for your todo.", "error");
    return false;
  }

  if (content.length > 5000) {
    showMessage("Content may be a maximum of 5000 characters long.", "error");
    return false;
  }

  return true;
};
