/**
 * @fileoverview Todos List Filter Module
 * @module todos-list-filter
 */

import { getTodos } from "./../../state/main-state.js";
import { renderTodosList } from "./../../components/pages/todos-list.js";

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

/**
 * Renders todos list with applied filter
 * @param {string} filterMode - Filter mode to apply
 * @param {string} containerId - ID of the container element
 */
export const renderTodosListWithFilter = (
  filterMode,
  containerId = "todosList"
) => {
  const todosContainer = document.getElementById(containerId);
  if (!todosContainer) {
    console.warn(`Todos container with ID '${containerId}' not found`);
    return;
  }

  const allTodos = getTodos();
  const filteredTodos = filterTodos(allTodos, filterMode);

  todosContainer.innerHTML = renderTodosList(filteredTodos);
};

/**
 * Gets filter button configuration for UI display
 * @param {string} filterMode - Current filter mode
 * @returns {Object} Filter button configuration
 */
export const getFilterButtonConfig = (filterMode) => {
  switch (filterMode) {
    case TODOS_LIST_FILTER_MODES.ALL:
      return {
        title: "Alle Todos",
        description: "Zeige alle deine Todos und Aufgaben",
      };
    case TODOS_LIST_FILTER_MODES.COMPLETED:
      return {
        title: "Erledigte Todos",
        description: "Zeige nur abgeschlossene Todos",
      };
    case TODOS_LIST_FILTER_MODES.PENDING:
      return {
        title: "Offene Todos",
        description: "Zeige nur ausstehende Todos",
      };
    default:
      return {
        title: "Alle Todos",
        description: "Zeige alle deine Todos und Aufgaben",
      };
  }
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
  const titleElement = document.getElementById(titleId);
  const descElement = document.getElementById(descId);

  if (!titleElement || !descElement) {
    return false; // Elements not available
  }

  const config = getFilterButtonConfig(filterMode);
  titleElement.textContent = config.title;
  descElement.textContent = config.description;

  return true;
};
