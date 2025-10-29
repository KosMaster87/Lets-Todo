/**
 * @fileoverview Personal Data Upload Core - File Processing & Import Logic
 * @description Handles validation, parsing, normalization, duplicate detection,
 * and import operations for personal data upload in todo application.
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

// ###############################################################
// Import Result Constants
// ###############################################################

export const IMPORT_RESULT_TYPES = {
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
};

// ###############################################################
// File Validation Utilities
// ###############################################################

/**
 * Validates file format and ensures it's a JSON file
 * @param {File} file - File to validate
 * @returns {Object} Validation result object
 */
export const validateFileFormat = (file) => {
  const fileError = validateFileExists(file);
  if (fileError) {
    return fileError;
  }

  return isSupportedFileExtension(file.name)
    ? createValidationSuccess()
    : createUnsupportedFormatError();
};

// ###############################################################
// File Content Processing
// ###############################################################

/**
 * Reads file content asynchronously as text
 * @param {File} file - File to read
 * @returns {Promise<string>} File content as text
 */
export const readFileContent = (file) => {
  const reader = createFileReader();

  return new Promise((resolve, reject) => {
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = () => reject(new Error("File reading failed"));
    reader.readAsText(file);
  });
};

/**
 * Creates legacy format metadata object
 * @param {Array} data - Legacy format data array
 * @returns {Object} Legacy format metadata
 */
const createLegacyMetadata = (data) => ({
  format: "legacy",
  todoCount: Array.isArray(data) ? data.length : 0,
  trashedCount: 0,
});

/**
 * Handles JSON parsing error and returns appropriate error object
 * @param {Error} error - JSON parsing error
 * @returns {Object} Error result object
 */
const handleParseError = (error) =>
  error.name === "SyntaxError"
    ? createParseError()
    : createUnknownFormatError();

/**
 * Parses JSON content and determines format type
 * @param {string} content - JSON content to parse
 * @returns {Object} Parsed data with format information
 */
export const parseJSONImport = (content) => {
  try {
    const parsedData = JSON.parse(content);
    if (isNewExportFormat(parsedData)) {
      const metadata = createNewFormatMetadata(parsedData);
      return createSuccessResult(parsedData, metadata);
    }
    const metadata = createLegacyMetadata(parsedData);
    return createSuccessResult(parsedData, metadata);
  } catch (error) {
    return handleParseError(error);
  }
};

// ###############################################################
// Format Processing Utilities
// ###############################################################

/**
 * Processes new format export data (version 2.0+)
 * @param {Object} data - Parsed new format data
 * @param {Object} metadata - Format metadata
 * @returns {Object} Processing result with todos and trashed items
 */
export const processNewFormatData = (data, metadata) => ({
  todos: data.todos || [],
  trashed: data.trashed || [],
  metadata,
  success: true,
  format: "new",
});

/**
 * Processes legacy format export data (version 1.x)
 * @param {Array} data - Parsed legacy format data
 * @param {Object} metadata - Format metadata
 * @returns {Object} Processing result with todos
 */
export const processLegacyFormatData = (data, metadata) => ({
  todos: Array.isArray(data) ? data : [],
  trashed: [],
  metadata,
  success: true,
  format: "legacy",
});

// ###############################################################
// Data Normalization Utilities
// ###############################################################

/**
 * Ensures value is converted to string format
 * @param {*} value - Value to convert
 * @returns {string} String representation of value
 */
export const ensureString = (value) => {
  if (isStringValue(value)) return value;
  if (Array.isArray(value)) return arrayToString(value);
  if (typeof value === "object") return objectToString(value);

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

// ###############################################################
// Duplicate Detection Utilities
// ###############################################################

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

// ###############################################################
// Active Todos Import Operations
// ###############################################################

/**
 * Processes a single active todo during import
 * @param {Object} todo - Todo to process
 * @param {Object} counters - Import counters object
 */
const processActiveTodoSafely = (todo, counters) => {
  try {
    processSingleActiveTodo(todo, counters, ensureString, addTodo);
  } catch (error) {
    handleActiveTodoError(error, todo, counters.errors, ensureString);
  }
};

/**
 * Prepares active todos import data and filters
 * @param {Array} activeTodos - Active todos to import
 * @param {Object} options - Import options
 * @returns {Object} Prepared import data
 */
const prepareActiveImportData = (activeTodos, options) => {
  const existingTodos = getTodos();
  const { duplicates, unique } = findDuplicates(activeTodos, existingTodos);
  const todosToImport = selectTodosToImport(activeTodos, unique, options);

  return { duplicates, todosToImport };
};

/**
 * Imports active todos into the system
 * @param {Array} activeTodos - Active todos to import
 * @param {Object} options - Import options
 * @returns {Object} Import result
 */
export const importActiveTodos = (activeTodos, options = {}) => {
  const { duplicates, todosToImport } = prepareActiveImportData(
    activeTodos,
    options
  );
  const counters = { imported: 0, errors: [] };

  todosToImport.forEach((todo) => processActiveTodoSafely(todo, counters));

  return createActiveImportResult(
    counters.imported,
    duplicates,
    counters.errors,
    options
  );
};

// ###############################################################
// Trashed Todos Import Operations
// ###############################################################

/**
 * Processes a single trashed todo during import
 * @param {Object} todo - Todo to process
 * @param {Object} counters - Import counters object
 */
const processTrashedTodoSafely = async (todo, counters) => {
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
};

/**
 * Prepares trashed todos import data and filters
 * @param {Array} trashedTodos - Trashed todos to import
 * @param {Object} options - Import options
 * @returns {Object} Prepared import data
 */
const prepareTrashImportData = (trashedTodos, options) => {
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

  return { duplicates, todosToImport };
};

/**
 * Imports trashed todos into the system
 * Note: Creates todos first, then moves them to trash
 * @param {Array} trashedTodos - Trashed todos to import
 * @param {Object} options - Import options
 * @returns {Promise<Object>} Import result
 */
export const importTrashedTodos = async (trashedTodos, options = {}) => {
  const { duplicates, todosToImport } = prepareTrashImportData(
    trashedTodos,
    options
  );
  const counters = { imported: 0, errors: [] };

  for (const todo of todosToImport) {
    await processTrashedTodoSafely(todo, counters);
  }

  return createTrashImportResult(
    counters.imported,
    duplicates,
    counters.errors,
    options
  );
};
