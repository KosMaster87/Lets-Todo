/**
 * @fileoverview Trash Filter Module
 * @module trash-filter
 */

import { getTrashedTodos } from "./../../state/main-state.js";
import {
  renderTrashPlaceholder,
  renderSingleTrashTodo,
} from "./../../components/pages/trash.js";

// ###############################################################
// Filter Configuration Constants
// ###############################################################

/**
 * Valid filter modes for trash display
 */
export const TRASH_FILTER_MODES = {
  ALL: "all",
  RECENT: "recent",
  OLD: "old",
};

// ###############################################################
// Filter Mode Navigation Utilities
// ###############################################################

/**
 * Gets the next filter mode in the cycle
 * @param {string} currentMode - Current filter mode
 * @returns {string} Next filter mode
 */
export const getNextFilterMode = (currentMode) => {
  switch (currentMode) {
    case TRASH_FILTER_MODES.ALL:
      return TRASH_FILTER_MODES.RECENT;
    case TRASH_FILTER_MODES.RECENT:
      return TRASH_FILTER_MODES.OLD;
    case TRASH_FILTER_MODES.OLD:
      return TRASH_FILTER_MODES.ALL;
    default:
      return TRASH_FILTER_MODES.ALL;
  }
};

// ###############################################################
// Todo Sorting and Filtering Logic
// ###############################################################

/**
 * Sorts todos by recent deletion date
 * @param {Array} todos - Array of todos to sort
 * @returns {Array} Sorted todos (newest first)
 */
const sortByRecentDeletion = (todos) => {
  return todos.sort(
    (a, b) => new Date(b.deletedAt || 0) - new Date(a.deletedAt || 0)
  );
};

/**
 * Sorts todos by old deletion date
 * @param {Array} todos - Array of todos to sort
 * @returns {Array} Sorted todos (oldest first)
 */
const sortByOldDeletion = (todos) => {
  return todos.sort(
    (a, b) => new Date(a.deletedAt || 0) - new Date(b.deletedAt || 0)
  );
};

/**
 * Sorts trashed todos based on filter mode
 * @param {Array} todos - Array of trashed todos
 * @param {string} filterMode - Filter mode to apply
 * @returns {Array} Sorted array of todos
 */
export const sortTrashedTodos = (todos, filterMode) => {
  const todosCopy = [...todos];

  switch (filterMode) {
    case TRASH_FILTER_MODES.RECENT:
      return sortByRecentDeletion(todosCopy);
    case TRASH_FILTER_MODES.OLD:
      return sortByOldDeletion(todosCopy);
    case TRASH_FILTER_MODES.ALL:
    default:
      return todosCopy;
  }
};

// ###############################################################
// Trash Rendering Operations
// ###############################################################

/**
 * Validates and gets trash container element
 * @param {string} containerId - Container element ID
 * @returns {HTMLElement|null} Container element or null
 */
const getTrashContainer = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Trash container with ID '${containerId}' not found`);
  }
  return container;
};

/**
 * Renders empty state for trash
 * @param {HTMLElement} container - Trash container element
 */
const renderEmptyTrash = (container) => {
  container.innerHTML = renderTrashPlaceholder();
};

/**
 * Renders todos in trash container
 * @param {HTMLElement} container - Trash container element
 * @param {Array} todos - Array of todos to render
 */
const renderTrashTodos = (container, todos) => {
  container.innerHTML = todos.map(renderSingleTrashTodo).join("");
};

/**
 * Renders trash todos with applied filter
 * @param {string} filterMode - Filter mode to apply
 * @param {string} containerId - ID of the container element
 */
export const renderTrashWithFilter = (
  filterMode,
  containerId = "trashTodosList"
) => {
  const trashContainer = getTrashContainer(containerId);
  if (!trashContainer) return;

  const trashedTodos = getTrashedTodos();
  const sortedTodos = sortTrashedTodos(trashedTodos, filterMode);

  if (sortedTodos.length === 0) {
    renderEmptyTrash(trashContainer);
  } else {
    renderTrashTodos(trashContainer, sortedTodos);
  }
};

// ###############################################################
// Filter Button Configuration
// ###############################################################

/**
 * Gets configuration for "All" filter mode
 * @returns {Object} Filter configuration object
 */
const getAllFilterConfig = () => ({
  title: "Alle anzeigen",
  description: "Alle gelöschten Todos anzeigen",
});

/**
 * Gets configuration for "Recent" filter mode
 * @returns {Object} Filter configuration object
 */
const getRecentFilterConfig = () => ({
  title: "Neueste zuerst",
  description: "Kürzlich gelöschte Todos zuerst",
});

/**
 * Gets configuration for "Old" filter mode
 * @returns {Object} Filter configuration object
 */
const getOldFilterConfig = () => ({
  title: "Älteste zuerst",
  description: "Älteste gelöschte Todos zuerst",
});

/**
 * Gets filter button configuration for UI display
 * @param {string} filterMode - Current filter mode
 * @returns {Object} Filter button configuration
 */
export const getFilterButtonConfig = (filterMode) => {
  switch (filterMode) {
    case TRASH_FILTER_MODES.ALL:
      return getAllFilterConfig();
    case TRASH_FILTER_MODES.RECENT:
      return getRecentFilterConfig();
    case TRASH_FILTER_MODES.OLD:
      return getOldFilterConfig();
    default:
      return getAllFilterConfig();
  }
};
