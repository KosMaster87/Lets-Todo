/**
 * @fileoverview Button Configuration Utilities for Action Buttons
 * @module button-config
 */

/**
 * Creates completed state handler with badge update
 * @param {Function} setCompletedState - Function to set completed state
 * @param {Function} updateTodoStatusBadge - Function to update status badge
 * @returns {Function} Enhanced completed state handler
 */
export const createCompletedStateHandler =
  (setCompletedState, updateTodoStatusBadge) => (state) => {
    setCompletedState(state);
    updateTodoStatusBadge(state);
  };

/**
 * Creates bookmark button configuration
 * @param {Function} getBookmarkStateFromDOM - Function to get bookmark state
 * @param {Function} setBookmarkState - Function to set bookmark state
 * @param {Function} createBookmarkToggleHandler - Handler creator function
 * @returns {Object} Bookmark button configuration
 */
export const createBookmarkButtonConfig = (
  getBookmarkStateFromDOM,
  setBookmarkState,
  createBookmarkToggleHandler
) => ({
  elementId: "bookmarkViewBtn",
  handler: createBookmarkToggleHandler(
    getBookmarkStateFromDOM,
    setBookmarkState,
    "bookmarkViewBtn"
  ),
});

/**
 * Creates done button configuration
 * @param {Function} getCompletedStateFromDOM - Function to get completed state
 * @param {Function} setCompletedState - Function to set completed state
 * @param {Function} createCompletedToggleHandler - Handler creator function
 * @param {Function} updateTodoStatusBadge - Function to update status badge
 * @returns {Object} Done button configuration
 */
export const createDoneButtonConfig = (
  getCompletedStateFromDOM,
  setCompletedState,
  createCompletedToggleHandler,
  updateTodoStatusBadge
) => ({
  elementId: "doneTodoBtn",
  handler: createCompletedToggleHandler(
    getCompletedStateFromDOM,
    createCompletedStateHandler(setCompletedState, updateTodoStatusBadge),
    "doneTodoBtn"
  ),
});

/**
 * Creates share button configuration
 * @param {Function} getContentForActions - Function to get content for sharing
 * @param {Function} createShareHandler - Handler creator function
 * @returns {Object} Share button configuration
 */
export const createShareButtonConfig = (
  getContentForActions,
  createShareHandler
) => ({
  elementId: "shareTodoBtn",
  handler: createShareHandler(getContentForActions),
});

/**
 * Creates copy button configuration
 * @param {Function} getContentForActions - Function to get content for copying
 * @param {Function} createCopyHandler - Handler creator function
 * @returns {Object} Copy button configuration
 */
export const createCopyButtonConfig = (
  getContentForActions,
  createCopyHandler
) => ({
  elementId: "copyTodoBtn",
  handler: createCopyHandler(getContentForActions),
});

/**
 * Creates delete button configuration
 * @param {Function} deleteHandler - Pre-configured delete handler
 * @returns {Object} Delete button configuration
 */
export const createDeleteButtonConfig = (deleteHandler) => ({
  elementId: "deleteTodoBtn",
  handler: deleteHandler,
});

/**
 * Creates complete action button configuration object
 * @param {Object} handlers - Handler functions object
 * @param {Object} stateGetters - State getter functions object
 * @param {Object} stateSetters - State setter functions object
 * @param {Function} deleteHandler - Pre-configured delete handler
 * @returns {Object} Complete action button configuration
 */
export const createActionButtonConfig = (
  handlers,
  stateGetters,
  stateSetters,
  deleteHandler
) => ({
  bookmark: createBookmarkButtonConfig(
    stateGetters.getBookmarkStateFromDOM,
    stateSetters.setBookmarkState,
    handlers.createBookmarkToggleHandler
  ),
  done: createDoneButtonConfig(
    stateGetters.getCompletedStateFromDOM,
    stateSetters.setCompletedState,
    handlers.createCompletedToggleHandler,
    handlers.updateTodoStatusBadge
  ),
  share: createShareButtonConfig(
    handlers.getContentForActions,
    handlers.createShareHandler
  ),
  copy: createCopyButtonConfig(
    handlers.getContentForActions,
    handlers.createCopyHandler
  ),
  delete: createDeleteButtonConfig(deleteHandler),
});
