/**
 * @fileoverview Todo Action Setup Module
 * @description Sets up action buttons and handlers for todo views
 * @module todo-action-setup
 */

import { getCurrentTodo, trashTodo } from "./../../state/main-state.js";
import { VIEWS } from "./../../utils/constants.js";
import { navigateToView } from "./../navigation/navigation.js";
import {
  setupActionButtons,
  createBookmarkToggleHandler,
  createCompletedToggleHandler,
  createShareHandler,
  createCopyHandler,
  createDeleteHandler,
  createContentClearHandler,
} from "./../navigation/navigation-action-buttons.js";
import { updateTodoStatusBadge, initializeButtonsUI } from "./todo-form.js";
import { getContentForActions, clearTodoContent } from "./todo-content.js";
import {
  getBookmarkStateFromDOM,
  getCompletedStateFromDOM,
  isInTodoView,
  areActionButtonsAvailable,
} from "./../../utils/dom-selectors.js";
import {
  canSetupActionButtons,
  getCurrentDOMStates,
  initializeActionButtons,
} from "./../../utils/ui-state-helpers.js";
import { createActionButtonConfig } from "./../../utils/ui-helpers/button-config.js";

/**
 * Gets the current todo ID for action handlers
 * @returns {string|null} Current todo ID or null
 */
const getCurrentTodoId = () => {
  const currentTodo = getCurrentTodo();
  return currentTodo ? currentTodo.id : null;
};

/**
 * Handles todo deletion by navigating to dashboard
 * @returns {void}
 */
const handleTodoTrash = () => {
  navigateToView(VIEWS.DASHBOARD);
};

/**
 * Determines if current todo exists and has ID
 * @returns {boolean} True if todo exists with ID
 */
const hasExistingTodoId = () => {
  const currentTodo = getCurrentTodo();
  return !!(currentTodo && currentTodo.id);
};

/**
 * Creates delete handler for existing todo
 * @returns {Function} Delete handler for existing todo
 */
const createExistingTodoDeleteHandler = () => {
  return createDeleteHandler(getCurrentTodoId, trashTodo, handleTodoTrash);
};

/**
 * Creates content clear handler for new todo
 * @param {Function} resetBookmarkState - Function to reset bookmark state
 * @returns {Function} Content clear handler
 */
const createNewTodoDeleteHandler = (resetBookmarkState) => {
  return createContentClearHandler(getContentForActions, clearTodoContent, resetBookmarkState);
};

/**
 * Creates appropriate delete handler based on context
 * @param {Function} resetBookmarkState - Function to reset bookmark state
 * @returns {Function} Appropriate delete handler
 */
const createTodoDeleteHandler = (resetBookmarkState) => {
  if (hasExistingTodoId()) {
    return createExistingTodoDeleteHandler();
  }
  return createNewTodoDeleteHandler(resetBookmarkState);
};

/**
 * Sets up action buttons for todo views
 * @param {Function} setBookmarkState - Function to set bookmark state
 * @param {Function} setCompletedState - Function to set completed state
 * @param {Function} resetBookmarkState - Function to reset bookmark state
 * @returns {void}
 */
export const setupTodosActionButtons = (
  setBookmarkState,
  setCompletedState,
  resetBookmarkState
) => {
  if (!canSetupActionButtons(isInTodoView, areActionButtonsAvailable)) return;

  const handlers = {
    createBookmarkToggleHandler,
    createCompletedToggleHandler,
    createShareHandler,
    createCopyHandler,
    updateTodoStatusBadge,
    getContentForActions,
  };

  const stateGetters = {
    getBookmarkStateFromDOM,
    getCompletedStateFromDOM,
  };

  const stateSetters = {
    setBookmarkState,
    setCompletedState,
  };

  const deleteHandler = createTodoDeleteHandler(resetBookmarkState);
  const actionButtonConfig = createActionButtonConfig(
    handlers,
    stateGetters,
    stateSetters,
    deleteHandler
  );

  const currentStates = getCurrentDOMStates(getBookmarkStateFromDOM, getCompletedStateFromDOM);

  initializeActionButtons(
    actionButtonConfig,
    currentStates,
    setupActionButtons,
    initializeButtonsUI
  );
};
