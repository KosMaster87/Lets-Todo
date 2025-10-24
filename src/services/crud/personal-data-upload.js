/**
 * @fileoverview Personal Data Upload Core - File Processing & Import Logic
 * @module personal-data-upload
 */

import {
  addTodo,
  getTodos,
  getTrashedTodos,
  trashTodo,
} from "./../../state/main-state.js";

import {
  validateFileExists,
  isSupportedFileExtension,
  createValidationSuccess,
  createUnsupportedFormatError,
  createFileReader,
  isNewExportFormat,
  createNewFormatMetadata,
  createSuccessResult,
  createParseError,
  createUnknownFormatError,
  isStringValue,
  arrayToString,
  objectToString,
  createFallbackString,
  isValidTodoObject,
  createDefaultTodoObject,
  createNormalizedTodo,
  createEmptyAnalysisResult,
  categorizeTodo,
  selectTodosToImport,
  processSingleActiveTodo,
  handleActiveTodoError,
  createActiveImportResult,
  selectTrashedTodosToImport,
  processSingleTrashedTodo,
  handleTrashedTodoError,
  createTrashImportResult,
} from "./../../utils/import-export/index.js";

export const IMPORT_RESULT_TYPES = {
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
};

/**
 * Validates if a file is a supported format
 * @param {File} file - File object to validate
 * @returns {Object} Validation result with isValid and format
 */
export const validateFileFormat = (file) => {
  const fileExistsError = validateFileExists(file);
  if (fileExistsError) return fileExistsError;

  return isSupportedFileExtension(file.name)
    ? createValidationSuccess()
    : createUnsupportedFormatError();
};

/**
 * Reads file content as text
 * @param {File} file - File to read
 * @returns {Promise<string>} File content
 */
export const readFileContent = (file) => {
  return new Promise((resolve, reject) => {
    const reader = createFileReader(resolve, reject);
    reader.readAsText(file);
  });
};

/**
 * Parses JSON import file
 * @param {string} content - File content
 * @returns {Object} Parsed todos with metadata
 */
export const parseJSONImport = (content) => {
  try {
    const data = JSON.parse(content);

    if (isNewExportFormat(data)) {
      return processNewFormatData(data);
    }

    if (Array.isArray(data)) {
      return processLegacyFormatData(data);
    }

    return createUnknownFormatError();
  } catch (error) {
    return createParseError(error);
  }
};

/**
 * Processes new export format data
 * @param {Object} data - Parsed JSON data
 * @returns {Object} Formatted result object
 */
const processNewFormatData = (data) => {
  const activeTodos = data.todos || [];
  const trashedTodos = data.trash || [];

  return createSuccessResult(
    activeTodos.map(normalizeTodoObject),
    trashedTodos.map(normalizeTodoObject),
    createNewFormatMetadata(data, activeTodos, trashedTodos)
  );
};

/**
 * Processes legacy format data (array of todos)
 * @param {Array} data - Array of todos
 * @returns {Object} Formatted result object
 */
const processLegacyFormatData = (data) => {
  const todos = data.map(normalizeTodoObject);

  return createSuccessResult(
    todos.filter((todo) => !todo.deletedAt),
    todos.filter((todo) => todo.deletedAt),
    { format: "legacy" }
  );
};

/**
 * Ensures string value from potentially corrupted data
 * @param {*} value - Value to fix
 * @returns {string} Cleaned string
 */
export const ensureString = (value) => {
  if (isStringValue(value)) return value;
  if (Array.isArray(value)) return arrayToString(value);
  if (typeof value === "object" && value !== null) return objectToString(value);
  return createFallbackString(value);
};

/**
 * Normalizes todo object to ensure required fields
 * @param {Object} todo - Raw todo object
 * @returns {Object} Normalized todo object
 */
export const normalizeTodoObject = (todo) => {
  if (!isValidTodoObject(todo)) {
    console.warn("Invalid todo object:", todo);
    return createDefaultTodoObject();
  }

  return createNormalizedTodo(todo, ensureString);
};

/**
 * Checks for duplicate todos
 * @param {Array} importedTodos - Todos to import
 * @param {Array} existingTodos - Existing todos
 * @returns {Object} Duplicates analysis
 */
export const findDuplicates = (importedTodos, existingTodos) => {
  const result = createEmptyAnalysisResult();

  importedTodos.forEach((importedTodo) => {
    categorizeTodo(
      importedTodo,
      existingTodos,
      result.duplicates,
      result.unique
    );
  });

  return result;
};

/**
 * Imports active todos into the system
 * @param {Array} activeTodos - Active todos to import
 * @param {Object} options - Import options
 * @returns {Object} Import result
 */
export const importActiveTodos = (activeTodos, options = {}) => {
  const existingTodos = getTodos();
  const { duplicates, unique } = findDuplicates(activeTodos, existingTodos);
  const todosToImport = selectTodosToImport(activeTodos, unique, options);

  const counters = { imported: 0, errors: [] };

  todosToImport.forEach((todo) => {
    try {
      processSingleActiveTodo(todo, counters, ensureString, addTodo);
    } catch (error) {
      handleActiveTodoError(error, todo, counters.errors, ensureString);
    }
  });

  return createActiveImportResult(
    counters.imported,
    duplicates,
    counters.errors,
    options
  );
};

/**
 * Imports trashed todos into the system
 * Note: Creates todos first, then moves them to trash
 * @param {Array} trashedTodos - Trashed todos to import
 * @param {Object} options - Import options
 * @returns {Promise<Object>} Import result
 */
export const importTrashedTodos = async (trashedTodos, options = {}) => {
  const existingTrashedTodos = getTrashedTodos();
  const { duplicates, unique } = findDuplicates(
    trashedTodos,
    existingTrashedTodos
  );
  const todosToImport = selectTrashedTodosToImport(
    trashedTodos,
    unique,
    options
  );

  const counters = { imported: 0, errors: [] };

  for (const todo of todosToImport) {
    try {
      await processSingleTrashedTodo(
        todo,
        counters,
        ensureString,
        addTodo,
        getTodos,
        trashTodo
      );
    } catch (error) {
      handleTrashedTodoError(error, todo, counters.errors, ensureString);
    }
  }

  return createTrashImportResult(
    counters.imported,
    duplicates,
    counters.errors,
    options
  );
};
