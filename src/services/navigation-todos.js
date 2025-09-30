// lets-todo-app/src/services/navigation-todos.js

import { setCurrentView, addTodo } from "../state.js";
import { VIEWS } from "../utils/constants.js";
import { navigateToView } from "./navigation.js";
import {
  setupActionButtons,
  createBookmarkToggleHandler,
  createCompletedToggleHandler,
  createShareHandler,
  createCopyHandler,
  createDeleteHandler,
  showMessage,
} from "./navigation-action-buttons.js";

let isEditMode = false;
let currentBookmarkState = false;
let currentCompletedState = false;

export function setupTodosNavigation() {
  setupTodosMenuNavigation();
  setupTodosContentEditableHandlers();
  setupTodosActionButtons();
  initializeBookmarkState();
}

/**
 * Sets up navigation for the todos menu (cancel and save buttons).
 */
function setupTodosMenuNavigation() {
  const cancelBtn = document.getElementById("todosCancelBtn");
  const saveBtn = document.getElementById("todosSaveBtn");

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      navigateToView(VIEWS.DASHBOARD);
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", handleSaveTodo);
  }
}

/**
 * Sets up event handlers for contenteditable title and content fields.
 * Handles validation, input changes, placeholder behavior, and key events.
 */
function setupTodosContentEditableHandlers() {
  const titleElement = document.getElementById("todoDisplayTitle");
  const contentElement = document.getElementById("todoContentDisplay");

  if (titleElement) {
    titleElement.addEventListener("blur", validateTodoTitle);
    titleElement.addEventListener("input", handleContentChange);
    titleElement.addEventListener("focus", handlePlaceholderFocus);
    titleElement.addEventListener("blur", handlePlaceholderBlur);
  }

  if (contentElement) {
    contentElement.addEventListener("blur", validateTodoContent);
    contentElement.addEventListener("input", handleContentChange);
    contentElement.addEventListener("focus", handlePlaceholderFocus);
    contentElement.addEventListener("blur", handlePlaceholderBlur);
    contentElement.addEventListener("keydown", handleKeyDown);
  }
}

/**
 * Sets up action buttons using the central action-buttons service.
 */
function setupTodosActionButtons() {
  // Prüfe ob wir uns in einer Todo-Bearbeitungsansicht befinden
  const isTodosView = document.querySelector('[data-view="todos"]');
  const isTodoView = document.querySelector('[data-view="todo-view"]');

  if (!isTodosView && !isTodoView) {
    // console.log(
    //   "📋 Skipping todos action buttons setup - not in todos/todo-view"
    // );
    return;
  }

  // Prüfe ob die Buttons existieren (können nach DOM-Update fehlen)
  const bookmarkBtn = document.getElementById("bookmarkViewBtn");
  const doneBtn = document.getElementById("doneTodoBtn");

  if (!bookmarkBtn && !doneBtn) {
    console.log(
      "⏳ Action buttons not yet available in DOM - will retry later"
    );
    return;
  }

  const actionButtonConfig = {
    bookmark: {
      elementId: "bookmarkViewBtn",
      handler: createBookmarkToggleHandler(
        () => currentBookmarkState,
        (state) => {
          currentBookmarkState = state;
        },
        "bookmarkViewBtn"
      ),
    },
    done: {
      elementId: "doneTodoBtn",
      handler: createCompletedToggleHandler(
        () => currentCompletedState,
        (state) => {
          currentCompletedState = state;
          updateTodoStatusBadge(state);
        },
        "doneTodoBtn"
      ),
    },
    share: {
      elementId: "shareTodoBtn",
      handler: createShareHandler(getContentForActions),
    },
    copy: {
      elementId: "copyTodoBtn",
      handler: createCopyHandler(getContentForActions),
    },
    delete: {
      elementId: "deleteTodoBtn",
      handler: createDeleteHandler(
        getContentForActions,
        clearTodoContent,
        resetBookmarkState
      ),
    },
  };

  setupActionButtons(actionButtonConfig);
}

function validateTodoTitle() {
  const titleElement = document.getElementById("todoDisplayTitle");
  if (!titleElement) return true;

  const title = titleElement.textContent.trim();

  if (title.length === 0) {
    showMessage("Bitte gib einen Titel für deine Todo ein.", "error");
    return false;
  }

  if (title.length > 100) {
    showMessage("Der Titel darf maximal 100 Zeichen lang sein.", "error");
    return false;
  }

  return true;
}

