/**
 * @fileoverview UI state management utilities
 * @module ui-state-helpers
 */

/**
 * @function updateButtonText
 * @description Updates the text content of a submit button based on loading state
 * @param {HTMLElement} submitBtn - Submit button element to update
 * @param {boolean} isLoading - Loading state flag
 * @param {string} loadingText - Text to display during loading state
 * @param {string} defaultText - Text to display in default state
 * @returns {void} No return value - performs DOM text content update
 */
const updateButtonText = (
  submitBtn,
  isLoading,
  loadingText = "Saving...",
  defaultText = "Save Password"
) => {
  const btnText = submitBtn.querySelector("h3");
  if (btnText) {
    btnText.textContent = isLoading ? loadingText : defaultText;
  }
};

/**
 * @function updateButtonClass
 * @description Updates CSS classes on submit button based on loading state
 * @param {HTMLElement} submitBtn - Submit button element to update
 * @param {boolean} isLoading - Loading state flag
 * @returns {void} No return value - performs CSS class manipulation
 */
const updateButtonClass = (submitBtn, isLoading) => {
  if (isLoading) {
    submitBtn.classList.add("loading");
  } else {
    submitBtn.classList.remove("loading");
  }
};

/**
 * @function setSubmitButtonState
 * @description Sets comprehensive submit button state including text, classes, and disabled state
 * @param {boolean} isLoading - Loading state flag
 * @param {string} buttonId - ID of the button element to update
 * @param {string} loadingText - Text to display during loading state
 * @param {string} defaultText - Text to display in default state
 * @returns {void} No return value - orchestrates button state updates
 */
export const setSubmitButtonState = (
  isLoading,
  buttonId = "resetPasswordConfirmSubmitBtn",
  loadingText,
  defaultText
) => {
  const submitBtn = document.getElementById(buttonId);
  if (!submitBtn) return;

  submitBtn.disabled = isLoading;
  updateButtonText(submitBtn, isLoading, loadingText, defaultText);
  updateButtonClass(submitBtn, isLoading);
};

/**
 * @function showErrorMessage
 * @description Shows error message in forms with smooth scrolling
 * @param {string} message - Error message text to display to user
 * @param {string} errorElementId - ID of the error element to display message in
 * @returns {void} No return value - performs DOM manipulation for error display
 */
export const showErrorMessage = (
  message,
  errorElementId = "changePasswordError"
) => {
  const errorElement = getErrorElement(errorElementId);
  if (errorElement) {
    displayErrorMessage(errorElement, message);
    scrollToElement(errorElement);
  }
};

/**
 * @function getErrorElement
 * @description Retrieves the error message display element from DOM
 * @param {string} errorElementId - ID of the error element
 * @returns {HTMLElement|null} Error element if found, null if not found
 */
const getErrorElement = (errorElementId) => {
  return document.getElementById(errorElementId);
};

/**
 * @function displayErrorMessage
 * @description Updates error element content and makes it visible
 * @param {HTMLElement} errorElement - Error element to update
 * @param {string} message - Error message text to display
 * @returns {void} No return value - performs DOM content and visibility updates
 */
const displayErrorMessage = (errorElement, message) => {
  errorElement.textContent = message;
  errorElement.style.display = "block";
};

/**
 * @function scrollToElement
 * @description Scrolls element into view with smooth behavior
 * @param {HTMLElement} element - Element to scroll into view
 * @returns {void} No return value - performs smooth scrolling side effect
 */
const scrollToElement = (element) => {
  element.scrollIntoView({ behavior: "smooth", block: "nearest" });
};

/**
 * @function showSuccessMessage
 * @description Shows success message in forms with smooth scrolling
 * @param {string} message - Success message text to display to user
 * @param {string} successElementId - ID of the success element to display message in
 * @returns {void} No return value - performs DOM manipulation for success display
 */
export const showSuccessMessage = (
  message,
  successElementId = "changePasswordSuccess"
) => {
  const successElement = getSuccessElement(successElementId);
  if (successElement) {
    displaySuccessMessage(successElement, message);
    scrollToElement(successElement);
  }
};

/**
 * @function getSuccessElement
 * @description Retrieves the success message display element from DOM
 * @param {string} successElementId - ID of the success element
 * @returns {HTMLElement|null} Success element if found, null if not found
 */
const getSuccessElement = (successElementId) => {
  return document.getElementById(successElementId);
};

/**
 * @function displaySuccessMessage
 * @description Updates success element content and makes it visible
 * @param {HTMLElement} successElement - Success element to update
 * @param {string} message - Success message text to display
 * @returns {void} No return value - performs DOM content and visibility updates
 */
const displaySuccessMessage = (successElement, message) => {
  successElement.textContent = message;
  successElement.style.display = "block";
};

/**
 * @function clearErrorMessages
 * @description Clears both error and success messages from forms
 * @param {string} errorElementId - ID of the error element
 * @param {string} successElementId - ID of the success element
 * @returns {void} No return value - performs DOM manipulation to hide messages
 */
export const clearErrorMessages = (
  errorElementId = "changePasswordError",
  successElementId = "changePasswordSuccess"
) => {
  hideErrorMessage(errorElementId);
  hideSuccessMessage(successElementId);
};

/**
 * @function hideErrorMessage
 * @description Hides the error message element if it exists
 * @param {string} errorElementId - ID of the error element
 * @returns {void} No return value - performs DOM visibility update
 */
const hideErrorMessage = (errorElementId) => {
  const errorElement = getErrorElement(errorElementId);
  if (errorElement) {
    errorElement.style.display = "none";
  }
};

