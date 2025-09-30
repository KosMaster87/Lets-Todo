// lets-todo-app/src/services/navigation-todos-list.js

import {
  setCurrentView,
  getTodos,
  setCurrentTodo,
  updateTodo,
  trashTodo,
} from "../state.js";
import { VIEWS } from "../utils/constants.js";
import { renderTodosList } from "../components/pages/todos-list.js";
import { navigateToView } from "./navigation.js";

let todosListFilterMode = "all";

/**
 * Sets up all navigation event handlers for todos list.
 */
export function setupTodosListNavigation() {
  setupFilterButtonNavigation();
  setupCancelButtonNavigation();
  setupTodoActionsNavigation();
}

/**
 * Sets up the filter button to cycle through filter modes and re-render the todos list.
 */
function setupFilterButtonNavigation() {
  const filterBtn = document.getElementById("todosListFilterBtn");
  if (filterBtn) {
    filterBtn.addEventListener("click", () => {
      toggleFilterMode();
      renderTodosWithFilter();
    });
  }
}

/**
 * Cycles through the todos list filter modes and updates the button text.
 */
function toggleFilterMode() {
  switch (todosListFilterMode) {
    case "all":
      todosListFilterMode = "completed";
      break;
    case "completed":
      todosListFilterMode = "pending";
      break;
    case "pending":
      todosListFilterMode = "all";
      break;
    default:
      todosListFilterMode = "all";
  }

  updateFilterButtonText();
}

/**
 * Updates the filter button text based on the current filter mode.
 */
function updateFilterButtonText() {
  const titleElement = document.getElementById("todosListFilterTitle");
  const descElement = document.getElementById("todosListFilterDesc");

  if (titleElement && descElement) {
    switch (todosListFilterMode) {
      case "all":
        titleElement.textContent = "Alle Todos";
        descElement.textContent = "Zeige alle deine Todos und Aufgaben";
        break;
      case "completed":
        titleElement.textContent = "Erledigte Todos";
        descElement.textContent = "Zeige nur abgeschlossene Todos";
        break;
      case "pending":
        titleElement.textContent = "Offene Todos";
        descElement.textContent = "Zeige nur ausstehende Todos";
        break;
    }
  }
}

/**
 * Renders the todos list with the current filter applied.
 * @returns {void}
 */
function renderTodosWithFilter() {
  const todosContainer = document.getElementById("todosList");
  if (!todosContainer) return;

  const allTodos = getTodos();
  let filteredTodos = [];

  switch (todosListFilterMode) {
    case "completed":
      filteredTodos = allTodos.filter((todo) => todo.completed);
      break;
    case "pending":
      filteredTodos = allTodos.filter((todo) => !todo.completed);
      break;
    case "all":
    default:
      filteredTodos = allTodos;
      break;
  }

  todosContainer.innerHTML = renderTodosList(filteredTodos);
}

/**
 * Sets up the cancel button to navigate back to the dashboard.
 */
function setupCancelButtonNavigation() {
  const cancelBtn = document.getElementById("todosListCancelBtn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      navigateToView(VIEWS.DASHBOARD);
    });
  }
}

/**
 * Sets up event delegation for todo actions like open, bookmark, share, and copy.
 */
function setupTodoActionsNavigation() {
  const todosContainer = document.getElementById("todosList");
  if (todosContainer) {
    todosContainer.addEventListener("click", (e) => {
      if (
        e.target.closest(".todo-title") ||
        e.target.closest(".todo-content-display")
      ) {
        const todoId = e.target.closest(".todo-display").dataset.todoId;
        handleOpenTodo(todoId);
      } else if (e.target.closest(".bookmark-view-btn")) {
        const todoId = e.target.closest(".todo-display").dataset.todoId;
        handleBookmarkToggle(todoId);
      } else if (e.target.closest(".done-todo-btn")) {
        const todoId = e.target.closest(".todo-display").dataset.todoId;
        handleToggleDone(todoId);
      } else if (e.target.closest(".share-todo-btn")) {
        const todoId = e.target.closest(".todo-display").dataset.todoId;
        handleShareTodo(todoId);
      } else if (e.target.closest(".copy-todo-btn")) {
        const todoId = e.target.closest(".todo-display").dataset.todoId;
        handleCopyTodo(todoId);
      } else if (e.target.closest(".delete-todo-btn")) {
        const todoId = e.target.closest(".todo-display").dataset.todoId;
        handleDeleteTodo(todoId);
      }
    });
  }
}

/**
 * Handles opening a todo.
 * @param {*} todoId
 */
function handleOpenTodo(todoId) {
  const todos = getTodos();
  const todo = todos.find((t) => t.id === todoId);

  if (todo) {
    setCurrentTodo(todo);
    navigateToView(VIEWS.TODO_VIEW);
  } else {
    console.error("Todo not found:", todoId);
  }
}

function handleBookmarkToggle(todoId) {
  console.log("Toggle bookmark for todo:", todoId);

  const todos = getTodos();
  const todo = todos.find((t) => t.id === todoId);

  if (todo && updateTodo) {
    const newBookmarkState = !todo.bookmarked;
    updateTodo(todoId, { bookmarked: newBookmarkState });

    // Re-render to show updated bookmark state
    renderTodosWithFilter();
  }
}

function handleShareTodo(todoId) {
  console.log("Share todo:", todoId);

  const todos = getTodos();
  const todo = todos.find((t) => t.id === todoId);

  if (todo) {
    const shareText = `${todo.title || "Untitled"}\n\n${todo.content || ""}`;

    if (navigator.share) {
      navigator
        .share({
          title: todo.title || "Meine Todo",
          text: shareText,
        })
        .catch(() => {
          copyToClipboard(shareText);
        });
    } else {
      copyToClipboard(shareText);
    }
  }
}

function handleCopyTodo(todoId) {
  console.log("Copy todo:", todoId);

  const todos = getTodos();
  const todo = todos.find((t) => t.id === todoId);

  if (todo) {
    const copyText = `${todo.title || "Untitled"}\n\n${todo.content || ""}`;
    copyToClipboard(copyText);
  }
}

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => console.log("Todo copied to clipboard"))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
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
    console.log("Todo copied to clipboard (fallback)");
  } catch (err) {
    console.log("Copy failed");
  }

  document.body.removeChild(textArea);
}

/**
 * Handles toggling done state for a todo
 * @param {string} todoId - Todo ID
 */
function handleToggleDone(todoId) {
  console.log("Toggle done for todo:", todoId);

  const todos = getTodos();
  const todo = todos.find((t) => t.id === todoId);

  if (todo && updateTodo) {
    const newCompletedState = !todo.completed;
    updateTodo(todoId, {
      completed: newCompletedState,
      lastModified: new Date().toISOString(),
    });

    // Re-render to show updated state
    renderTodosWithFilter();
  }
}

/**
 * Handles deleting (moving to trash) a todo from the list
 * @param {string} todoId - Todo ID
 */
function handleDeleteTodo(todoId) {
  console.log("Delete todo:", todoId);

  if (!todoId) {
    console.error("No todoId provided for delete");
    return;
  }

  if (
    confirm("Möchten Sie diese Todo wirklich in den Papierkorb verschieben?")
  ) {
    try {
      trashTodo(todoId);

      // Re-render todos list to remove the deleted item
      renderTodosWithFilter();

      console.log("Todo moved to trash successfully");
    } catch (error) {
      console.error("Error moving todo to trash:", error);
    }
  }
}

export { todosListFilterMode, renderTodosWithFilter };
