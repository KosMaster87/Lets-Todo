/**
 * @fileoverview Import/Export utilities for data handling
 * @module import-export-helpers
 */

/**
 * Gets supported file types for display
 * @returns {Array} Array of supported file extensions
 */
export const getSupportedFileTypes = () => {
  return [".json"];
};

/**
 * Creates upload instructions text
 * @returns {string} Instructions for users
 */
export const getUploadInstructions = () => {
  return `
  Unterstütztes Dateiformat:
  • JSON: Vollständige Todos mit allen Metadaten und Timestamps

  Die Datei sollte aus einem vorherigen Export stammen.
  Duplikate werden automatisch erkannt und übersprungen.
  `.trim();
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
 * Creates default import options
 * @returns {Object} Default import options
 */
export const createDefaultImportOptions = () => ({
  allowDuplicates: false,
  showPreview: true,
  containerId: "personalDataContainer",
  skipTrash: false,
});

/**
 * Validates file extension against supported types
 * @param {string} fileName - Name of the file to validate
 * @returns {boolean} True if file extension is supported
 */
export const isFileTypeSupported = (fileName) => {
  const supportedTypes = getSupportedFileTypes();
  const fileExtension = fileName
    .toLowerCase()
    .substring(fileName.lastIndexOf("."));
  return supportedTypes.includes(fileExtension);
};

/**
 * Gets file type description for user display
 * @param {string} fileName - Name of the file
 * @returns {string} Human-readable file type description
 */
export const getFileTypeDescription = (fileName) => {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));

  const descriptions = {
    ".json": "JSON-Datei mit vollständigen Todo-Daten",
  };

  return descriptions[extension] || "Unbekannter Dateityp";
};
