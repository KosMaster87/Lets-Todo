// lets-todo-app/src/services/crud/personal-data-upload-handler.js

import {
  validateFileFormat,
  readFileContent,
  parseJSONImport,
  parseCSVImport,
  importActiveTodos,
  importTrashedTodos,
  IMPORT_FORMATS,
} from "./personal-data-upload.js";

import {
  showPersonalDataSuccess,
  showPersonalDataError,
  showPersonalDataInfo,
  updateUploadLoadingState,
  createProgressIndicator,
  removeProgressIndicator,
} from "./personal-data-ui-state.js";

/**
 * Creates file input for todo upload
 * @param {Function} onFileSelected - Callback when file is selected
 * @returns {HTMLInputElement} File input element
 */
export const createFileInput = (onFileSelected) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,.csv";
  input.style.display = "none";

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file && onFileSelected) {
      onFileSelected(file);
    }
  });

  return input;
};

/**
 * Triggers file selection dialog
 * @param {Function} onComplete - Callback when upload is complete
 * @param {Object} options - Upload options
 */
export const triggerFileUpload = (onComplete, options = {}) => {
  const input = createFileInput(async (file) => {
    await handleFileUpload(file, onComplete, options);
  });

  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
};

/**
 * Handles the complete file upload process
 * @param {File} file - Selected file
 * @param {Function} onComplete - Completion callback
 * @param {Object} options - Upload options
 */
export const handleFileUpload = async (file, onComplete, options = {}) => {
  const containerId = options.containerId || "personalDataContainer";

  try {
    // Validate file format
    const validation = validateFileFormat(file);
    if (!validation.isValid) {
      showPersonalDataError(validation.error);
      onComplete?.(false, validation.error);
      return;
    }

    showPersonalDataInfo(`Datei "${file.name}" wird verarbeitet...`);
    updateUploadLoadingState(true);
    createProgressIndicator(containerId, "Datei wird gelesen...");

    // Read file content
    const content = await readFileContent(file);

    removeProgressIndicator(containerId);
    createProgressIndicator(containerId, "Todos werden analysiert...");

    // Parse content based on format
    let parseResult;
    if (validation.format === IMPORT_FORMATS.JSON) {
      parseResult = parseJSONImport(content);
    } else if (validation.format === IMPORT_FORMATS.CSV) {
      parseResult = parseCSVImport(content);
    }

    if (!parseResult.success) {
      removeProgressIndicator(containerId);
      showPersonalDataError(parseResult.error);
      onComplete?.(false, parseResult.error);
      return;
    }

    removeProgressIndicator(containerId);
    createProgressIndicator(containerId, "Todos werden importiert...");

    // Import todos
    const importResult = await importTodosFromParseResult(parseResult, options);

    removeProgressIndicator(containerId);

    if (importResult.success) {
      showUploadSuccessMessage(importResult);
      onComplete?.(true, importResult);
    } else {
      showPersonalDataError(importResult.error);
      onComplete?.(false, importResult.error);
    }
  } catch (error) {
    console.error("Upload error:", error);
    removeProgressIndicator(containerId);
    showPersonalDataError(`Upload-Fehler: ${error.message}`);
    onComplete?.(false, error.message);
  } finally {
    updateUploadLoadingState(false);
  }
};

/**
 * Imports todos from parsed result
 * @param {Object} parseResult - Parsed file result
 * @param {Object} options - Import options
 * @returns {Object} Import result summary
 */
export const importTodosFromParseResult = async (parseResult, options = {}) => {
  try {
    const { activeTodos, trashedTodos, totalCount, metadata } = parseResult;

    // Import active todos
    const activeImportResult = importActiveTodos(activeTodos, options);

    // Import trashed todos if not skipped
    let trashImportResult = {
      imported: 0,
      duplicatesFound: 0,
      errors: [],
      skipped: 0,
    };
    if (!options.skipTrash && trashedTodos.length > 0) {
      trashImportResult = await importTrashedTodos(trashedTodos, options);
    }

    return {
      success: true,
      totalFound: totalCount,
      activeImported: activeImportResult.imported,
      activeSkipped: activeImportResult.skipped,
      activeDuplicates: activeImportResult.duplicatesFound,
      trashFound: trashedTodos.length,
      trashImported: trashImportResult.imported,
      trashSkipped: trashImportResult.skipped,
      trashDuplicates: trashImportResult.duplicatesFound,
      errors: [...activeImportResult.errors, ...trashImportResult.errors],
      metadata,
    };
  } catch (error) {
    return {
      success: false,
      error: `Import-Fehler: ${error.message}`,
    };
  }
};

/**
 * Shows detailed success message for upload
 * @param {Object} result - Import result
 */
export const showUploadSuccessMessage = (result) => {
  const parts = [];

  if (result.activeImported > 0) {
    parts.push(`${result.activeImported} aktive Todos importiert`);
  }

  if (result.trashImported > 0) {
    parts.push(`${result.trashImported} gelöschte Todos wiederhergestellt`);
  }

  const totalSkipped = (result.activeSkipped || 0) + (result.trashSkipped || 0);
  if (totalSkipped > 0) {
    parts.push(`${totalSkipped} Duplikate übersprungen`);
  }

  if (result.errors.length > 0) {
    parts.push(`${result.errors.length} Fehler aufgetreten`);
  }

  const message =
    parts.length > 0 ? parts.join(", ") : "Import erfolgreich abgeschlossen";
  showPersonalDataSuccess(`✅ ${message}`);

  if (result.errors.length > 0) {
    console.warn("Import errors:", result.errors);
  }
};

/**
 * Shows import preview before actual import
 * @param {Object} parseResult - Parsed file result
 * @param {Function} onConfirm - Callback when user confirms
 * @param {Function} onCancel - Callback when user cancels
 */
export const showImportPreview = (parseResult, onConfirm, onCancel) => {
  const { activeTodos, trashedTodos, totalCount } = parseResult;

  const previewMessage = `
Gefunden in der Datei:
• ${activeTodos.length} aktive Todos
• ${trashedTodos.length} gelöschte Todos
• Insgesamt: ${totalCount} Todos

Möchten Sie diese Todos importieren?
(Duplikate werden automatisch übersprungen)
  `.trim();

  if (confirm(previewMessage)) {
    onConfirm?.();
  } else {
    onCancel?.();
  }
};

/**
 * Validates import options
 * @param {Object} options - Import options to validate
 * @returns {Object} Validation result
 */
export const validateImportOptions = (options = {}) => {
  const validatedOptions = {
    allowDuplicates: Boolean(options.allowDuplicates),
    showPreview: options.showPreview !== false, // Default true
    containerId: options.containerId || "personalDataContainer",
    skipTrash: Boolean(options.skipTrash),
  };

  return {
    isValid: true,
    options: validatedOptions,
  };
};

/**
 * Gets supported file types for display
 * @returns {Array} Array of supported file extensions
 */
export const getSupportedFileTypes = () => {
  return [".json", ".csv"];
};

/**
 * Creates upload instructions text
 * @returns {string} Instructions for users
 */
export const getUploadInstructions = () => {
  return `
Unterstützte Dateiformate:
• JSON: Vollständige Todos mit allen Metadaten
• CSV: Tabellenformat für einfache Bearbeitung

Die Datei sollte aus einem vorherigen Export stammen.
Duplikate werden automatisch erkannt und übersprungen.
  `.trim();
};
