/**
 * @fileoverview Import/Export Utilities - Public API
 * @description Centralized export of all import/export utility functions and constants
 * @module import-export
 */

// File Input & Validation
export {
  createFileInput,
  createBasicFileInput,
  handleFileChange,
  setupCancelDetection,
  executeFileInputClick,
} from "./file-input-helpers.js";

export {
  IMPORT_FORMATS,
  validateFileExists,
  isSupportedFileExtension,
  createValidationSuccess,
  createUnsupportedFormatError,
  createFileReader,
  createFileReadError,
} from "./file-validation-helpers.js";

// JSON Parsing & Processing
export {
  isNewExportFormat,
  createNewFormatMetadata,
  createSuccessResult,
  createParseError,
  createUnknownFormatError,
  isStringValue,
  arrayToString,
  objectToString,
  createFallbackString,
} from "./json-parsing-helpers.js";

// Todo Normalization & Validation
export {
  generateTempId,
  isValidTodoObject,
  createDefaultTodoObject,
  extractTodoTitle,
  extractTodoContent,
  createNormalizedTodo,
  createEmptyAnalysisResult,
  categorizeTodo,
} from "./todo-normalization-helpers.js";

// Active Todo Import Processing
export {
  selectTodosToImport,
  hasValidTitle,
  createImportTodoObject,
  processSingleActiveTodo,
  handleActiveTodoError,
  createActiveImportResult,
} from "./active-todo-import-helpers.js";

// Trashed Todo Import Processing
export {
  selectTrashedTodosToImport,
  extractTrashTodoData,
  createTrashImportTodoObject,
  waitForServerSync,
  findCreatedTodo,
  moveToTrashWithRetry,
  processSingleTrashedTodo,
  handleTrashedTodoError,
  createTrashImportResult,
} from "./trashed-todo-import-helpers.js";

// Import/Export Core Utilities
export {
  getSupportedFileTypes,
  getUploadInstructions,
  validateImportOptions,
  createDefaultImportOptions,
  isFileTypeSupported,
  getFileTypeDescription,
} from "./import-export-helpers.js";

// Preview Dialog System
export { showImportPreview } from "./preview-dialog-helpers.js";

// Download & Export Utilities
export {
  getTimestamp,
  triggerDownload,
  generateJSONFilename,
  createExportMetadata,
  formatTodoForExport,
  todosToJSON,
  createExportSuccessMessage,
  validateTodosForExport,
} from "./download-helpers.js";
