/**
 * @fileoverview Active Todo Import Processing Utilities
 * @description Helper functions for processing active todo imports, such as selecting todos, validating titles, and creating import results.
 * @module active-todo-import-helpers
 */

/**
 * Determines which todos to import based on options
 * @param {Array} activeTodos - All active todos
 * @param {Array} unique - Unique todos only
 * @param {Object} options - Import options
 * @returns {Array} Todos to import
 */
export const selectTodosToImport = (activeTodos, unique, options) => {
  return options.allowDuplicates ? activeTodos : unique;
};

/**
 * Validates todo has required title
 * @param {string} title - Todo title to validate
 * @returns {boolean} True if title is valid
 */
export const hasValidTitle = (title) => {
  return title && title.trim().length > 0;
};

/**
 * Creates todo object for import
 * @param {Object} todo - Raw todo data
 * @param {string} title - Cleaned title
 * @param {string} content - Cleaned content
 * @returns {Object} Todo object ready for import
 */
export const createImportTodoObject = (todo, title, content) => ({
  title,
  content,
  completed: Boolean(todo.completed),
  bookmarked: Boolean(todo.bookmarked),
});

/**
 * Processes single active todo import
 * @param {Object} todo - Todo to import
 * @param {Object} counters - Import counters object
 * @param {Function} ensureString - String cleaning function
 * @param {Function} addTodo - Todo creation function
 * @returns {void}
 */
export const processSingleActiveTodo = (todo, counters, ensureString, addTodo) => {
  console.log(`🔍 Raw active todo object:`, todo);

  const title = ensureString(todo.title).trim() || "Importiertes Todo";
  const content = ensureString(todo.content).trim();

  console.log(`🔍 Fixed title: "${title}", content: "${content}"`);

  if (!hasValidTitle(title)) {
    counters.errors.push(`Todo without title skipped`);
    return;
  }

  const todoObject = createImportTodoObject(todo, title, content);
  console.log(`📥 Importing active todo: "${title}"`);
  addTodo(todoObject);
  counters.imported++;
};

/**
 * Handles active todo import error
 * @param {Error} error - Import error
 * @param {Object} todo - Todo that failed
 * @param {Array} errors - Errors collection
 * @param {Function} ensureString - String cleaning function
 * @returns {void}
 */
export const handleActiveTodoError = (error, todo, errors, ensureString) => {
  console.error(`Error importing active todo:`, error);
  const todoTitle = ensureString(todo.title) || "Unknown Todo";
  errors.push(`Error importing: ${todoTitle} - ${error.message}`);
};

/**
 * Creates active import result object
 * @param {number} imported - Number imported
 * @param {Array} duplicates - Duplicates found
 * @param {Array} errors - Import errors
 * @param {Object} options - Import options
 * @returns {Object} Import result
 */
export const createActiveImportResult = (imported, duplicates, errors, options) => ({
  imported,
  duplicatesFound: duplicates.length,
  errors,
  skipped: options.allowDuplicates ? 0 : duplicates.length,
});
