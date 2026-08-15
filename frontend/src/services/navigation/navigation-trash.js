/**
 * @fileoverview Navigation event handling for trash view
 * @description Sets up navigation and action handlers for the trash view,
 * including emptying trash, restoring todos, and deleting todos permanently.
 * @module navigation-trash
 */

import { VIEWS } from "./../../utils/constants.js";
import { navigateToView } from "./navigation.js";
import {
  handleEmptyTrash,
  handleRestoreTodo,
  handleDeleteForever,
} from "./../crud/trash-operations.js";
import { renderTrashWithFilter, TRASH_FILTER_MODES } from "./../crud/trash-filter.js";
import { showTrashSuccess, showTrashError } from "./../crud/trash-messages.js";
import {
  toggleTrashFilter,
  initializeTrashFilterUI,
  createTrashActionHandler,
} from "./../crud/trash-ui-state.js";

let trashFilterMode = TRASH_FILTER_MODES.ALL;

/**
 * @function setupTrashNavigation
 * @description Sets up all navigation event handlers for the trash view
 * @returns {void} No return value - performs event handler registration
 */
export function setupTrashNavigation() {
  setupTrashMenuNavigation();
  setupTrashActionButtons();
  initializeTrashUI();
}

/**
 * @function setupTrashMenuNavigation
 * @description Sets up navigation for the trash menu (cancel, empty, filter buttons)
 * @returns {void} No return value - performs event listener registration
 */
function setupTrashMenuNavigation() {
  setupCancelButton();
  setupEmptyTrashButton();
  setupFilterButton();
}

/**
 * @function setupCancelButton
 * @description Sets up cancel button to navigate back to dashboard
 * @returns {void} No return value - performs cancel button setup
 */
const setupCancelButton = () => {
  const cancelBtn = document.getElementById("trashCancelBtn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      navigateToView(VIEWS.DASHBOARD);
    });
  }
};

/**
 * @function setupEmptyTrashButton
 * @description Sets up empty trash button event handler
 * @returns {void} No return value - performs empty trash button setup
 */
const setupEmptyTrashButton = () => {
  const emptyTrashBtn = document.getElementById("emptyTrashBtn");
  if (emptyTrashBtn) {
    emptyTrashBtn.addEventListener("click", handleEmptyTrashAction);
  }
};

/**
 * @function setupFilterButton
 * @description Sets up filter button event handler
 * @returns {void} No return value - performs filter button setup
 */
const setupFilterButton = () => {
  const filterBtn = document.getElementById("trashFilterBtn");
  if (filterBtn) {
    filterBtn.addEventListener("click", handleFilterToggle);
  }
};

/**
 * @function setupTrashActionButtons
 * @description Sets up event handlers for trash action buttons (restore, delete forever)
 * @returns {void} No return value - performs action button event delegation setup
 */
function setupTrashActionButtons() {
  const trashContainer = document.getElementById("trashTodosList");
  if (!trashContainer) return;

  const actionHandler = createTrashActionHandler(handleRestoreAction, handleDeleteForeverAction);

  trashContainer.addEventListener("click", actionHandler);
}

/**
 * @function initializeTrashUI
 * @description Initializes the trash UI with default state
 * @returns {void} No return value - performs UI initialization
 */
function initializeTrashUI() {
  trashFilterMode = initializeTrashFilterUI();
}

/**
 * @function handleFilterToggle
 * @description Handles filter toggle action and re-renders trash list
 * @returns {void} No return value - performs filter toggle and re-render
 */
function handleFilterToggle() {
  trashFilterMode = toggleTrashFilter(trashFilterMode);
  renderTrashWithFilter(trashFilterMode);
}

/**
 * @function handleEmptyTrashAction
 * @description Handles empty trash action with success and error callbacks
 * @returns {void} No return value - performs empty trash operation
 */
function handleEmptyTrashAction() {
  handleEmptyTrash(
    (message) => {
      showTrashSuccess(message);
      renderTrashWithFilter(trashFilterMode);
    },
    (error) => {
      showTrashError(error);
    }
  );
}

/**
 * @function handleRestoreAction
 * @description Handles restore todo action with success and error callbacks
 * @param {string} todoId - ID of the todo to restore
 * @returns {void} No return value - performs todo restoration operation
 */
function handleRestoreAction(todoId) {
  handleRestoreTodo(
    todoId,
    (message) => {
      showTrashSuccess(message);
      renderTrashWithFilter(trashFilterMode);
    },
    (error) => {
      showTrashError(error);
    }
  );
}

/**
 * @function handleDeleteForeverAction
 * @description Handles delete forever action with success and error callbacks
 * @param {string} todoId - ID of the todo to delete forever
 * @returns {void} No return value - performs permanent deletion operation
 */
function handleDeleteForeverAction(todoId) {
  handleDeleteForever(
    todoId,
    (message) => {
      showTrashSuccess(message);
      renderTrashWithFilter(trashFilterMode);
    },
    (error) => {
      showTrashError(error);
    }
  );
}

export { trashFilterMode };
