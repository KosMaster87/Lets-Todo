/**
 * @fileoverview Todo Object Normalization and Processing Utilities
 * @description Helper functions for normalizing, validating, and processing todo objects
 * @module todo-normalization-helpers
 */

/**
 * Generates temporary ID for imported todos
 * @returns {string} Temporary ID
 */
export const generateTempId = () => {
  return `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validates if todo object is valid
 * @param {*} todo - Todo object to validate
 * @returns {boolean} True if todo is valid object
 */
export const isValidTodoObject = (todo) => {
  return todo && typeof todo === "object";
};

/**
 * Creates default todo object for invalid inputs
 * @returns {Object} Default todo object
 */
export const createDefaultTodoObject = () => ({
  id: generateTempId(),
  title: "Importiertes Todo",
  content: "",
  completed: false,
  bookmarked: false,
  created: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  deletedAt: null,
});

/**
 * Extracts and cleans todo title
 * @param {Object} todo - Raw todo object
 * @param {Function} ensureString - String cleaning function
 * @returns {string} Cleaned title
 */
export const extractTodoTitle = (todo, ensureString) => {
  return ensureString(todo.title).trim() || "Importiertes Todo";
};

/**
 * Extracts and cleans todo content
 * @param {Object} todo - Raw todo object
 * @param {Function} ensureString - String cleaning function
 * @returns {string} Cleaned content
 */
export const extractTodoContent = (todo, ensureString) => {
  return ensureString(todo.content).trim();
};

/**
 * Creates normalized todo from valid input
 * @param {Object} todo - Valid todo object
 * @param {Function} ensureString - String cleaning function
 * @returns {Object} Normalized todo object
 */
export const createNormalizedTodo = (todo, ensureString) => ({
  id: todo.id || generateTempId(),
  title: extractTodoTitle(todo, ensureString),
  content: extractTodoContent(todo, ensureString),
  completed: Boolean(todo.completed),
  bookmarked: Boolean(todo.bookmarked),
  created: todo.created || new Date().toISOString(),
  lastModified: todo.lastModified || new Date().toISOString(),
  deletedAt: todo.deletedAt || null,
});

/**
 * Creates empty duplicates analysis result
 * @returns {Object} Empty duplicates and unique arrays
 */
export const createEmptyAnalysisResult = () => ({
  duplicates: [],
  unique: [],
});

/**
 * Checks if imported todo matches existing todo
 * @param {Object} importedTodo - Todo to check
 * @param {Object} existingTodo - Existing todo to compare
 * @returns {boolean} True if todos match
 */
export const isTodoMatch = (importedTodo, existingTodo) => {
  return existingTodo.title === importedTodo.title && existingTodo.content === importedTodo.content;
};

/**
 * Checks if imported todo is duplicate of any existing todo
 * @param {Object} importedTodo - Todo to check
 * @param {Array} existingTodos - Array of existing todos
 * @returns {boolean} True if duplicate found
 */
export const isDuplicateTodo = (importedTodo, existingTodos) => {
  return existingTodos.some((existing) => isTodoMatch(importedTodo, existing));
};

/**
 * Categorizes single todo as duplicate or unique
 * @param {Object} importedTodo - Todo to categorize
 * @param {Array} existingTodos - Existing todos array
 * @param {Array} duplicates - Duplicates collection
 * @param {Array} unique - Unique collection
 * @returns {void}
 */
export const categorizeTodo = (importedTodo, existingTodos, duplicates, unique) => {
  if (isDuplicateTodo(importedTodo, existingTodos)) {
    duplicates.push(importedTodo);
  } else {
    unique.push(importedTodo);
  }
};
