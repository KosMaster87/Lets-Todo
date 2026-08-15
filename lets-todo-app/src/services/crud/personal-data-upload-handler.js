/**
 * @fileoverview Personal Data Upload Handler - File Selection and Upload Process
 * @description Manages the file selection dialog, upload process, and user notifications
 * @module personal-data-upload-handler
 */

import {
  validateFileFormat,
  readFileContent,
  parseJSONImport,
  importActiveTodos,
  importTrashedTodos,
} from "./personal-data-upload.js";
import {
  showSuccessNotification,
  showErrorNotification,
  showInfoNotification,
} from "./../../utils/notifications.js";
import {
  createProgressIndicator,
  removeProgressIndicator,
} from "./../../utils/ui-helpers/progress-indicators.js";
import {
  createFileInput,
  executeFileInputClick,
} from "./../../utils/import-export/index.js";
import { setUploadButtonState } from "./../../utils/ui-state-helpers.js";

/**
 * Triggers file selection dialog
 * @param {Function} onComplete - Callback when upload is complete
 * @param {Object} options - Upload options
 * @returns {void}
 */
export const triggerFileUpload = (onComplete, options = {}) => {
  const fileSelectedHandler = createFileSelectedHandler(onComplete, options);
  const fileCancelledHandler = createFileCancelledHandler(onComplete);

  const input = createFileInput(fileSelectedHandler, fileCancelledHandler);
  executeFileInputClick(input);
};

/**
 * Creates file selected callback handler
 * @param {Function} onComplete - Upload completion callback
 * @param {Object} options - Upload options
 * @returns {Function} File selection handler
 */
const createFileSelectedHandler = (onComplete, options) => {
  return async (file) => {
    await handleFileUpload(file, onComplete, options);
  };
};

/**
 * Creates file selection cancelled callback handler
 * @param {Function} onComplete - Upload completion callback
 * @returns {Function} File cancellation handler
 */
const createFileCancelledHandler = (onComplete) => {
  return () => {
    setUploadButtonState(false);
    onComplete?.(false, { message: "File selection cancelled" });
  };
};

/**
 * Handles the complete file upload process
 * @param {File} file - Selected file
 * @param {Function} onComplete - Completion callback
 * @param {Object} options - Upload options
 * @returns {Promise<void>}
 */
export const handleFileUpload = async (file, onComplete, options = {}) => {
  const containerId = options.containerId || "personalDataContainer";

  try {
    if (!validateUploadedFile(file, onComplete)) return;

    initializeUploadProcess(file, containerId);
    const content = await readFileContent(file);

    const parseResult = processFileContent(content, containerId, onComplete);
    if (!parseResult) return;

    const importResult = await executeImportProcess(
      parseResult,
      options,
      containerId
    );
    removeProgressIndicator(containerId);

    importResult.success
      ? handleImportSuccess(importResult, onComplete)
      : handleImportFailure(importResult, onComplete);
  } catch (error) {
    handleUploadError(error, containerId, onComplete);
  } finally {
    setUploadButtonState(false);
  }
};

/**
 * Validates uploaded file format
 * @param {File} file - File to validate
 * @param {Function} onComplete - Completion callback
 * @returns {boolean} True if validation passes
 */
const validateUploadedFile = (file, onComplete) => {
  const validation = validateFileFormat(file);
  if (!validation.isValid) {
    showErrorNotification(validation.error);
    onComplete?.(false, validation.error);
    return false;
  }
  return true;
};

/**
 * Initializes upload process with notifications and progress
 * @param {File} file - File being uploaded
 * @param {string} containerId - Progress container ID
 * @returns {void}
 */
const initializeUploadProcess = (file, containerId) => {
  showInfoNotification(`File "${file.name}" is being processed...`);
  setUploadButtonState(true);
  createProgressIndicator(containerId, "Reading file...");
};

/**
 * Updates progress indicator with new message
 * @param {string} containerId - Progress container ID
 * @param {string} message - Progress message
 * @returns {void}
 */
const updateProgressIndicator = (containerId, message) => {
  removeProgressIndicator(containerId);
  createProgressIndicator(containerId, message);
};

/**
 * Processes file content through parsing pipeline
 * @param {string} content - File content
 * @param {string} containerId - Progress container ID
 * @param {Function} onComplete - Completion callback
 * @returns {Object|null} Parse result or null if failed
 */
const processFileContent = (content, containerId, onComplete) => {
  updateProgressIndicator(containerId, "Todos werden analysiert...");

  const parseResult = parseJSONImport(content);
  if (!parseResult.success) {
    removeProgressIndicator(containerId);
    showErrorNotification(parseResult.error);
    onComplete?.(false, parseResult.error);
    return null;
  }
  return parseResult;
};

/**
 * Executes todo import process
 * @param {Object} parseResult - Parsed file result
 * @param {Object} options - Import options
 * @param {string} containerId - Progress container ID
 * @returns {Promise<Object>} Import result
 */
const executeImportProcess = async (parseResult, options, containerId) => {
  updateProgressIndicator(containerId, "Todos werden importiert...");
  return await importTodosFromParseResult(parseResult, options);
};

/**
 * Handles successful import completion
 * @param {Object} importResult - Import result
 * @param {Function} onComplete - Completion callback
 * @returns {void}
 */
const handleImportSuccess = (importResult, onComplete) => {
  showUploadSuccessMessage(importResult);
  onComplete?.(true, importResult);
};

/**
 * Handles failed import completion
 * @param {Object} importResult - Import result with error
 * @param {Function} onComplete - Completion callback
 * @returns {void}
 */
