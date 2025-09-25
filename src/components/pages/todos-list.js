// lets-todo-app/src/components/pages/todos-list.js

import { getTodos } from "../../state.js";

/**
 * Renders the todos list page.
 * @returns {string} HTML string for the todos list page
 */
export const renderTodosListPage = () => {
  const todos = getTodos();

  return `
    <main class="todos-list-wrapper" data-view="todos-list">
      <section class="todos-list-intro">
        <h2>Deine Todos</h2>
        <p>
          Hier findest du alle deine gespeicherten Todos. Verwalte sie,
          bearbeite sie oder erstelle neue.
        </p>
      </section>

      <nav class="todos-list-menu">
        <button
          class="menu-btn todos-list-filter-btn"
          id="todosListFilterBtn"
        >
          <div class="btn-icon todos-list-filter-btn-icon"></div>
          <div class="btn-content">
            <h3 id="todosListFilterTitle">Filter & Sortierung</h3>
            <p id="todosListFilterDesc">Todos filtern und sortieren</p>
          </div>
        </button>

        <button class="menu-btn todos-list-cancel-btn" id="todosListCancelBtn">
          <div class="btn-icon todos-list-cancel-btn-icon"></div>
          <div class="btn-content">
            <h3>Zurück zum Menü</h3>
            <p>Zurück zur Hauptseite</p>
          </div>
        </button>
      </nav>

      <section class="todos-list-container">
        <h3>Gespeicherte Todos</h3>
        <div class="todos-list" id="todosList">
          ${renderTodosList(todos)}
        </div>
      </section>
    </main>
  `;
};

/**
 * Renders the list of todos.
 * @param {Array} todos - Array of todo items
 * @returns {string} HTML string for the todos list
 */
export const renderTodosList = (todos) => {
  if (!todos || todos.length === 0) {
    return `
      <div class="todo-placeholder">
        <p>Noch keine Todos vorhanden. Erstelle dein erstes Todo!</p>
      </div>
    `;
  }

  return todos
    .map(
      (todo) => `
    <section class="todo-display" data-todo-id="${todo.id}">
      <div class="todo-header">
        <h3 class="todo-title">${escapeHtml(todo.title || "Untitled")}</h3>
      </div>

      <div class="todo-content-display">
        ${escapeHtml(
          (todo.content || todo.title || "Kein Inhalt vorhanden...").substring(
            0,
            150
          )
        )}${(todo.content || todo.title || "").length > 150 ? "..." : ""}
      </div>

      <div class="todo-view-actions">
        <button
          class="action-btn bookmark-view-btn ${
            todo.bookmarked ? "bookmarked" : ""
          }"
          title="Lesezeichen umschalten"
        >
          <div class="action-icon bookmark-view-icon"></div>
        </button>

        <button
          class="action-btn share-todo-btn"
          title="Todo teilen"
        >
          <div class="action-icon share-todo-icon"></div>
        </button>

        <button
          class="action-btn copy-todo-btn"
          title="Todo kopieren"
        >
          <div class="action-icon copy-todo-icon"></div>
        </button>
      </div>

      <div class="todo-meta-info">
        <span class="todo-creation-date">Erstellt: ${formatDate(
          todo.created || new Date()
        )}</span>
        <span class="todo-status-badge ${
          todo.completed ? "completed" : "pending"
        }">
          ${todo.completed ? "Erledigt" : "Ausstehend"}
        </span>
      </div>
    </section>
  `
    )
    .join("");
};

/**
 * Formats a date for display.
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  if (!date) return "Unbekannt";

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "Unbekannt";
    }

    const now = new Date();
    const diff = now - dateObj;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return "Heute";
    } else if (days === 1) {
      return "Gestern";
    } else if (days < 7) {
      return `vor ${days} Tagen`;
    } else {
      return dateObj.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  } catch (error) {
    return "Unbekannt";
  }
};

/**
 * Escapes HTML characters in text
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
const escapeHtml = (text) => {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};
