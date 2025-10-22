/**
 * @fileoverview Todo Form State Management
 * @module todo-form
 */

/**
 * Clears form after new todo creation
 * @param {HTMLElement} titleElement - Title DOM element
 * @param {HTMLElement} contentElement - Content DOM element
 */
export const clearFormAfterNewTodo = (titleElement, contentElement) => {
  titleElement.textContent = "Neue Todo";
  contentElement.textContent = "";
  resetBookmarkUI();
};

/**
 * Initializes bookmark and completion state
 * @returns {Object} Object with initialized state values
 */
export const initializeFormState = () => ({
  bookmarkState: false,
  completedState: false,
});

/**
 * Resets bookmark and completion state to defaults
 * @returns {Object} Object with reset state values
 */
export const resetFormState = () => ({
  bookmarkState: false,
  completedState: false,
});

/**
 * Updates todo status badge in the DOM
 * @param {boolean} completed - Whether todo is completed
 */
export const updateTodoStatusBadge = (completed) => {
  const statusBadge = document.querySelector(".todo-status-badge");
  if (statusBadge) {
    statusBadge.className =
      "todo-status-badge " + (completed ? "completed" : "pending");
    statusBadge.textContent = completed ? "Erledigt" : "Neu";
  }
};

/**
 * Resets all bookmark and completion UI elements
 */
export const resetBookmarkUI = () => {
  const bookmarkBtn = document.getElementById("bookmarkViewBtn");
  if (bookmarkBtn) {
    bookmarkBtn.classList.remove("bookmarked");
  }

  const doneBtn = document.getElementById("doneTodoBtn");
  if (doneBtn) {
    doneBtn.classList.remove("completed");
  }

  updateTodoStatusBadge(false);
};
