/**
 * @fileoverview Todos List Sharing Service
 * @module todos-list-sharing
 */

import {
  findTodoById,
  isValidTodoId,
  formatTodoContent,
  logTodoAction,
} from "./todos-list-utils.js";

/**
 * Copies text to clipboard using modern API with fallback
 * @param {string} text - Text to copy
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export const copyToClipboard = async (text, onSuccess, onError) => {
  if (!text) {
    onError?.("No text to copy");
    return;
  }

  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      onSuccess?.("Todo copied to clipboard");
    } else {
      fallbackCopy(text, onSuccess, onError);
    }
  } catch (error) {
    console.error("Clipboard copy failed:", error);
    fallbackCopy(text, onSuccess, onError);
  }
};

/**
 * Fallback copy method for older browsers
 * @param {string} text - Text to copy
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export const fallbackCopy = (text, onSuccess, onError) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

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
  } finally {
    document.body.removeChild(textArea);
  }
};

/**
 * Handles sharing a todo using Web Share API with clipboard fallback
 * @param {string|number} todoId - Todo ID
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export const handleShareTodo = async (todoId, onSuccess, onError) => {
  if (!isValidTodoId(todoId)) {
    onError?.("Invalid todo ID");
    return;
  }

  const todo = findTodoById(todoId);
  if (!todo) {
    onError?.(`Todo with ID ${todoId} not found`);
    return;
  }

  logTodoAction("Share", todoId);
  const shareText = formatTodoContent(todo);

  if (navigator.share) {
    try {
      await navigator.share({
        title: todo.title || "Meine Todo",
        text: shareText,
      });
      onSuccess?.("Todo shared successfully");
    } catch (error) {
      if (error.name !== "AbortError") {
        // User didn't cancel, try clipboard fallback
        copyToClipboard(shareText, onSuccess, onError);
      }
    }
  } else {
    // No Web Share API, use clipboard
    copyToClipboard(shareText, onSuccess, onError);
  }
};

/**
 * Handles copying a todo to clipboard
 * @param {string|number} todoId - Todo ID
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export const handleCopyTodo = (todoId, onSuccess, onError) => {
  if (!isValidTodoId(todoId)) {
    onError?.("Invalid todo ID");
    return;
  }

  const todo = findTodoById(todoId);
  if (!todo) {
    onError?.(`Todo with ID ${todoId} not found`);
    return;
  }

  logTodoAction("Copy", todoId);
  const copyText = formatTodoContent(todo);
  copyToClipboard(copyText, onSuccess, onError);
};
