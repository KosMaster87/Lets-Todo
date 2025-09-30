// lets-todo-app/src/services/navigation-trash.js

import {
  setCurrentView,
  getTrashedTodos,
  emptyTrash,
  restoreTodo,
  deleteTodoPermanently,
} from "../state.js";
import { VIEWS } from "../utils/constants.js";
import { navigateToView } from "./navigation.js";
import {
  renderTrashPlaceholder,
  renderSingleTrashTodo,
  formatDate,
  escapeHtml,
} from "../components/pages/trash.js";

let trashFilterMode = "all";

export function setupTrashNavigation() {
  setupTrashMenuNavigation();
  setupTrashActionButtons();
}

function setupTrashMenuNavigation() {
  const cancelBtn = document.getElementById("trashCancelBtn");
  const emptyTrashBtn = document.getElementById("emptyTrashBtn");
  const filterBtn = document.getElementById("trashFilterBtn");

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      navigateToView(VIEWS.DASHBOARD);
    });
  }

  if (emptyTrashBtn) {
    emptyTrashBtn.addEventListener("click", handleEmptyTrash);
  }

  if (filterBtn) {
    filterBtn.addEventListener("click", () => {
      toggleTrashFilter();
      renderTrashWithFilter();
    });
  }
}

function setupTrashActionButtons() {
  const trashContainer = document.getElementById("trashTodosList");
  if (trashContainer) {
    trashContainer.addEventListener("click", (e) => {
      if (e.target.closest(".restore-todo-btn")) {
        const todoId = e.target.closest(".restore-todo-btn").dataset.todoId;
        handleRestoreTodo(todoId);
      } else if (e.target.closest(".delete-forever-btn")) {
        const todoId = e.target.closest(".delete-forever-btn").dataset.todoId;
        handleDeleteForever(todoId);
      }
    });
  }
}

function toggleTrashFilter() {
  switch (trashFilterMode) {
    case "all":
      trashFilterMode = "recent";
      break;
    case "recent":
      trashFilterMode = "old";
      break;
    case "old":
      trashFilterMode = "all";
      break;
    default:
      trashFilterMode = "all";
  }

  updateTrashFilterButtonText();
}

function updateTrashFilterButtonText() {
  const filterBtn = document.getElementById("trashFilterBtn");
  const titleElement = filterBtn?.querySelector(".btn-content h3");
  const descElement = filterBtn?.querySelector(".btn-content p");

  if (titleElement && descElement) {
    switch (trashFilterMode) {
      case "all":
        titleElement.textContent = "Alle anzeigen";
        descElement.textContent = "Alle gelöschten Todos anzeigen";
        break;
      case "recent":
        titleElement.textContent = "Neueste zuerst";
        descElement.textContent = "Kürzlich gelöschte Todos zuerst";
        break;
      case "old":
        titleElement.textContent = "Älteste zuerst";
        descElement.textContent = "Älteste gelöschte Todos zuerst";
        break;
    }
  }
}

function renderTrashWithFilter() {
  const trashContainer = document.getElementById("trashTodosList");
  if (!trashContainer) return;

  let trashedTodos = getTrashedTodos();

  // Apply filter/sorting
  switch (trashFilterMode) {
    case "recent":
      trashedTodos = trashedTodos.sort(
        (a, b) => new Date(b.deletedAt || 0) - new Date(a.deletedAt || 0)
      );
      break;
    case "old":
      trashedTodos = trashedTodos.sort(
        (a, b) => new Date(a.deletedAt || 0) - new Date(b.deletedAt || 0)
      );
      break;
    case "all":
      break;
  }

  // Use centralized HTML generation from trash.js
  if (trashedTodos.length === 0) {
    trashContainer.innerHTML = renderTrashPlaceholder();
  } else {
    trashContainer.innerHTML = trashedTodos.map(renderSingleTrashTodo).join("");
  }
}

function handleEmptyTrash() {
  if (
    confirm(
      "Möchten Sie wirklich alle gelöschten Todos endgültig löschen? Diese Aktion kann nicht rückgängig gemacht werden."
    )
  ) {
    emptyTrash();
    showTrashMessage("Papierkorb wurde geleert!");
    renderTrashWithFilter(); // Re-render after emptying
  }
}

function handleRestoreTodo(todoId) {
  console.log("Restore todo:", todoId);

  if (confirm("Möchten Sie dieses Todo wiederherstellen?")) {
    restoreTodo(todoId);
    showTrashMessage("Todo wurde wiederhergestellt!");
    renderTrashWithFilter(); // Re-render after restoration
  }
}

function handleDeleteForever(todoId) {
  console.log("Delete forever:", todoId);

  if (
    confirm(
      "Möchten Sie dieses Todo endgültig löschen? Diese Aktion kann nicht rückgängig gemacht werden."
    )
  ) {
    deleteTodoPermanently(todoId);
    showTrashMessage("Todo wurde endgültig gelöscht!");
    renderTrashWithFilter(); // Re-render after deletion
  }
}

function showTrashMessage(message) {
  // TODO: Implement proper toast/message display system
  console.log("Trash message:", message);

  // Temporary visual feedback
  const messageDiv = document.createElement("div");
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(76, 175, 80, 0.9);
    color: white;
    padding: 1rem;
    border-radius: 0.5rem;
    z-index: 1000;
    font-size: 0.9rem;
  `;

  document.body.appendChild(messageDiv);

  setTimeout(() => {
    if (document.body.contains(messageDiv)) {
      document.body.removeChild(messageDiv);
    }
  }, 3000);
}

export { trashFilterMode, renderTrashWithFilter };
