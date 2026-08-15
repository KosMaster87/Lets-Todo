/**
 * @fileoverview Trash UI State Service
 * @description Manages UI state for trash functionality, including filter button updates
 * and action event handlers.
 * @module trash-ui-state
 */

import { getFilterButtonConfig, getNextFilterMode, TRASH_FILTER_MODES } from "./trash-filter.js";

// ###############################################################
// Filter Button UI Management
// ###############################################################

/**
 * Gets filter button DOM element
 * @param {string} buttonId - Button element ID
 * @returns {HTMLElement|null} Button element or null
 */
const getFilterButton = (buttonId) => {
  return document.getElementById(buttonId);
};

/**
 * Updates button text content elements
 * @param {HTMLElement} button - Button element
 * @param {Object} config - Configuration object
 */
const updateButtonContent = (button, config) => {
  const titleElement = button.querySelector(".btn-content h3");
  const descElement = button.querySelector(".btn-content p");

  if (titleElement) titleElement.textContent = config.title;
  if (descElement) descElement.textContent = config.description;
};

/**
 * Updates the filter button text and description based on current mode
 * @param {string} filterMode - Current filter mode
 * @param {string} buttonId - ID of the filter button
 * @returns {boolean} True if button was found and updated
 */
export const updateTrashFilterButtonText = (filterMode, buttonId = "trashFilterBtn") => {
  const filterBtn = getFilterButton(buttonId);
  if (!filterBtn) return false; // Silent fail - button not available yet

  const config = getFilterButtonConfig(filterMode);
  updateButtonContent(filterBtn, config);
  return true;
};

// ###############################################################
// Filter Mode Toggle Operations
// ###############################################################

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
 * Gets default filter mode
 * @returns {string} Default filter mode
 */
const getDefaultFilterMode = () => TRASH_FILTER_MODES.ALL;

/**
 * Initializes the trash filter UI with default state
 * @param {string} buttonId - ID of the filter button
 * @returns {string} Initial filter mode
 */
export const initializeTrashFilterUI = (buttonId = "trashFilterBtn") => {
  const initialMode = getDefaultFilterMode();

  // Only update if button exists (we might not be in trash view)
  const buttonExists = updateTrashFilterButtonText(initialMode, buttonId);
  if (!buttonExists) {
    // Button not found - probably not in trash view, which is fine
    return initialMode;
  }

  return initialMode;
};

// ###############################################################
// Trash Action Event Handlers
// ###############################################################

/**
 * Handles restore button click
 * @param {HTMLElement} button - Restore button element
 * @param {Function} onRestore - Restore callback
 */
const handleRestoreClick = (button, onRestore) => {
  const todoId = button.dataset.todoId;
  onRestore?.(todoId);
};

/**
 * Handles delete forever button click
 * @param {HTMLElement} button - Delete button element
 * @param {Function} onDeleteForever - Delete callback
 */
const handleDeleteForeverClick = (button, onDeleteForever) => {
  const todoId = button.dataset.todoId;
  onDeleteForever?.(todoId);
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
      handleRestoreClick(restoreBtn, onRestore);
    } else if (deleteBtn) {
      handleDeleteForeverClick(deleteBtn, onDeleteForever);
    }
  };
};
