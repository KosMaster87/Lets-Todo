/**
 * @fileoverview Action Buttons Module
 * @description Sets up and manages action buttons for todo items
 * @module navigation-action-buttons
 */

import { getTodoElements } from "./../../utils/dom-selectors.js";
import { logActionStatus, showMessage } from "./../../utils/ui-helpers/message-helpers.js";
import { updateBookmarkButton, updateCompletedButton } from "./../../utils/ui-state-helpers.js";
import { fallbackCopy, fallbackShare } from "./../../utils/ui-helpers/clipboard-helpers.js";
import { hasAnyTodoContent, handleContentClear } from "./../../utils/ui-helpers/content-helpers.js";

/**
 * Logs missing element warning if not suppressed
 * @param {string} elementId - Button element ID
 * @param {string} actionType - Type of action
 * @param {boolean} suppressWarnings - Whether to suppress warnings
 * @returns {void}
 */
const logMissingElementWarning = (elementId, actionType, suppressWarnings) => {
  if (!suppressWarnings) {
    logActionStatus("warning", `⚠️ Action button element ${elementId} not found for ${actionType}`);
  }
};

/**
 * Removes existing event handler from element
 * @param {HTMLElement} element - Button element
 * @returns {void}
 */
const removeExistingHandler = (element) => {
  const existingHandler = element._actionHandler;
  if (existingHandler) {
    element.removeEventListener("click", existingHandler);
  }
};

/**
 * Adds event handler to element
 * @param {HTMLElement} element - Button element
 * @param {Function} handler - Click handler function
 * @returns {void}
 */
const addEventHandler = (element, handler) => {
  element.addEventListener("click", handler);
  element._actionHandler = handler;
};

/**
 * Configures a single action button with handler
 * @param {string} actionType - Type of action
 * @param {string} elementId - Button element ID
 * @param {Function} handler - Click handler function
 * @param {boolean} suppressWarnings - Whether to suppress warnings
 * @returns {boolean} True if configured successfully
 */
const configureActionButton = (actionType, elementId, handler, suppressWarnings) => {
  const element = document.getElementById(elementId);
  if (!element) {
    logMissingElementWarning(elementId, actionType, suppressWarnings);
    return false;
  }

  removeExistingHandler(element);
  addEventHandler(element, handler);
  return true;
};

/**
 * Configures a single button entry from config
 * @param {string} actionType - Type of action
 * @param {Object} buttonConfig - Button configuration
 * @param {boolean} suppressWarnings - Whether to suppress warnings
 * @returns {boolean} True if configured successfully
 */
const configureSingleButton = (actionType, buttonConfig, suppressWarnings) => {
  const { elementId, handler } = buttonConfig;
  return configureActionButton(actionType, elementId, handler, suppressWarnings);
};

/**
 * Logs setup completion status
 * @param {number} configuredCount - Number of configured buttons
 * @param {number} totalCount - Total number of buttons
 * @returns {void}
 */
const logSetupStatus = (configuredCount, totalCount) => {
  if (configuredCount > 0) {
    logActionStatus(
      "info",
      `🎯 Action buttons setup complete: ${configuredCount}/${totalCount} configured`
    );
  } else {
    logActionStatus("info", "📋 No action buttons found to configure");
  }
};

/**
 * Sets up action buttons with configurable handlers
 * @param {Object} config - Configuration object with button definitions
 * @param {boolean} suppressWarnings - Whether to suppress missing element warnings
 * @returns {void}
 */
export const setupActionButtons = (config, suppressWarnings = false) => {
  let configuredCount = 0;
  const totalCount = Object.keys(config).length;

  Object.entries(config).forEach(([actionType, buttonConfig]) => {
    if (configureSingleButton(actionType, buttonConfig, suppressWarnings)) {
      configuredCount++;
    }
  });

  logSetupStatus(configuredCount, totalCount);
};

/**
 * Handles bookmark toggle functionality
 * @param {Function} getBookmarkState - Function to get current bookmark state
 * @param {Function} setBookmarkState - Function to set bookmark state
 * @param {string} buttonId - ID of the bookmark button
 * @returns {Function} Event handler function
 */
export const createBookmarkToggleHandler =
  (getBookmarkState, setBookmarkState, buttonId) => (event) => {
    event.preventDefault();

    const bookmarkBtn = event.currentTarget;
    if (!bookmarkBtn) return;

    const currentState = getBookmarkState();
    const newState = !currentState;

    setBookmarkState(newState);
    updateBookmarkButton(bookmarkBtn, newState);
  };