const handleImportFailure = (importResult, onComplete) => {
  showErrorNotification(importResult.error);
  onComplete?.(false, importResult.error);
};

/**
 * Handles upload process errors with cleanup
 * @param {Error} error - Error object
 * @param {string} containerId - Progress container ID
 * @param {Function} onComplete - Completion callback
 * @returns {void}
 */
const handleUploadError = (error, containerId, onComplete) => {
  console.error("Upload error:", error);
  removeProgressIndicator(containerId);
  showErrorNotification(`Upload-Fehler: ${error.message}`);
  onComplete?.(false, error.message);
};

/**
 * Imports todos from parsed result
 * @param {Object} parseResult - Parsed file result
 * @param {Object} options - Import options
 * @returns {Promise<Object>} Import result summary
 */
export const importTodosFromParseResult = async (parseResult, options = {}) => {
  try {
    const { activeTodos, trashedTodos } = parseResult;

    const activeResult = processActiveTodosImport(activeTodos, options);
    const trashResult = await processTrashTodosImport(trashedTodos, options);

    return createSuccessResult(activeResult, trashResult, parseResult);
  } catch (error) {
    return createErrorResult(error);
  }
};

/**
 * Creates default trash import result
 * @returns {Object} Default trash import result
 */
const createDefaultTrashResult = () => ({
  imported: 0,
  duplicatesFound: 0,
  errors: [],
  skipped: 0,
});

/**
 * Processes active todos import
 * @param {Array} activeTodos - Active todos to import
 * @param {Object} options - Import options
 * @returns {Object} Active import result
 */
const processActiveTodosImport = (activeTodos, options) => {
  return importActiveTodos(activeTodos, options);
};

/**
 * Processes trash todos import conditionally
 * @param {Array} trashedTodos - Trashed todos to import
 * @param {Object} options - Import options
 * @returns {Promise<Object>} Trash import result
 */
const processTrashTodosImport = async (trashedTodos, options) => {
  if (options.skipTrash || trashedTodos.length === 0) {
    return createDefaultTrashResult();
  }
  return await importTrashedTodos(trashedTodos, options);
};

/**
 * Creates successful import result summary
 * @param {Object} activeResult - Active todos import result
 * @param {Object} trashResult - Trash todos import result
 * @param {Object} parseData - Original parse data
 * @returns {Object} Success result summary
 */
const createSuccessResult = (activeResult, trashResult, parseData) => ({
  success: true,
  totalFound: parseData.totalCount,
  activeImported: activeResult.imported,
  activeSkipped: activeResult.skipped,
  activeDuplicates: activeResult.duplicatesFound,
  trashFound: parseData.trashedTodos.length,
  trashImported: trashResult.imported,
  trashSkipped: trashResult.skipped,
  trashDuplicates: trashResult.duplicatesFound,
  errors: [...activeResult.errors, ...trashResult.errors],
  metadata: parseData.metadata,
});

/**
 * Creates error result for import failure
 * @param {Error} error - Error that occurred
 * @returns {Object} Error result
 */
const createErrorResult = (error) => ({
  success: false,
  error: `Import-Fehler: ${error.message}`,
});

/**
 * Shows detailed success message for upload
 * @param {Object} result - Import result
 * @returns {void}
 */
export const showUploadSuccessMessage = (result) => {
  const message = buildSuccessMessage(result);
  showSuccessNotification(`✅ ${message}`);
  logImportErrors(result);
};

/**
 * Adds active todos import message to parts array
 * @param {Array} parts - Message parts array
 * @param {Object} result - Import result
 * @returns {void}
 */
const addActiveImportMessage = (parts, result) => {
  if (result.activeImported > 0) {
    parts.push(`${result.activeImported} aktive Todos importiert`);
  }
};

/**
 * Adds trash todos import message to parts array
 * @param {Array} parts - Message parts array
 * @param {Object} result - Import result
 * @returns {void}
 */
const addTrashImportMessage = (parts, result) => {
  if (result.trashImported > 0) {
    parts.push(`${result.trashImported} gelöschte Todos wiederhergestellt`);
  }
};

/**
 * Adds skipped duplicates message to parts array
 * @param {Array} parts - Message parts array
 * @param {Object} result - Import result
 * @returns {void}
 */
const addSkippedMessage = (parts, result) => {
  const totalSkipped = (result.activeSkipped || 0) + (result.trashSkipped || 0);
  if (totalSkipped > 0) {
    parts.push(`${totalSkipped} duplicates skipped`);
  }
};

/**
 * Adds errors message to parts array
 * @param {Array} parts - Message parts array
 * @param {Object} result - Import result
 * @returns {void}
 */
const addErrorsMessage = (parts, result) => {
  if (result.errors.length > 0) {
    parts.push(`${result.errors.length} Fehler aufgetreten`);
  }
};

/**
 * Builds complete success message from result
 * @param {Object} result - Import result
 * @returns {string} Complete success message
 */
const buildSuccessMessage = (result) => {
  const parts = [];

  addActiveImportMessage(parts, result);
  addTrashImportMessage(parts, result);
  addSkippedMessage(parts, result);
  addErrorsMessage(parts, result);

  return parts.length > 0
    ? parts.join(", ")
    : "Import erfolgreich abgeschlossen";
};

/**
 * Logs import errors to console if present
 * @param {Object} result - Import result
 * @returns {void}
 */
const logImportErrors = (result) => {
  if (result.errors.length > 0) {
    console.warn("Import errors:", result.errors);
  }
};
