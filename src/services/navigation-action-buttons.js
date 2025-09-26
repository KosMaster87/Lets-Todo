// lets-todo-app/src/services/action-buttons.js

/**
 * Central service for action button functionality
 * Handles bookmark, share, copy, and delete actions across the application
 */

/**
 * Sets up action buttons with configurable handlers
 * @param {Object} config - Configuration object with button definitions
 */
export const setupActionButtons = (config) => {
  Object.entries(config).forEach(([actionType, { elementId, handler }]) => {
    const element = document.getElementById(elementId);
    if (element) {
      // Entferne vorherige Event-Listener um Duplikate zu vermeiden
      const existingHandler = element._actionHandler;
      if (existingHandler) {
        element.removeEventListener("click", existingHandler);
      }

      // Füge neuen Event-Listener hinzu
      element.addEventListener("click", handler);
      element._actionHandler = handler; // Speichere Referenz für spätere Entfernung

      console.log(`Action button ${actionType} (${elementId}) configured`);
    } else {
      console.warn(
        `Action button element ${elementId} not found for ${actionType}`
      );
    }
  });
};

/**
 * Handles bookmark toggle functionality
 * @param {Function} getBookmarkState - Function to get current bookmark state
 * @param {Function} setBookmarkState - Function to set bookmark state
 * @param {string} buttonId - ID of the bookmark button
 * @returns {Function} Event handler function
 */
export const createBookmarkToggleHandler = (
  getBookmarkState,
  setBookmarkState,
  buttonId
) => {
  return (event) => {
    event.preventDefault();

    const bookmarkBtn = document.getElementById(buttonId);
    if (!bookmarkBtn) return;

    const currentState = getBookmarkState();
    const newState = !currentState;

    setBookmarkState(newState);

    if (newState) {
      bookmarkBtn.classList.add("bookmarked");
      showMessage("Als Lesezeichen markiert!");
    } else {
      bookmarkBtn.classList.remove("bookmarked");
      showMessage("Lesezeichen entfernt!");
    }
  };
};

/**
 * Handles completed/done toggle functionality
 * @param {Function} getCompletedState - Function to get current completed state
 * @param {Function} setCompletedState - Function to set completed state
 * @param {string} buttonId - ID of the done button
 * @returns {Function} Event handler function
 */
export const createCompletedToggleHandler = (
  getCompletedState,
  setCompletedState,
  buttonId
) => {
  return (event) => {
    event.preventDefault();

    const doneBtn = document.getElementById(buttonId);
    if (!doneBtn) return;

    const currentState = getCompletedState();
    const newState = !currentState;

    setCompletedState(newState);

    if (newState) {
      doneBtn.classList.add("completed");
      showMessage("Todo als erledigt markiert!");
    } else {
      doneBtn.classList.remove("completed");
      showMessage("Todo als ausstehend markiert!");
    }
  };
};

/**
 * Handles content sharing functionality
 * @param {Function} getContentCallback - Function to get title and content
 * @returns {Function} Event handler function
 */
export const createShareHandler = (getContentCallback) => {
  return (event) => {
    event.preventDefault();

    const { title, content } = getContentCallback();

    if (!title && !content) {
      showMessage("Keine Inhalte zum Teilen vorhanden.");
      return;
    }

    const shareText = `${title}\n\n${content}`;

    if (navigator.share) {
      navigator
        .share({
          title: title || "Meine Todo",
          text: shareText,
        })
        .catch(() => {
          fallbackShare(shareText);
        });
    } else {
      fallbackShare(shareText);
    }
  };
};

/**
 * Handles content copying functionality
 * @param {Function} getContentCallback - Function to get title and content
 * @returns {Function} Event handler function
 */
export const createCopyHandler = (getContentCallback) => {
  return (event) => {
    event.preventDefault();

    const { title, content } = getContentCallback();
    const copyText = `${title}\n\n${content}`;

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(copyText)
        .then(() => {
          showMessage("Todo in die Zwischenablage kopiert!");
        })
        .catch(() => {
          fallbackCopy(copyText);
        });
    } else {
      fallbackCopy(copyText);
    }
  };
};

/**
 * Handles content deletion functionality
 * @param {Function} getContentCallback - Function to get current content
 * @param {Function} clearContentCallback - Function to clear content
 * @param {Function} onDeleteCallback - Optional callback after deletion
 * @returns {Function} Event handler function
 */
export const createDeleteHandler = (
  getContentCallback,
  clearContentCallback,
  onDeleteCallback
) => {
  return (event) => {
    event.preventDefault();

    console.log("Delete handler called");
    const { title, content } = getContentCallback();
    console.log("Delete handler content:", { title, content });

    // Prüfe ob Content-Elemente existieren
    const titleElement = document.querySelector("#todoDisplayTitle");
    const contentElement = document.querySelector("#todoContentDisplay");

    if (!titleElement && !contentElement) {
      showMessage("Keine Todo-Elemente gefunden.");
      return;
    }

    // Für neue Todos: Immer löschen erlauben, auch bei leerem Content
    const hasAnyContent =
      title ||
      content ||
      (titleElement && titleElement.textContent.trim() !== "Neue Todo") ||
      (contentElement && contentElement.textContent.trim() !== "");

    if (!hasAnyContent) {
      // Auch bei leerem Content zurücksetzen
      if (confirm("Möchten Sie die Todo zurücksetzen?")) {
        clearContentCallback();
        showMessage("Todo zurückgesetzt!");

        if (onDeleteCallback) {
          onDeleteCallback();
        }
      }
      return;
    }

    if (confirm("Möchten Sie den Inhalt dieser Todo wirklich löschen?")) {
      clearContentCallback();
      showMessage("Inhalt gelöscht!");

      if (onDeleteCallback) {
        onDeleteCallback();
      }
    }
  };
};

/**
 * Fallback share function
 * @param {string} text - Text to share
 */
const fallbackShare = (text) => {
  fallbackCopy(text);
  showMessage("Todo kopiert - kann nun geteilt werden!");
};

/**
 * Fallback copy function for older browsers
 * @param {string} text - Text to copy
 */
export const fallbackCopy = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
    showMessage("Todo in die Zwischenablage kopiert!");
  } catch (err) {
    showMessage("Kopieren fehlgeschlagen.");
  }

  document.body.removeChild(textArea);
};

/**
 * Shows a message to the user
 * @param {string} message - Message to display
 * @param {string} type - Message type (success, error, info)
 */
export const showMessage = (message, type = "success") => {
  console.log(`Action message (${type}):`, message);

  // Create visual feedback
  const messageDiv = document.createElement("div");
  messageDiv.textContent = message;

  const backgroundColor =
    type === "error" ? "rgba(244, 67, 54, 0.9)" : "rgba(76, 175, 80, 0.9)";

  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${backgroundColor};
    color: white;
    padding: 1rem;
    border-radius: 0.5rem;
    z-index: 1000;
    font-size: 0.9rem;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `;

  document.body.appendChild(messageDiv);

  setTimeout(() => {
    if (document.body.contains(messageDiv)) {
      document.body.removeChild(messageDiv);
    }
  }, 3000);
};
