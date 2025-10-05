// lets-todo-app/src/services/crud/todo-validation.js

import { showMessage } from "./../navigation/navigation-action-buttons.js";

/**
 * Validates todo title from DOM element
 * @returns {boolean} True if valid, false otherwise
 */
export const validateTodoTitle = () => {
  const titleElement = document.getElementById("todoDisplayTitle");
  if (!titleElement) return true;

  const title = titleElement.textContent.trim();
  return validateTitleValue(title);
};

/**
 * Validates todo content from DOM element
 * @returns {boolean} True if valid, false otherwise
 */
export const validateTodoContent = () => {
  const contentElement = document.getElementById("todoContentDisplay");
  if (!contentElement) return true;

  const content = contentElement.textContent.trim();
  return validateContentValue(content);
};

/**
 * Validates todo content values directly
 * @param {string} title - Todo title
 * @param {string} content - Todo content
 * @returns {boolean} True if valid, false otherwise
 */
export const validateTodoContentValues = (title, content) => {
  if (!title && !content) {
    showMessage("Titel oder Inhalt darf nicht leer sein.", "error");
    return false;
  }
  return true;
};

/**
 * Validates title value with length constraints
 * @param {string} title - Title to validate
 * @returns {boolean} True if valid, false otherwise
 */
const validateTitleValue = (title) => {
  if (title.length === 0) {
    showMessage("Bitte gib einen Titel für deine Todo ein.", "error");
    return false;
  }

  if (title.length > 100) {
    showMessage("Der Titel darf maximal 100 Zeichen lang sein.", "error");
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
    showMessage("Bitte gib einen Inhalt für deine Todo ein.", "error");
    return false;
  }

  if (content.length > 5000) {
    showMessage("Der Inhalt darf maximal 5000 Zeichen lang sein.", "error");
    return false;
  }

  return true;
};
