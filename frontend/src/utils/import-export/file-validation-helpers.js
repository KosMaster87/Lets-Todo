/**
 * @fileoverview File Validation Utilities
 * @description Helper functions for validating imported files
 * @module file-validation-helpers
 */

export const IMPORT_FORMATS = {
  JSON: "json",
};

/**
 * Checks if file exists
 * @param {File} file - File object to check
 * @returns {Object|null} Error result or null if valid
 */
export const validateFileExists = (file) => {
  if (!file) {
    return { isValid: false, error: "No file selected." };
  }
  return null;
};

/**
 * Checks if filename has supported extension
 * @param {string} fileName - File name to check
 * @returns {boolean} True if extension is supported
 */
export const isSupportedFileExtension = (fileName) => {
  return fileName.toLowerCase().endsWith(".json");
};

/**
 * Creates success validation result
 * @returns {Object} Success validation result
 */
export const createValidationSuccess = () => ({
  isValid: true,
  format: IMPORT_FORMATS.JSON,
});

/**
 * Creates error validation result for unsupported format
 * @returns {Object} Error validation result
 */
export const createUnsupportedFormatError = () => ({
  isValid: false,
  error: "Unsupported file format. Only JSON files are supported.",
});

/**
 * Creates file reader with event handlers
 * @param {Function} resolve - Promise resolve function
 * @param {Function} reject - Promise reject function
 * @returns {FileReader} Configured file reader
 */
export const createFileReader = (resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => resolve(e.target.result);
  reader.onerror = () => reject(createFileReadError());
  return reader;
};

/**
 * Creates file read error
 * @returns {Error} File read error object
 */
export const createFileReadError = () => {
  return new Error("File could not be read");
};
