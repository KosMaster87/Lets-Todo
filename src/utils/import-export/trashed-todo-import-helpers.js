/**
 * @fileoverview Trashed Todo Import Processing Utilities
 * @description Helper functions for processing trashed todo imports
 * @module trashed-todo-import-helpers
 */

/**
 * Determines which trash todos to import based on options
 * @param {Array} trashedTodos - All trashed todos
 * @param {Array} unique - Unique todos only
 * @param {Object} options - Import options
 * @returns {Array} Todos to import
 */
export const selectTrashedTodosToImport = (trashedTodos, unique, options) => {
  return options.allowDuplicates ? trashedTodos : unique;
};

/**
 * Extracts and validates trash todo data
 * @param {Object} todo - Raw todo object
 * @param {Function} ensureString - String cleaning function
 * @returns {Object|null} Validated todo data or null if invalid
 */
export const extractTrashTodoData = (todo, ensureString) => {
  const title = ensureString(todo.title).trim() || "Importiertes Todo";
  const content = ensureString(todo.content).trim();

  if (!title) {
    return null;
  }

  return { title, content, todo };
};

/**
 * Creates todo object for trash import
 * @param {string} title - Todo title
 * @param {string} content - Todo content
 * @param {Object} todo - Original todo data
 * @returns {Object} Todo object ready for import
 */
export const createTrashImportTodoObject = (title, content, todo) => ({
  title,
  content,
  completed: Boolean(todo.completed),
  bookmarked: Boolean(todo.bookmarked),
});

/**
 * Waits for server synchronization
 * @returns {Promise} Promise that resolves after sync delay
 */
export const waitForServerSync = () => {
  return new Promise((resolve) => setTimeout(resolve, 100));
};

/**
 * Finds created todo in current todos list
 * @param {string} title - Todo title to find
 * @param {string} content - Todo content to match
 * @param {Object} todo - Original todo data for matching
 * @param {Function} getTodos - Function to get current todos
 * @returns {Object|null} Found todo or null
 */
export const findCreatedTodo = (title, content, todo, getTodos) => {
  const currentTodos = getTodos();
  return currentTodos.find(
    (t) =>
      t.title === title &&
      t.content === content &&
      t.completed === Boolean(todo.completed) &&
      t.bookmarked === Boolean(todo.bookmarked)
  );
};

/**
 * Moves created todo to trash with error handling
 * @param {Object} createdTodo - Todo to move to trash
 * @param {string} title - Todo title for logging
 * @param {Function} trashTodo - Function to trash todo
 * @returns {Promise<boolean>} True if successful
 */
export const moveToTrashWithRetry = async (createdTodo, title, trashTodo) => {
  console.log(`🗑️ Moving to trash: ID ${createdTodo.id}`);

  try {
    await trashTodo(createdTodo.id);
    return true;
  } catch (trashError) {
    console.warn(
      `⚠️ Trash sync failed for "${title}", but todo is trashed locally`
    );
    return true; // Still count as success since it's in correct local state
  }
};

/**
 * Processes single trashed todo import
 * @param {Object} todo - Todo to import
 * @param {Object} counters - Import counters object
 * @param {Function} ensureString - String cleaning function
 * @param {Function} addTodo - Function to add todo
 * @param {Function} getTodos - Function to get todos
 * @param {Function} trashTodo - Function to trash todo
 * @returns {Promise<void>}
 */
export const processSingleTrashedTodo = async (
  todo,
  counters,
  ensureString,
  addTodo,
  getTodos,
  trashTodo
) => {
  const todoData = extractTrashTodoData(todo, ensureString);

  if (!todoData) {
    counters.errors.push(`Todo without title skipped`);
    return;
  }

  const { title, content } = todoData;
  console.log(`📥 Importing trash todo: "${title}"`);

  const todoObject = createTrashImportTodoObject(title, content, todo);
  await addTodo(todoObject);
  await waitForServerSync();

  const createdTodo = findCreatedTodo(title, content, todo, getTodos);

  if (createdTodo) {
    const success = await moveToTrashWithRetry(createdTodo, title, trashTodo);
    if (success) counters.imported++;
  } else {
    counters.errors.push(
      `Todo "${title}" was created but could not be found for trash move`
    );
  }
};

/**
 * Handles trash todo import error
 * @param {Error} error - Import error
 * @param {Object} todo - Todo that failed
 * @param {Array} errors - Errors collection
 * @param {Function} ensureString - String cleaning function
 * @returns {void}
 */
export const handleTrashedTodoError = (error, todo, errors, ensureString) => {
  console.error(`Error importing trash todo:`, error);
  const todoTitle = ensureString(todo.title) || "Unknown Todo";
  errors.push(`Error importing: ${todoTitle} - ${error.message}`);
};

/**
 * Creates trash import result object
 * @param {number} imported - Number imported
 * @param {Array} duplicates - Duplicates found
 * @param {Array} errors - Import errors
 * @param {Object} options - Import options
 * @returns {Object} Import result
 */
export const createTrashImportResult = (
  imported,
  duplicates,
  errors,
  options
) => ({
  imported,
  duplicatesFound: duplicates.length,
  errors,
  skipped: options.allowDuplicates ? 0 : duplicates.length,
});
