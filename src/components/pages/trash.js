/**
 * @fileoverview Trash Page Component
 * @description Renders the Trash page with deleted todos and actions
 * @module trash
 */

import { getTrashedTodos } from "../../state/main-state.js";

/**
 * Renders the trash page.
 * @returns {string} HTML string for the trash page
 */
export const renderTrashPage = () => {
  return `
    <main class="trash-wrapper" data-view="trash">
      <section class="trash-intro">
        <h2>Trash</h2>
        <p>
          Here you'll find all deleted todos. You can
          restore them or delete them permanently.
        </p>
      </section>

      <nav class="trash-menu">
        <button class="menu-btn empty-trash-btn" id="emptyTrashBtn">
          <div class="btn-icon empty-trash-btn-icon"></div>
          <div class="btn-content">
            <h3>Empty Trash</h3>
            <p>Permanently remove all deleted todos</p>
          </div>
        </button>

        <button class="menu-btn trash-filter-btn" id="trashFilterBtn">
          <div class="btn-icon trash-filter-btn-icon"></div>
          <div class="btn-content">
            <h3>Filter</h3>
            <p>Filter and sort deleted todos</p>
          </div>
        </button>

        <button class="menu-btn trash-cancel-btn" id="trashCancelBtn">
          <div class="btn-icon trash-cancel-btn-icon"></div>
          <div class="btn-content">
            <h3>Back to Dashboard</h3>
            <p>Return to dashboard</p>
          </div>
        </button>
      </nav>

      <section class="trash-todos-container">
        <h3>Deleted Todos</h3>
        <div class="trash-todos-list" id="trashTodosList">
          ${renderTrashedTodos()}
        </div>
      </section>
    </main>
  `;
};

/**
 * Generates HTML for a placeholder when no todos are found
 * @returns {string} HTML string for placeholder
 */
export const renderTrashPlaceholder = () => {
  return `
    <div class="trash-todo-placeholder">
      <p>No deleted todos available</p>
    </div>
  `;
};

/**
 * Generates HTML for a single trash todo item
 * @param {Object} todo - Todo object
 * @returns {string} HTML string for trash todo item
 */
export const renderSingleTrashTodo = (todo) => {
  return `
    <div class="trash-todo-item" data-todo-id="${todo.id}">
      <div class="trash-todo-header">
        <h4 class="trash-todo-title">${escapeHtml(
          todo.title || "Untitled"
        )}</h4>

        <div class="trash-todo-actions">
          <button class="action-btn restore-todo-btn" title="Restore todo" data-todo-id="${
            todo.id
          }">
            <div class="action-icon restore-todo-icon"></div>
          </button>

          <button class="action-btn delete-forever-btn" title="Delete permanently" data-todo-id="${
            todo.id
          }">
            <div class="action-icon delete-forever-icon"></div>
          </button>
        </div>
      </div>

      <div class="trash-todo-content">
        <p class="trash-todo-text">${escapeHtml(
          todo.content || todo.title || ""
        )}</p>
      </div>

      <div class="trash-todo-meta">
        <span class="trash-todo-date">Deleted: ${formatDate(
          todo.deletedAt || new Date()
        )}</span>

        <span class="trash-todo-original-date">Created: ${formatDate(
          todo.created || new Date()
        )}</span>
      </div>
    </div>
  `;
};

/**
 * Renders multiple trash todos or placeholder
 * @param {Array} trashedTodos - Array of trashed todo objects
 * @returns {string} HTML string for trashed todos
 */
export const renderTrashedTodos = (trashedTodos = null) => {
  const todos = trashedTodos || getTrashedTodos();

  if (todos.length === 0) {
    return renderTrashPlaceholder();
  }

  return todos.map(renderSingleTrashTodo).join("");
};

/**
 * Formats a date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return "Today";
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
};

/**
 * Escapes HTML characters in text
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export const escapeHtml = (text) => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};
