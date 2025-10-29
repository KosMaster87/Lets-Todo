/**
 * @fileoverview Personal Data Download Service - JSON Export Only
 * @description Provides functionality to download personal data (todos) in JSON format
 * @module personal-data-download
 */

import { getTodos, getTrashedTodos } from "./../../state/main-state.js";
import {
  triggerDownload,
  generateJSONFilename,
  todosToJSON,
  createExportSuccessMessage,
  validateTodosForExport,
} from "./../../utils/import-export/index.js";

/**
 * Downloads todos as JSON format
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {void}
 */
export const downloadTodos = (onSuccess, onError) => {
  try {
    const exportData = prepareExportData();
    const validation = validateTodosForExport(exportData.totalCount);

    if (!validation.isValid) {
      onError?.(validation.error);
      return;
    }

    executeDownload(exportData, onSuccess);
  } catch (error) {
    console.error("Download error:", error);
    onError?.("Error exporting todos.");
  }
};

/**
 * Prepares todos data for export
 * @returns {Object} Prepared export data with todos and counts
 */
const prepareExportData = () => {
  const todos = getTodos();
  const trashedTodos = getTrashedTodos();
  const totalCount = todos.length + trashedTodos.length;

  return { todos, trashedTodos, totalCount };
};

/**
 * Executes the download process with provided data
 * @param {Object} exportData - Export data object
 * @param {Function} onSuccess - Success callback
 * @returns {void}
 */
const executeDownload = (exportData, onSuccess) => {
  const { todos, trashedTodos, totalCount } = exportData;
  const content = todosToJSON(todos, trashedTodos);
  const filename = generateJSONFilename("todos_export");

  triggerDownload(content, filename, "application/json");

  const successMessage = createExportSuccessMessage(
    totalCount,
    todos.length,
    trashedTodos.length,
    filename
  );
  onSuccess?.(successMessage);
};
