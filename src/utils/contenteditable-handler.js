// lets-todo-app/src/utils/contenteditable-handler.js

/**
 * Central contenteditable handler for todo elements
 * Provides consistent behavior across todo creation, editing, and other views
 */

import { getTodoElements } from "./dom-selectors.js";
import {
  validateTodoTitle,
  validateTodoContent,
} from "./../services/crud/todo-validation.js";

/**
 * Sets up contenteditable handlers for todo title and content elements
 * @param {Object} options - Configuration options
 * @param {Function} options.onContentChange - Callback for content changes
 * @param {Function} options.onKeyDown - Callback for key events
 * @param {boolean} options.debug - Enable debug logging
 */
export function setupContentEditableHandlers(options = {}) {
  const { debug = false } = options;
  const { titleElement, contentElement } = getTodoElements();

  if (!titleElement && !contentElement) {
    if (debug) {
      console.warn("ContentEditable Handler: No todo elements found");
    }
    return false;
  }

  let setupCount = 0;

  if (titleElement) {
    setupElementHandlers(titleElement, {
      validateFn: validateTodoTitle,
      elementType: "title",
      ...options,
    });
    setupCount++;
  }

  if (contentElement) {
    setupElementHandlers(contentElement, {
      validateFn: validateTodoContent,
      hasKeyHandler: true,
      elementType: "content",
      ...options,
    });
    setupCount++;
  }

  if (debug) {
    console.log(
      `ContentEditable Handler: Setup complete for ${setupCount} elements`
    );
  }

  return true;
}

/**
 * Sets up all event handlers for a single contenteditable element
 * @param {HTMLElement} element - The contenteditable element
 * @param {Object} options - Configuration options
 */
function setupElementHandlers(element, options = {}) {
  const {
    validateFn,
    onContentChange,
    onKeyDown,
    hasKeyHandler,
    elementType,
    debug,
  } = options;

  // Mark element as never focused for initial cursor positioning
  element._hasBeenFocused = false;
  element._elementType = elementType || "unknown";

  if (debug) {
    console.log(
      `ContentEditable Handler: Setting up ${elementType || "unknown"} element`
    );
  }

  // Core event handlers
  if (validateFn) {
    element.addEventListener("blur", validateFn);
  }

  element.addEventListener("input", (event) => {
    handleContentChange(event);
    if (onContentChange) {
      onContentChange(event);
    }
  });

  element.addEventListener("focus", handlePlaceholderFocus);
  element.addEventListener("blur", handlePlaceholderBlur);

  // Content element gets additional input handler for placeholder styling
  if (hasKeyHandler) {
    element.addEventListener("input", handlePlaceholderInput);
    element.addEventListener("keydown", (event) => {
      handleKeyDown(event);
      if (onKeyDown) {
        onKeyDown(event);
      }
    });
  }
}

/**
 * Handles content change events in contenteditable fields
 * @param {InputEvent} event - The input event
 */
function handleContentChange(event) {
  // Auto-save functionality could be added here
  // console.log("Content changed:", event.target.textContent);
}

/**
 * Handles placeholder focus events in contenteditable fields
 * @param {FocusEvent} event - The focus event
 */
function handlePlaceholderFocus(event) {
  const element = event.target;
  const placeholder = element.getAttribute("data-placeholder");
  const isFirstFocus = !element._hasBeenFocused;

  // Handle placeholder text removal
  if (element.textContent === placeholder) {
    element.textContent = "";
    element.classList.remove("placeholder-active");
  }

  // Only set cursor to beginning on first focus, or when placeholder was cleared
  if (isFirstFocus || element.textContent === placeholder) {
    setTimeout(() => {
      if (element === document.activeElement) {
        setCursorToStart(element);
      }
    }, 0);
  }

  // Mark element as focused
  element._hasBeenFocused = true;
}

/**
 * Handles placeholder input events in contenteditable fields
 * @param {InputEvent} event - The input event
 */
function handlePlaceholderInput(event) {
  const element = event.target;
  const placeholder = element.getAttribute("data-placeholder");

  // Remove placeholder styling when user types
  if (
    element.textContent !== placeholder &&
    element.textContent.trim() !== ""
  ) {
    element.classList.remove("placeholder-active");
  }
}

/**
 * Handles placeholder blur events in contenteditable fields
 * @param {FocusEvent} event - The focus event
 */
function handlePlaceholderBlur(event) {
  const element = event.target;
  const placeholder = element.getAttribute("data-placeholder");

  if (element.textContent.trim() === "") {
    element.textContent = placeholder;
    element.classList.add("placeholder-active");
  }
}

/**
 * Initializes placeholder for title and content elements on page load
 */
export function initializePlaceholders() {
  const { titleElement, contentElement } = getTodoElements();

  if (titleElement && titleElement.textContent.trim() === "") {
    const titlePlaceholder = titleElement.getAttribute("data-placeholder");
    if (titlePlaceholder) {
      titleElement.textContent = titlePlaceholder;
      titleElement.classList.add("placeholder-active");
    }
  }

  if (contentElement && contentElement.textContent.trim() === "") {
    const contentPlaceholder = contentElement.getAttribute("data-placeholder");
    if (contentPlaceholder) {
      contentElement.textContent = contentPlaceholder;
      contentElement.classList.add("placeholder-active");
    }
  }
}

/**
 * Sets cursor to the beginning of a contenteditable element
 * @param {HTMLElement} element - The contenteditable element
 */
function setCursorToStart(element) {
  try {
    const range = document.createRange();
    const selection = window.getSelection();

    // Clear any existing selections
    selection.removeAllRanges();

    // Different strategies for different content structures
    if (element.childNodes.length === 0) {
      // Empty element - position at start
      range.setStart(element, 0);
      range.setEnd(element, 0);
    } else {
      // Has content - find first text node or position before first element
      let targetNode = element;
      let targetOffset = 0;

      // Walk through child nodes to find the first text node
      for (let i = 0; i < element.childNodes.length; i++) {
        const node = element.childNodes[i];
        if (node.nodeType === Node.TEXT_NODE) {
          targetNode = node;
          targetOffset = 0;
          break;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // Position before this element
          targetNode = element;
          targetOffset = i;
          break;
        }
      }

      range.setStart(targetNode, targetOffset);
      range.setEnd(targetNode, targetOffset);
    }

    range.collapse(true);
    selection.addRange(range);

    // Ensure the element stays focused
    element.focus();
  } catch (error) {
    console.warn("Could not set cursor position:", error);
    // Fallback: just focus the element
    element.focus();
  }
}

/**
 * Handles key down events in contenteditable fields
 * @param {KeyboardEvent} event - The key down event
 */
function handleKeyDown(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    return; // Normal behavior
  }
}
