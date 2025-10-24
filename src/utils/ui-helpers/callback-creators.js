/**
 * @fileoverview Callback Creator Utilities for UI Actions
 * @module callback-creators
 */

/**
 * Creates success handler for bookmark toggle with UI refresh
 * @param {string} todoId - ID of the todo
 * @param {boolean} shouldRestoreFocus - Whether to restore focus
 * @param {Function} renderFunction - Function to re-render UI
 * @param {Function} restoreFocusFunction - Function to restore focus
 * @returns {Function} Success callback function
 */
export const createBookmarkSuccessHandler =
  (todoId, shouldRestoreFocus, renderFunction, restoreFocusFunction) =>
  (newState) => {
    renderFunction();
    if (shouldRestoreFocus) {
      restoreFocusFunction(todoId);
    }
  };

/**
 * Creates success handler for done toggle with UI refresh
 * @param {string} todoId - ID of the todo
 * @param {boolean} shouldRestoreFocus - Whether to restore focus
 * @param {Function} renderFunction - Function to re-render UI
 * @param {Function} restoreFocusFunction - Function to restore focus
 * @returns {Function} Success callback function
 */
export const createDoneSuccessHandler =
  (todoId, shouldRestoreFocus, renderFunction, restoreFocusFunction) =>
  (newState) => {
    renderFunction();
    if (shouldRestoreFocus) {
      restoreFocusFunction(todoId);
    }
  };

/**
 * Creates generic success handler with optional focus restoration
 * @param {string} todoId - ID of the todo
 * @param {boolean} shouldRestoreFocus - Whether to restore focus
 * @param {Function} renderFunction - Function to re-render UI
 * @param {Function} restoreFocusFunction - Function to restore focus
 * @returns {Function} Generic success callback function
 */
export const createGenericSuccessHandler =
  (todoId, shouldRestoreFocus, renderFunction, restoreFocusFunction) =>
  (newState) => {
    renderFunction();
    if (shouldRestoreFocus && restoreFocusFunction) {
      restoreFocusFunction(todoId);
    }
  };
