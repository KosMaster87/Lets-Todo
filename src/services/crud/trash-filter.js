// lets-todo-app/src/services/crud/trash-filter.js

import { getTrashedTodos } from "./../../state.js";
import {
  renderTrashPlaceholder,
  renderSingleTrashTodo,
} from "./../../components/pages/trash.js";

/**
 * Valid filter modes for trash display
 */
export const TRASH_FILTER_MODES = {
  ALL: "all",
  RECENT: "recent",
  OLD: "old",
};

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
      return todosCopy.sort(
        (a, b) => new Date(b.deletedAt || 0) - new Date(a.deletedAt || 0)
      );
    case TRASH_FILTER_MODES.OLD:
      return todosCopy.sort(
        (a, b) => new Date(a.deletedAt || 0) - new Date(b.deletedAt || 0)
      );
    case TRASH_FILTER_MODES.ALL:
    default:
      return todosCopy;
  }
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
  const trashContainer = document.getElementById(containerId);
  if (!trashContainer) {
    console.warn(`Trash container with ID '${containerId}' not found`);
    return;
  }

  const trashedTodos = getTrashedTodos();
  const sortedTodos = sortTrashedTodos(trashedTodos, filterMode);

  if (sortedTodos.length === 0) {
    trashContainer.innerHTML = renderTrashPlaceholder();
  } else {
    trashContainer.innerHTML = sortedTodos.map(renderSingleTrashTodo).join("");
  }
};

/**
 * Gets filter button configuration for UI display
 * @param {string} filterMode - Current filter mode
 * @returns {Object} Filter button configuration
 */
export const getFilterButtonConfig = (filterMode) => {
  switch (filterMode) {
    case TRASH_FILTER_MODES.ALL:
      return {
        title: "Alle anzeigen",
        description: "Alle gelöschten Todos anzeigen",
      };
    case TRASH_FILTER_MODES.RECENT:
      return {
        title: "Neueste zuerst",
        description: "Kürzlich gelöschte Todos zuerst",
      };
    case TRASH_FILTER_MODES.OLD:
      return {
        title: "Älteste zuerst",
        description: "Älteste gelöschte Todos zuerst",
      };
    default:
      return {
        title: "Alle anzeigen",
        description: "Alle gelöschten Todos anzeigen",
      };
  }
};
