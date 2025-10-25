/**
 * @fileoverview File input utilities for file selection and upload
 * @module file-input-helpers
 */

/**
 * Creates file input for todo upload
 * @param {Function} onFileSelected - Callback when file is selected
 * @param {Function} onCancel - Callback when dialog is cancelled
 * @returns {HTMLInputElement} File input element
 */
export const createFileInput = (onFileSelected, onCancel) => {
  const input = createBasicFileInput();
  const state = { dialogHandled: false, focusHandler: null };

  state.focusHandler = createCancelHandler(onCancel, state);

  input.addEventListener("change", (event) =>
    handleFileChange(event, onFileSelected, onCancel, state)
  );

  setupCancelDetection(state);
  return input;
};

/**
 * Creates basic file input element with attributes
 * @returns {HTMLInputElement} Configured file input element
 */
export const createBasicFileInput = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.style.display = "none";
  return input;
};

/**
 * Creates cancel detection handler
 * @param {Function} onCancel - Cancel callback
 * @param {Object} state - Dialog state object
 * @returns {Function} Focus handler function
 */
export const createCancelHandler = (onCancel, state) => {
  return () => {
    setTimeout(() => {
      if (!state.dialogHandled && onCancel) {
        state.dialogHandled = true;
        onCancel();
      }
    }, 100);
  };
};

/**
 * Handles file change event and cleanup
 * @param {Event} event - File input change event
 * @param {Function} onFileSelected - File selected callback
 * @param {Function} onCancel - Cancel callback
 * @param {Object} state - Dialog state object
 * @returns {void}
 */
export const handleFileChange = (event, onFileSelected, onCancel, state) => {
  const file = event.target.files[0];
  state.dialogHandled = true;

  if (state.focusHandler) {
    window.removeEventListener("focus", state.focusHandler);
  }

  file && onFileSelected ? onFileSelected(file) : onCancel?.();
};

/**
 * Sets up cancel detection with delay
 * @param {Object} state - Dialog state object
 * @returns {void}
 */
export const setupCancelDetection = (state) => {
  setTimeout(() => {
    if (!state.dialogHandled) {
      window.addEventListener("focus", state.focusHandler, { once: true });
    }
  }, 100);
};

/**
 * Executes file input DOM operations
 * @param {HTMLInputElement} input - File input element
 * @returns {void}
 */
export const executeFileInputClick = (input) => {
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
};