function validateTodoContent() {
  const contentElement = document.getElementById("todoContentDisplay");
  if (!contentElement) return true;

  const content = contentElement.textContent.trim();

  if (content.length === 0) {
    showMessage("Bitte gib einen Inhalt für deine Todo ein.", "error");
    return false;
  }

  if (content.length > 5000) {
    showMessage("Der Inhalt darf maximal 5000 Zeichen lang sein.", "error");
    return false;
  }

  return true;
}

function initializeBookmarkState() {
  currentBookmarkState = false;
  currentCompletedState = false;
}

function handleContentChange(event) {
  // Auto-save functionality could be added here
  console.log("Content changed:", event.target.textContent);
}

function handlePlaceholderFocus(event) {
  const element = event.target;
  if (element.textContent.trim() === "") {
    element.classList.add("focused");
  }
}

function handlePlaceholderBlur(event) {
  const element = event.target;
  element.classList.remove("focused");

  if (element.textContent.trim() === "") {
    element.classList.add("empty");
  } else {
    element.classList.remove("empty");
  }
}

function handleKeyDown(event) {
  // Allow normal Enter behavior for new lines in content
  if (event.key === "Enter" && !event.shiftKey) {
    return; // Normal behavior
  }
}

// === HELPER FUNCTIONS FOR ACTION-BUTTON SERVICE ===

/**
 * Updates the todo status badge based on completed state
 * @param {boolean} completed - Whether todo is completed
 */
function updateTodoStatusBadge(completed) {
  const statusBadge = document.querySelector(".todo-status-badge");
  if (statusBadge) {
    statusBadge.className =
      "todo-status-badge " + (completed ? "completed" : "pending");
    statusBadge.textContent = completed ? "Erledigt" : "Neu";
  }
}

/**
 * Gets current content for action button handlers
 * @returns {Object} Object with title and content
 */
function getContentForActions() {
  const titleElement = document.querySelector("#todoDisplayTitle");
  const contentElement = document.querySelector("#todoContentDisplay");

  const title = titleElement ? titleElement.textContent.trim() : "";
  const content = contentElement ? contentElement.textContent.trim() : "";

  console.log("getContentForActions called:", {
    title,
    content,
    titleElement,
    contentElement,
  });

  return { title, content };
}

/**
 * Clears todo content for delete action
 */
function clearTodoContent() {
  const titleElement = document.querySelector("#todoDisplayTitle");
  const contentElement = document.querySelector("#todoContentDisplay");

  if (titleElement) titleElement.textContent = "Neue Todo";
  if (contentElement) contentElement.textContent = "";
}

/**
 * Resets bookmark state after delete
 */
function resetBookmarkState() {
  currentBookmarkState = false;
  currentCompletedState = false;

  const bookmarkBtn = document.getElementById("bookmarkViewBtn");
  if (bookmarkBtn) {
    bookmarkBtn.classList.remove("bookmarked");
  }

  const doneBtn = document.getElementById("doneTodoBtn");
  if (doneBtn) {
    doneBtn.classList.remove("completed");
  }

  updateTodoStatusBadge(false);
}

function handleSaveTodo(event) {
  event.preventDefault();

  const titleValid = validateTodoTitle();
  const contentValid = validateTodoContent();

  if (!titleValid || !contentValid) {
    showMessage("Bitte korrigiere die Eingabefehler.", "error");
    return;
  }

  const titleElement = document.getElementById("todoDisplayTitle");
  const contentElement = document.getElementById("todoContentDisplay");

  if (!titleElement || !contentElement) {
    showMessage("Inhalte konnten nicht gefunden werden.", "error");
    return;
  }

  const title = titleElement.textContent.trim();
  const content = contentElement.textContent.trim();

  if (!title && !content) {
    showMessage("Titel oder Inhalt darf nicht leer sein.", "error");
    return;
  }

  const todoData = {
    title: title || "Neue Todo",
    content: content,
    created: new Date(),
    completed: currentCompletedState,
    bookmarked: currentBookmarkState,
  };

  try {
    addTodo(todoData);
    showMessage("Todo erfolgreich gespeichert!");

    // Clear content after successful save
    titleElement.textContent = "Neue Todo";
    contentElement.textContent = "";

    // Reset bookmark state
    resetBookmarkState();

    // Navigate back to dashboard after short delay
    setTimeout(() => {
      navigateToView(VIEWS.DASHBOARD);
    }, 1500);
  } catch (error) {
    showMessage("Fehler beim Speichern des Todos.", "error");
    console.error("Save error:", error);
  }
}

// All action button handlers are now handled by the central action-buttons service
