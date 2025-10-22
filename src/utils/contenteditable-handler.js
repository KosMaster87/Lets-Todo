/**
 * @fileoverview Central contenteditable handler for todo elements
 * @module contenteditable-handler
 */

import { getTodoElements } from "./dom-selectors.js";
import {
  validateTodoTitle,
  validateTodoContent,
} from "./../services/crud/todo-validation.js";
import { DEBUG_MODE } from "./constants.js";

/**
 * Sets up contenteditable handlers for todo title and content elements
 * @param {Object} options - Configuration options
 * @param {Function} options.onContentChange - Callback for content changes
 * @param {Function} options.onKeyDown - Callback for key events
 */
export function setupContentEditableHandlers(options = {}) {
  const { titleElement, contentElement } = getTodoElements();

  if (!hasAvailableElements(titleElement, contentElement)) {
    // logNoElementsWarning();
    return false;
  }

  const titleSetupCount = setupTitleElementIfExists(titleElement, options);
  const contentSetupCount = setupContentElementIfExists(
    contentElement,
    options
  );
  const totalSetupCount = titleSetupCount + contentSetupCount;

  logSetupCompletion(totalSetupCount);
  return true;
}

/**
 * Check if any todo elements are available for setup
 * @param {HTMLElement|null} titleElement - Title element
 * @param {HTMLElement|null} contentElement - Content element
 * @returns {boolean} True if at least one element exists
 */
const hasAvailableElements = (titleElement, contentElement) => {
  return titleElement || contentElement;
};

/**
 * Log warning when no elements are found
 */
const logNoElementsWarning = () => {
  if (DEBUG_MODE) {
    console.warn("ContentEditable Handler: No todo elements found");
  }
};

/**
 * Setup handlers for title element if it exists
 * @param {HTMLElement|null} titleElement - Title element to setup
 * @param {Object} options - Configuration options
 * @returns {number} 1 if element was setup, 0 otherwise
 */
const setupTitleElementIfExists = (titleElement, options) => {
  if (!titleElement) return 0;

  setupElementHandlers(titleElement, {
    validateFn: validateTodoTitle,
    elementType: "title",
    ...options,
  });
  return 1;
};

/**
 * Setup handlers for content element if it exists
 * @param {HTMLElement|null} contentElement - Content element to setup
 * @param {Object} options - Configuration options
 * @returns {number} 1 if element was setup, 0 otherwise
 */
const setupContentElementIfExists = (contentElement, options) => {
  if (!contentElement) return 0;

  setupElementHandlers(contentElement, {
    validateFn: validateTodoContent,
    hasKeyHandler: true,
    elementType: "content",
    ...options,
  });
  return 1;
};

/**
 * Log setup completion information
 * @param {number} setupCount - Number of elements that were setup
 */
const logSetupCompletion = (setupCount) => {
  if (DEBUG_MODE) {
    console.log(
      `ContentEditable Handler: Setup complete for ${setupCount} elements`
    );
  }
};

/**
 * Sets up all event handlers for a single contenteditable element
 * @param {HTMLElement} element - The contenteditable element
 * @param {Object} options - Configuration options
 */
function setupElementHandlers(element, options = {}) {
  const { validateFn, hasKeyHandler, elementType } = options;

  initializeElementProperties(element, elementType);
  logElementSetup(elementType);

  setupValidationListener(element, validateFn);
  setupCoreListeners(element, options);

  if (hasKeyHandler) {
    setupKeyHandlingListeners(element, options);
  }
}

/**
 * Initialize element properties for contenteditable handling
 * @param {HTMLElement} element - Element to initialize
 * @param {string} elementType - Type of element (title, content, etc.)
 */
const initializeElementProperties = (element, elementType) => {
  element._hasBeenFocused = false;
  element._elementType = elementType || "unknown";
};

/**
 * Add validation event listener if validation function provided
 * @param {HTMLElement} element - Element to add listener to
 * @param {Function|null} validateFn - Validation function
 */
const setupValidationListener = (element, validateFn) => {
  if (validateFn) {
    element.addEventListener("blur", validateFn);
  }
};

/**
 * Create input event handler with optional callback
 * @param {Function|null} onContentChange - Optional content change callback
 * @returns {Function} Input event handler
 */
const createInputHandler = (onContentChange) => {
  return (event) => {
    handleContentChange(event);
    if (onContentChange) {
      onContentChange(event);
    }
  };
};

/**
 * Create keydown event handler with optional callback
 * @param {Function|null} onKeyDown - Optional keydown callback
 * @returns {Function} Keydown event handler
 */
const createKeyDownHandler = (onKeyDown) => {
  return (event) => {
    handleKeyDown(event);
    if (onKeyDown) {
      onKeyDown(event);
    }
  };
};

/**
 * Setup core event listeners for all contenteditable elements
 * @param {HTMLElement} element - Element to setup
 * @param {Object} options - Configuration options
 */
const setupCoreListeners = (element, options) => {
  const { onContentChange } = options;

  element.addEventListener("input", createInputHandler(onContentChange));
  element.addEventListener("focus", handlePlaceholderFocus);
  element.addEventListener("blur", handlePlaceholderBlur);
};

/**
 * Setup additional listeners for elements with key handling
 * @param {HTMLElement} element - Element to setup
 * @param {Object} options - Configuration options
 */
const setupKeyHandlingListeners = (element, options) => {
  const { onKeyDown } = options;

  element.addEventListener("input", handlePlaceholderInput);
  element.addEventListener("keydown", createKeyDownHandler(onKeyDown));
};

