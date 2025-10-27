/**
 * @fileoverview Todos Page Component
 * @module todos
 */

import { renderSingleActionButtons } from "../action-view.js";

/**
 * Renders the todos creation page.
 * @returns {string} HTML string for the todos creation page
 */
export const renderTodosPage = () => {
  return `
    <main class="todos-wrapper" data-view="todos">
      <section class="todos-intro">
        <h2>Create New Todo</h2>
        <p>
          Create and edit your todos. Organize them with
          bookmarks and share them if needed.
        </p>
      </section>

      <nav class="todos-menu">
        <button class="menu-btn todos-cancel-btn" id="todosCancelBtn">
          <div class="btn-icon todos-cancel-btn-icon"></div>
          <div class="btn-content">
            <h3>Back to Dashboard</h3>
            <p>Return to dashboard</p>
          </div>
        </button>

        <button class="menu-btn todos-save-btn" id="todosSaveBtn">
          <div class="btn-icon todos-save-btn-icon"></div>
          <div class="btn-content">
            <h3>Save Todo</h3>
            <p>Save your todo</p>
          </div>
        </button>
      </nav>

      <section class="todo-display">
        <div class="todo-header">
          <h3 class="todo-title" id="todoDisplayTitle" contenteditable="true" data-placeholder="Enter your todo title...">New Todo</h3>
        </div>

        <div class="todo-content-display" id="todoContentDisplay" contenteditable="true" data-placeholder="Write your todo content here...">
        </div>

        ${renderSingleActionButtons()}

        <div class="todo-meta-info">
          <span class="todo-creation-date">Will be created: ${formatDate(
            new Date()
          )}</span>
          <span class="todo-status-badge pending">New</span>
        </div>
      </section>
    </main>
  `;
};

/**
 * Formats a date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Escapes HTML characters in text
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
const escapeHtml = (text) => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};
