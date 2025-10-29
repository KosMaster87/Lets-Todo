/**
 * @fileoverview JSON Parsing and Data Processing Utilities
 * @description Helper functions for parsing and processing JSON data exports
 * @module json-parsing-helpers
 */

/**
 * Checks if data has new export format structure
 * @param {Object} data - Parsed JSON data
 * @returns {boolean} True if new format detected
 */
export const isNewExportFormat = (data) => {
  return data.todos && Array.isArray(data.todos);
};

/**
 * Creates metadata for new format data
 * @param {Object} data - Original data
 * @param {Array} activeTodos - Active todos array
 * @param {Array} trashedTodos - Trashed todos array
 * @returns {Object} Metadata object
 */
export const createNewFormatMetadata = (data, activeTodos, trashedTodos) => ({
  exportDate: data.exportDate,
  originalActiveTodos: data.activeTodos || activeTodos.length,
  originalTrashedTodos: data.trashedTodos || trashedTodos.length,
});

/**
 * Creates success result object
 * @param {Array} activeTodos - Active todos array
 * @param {Array} trashedTodos - Trashed todos array
 * @param {Object} metadata - Metadata object
 * @returns {Object} Success result
 */
export const createSuccessResult = (activeTodos, trashedTodos, metadata) => ({
  success: true,
  activeTodos,
  trashedTodos,
  totalCount: activeTodos.length + trashedTodos.length,
  metadata,
});

/**
 * Creates parse error result
 * @param {Error} error - Parse error
 * @returns {Object} Error result
 */
export const createParseError = (error) => ({
  success: false,
  error: `JSON parsing error: ${error.message}`,
});

/**
 * Creates unknown format error result
 * @returns {Object} Error result
 */
export const createUnknownFormatError = () => ({
  success: false,
  error: "Unknown JSON format",
});

/**
 * Checks if value is already a string
 * @param {*} value - Value to check
 * @returns {boolean} True if value is string
 */
export const isStringValue = (value) => {
  return typeof value === "string";
};

/**
 * Converts array to string by joining elements
 * @param {Array} value - Array to convert
 * @returns {string} Joined string
 */
export const arrayToString = (value) => {
  return value.join("");
};

/**
 * Converts object to string by joining values
 * @param {Object} value - Object to convert
 * @returns {string} Joined object values
 */
export const objectToString = (value) => {
  return Object.values(value).join("");
};

/**
 * Creates fallback string for primitive values
 * @param {*} value - Value to convert
 * @returns {string} String representation
 */
export const createFallbackString = (value) => {
  return String(value || "");
};