/**
 * Handles completed/done toggle functionality
 * @param {Function} getCompletedState - Function to get current completed state
 * @param {Function} setCompletedState - Function to set completed state
 * @param {string} buttonId - ID of the done button
 * @returns {Function} Event handler function
 */
export const createCompletedToggleHandler =
  (getCompletedState, setCompletedState, buttonId) => (event) => {
    event.preventDefault();

    const doneBtn = event.currentTarget;
    if (!doneBtn) return;

    const currentState = getCompletedState();
    const newState = !currentState;

    setCompletedState(newState);
    updateCompletedButton(doneBtn, newState);
  };

/**
 * Executes native sharing with fallback
 * @param {string} shareText - Text to share
 * @param {string} title - Share title
 * @returns {void}
 */
const executeShare = (shareText, title) => {
  if (navigator.share) {
    navigator
      .share({
        title: title || "My Todo",
        text: shareText,
      })
      .catch(() => fallbackShare(shareText));
  } else {
    fallbackShare(shareText);
  }
};

/**
 * Handles content sharing functionality
 * @param {Function} getContentCallback - Function to get title and content
 * @returns {Function} Event handler function
 */
export const createShareHandler = (getContentCallback) => (event) => {
  event.preventDefault();

  const { title, content } = getContentCallback();
  if (!title && !content) {
    showMessage("No content available to share.");
    return;
  }

  const shareText = `${title}\n\n${content}`;
  executeShare(shareText, title);
};

/**
 * Executes clipboard copy with fallback
 * @param {string} copyText - Text to copy
 * @returns {void}
 */
const executeCopy = (copyText) => {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(copyText)
      .then(() => showMessage("Todo copied to clipboard!"))
      .catch(() => fallbackCopy(copyText));
  } else {
    fallbackCopy(copyText);
  }
};

/**
 * Handles content copying functionality
 * @param {Function} getContentCallback - Function to get title and content
 * @returns {Function} Event handler function
 */
export const createCopyHandler = (getContentCallback) => (event) => {
  event.preventDefault();

  const { title, content } = getContentCallback();
  const copyText = `${title}\n\n${content}`;
  executeCopy(copyText);
};

/**
 * Handles content clearing functionality (for new todos being created)
 * @param {Function} getContentCallback - Function to get current content
 * @param {Function} clearContentCallback - Function to clear content
 * @param {Function} onDeleteCallback - Optional callback after deletion
 * @returns {Function} Event handler function
 */
export const createContentClearHandler =
  (getContentCallback, clearContentCallback, onDeleteCallback) => (event) => {
    event.preventDefault();

    const { title, content } = getContentCallback();
    const { titleElement, contentElement } = getTodoElements();

    if (!titleElement && !contentElement) {
      showMessage("No todo elements found.");
      return;
    }

    const hasContent = hasAnyTodoContent(title, content, titleElement, contentElement);
    handleContentClear(clearContentCallback, onDeleteCallback, hasContent);
  };

/**
 * Executes todo deletion with error handling
 * @param {string} todoId - ID of todo to delete
 * @param {Function} trashTodoCallback - Function to move todo to trash
 * @param {Function} onDeleteCallback - Optional callback after deletion
 * @returns {void}
 */
const executeTodoDeletion = (todoId, trashTodoCallback, onDeleteCallback) => {
  try {
    trashTodoCallback(todoId);
    showMessage("Todo was moved to trash!");

    if (onDeleteCallback) {
      onDeleteCallback();
    }
  } catch (error) {
    logActionStatus("error", "Error deleting todo:", error);
    showMessage("Error deleting todo.", "error");
  }
};

/**
 * Handles todo deletion functionality (moves todo to trash)
 * @param {Function} getTodoIdCallback - Function to get current todo ID
 * @param {Function} trashTodoCallback - Function to move todo to trash
 * @param {Function} onDeleteCallback - Optional callback after deletion
 * @returns {Function} Event handler function
 */
export const createDeleteHandler =
  (getTodoIdCallback, trashTodoCallback, onDeleteCallback) => (event) => {
    event.preventDefault();

    const todoId = getTodoIdCallback();
    if (!todoId) {
      showMessage("No todo found to delete.", "error");
      return;
    }

    if (confirm("Do you really want to move this todo to trash?")) {
      executeTodoDeletion(todoId, trashTodoCallback, onDeleteCallback);
    }
  };
