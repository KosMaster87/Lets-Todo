/**
 * @fileoverview Trash UI State Service
 * @module trash-ui-state
 */

import {
  getFilterButtonConfig,
  getNextFilterMode,
  TRASH_FILTER_MODES,
} from "./trash-filter.js";

/**
 * Updates the filter button text and description based on current mode
 * @param {string} filterMode - Current filter mode
 * @param {string} buttonId - ID of the filter button
 * @returns {boolean} True if button was found and updated
 */
export const updateTrashFilterButtonText = (
  filterMode,
  buttonId = "trashFilterBtn"
) => {
  const filterBtn = document.getElementById(buttonId);
  if (!filterBtn) {
    return false; // Silent fail - button not available yet
  }

  const config = getFilterButtonConfig(filterMode);
  const titleElement = filterBtn.querySelector(".btn-content h3");
  const descElement = filterBtn.querySelector(".btn-content p");

  if (titleElement) titleElement.textContent = config.title;
  if (descElement) descElement.textContent = config.description;

  return true;
};

/**
 * Toggles the trash filter mode and updates UI
 * @param {string} currentMode - Current filter mode
 * @param {string} buttonId - ID of the filter button
 * @returns {string} New filter mode
 */
export const toggleTrashFilter = (currentMode, buttonId = "trashFilterBtn") => {
  const newMode = getNextFilterMode(currentMode);
  updateTrashFilterButtonText(newMode, buttonId);
  return newMode;
};

/**
 * Initializes the trash filter UI with default state
 * @param {string} buttonId - ID of the filter button
 * @returns {string} Initial filter mode
 */
export const initializeTrashFilterUI = (buttonId = "trashFilterBtn") => {
  const initialMode = TRASH_FILTER_MODES.ALL;

  // Only update if button exists (we might not be in trash view)
  const buttonExists = updateTrashFilterButtonText(initialMode, buttonId);
  if (!buttonExists) {
    // Button not found - probably not in trash view, which is fine
    return initialMode;
  }

  return initialMode;
};

/**
 * Creates event handlers for trash action buttons
 * @param {Function} onRestore - Callback for restore action
 * @param {Function} onDeleteForever - Callback for delete forever action
 * @returns {Function} Event handler function
 */
export const createTrashActionHandler = (onRestore, onDeleteForever) => {
  return (event) => {
    const restoreBtn = event.target.closest(".restore-todo-btn");
    const deleteBtn = event.target.closest(".delete-forever-btn");

    if (restoreBtn) {
      const todoId = restoreBtn.dataset.todoId;
      onRestore?.(todoId);
    } else if (deleteBtn) {
      const todoId = deleteBtn.dataset.todoId;
      onDeleteForever?.(todoId);
    }
  };
};
