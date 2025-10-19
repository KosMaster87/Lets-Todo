/**
 * @fileoverview Action Buttons Module
 * @module navigation-action-buttons
 */

import { getTodoElements } from "./../../utils/dom-selectors.js";
import { DEBUG_MODE } from "./../../utils/constants.js";

/**
 * Logs action button operation status
 * @param {string} type - Message type (success, warning, info)
 * @param {string} message - Message to log
 * @param {any} data - Optional data to log
 */
const logActionStatus = (type, message, data = null) => {
  if (!DEBUG_MODE) return;

  const logFunctions = {
    success: console.log,
    warning: console.warn,
    info: console.log,
    error: console.error,
  };

  const logFunction = logFunctions[type] || console.log;
  data ? logFunction(message, data) : logFunction(message);
};

/**
 * Configures a single action button with handler
 * @param {string} actionType - Type of action
 * @param {string} elementId - Button element ID
 * @param {Function} handler - Click handler function
 * @param {boolean} suppressWarnings - Whether to suppress warnings
 * @returns {boolean} True if configured successfully
 */
const configureActionButton = (
  actionType,
  elementId,
  handler,
  suppressWarnings
) => {
  const element = document.getElementById(elementId);
  if (!element) {
    if (!suppressWarnings) {
      logActionStatus(
        "warning",
        `⚠️ Action button element ${elementId} not found for ${actionType}`
      );
    }
    return false;
  }

  const existingHandler = element._actionHandler;
  if (existingHandler) {
    element.removeEventListener("click", existingHandler);
  }

  element.addEventListener("click", handler);
  element._actionHandler = handler;
  return true;
};

/**
 * Sets up action buttons with configurable handlers
 * @param {Object} config - Configuration object with button definitions
 * @param {boolean} suppressWarnings - Whether to suppress missing element warnings
 */
export const setupActionButtons = (config, suppressWarnings = false) => {
  let configuredCount = 0;
  const totalCount = Object.keys(config).length;

  Object.entries(config).forEach(([actionType, { elementId, handler }]) => {
    if (
      configureActionButton(actionType, elementId, handler, suppressWarnings)
    ) {
      configuredCount++;
    }
  });

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
 * Updates bookmark button visual state
 * @param {HTMLElement} button - Bookmark button element
 * @param {boolean} isBookmarked - New bookmark state
 */
const updateBookmarkButton = (button, isBookmarked) => {
  if (isBookmarked) {
    button.classList.add("bookmarked");
    showMessage("Marked as bookmark!");
  } else {
    button.classList.remove("bookmarked");
    showMessage("Bookmark removed!");
  }
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

    const bookmarkBtn = document.getElementById(buttonId);
    if (!bookmarkBtn) return;

    const currentState = getBookmarkState();
    const newState = !currentState;

    setBookmarkState(newState);
    updateBookmarkButton(bookmarkBtn, newState);
  };

/**
 * Updates completed button visual state
 * @param {HTMLElement} button - Done button element
 * @param {boolean} isCompleted - New completed state
 */
const updateCompletedButton = (button, isCompleted) => {
  if (isCompleted) {
    button.classList.add("completed");
    showMessage("Todo marked as completed!");
  } else {
    button.classList.remove("completed");
    showMessage("Todo marked as pending!");
  }
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

    const doneBtn = document.getElementById(buttonId);
    if (!doneBtn) return;

    const currentState = getCompletedState();
    const newState = !currentState;

    setCompletedState(newState);
    updateCompletedButton(doneBtn, newState);
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
 * Handles content copying functionality
 * @param {Function} getContentCallback - Function to get title and content
 * @returns {Function} Event handler function
 */
export const createCopyHandler = (getContentCallback) => (event) => {
  event.preventDefault();

  const { title, content } = getContentCallback();
  const copyText = `${title}\n\n${content}`;

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
 * Checks if todo has any content
 * @param {string} title - Todo title
 * @param {string} content - Todo content
 * @param {HTMLElement} titleElement - Title DOM element
 * @param {HTMLElement} contentElement - Content DOM element
 * @returns {boolean} True if todo has content
 */
const hasAnyTodoContent = (title, content, titleElement, contentElement) => {
  return (
    title ||
    content ||
    (titleElement && titleElement.textContent.trim() !== "New Todo") ||
    (contentElement && contentElement.textContent.trim() !== "")
  );
};

/**
 * Handles content clearing with user confirmation
 * @param {Function} clearContentCallback - Function to clear content
 * @param {Function} onDeleteCallback - Optional callback after deletion
 * @param {boolean} hasContent - Whether todo has content
 */
const handleContentClear = (
  clearContentCallback,
  onDeleteCallback,
  hasContent
) => {
  const confirmMessage = hasContent
    ? "Do you really want to delete the content of this todo?"
    : "Do you want to reset the todo?";

  const successMessage = hasContent ? "Content deleted!" : "Todo reset!";

  if (confirm(confirmMessage)) {
    clearContentCallback();
    showMessage(successMessage);

    if (onDeleteCallback) {
      onDeleteCallback();
    }
  }
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

    const hasContent = hasAnyTodoContent(
      title,
      content,
      titleElement,
      contentElement
    );
    handleContentClear(clearContentCallback, onDeleteCallback, hasContent);
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
    }
  };

/**
 * Creates a temporary textarea for fallback copy operations
 * @param {string} text - Text to copy
 * @returns {HTMLTextAreaElement} Configured textarea element
 */
const createCopyTextArea = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.cssText = "position: fixed; left: -999999px; top: -999999px;";
  return textArea;
};

/**
 * Fallback copy function for older browsers
 * @param {string} text - Text to copy
 */
export const fallbackCopy = (text) => {
  const textArea = createCopyTextArea(text);
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
    showMessage("Todo copied to clipboard!");
  } catch (err) {
    showMessage("Copy failed.");
  }

  document.body.removeChild(textArea);
};

/**
 * Fallback share function
 * @param {string} text - Text to share
 */
const fallbackShare = (text) => {
  fallbackCopy(text);
  showMessage("Todo copied - ready to share!");
};

/**
 * Creates styled message element
 * @param {string} message - Message text
 * @param {string} type - Message type
 * @returns {HTMLDivElement} Styled message element
 */
const createMessageElement = (message, type) => {
  const messageDiv = document.createElement("div");
  messageDiv.textContent = message;

  const backgroundColor =
    type === "error" ? "rgba(244, 67, 54, 0.9)" : "rgba(76, 175, 80, 0.9)";

  messageDiv.style.cssText = `
    position: fixed; top: 20px; right: 20px;
    background: ${backgroundColor}; color: white;
    padding: 1rem; border-radius: 0.5rem; z-index: 1000;
    font-size: 0.9rem; max-width: 300px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `;

  return messageDiv;
};

/**
 * Shows a message to the user
 * @param {string} message - Message to display
 * @param {string} type - Message type (success, error, info)
 */
export const showMessage = (message, type = "success") => {
  logActionStatus("info", `Action message (${type}): ${message}`);

  const messageDiv = createMessageElement(message, type);
  document.body.appendChild(messageDiv);

  setTimeout(() => {
    if (document.body.contains(messageDiv)) {
      document.body.removeChild(messageDiv);
    }
  }, 3000);
};
