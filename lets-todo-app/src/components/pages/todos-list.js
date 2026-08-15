/**
 * @fileoverview Todos List Page Component
 * @description Renders the todos list page with todos from state
 * @module todos-list
 */

import { getTodos } from "../../state/main-state.js";
import { renderListActionButtons } from "../action-view.js";

/**
 * Renders the todos list page.
 * @returns {string} HTML string for the todos list page
 */
export const renderTodosListPage = () => {
  const todos = getTodos();

  return `
    <main class="todos-list-wrapper" data-view="todos-list">
      <section class="todos-list-intro">
        <h2>Your Todos</h2>
        <p>
          Here you'll find all your saved todos. Manage them,
          edit them or create new ones.
        </p>
      </section>

      <nav class="todos-list-menu">
        <button
          class="menu-btn todos-list-filter-btn"
          id="todosListFilterBtn"
        >
          <div class="btn-icon todos-list-filter-btn-icon"></div>
          <div class="btn-content">
            <h3 id="todosListFilterTitle">Filter & Sorting</h3>
            <p id="todosListFilterDesc">Filter and sort todos</p>
          </div>
        </button>

        <button class="menu-btn todos-list-cancel-btn" id="todosListCancelBtn">
          <div class="btn-icon todos-list-cancel-btn-icon"></div>
          <div class="btn-content">
            <h3>Back to Menu</h3>
            <p>Back to main page</p>
          </div>
        </button>
      </nav>

      <section class="todos-list-container">
        <h3>Saved Todos</h3>
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
        <p>No todos available yet. Create your first todo!</p>
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

      <div class="todo-content-display">${(() => {
        const rawContent = todo.content || todo.title || "No content available...";
        const truncated = rawContent.substring(0, 150);
        const hasMore = rawContent.length > 150;
        return escapeHtml(truncated) + (hasMore ? "..." : "");
      })()}</div>

      ${renderListActionButtons(todo)}

      <div class="todo-meta-info">
        <span class="todo-creation-date">Created: ${formatDate(todo.created || new Date())}</span>
        <span class="todo-status-badge ${todo.completed ? "completed" : "pending"}">
          ${todo.completed ? "Completed" : "Pending"}
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
  if (!date) return "Unknown";

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "Unknown";
    }

    const now = new Date();
    const diff = now - dateObj;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return "Today";
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return dateObj.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  } catch (error) {
    return "Unknown";
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
