/**
 * @fileoverview Todos List Filter Module
 * @description Provides filtering functionality for the todos list, including
 * filter modes, rendering logic, and UI updates.
 * @module todos-list-filter
 */

import { getTodos } from "./../../state/main-state.js";
import { renderTodosList } from "./../../components/pages/todos-list.js";

// ###############################################################
// Filter Constants and Navigation
// ###############################################################

/**
 * Valid filter modes for todos list display
 */
export const TODOS_LIST_FILTER_MODES = {
  ALL: "all",
  COMPLETED: "completed",
  PENDING: "pending",
};

/**
 * Gets the next filter mode in the cycle
 * @param {string} currentMode - Current filter mode
 * @returns {string} Next filter mode
 */
export const getNextFilterMode = (currentMode) => {
  switch (currentMode) {
    case TODOS_LIST_FILTER_MODES.ALL:
      return TODOS_LIST_FILTER_MODES.COMPLETED;
    case TODOS_LIST_FILTER_MODES.COMPLETED:
      return TODOS_LIST_FILTER_MODES.PENDING;
    case TODOS_LIST_FILTER_MODES.PENDING:
      return TODOS_LIST_FILTER_MODES.ALL;
    default:
      return TODOS_LIST_FILTER_MODES.ALL;
  }
};

// ###############################################################
// Todo Filtering Logic
// ###############################################################

/**
 * Filters todos based on filter mode
 * @param {Array} todos - Array of todos
 * @param {string} filterMode - Filter mode to apply
 * @returns {Array} Filtered array of todos
 */
export const filterTodos = (todos, filterMode) => {
  switch (filterMode) {
    case TODOS_LIST_FILTER_MODES.COMPLETED:
      return todos.filter((todo) => todo.completed);
    case TODOS_LIST_FILTER_MODES.PENDING:
      return todos.filter((todo) => !todo.completed);
    case TODOS_LIST_FILTER_MODES.ALL:
    default:
      return todos;
  }
};

// ###############################################################
// Rendering Functions
// ###############################################################

/**
 * Gets and validates container element
 * @param {string} containerId - ID of the container element
 * @returns {HTMLElement|null} Container element or null
 */
const getValidatedContainer = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Todos container with ID '${containerId}' not found`);
    return null;
  }
  return container;
};

/**
 * Renders todos list with applied filter
 * @param {string} filterMode - Filter mode to apply
 * @param {string} containerId - ID of the container element
 * @returns {void}
 */
export const renderTodosListWithFilter = (
  filterMode,
  containerId = "todosList"
) => {
  const todosContainer = getValidatedContainer(containerId);
  if (!todosContainer) return;

  const allTodos = getTodos();
  const filteredTodos = filterTodos(allTodos, filterMode);
  todosContainer.innerHTML = renderTodosList(filteredTodos);
};

// ###############################################################
// UI Configuration and Updates
// ###############################################################

/**
 * Gets configuration for all filter mode
 * @returns {Object} All filter configuration
 */
const getAllFilterConfig = () => ({
  title: "Alle Todos",
  description: "Show all your todos and tasks",
});

/**
 * Gets configuration for completed filter mode
 * @returns {Object} Completed filter configuration
 */
const getCompletedFilterConfig = () => ({
  title: "Erledigte Todos",
  description: "Zeige nur abgeschlossene Todos",
});

/**
 * Gets configuration for pending filter mode
 * @returns {Object} Pending filter configuration
 */
const getPendingFilterConfig = () => ({
  title: "Offene Todos",
  description: "Zeige nur ausstehende Todos",
});

/**
 * Gets filter button configuration for UI display
 * @param {string} filterMode - Current filter mode
 * @returns {Object} Filter button configuration
 */
export const getFilterButtonConfig = (filterMode) => {
  switch (filterMode) {
    case TODOS_LIST_FILTER_MODES.ALL:
      return getAllFilterConfig();
    case TODOS_LIST_FILTER_MODES.COMPLETED:
      return getCompletedFilterConfig();
    case TODOS_LIST_FILTER_MODES.PENDING:
      return getPendingFilterConfig();
    default:
      return getAllFilterConfig();
  }
};

/**
 * Gets filter button elements by IDs
 * @param {string} titleId - ID of the title element
 * @param {string} descId - ID of the description element
 * @returns {Object|null} Elements object or null if not found
 */
const getFilterButtonElements = (titleId, descId) => {
  const titleElement = document.getElementById(titleId);
  const descElement = document.getElementById(descId);

  if (!titleElement || !descElement) {
    return null;
  }

  return { titleElement, descElement };
};

/**
 * Updates DOM elements with filter configuration
 * @param {Object} elements - DOM elements object
 * @param {Object} config - Filter configuration
 * @returns {void}
 */
const updateElementsWithConfig = (elements, config) => {
  elements.titleElement.textContent = config.title;
  elements.descElement.textContent = config.description;
};

/**
 * Updates filter button text based on current mode
 * @param {string} filterMode - Current filter mode
 * @param {string} titleId - ID of the title element
 * @param {string} descId - ID of the description element
 * @returns {boolean} True if elements were found and updated
 */
export const updateFilterButtonText = (
  filterMode,
  titleId = "todosListFilterTitle",
  descId = "todosListFilterDesc"
) => {
  const elements = getFilterButtonElements(titleId, descId);
  if (!elements) return false;

  const config = getFilterButtonConfig(filterMode);
  updateElementsWithConfig(elements, config);
  return true;
};
