/**
 * @fileoverview Todo View Page Component
 * @module todo-view
 */

import { getCurrentTodo } from "../../state/main-state.js";
import { renderSingleActionButtons } from "../action-view.js";

/**
 * Renders the todo view page.
 * @returns {string} HTML string for the todo view page
 */
export const renderTodoViewPage = () => {
  const currentTodo = getCurrentTodo();

  if (!currentTodo) {
    return renderNoTodoSelected();
  }

  return `
    <main class="todo-view-wrapper" data-view="todo-view">
      <section class="todo-view-intro">
        <h2>Your Todo</h2>
        <p>
          Here you can see your todo in detail. You can edit it,
          share it or delete it.
        </p>
      </section>

      <nav class="todo-view-menu">
        <button class="menu-btn todo-view-back-btn" id="todosCancelBtn">
          <div class="btn-icon todo-view-back-btn-icon"></div>
          <div class="btn-content">
            <h3>Back to Todos</h3>
            <p>Return to todos list</p>
          </div>
        </button>

        <button class="menu-btn todo-view-save-btn" id="todosSaveBtn">
          <div class="btn-icon todo-view-save-btn-icon"></div>
          <div class="btn-content">
            <h3>Save Todo</h3>
            <p>Save changes</p>
          </div>
        </button>
      </nav>

      <section class="todo-display">
        <div class="todo-header">
          <h3 class="todo-title" id="todoDisplayTitle" contenteditable="true" data-placeholder="Enter your todo title...">${escapeHtml(
            currentTodo.title || "Untitled"
          )}</h3>
        </div>

        <div class="todo-content-display" id="todoContentDisplay" contenteditable="true" data-placeholder="Write your todo content here...">${escapeHtml(
          currentTodo.content || currentTodo.title || "No content available..."
        )}</div>

        ${renderSingleActionButtons(currentTodo)}

        <div class="todo-meta-info">
          <span class="todo-creation-date">Created: ${formatDate(
            currentTodo.created || new Date()
          )}</span>
          <span class="todo-status-badge ${
            currentTodo.completed ? "completed" : "pending"
          }">
            ${currentTodo.completed ? "Completed" : "Pending"}
          </span>
        </div>
      </section>
    </main>
  `;
};

/**
 * Renders the no todo selected state
 * @returns {string} HTML string for no todo selected
 */
const renderNoTodoSelected = () => {
  return `
    <main class="todo-view-wrapper" data-view="todo-view">
      <section class="todo-view-intro">
        <h2>No Todo Selected</h2>
        <p>
          Please select a note from the list to display it.
        </p>
      </section>

      <nav class="todo-view-menu">
        <button class="menu-btn todo-view-back-btn" id="todoViewBackBtn">
          <div class="btn-icon todo-view-back-btn-icon"></div>
          <div class="btn-content">
            <h3>Back to Todos</h3>
            <p>Return to todos list</p>
          </div>
        </button>
      </nav>

      <section class="todo-display">
        <div class="todo-placeholder">
          <p>No todo selected for display.</p>
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
 * Prevented XSS-Attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
const escapeHtml = (text) => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};
