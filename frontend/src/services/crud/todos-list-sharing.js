/**
 * @fileoverview Todos List Sharing Service
 * @description Provides functions to share or copy todos using Web Share API or clipboard
 * @module todos-list-sharing
 */

import {
  findTodoById,
  isValidTodoId,
  formatTodoContent,
  logTodoAction,
} from "./todos-list-utils.js";

// ###############################################################
// Clipboard Operations
// ###############################################################

/**
 * Attempts modern clipboard API copy
 * @param {string} text - Text to copy
 * @param {Function} onSuccess - Success callback
 * @returns {Promise<void>}
 */
const attemptModernClipboardCopy = async (text, onSuccess) => {
  await navigator.clipboard.writeText(text);
  onSuccess?.("Todo copied to clipboard");
};

/**
 * Executes clipboard copy with error handling
 * @param {string} text - Text to copy
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {Promise<void>}
 */
const executeClipboardOperation = async (text, onSuccess, onError) => {
  try {
    if (navigator.clipboard) {
      await attemptModernClipboardCopy(text, onSuccess);
    } else {
      fallbackCopy(text, onSuccess, onError);
    }
  } catch (error) {
    console.error("Clipboard copy failed:", error);
    fallbackCopy(text, onSuccess, onError);
  }
};

/**
 * Copies text to clipboard using modern API with fallback
 * @param {string} text - Text to copy
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {Promise<void>}
 */
export const copyToClipboard = async (text, onSuccess, onError) => {
  if (!text) {
    onError?.("No text to copy");
    return;
  }

  await executeClipboardOperation(text, onSuccess, onError);
};

/**
 * Creates and configures textarea for fallback copy
 * @param {string} text - Text to copy
 * @returns {HTMLTextAreaElement} Configured textarea element
 */
const createFallbackTextArea = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  return textArea;
};

/**
 * Executes fallback copy operation
 * @param {HTMLTextAreaElement} textArea - Textarea element
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {void}
 */
const executeFallbackCopy = (textArea, onSuccess, onError) => {
  try {
    const successful = document.execCommand("copy");
    if (successful) {
      onSuccess?.("Todo copied to clipboard (fallback)");
    } else {
      onError?.("Copy failed");
    }
  } catch (error) {
    console.error("Fallback copy failed:", error);
    onError?.("Copy failed");
  }
};

/**
 * Fallback copy method for older browsers
 * @param {string} text - Text to copy
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {void}
 */
export const fallbackCopy = (text, onSuccess, onError) => {
  const textArea = createFallbackTextArea(text);

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  executeFallbackCopy(textArea, onSuccess, onError);
  document.body.removeChild(textArea);
};

// ###############################################################
// Todo Sharing Operations
// ###############################################################

/**
 * Validates todo ID and finds todo
 * @param {string|number} todoId - Todo ID
 * @param {Function} onError - Error callback
 * @returns {Object|null} Todo object or null if invalid
 */
const validateAndFindTodo = (todoId, onError) => {
  if (!isValidTodoId(todoId)) {
    onError?.("Invalid todo ID");
    return null;
  }

  const todo = findTodoById(todoId);
  if (!todo) {
    onError?.(`Todo with ID ${todoId} not found`);
    return null;
  }

  return todo;
};

/**
 * Creates share text for a todo
 * @param {Object} todo - Todo object
 * @returns {string} Formatted share text
 */
const createShareText = (todo) => formatTodoContent(todo);

/**
 * Validates and prepares share data for a todo
 * @param {string|number} todoId - Todo ID
 * @param {Function} onError - Error callback
 * @returns {Object|null} Share data object or null if invalid
 */
const validateAndPrepareShareData = (todoId, onError) => {
  const todo = validateAndFindTodo(todoId, onError);
  if (!todo) return null;

  const shareText = createShareText(todo);
  return { todo, shareText };
};

/**
 * Attempts native Web Share API
 * @param {Object} todo - Todo object
 * @param {string} shareText - Formatted share text
 * @param {Function} onSuccess - Success callback
 * @returns {Promise<boolean>} True if successful, false if should fallback
 */
const attemptNativeShare = async (todo, shareText, onSuccess) => {
  try {
    await navigator.share({
      title: todo.title || "Meine Todo",
      text: shareText,
    });
    onSuccess?.("Todo shared successfully");
    return true;
  } catch (error) {
    return error.name === "AbortError"; // User cancelled, don't fallback
  }
};

/**
 * Executes share operation with native or fallback
 * @param {Object} shareData - Share data object
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {Promise<void>}
 */
const executeShareOperation = async (shareData, onSuccess, onError) => {
  if (navigator.share) {
    const shareSuccessful = await attemptNativeShare(
      shareData.todo,
      shareData.shareText,
      onSuccess
    );
    if (!shareSuccessful) {
      copyToClipboard(shareData.shareText, onSuccess, onError);
    }
  } else {
    copyToClipboard(shareData.shareText, onSuccess, onError);
  }
};

/**
 * Handles sharing a todo using Web Share API with clipboard fallback
 * @param {string|number} todoId - Todo ID
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {Promise<void>}
 */
export const handleShareTodo = async (todoId, onSuccess, onError) => {
  const shareData = validateAndPrepareShareData(todoId, onError);
  if (!shareData) return;

  logTodoAction("Share", todoId);
  await executeShareOperation(shareData, onSuccess, onError);
};

/**
 * Handles copying a todo to clipboard
 * @param {string|number} todoId - Todo ID
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {void}
 */
export const handleCopyTodo = (todoId, onSuccess, onError) => {
  const shareData = validateAndPrepareShareData(todoId, onError);
  if (!shareData) return;

  logTodoAction("Copy", todoId);
  copyToClipboard(shareData.shareText, onSuccess, onError);
};