/**
 * Log debug information about element setup
 * @param {string} elementType - Type of element being setup
 */
const logElementSetup = (elementType) => {
  if (DEBUG_MODE) {
    console.log(
      `ContentEditable Handler: Setting up ${elementType || "unknown"} element`
    );
  }
};

/**
 * TODO: AUTOSAVE TODOS while editing, so you don't have to save.
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

  if (hasPlaceholderText(element, placeholder)) {
    clearPlaceholderText(element);
  }

  if (needsCursorPositioning(isFirstFocus, element, placeholder)) {
    scheduleCursorPositioning(element);
  }

  element._hasBeenFocused = true;
}

/**
 * Check if element contains placeholder text
 * @param {HTMLElement} element - Element to check
 * @param {string} placeholder - Placeholder text
 * @returns {boolean} True if element shows placeholder
 */
const hasPlaceholderText = (element, placeholder) => {
  return element.textContent === placeholder;
};

/**
 * Remove placeholder text and styling from element
 * @param {HTMLElement} element - Element to clear
 */
const clearPlaceholderText = (element) => {
  element.textContent = "";
  element.classList.remove("placeholder-active");
};

/**
 * Check if cursor positioning is needed
 * @param {boolean} isFirstFocus - Whether this is the first focus
 * @param {HTMLElement} element - Element to check
 * @param {string} placeholder - Placeholder text
 * @returns {boolean} True if cursor should be positioned
 */
const needsCursorPositioning = (isFirstFocus, element, placeholder) => {
  return isFirstFocus || hasPlaceholderText(element, placeholder);
};

/**
 * Schedule cursor positioning for next tick
 * @param {HTMLElement} element - Element to position cursor in
 */
const scheduleCursorPositioning = (element) => {
  setTimeout(() => {
    if (element === document.activeElement) {
      setCursorToStart(element);
    }
  }, 0);
};

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

  if (needsPlaceholderInitialization(titleElement)) {
    initializeElementPlaceholder(titleElement);
  }

  if (needsPlaceholderInitialization(contentElement)) {
    initializeElementPlaceholder(contentElement);
  }
}

/**
 * Check if element needs placeholder initialization
 * @param {HTMLElement|null} element - Element to check
 * @returns {boolean} True if element exists and is empty
 */
const needsPlaceholderInitialization = (element) => {
  return element && element.textContent.trim() === "";
};

/**
 * Initialize placeholder for a single element
 * @param {HTMLElement} element - Element to initialize
 */
const initializeElementPlaceholder = (element) => {
  const placeholder = element.getAttribute("data-placeholder");
  if (placeholder) {
    element.textContent = placeholder;
    element.classList.add("placeholder-active");
  }
};

/**
 * Sets cursor to the beginning of a contenteditable element
 * @param {HTMLElement} element - The contenteditable element
 */
function setCursorToStart(element) {
  try {
    const hasChildNodes = element.childNodes.length > 0;
    const range = hasChildNodes
      ? createRangeForContentElement(element)
      : createRangeForEmptyElement(element);

    applyRangeAndFocus(range, element);
  } catch (error) {
    console.warn("Could not set cursor position:", error);
    element.focus(); // Fallback: just focus the element
  }
}

/**
 * Create and configure cursor range for element with content
 * @param {HTMLElement} element - Element with child nodes
 * @returns {Range} Configured range object
 */
const createRangeForContentElement = (element) => {
  const { targetNode, targetOffset } = findOptimalCursorPosition(element);
  const range = document.createRange();
  range.setStart(targetNode, targetOffset);
  range.setEnd(targetNode, targetOffset);
  return range;
};

/**
 * Create and configure cursor range for empty element
 * @param {HTMLElement} element - Empty element
 * @returns {Range} Configured range object
 */
const createRangeForEmptyElement = (element) => {
  const range = document.createRange();
  range.setStart(element, 0);
  range.setEnd(element, 0);
  return range;
};

/**
 * Apply range to selection and focus element
 * @param {Range} range - Range to apply
 * @param {HTMLElement} element - Element to focus
 */
const applyRangeAndFocus = (range, element) => {
  const selection = window.getSelection();
  selection.removeAllRanges();
  range.collapse(true);
  selection.addRange(range);
  element.focus();
};

/**
 * Find optimal cursor position in element with child nodes
 * @param {HTMLElement} element - Element to analyze
 * @returns {Object} Object with targetNode and targetOffset
 */
const findOptimalCursorPosition = (element) => {
  for (let i = 0; i < element.childNodes.length; i++) {
    const node = element.childNodes[i];

    if (node.nodeType === Node.TEXT_NODE) {
      return {
        targetNode: node,
        targetOffset: findFirstMeaningfulPosition(node),
      };
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      return {
        targetNode: element,
        targetOffset: i,
      };
    }
  }

  return { targetNode: element, targetOffset: 0 };
};

/**
 * Find the first meaningful text position in a text node
 * @param {Text} textNode - Text node to analyze
 * @returns {number} Index of first non-whitespace character, or 0
 */
const findFirstMeaningfulPosition = (textNode) => {
  const text = textNode.textContent || "";
  const trimmedStartIndex = text.search(/\S/);
  return trimmedStartIndex >= 0 ? trimmedStartIndex : 0;
};

/**
 * Handles key down events in contenteditable fields
 * @param {KeyboardEvent} event - The key down event
 */
function handleKeyDown(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    return; // Normal behavior
  }
}
