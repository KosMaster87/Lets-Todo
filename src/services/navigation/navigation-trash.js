// lets-todo-app/src/services/navigation-trash.js

import { VIEWS } from "./../../utils/constants.js";
import { navigateToView } from "./navigation.js";
import {
  handleEmptyTrash,
  handleRestoreTodo,
  handleDeleteForever,
} from "./../crud/trash-operations.js";
import {
  renderTrashWithFilter,
  TRASH_FILTER_MODES,
} from "./../crud/trash-filter.js";
import { showTrashSuccess, showTrashError } from "./../crud/trash-messages.js";
import {
  toggleTrashFilter,
  initializeTrashFilterUI,
  createTrashActionHandler,
} from "./../crud/trash-ui-state.js";

let trashFilterMode = TRASH_FILTER_MODES.ALL;

/**
 * Sets up all navigation event handlers for the trash view.
 */
export function setupTrashNavigation() {
  setupTrashMenuNavigation();
  setupTrashActionButtons();
  initializeTrashUI();
}

/**
 * Sets up navigation for the trash menu (cancel, empty, filter buttons).
 */
function setupTrashMenuNavigation() {
  const cancelBtn = document.getElementById("trashCancelBtn");
  const emptyTrashBtn = document.getElementById("emptyTrashBtn");
  const filterBtn = document.getElementById("trashFilterBtn");

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      navigateToView(VIEWS.DASHBOARD);
    });
  }

  if (emptyTrashBtn) {
    emptyTrashBtn.addEventListener("click", handleEmptyTrashAction);
  }

  if (filterBtn) {
    filterBtn.addEventListener("click", handleFilterToggle);
  }
}

/**
 * Sets up event handlers for trash action buttons (restore, delete forever).
 */
function setupTrashActionButtons() {
  const trashContainer = document.getElementById("trashTodosList");
  if (!trashContainer) return;

  const actionHandler = createTrashActionHandler(
    handleRestoreAction,
    handleDeleteForeverAction
  );

  trashContainer.addEventListener("click", actionHandler);
}

/**
 * Initializes the trash UI with default state.
 */
function initializeTrashUI() {
  trashFilterMode = initializeTrashFilterUI();
}

/**
 * Handles filter toggle action.
 */
function handleFilterToggle() {
  trashFilterMode = toggleTrashFilter(trashFilterMode);
  renderTrashWithFilter(trashFilterMode);
}

/**
 * Handles empty trash action with callbacks.
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
 * Handles restore todo action with callbacks.
 * @param {string} todoId - ID of the todo to restore
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
 * Handles delete forever action with callbacks.
 * @param {string} todoId - ID of the todo to delete forever
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