/**
 * @function hideSuccessMessage
 * @description Hides the success message element if it exists
 * @param {string} successElementId - ID of the success element
 * @returns {void} No return value - performs DOM visibility update
 */
const hideSuccessMessage = (successElementId) => {
  const successElement = getSuccessElement(successElementId);
  if (successElement) {
    successElement.style.display = "none";
  }
};

/**
 * @function setChangePasswordButtonState
 * @description Sets change password submit button loading state with comprehensive UI updates
 * @param {boolean} isLoading - Loading state flag determining button appearance
 * @returns {void} No return value - orchestrates button state updates
 */
export const setChangePasswordButtonState = (isLoading) => {
  const submitBtn = getChangePasswordSubmitButton();
  if (!submitBtn) return;

  updateButtonState(submitBtn, isLoading);
  updateButtonContent(submitBtn, isLoading);
};

/**
 * @function getChangePasswordSubmitButton
 * @description Retrieves the change password submit button element from DOM
 * @returns {HTMLButtonElement|null} Submit button element if found, null if not found
 */
const getChangePasswordSubmitButton = () => {
  return document.getElementById("changePasswordSubmitBtn");
};

/**
 * @function updateButtonState
 * @description Updates submit button disabled state and CSS classes
 * @param {HTMLButtonElement} submitBtn - Submit button element to update
 * @param {boolean} isLoading - Loading state flag
 * @returns {void} No return value - performs button state updates
 */
const updateButtonState = (submitBtn, isLoading) => {
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle("loading", isLoading);
};

/**
 * @function updateButtonContent
 * @description Updates submit button content text based on loading state
 * @param {HTMLButtonElement} submitBtn - Submit button element to update
 * @param {boolean} isLoading - Loading state flag
 * @returns {void} No return value - performs button content updates
 */
const updateButtonContent = (submitBtn, isLoading) => {
  const { btnContentH3, btnContentP } = getButtonContentElements(submitBtn);

  if (btnContentH3 && btnContentP) {
    const { headerText, descriptionText } = getButtonTexts(isLoading);
    btnContentH3.textContent = headerText;
    btnContentP.textContent = descriptionText;
  }
};

/**
 * @function getButtonContentElements
 * @description Retrieves button content elements from submit button
 * @param {HTMLButtonElement} submitBtn - Submit button containing content elements
 * @returns {Object} Button content elements object
 */
const getButtonContentElements = (submitBtn) => ({
  btnContentH3: submitBtn.querySelector(".btn-content h3"),
  btnContentP: submitBtn.querySelector(".btn-content p"),
});

/**
 * @function getButtonTexts
 * @description Returns appropriate button texts based on loading state
 * @param {boolean} isLoading - Loading state flag
 * @returns {Object} Button text configuration object
 */
const getButtonTexts = (isLoading) => {
  if (isLoading) {
    return {
      headerText: "Saving...",
      descriptionText: "Please wait",
    };
  } else {
    return {
      headerText: "Save Password",
      descriptionText: "Apply new password",
    };
  }
};

/**
 * @function setDownloadButtonState
 * @description Sets download button loading state while preserving icon
 * @param {boolean} isLoading - Loading state flag
 * @param {string} buttonId - Download button ID
 * @returns {void} No return value - performs button state updates
 */
export const setDownloadButtonState = (
  isLoading,
  buttonId = "downloadTodosBtn"
) => {
  const button = document.getElementById(buttonId);
  if (!button) return;

  button.disabled = isLoading;
  button.classList.toggle("loading", isLoading);

  const btnContent = button.querySelector(".btn-content");
  if (btnContent) {
    updateDownloadButtonContent(btnContent, isLoading);
  }
};

/**
 * @function updateDownloadButtonContent
 * @description Updates download button content text while preserving structure
 * @param {HTMLElement} btnContent - Button content container
 * @param {boolean} isLoading - Loading state flag
 * @returns {void} No return value - performs content updates
 */
const updateDownloadButtonContent = (btnContent, isLoading) => {
  const h3 = btnContent.querySelector("h3");
  const p = btnContent.querySelector("p");

  if (h3 && p) {
    if (isLoading) {
      h3.textContent = "Exporting...";
      p.textContent = "Preparing todos for download";
    } else {
      h3.textContent = "Todos herunterladen";
      p.textContent = "Alle deine Todos als Datei speichern";
    }
  }
};

/**
 * @function setUploadButtonState
 * @description Sets upload button loading state while preserving icon
 * @param {boolean} isLoading - Loading state flag
 * @param {string} buttonId - Upload button ID
 * @returns {void} No return value - performs button state updates
 */
export const setUploadButtonState = (
  isLoading,
  buttonId = "uploadTodosBtn"
) => {
  const button = document.getElementById(buttonId);
  if (!button) return;

  button.disabled = isLoading;
  button.classList.toggle("loading", isLoading);

  const btnContent = button.querySelector(".btn-content");
  if (btnContent) {
    updateUploadButtonContent(btnContent, isLoading);
  }
};

/**
 * @function updateUploadButtonContent
 * @description Updates upload button content text while preserving structure
 * @param {HTMLElement} btnContent - Button content container
 * @param {boolean} isLoading - Loading state flag
 * @returns {void} No return value - performs content updates
 */
const updateUploadButtonContent = (btnContent, isLoading) => {
  const h3 = btnContent.querySelector("h3");
  const p = btnContent.querySelector("p");

  if (h3 && p) {
    if (isLoading) {
      h3.textContent = "Importing...";
      p.textContent = "Processing uploaded file";
    } else {
      h3.textContent = "Todos wiederherstellen";
      p.textContent = "Todos aus einer Datei importieren";
    }
  }
};
