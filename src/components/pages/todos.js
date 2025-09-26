// lets-todo-app/src/components/pages/todos.js

import { renderSingleActionButtons } from "../action-view.js";

/**
 * Renders the todos creation page.
 * @returns {string} HTML string for the todos creation page
 */
export const renderTodosPage = () => {
  return `
    <main class="todos-wrapper" data-view="todos">
      <section class="todos-intro">
        <h2>Neue Todo erstellen</h2>
        <p>
          Erstelle und bearbeite deine Todos. Organisiere sie mit
          Lesezeichen und teile sie bei Bedarf.
        </p>
      </section>

      <nav class="todos-menu">
        <button class="menu-btn todos-cancel-btn" id="todosCancelBtn">
          <div class="btn-icon todos-cancel-btn-icon"></div>
          <div class="btn-content">
            <h3>Zurück zum Dashboard</h3>
            <p>Zurück zum Dashboard</p>
          </div>
        </button>

        <button class="menu-btn todos-save-btn" id="todosSaveBtn">
          <div class="btn-icon todos-save-btn-icon"></div>
          <div class="btn-content">
            <h3>Todo speichern</h3>
            <p>Dein Todo sichern</p>
          </div>
        </button>
      </nav>

      <section class="todo-display">
        <div class="todo-header">
          <h3 class="todo-title" id="todoDisplayTitle" contenteditable="true" data-placeholder="Titel deiner Todo eingeben...">Neue Todo</h3>
        </div>

        <div class="todo-content-display" id="todoContentDisplay" contenteditable="true" data-placeholder="Schreibe hier den Inhalt deiner Todo...">
        </div>

        ${renderSingleActionButtons()}

        <div class="todo-meta-info">
          <span class="todo-creation-date">Wird erstellt: ${formatDate(
            new Date()
          )}</span>
          <span class="todo-status-badge pending">Neu</span>
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
    return "Ungültiges Datum";
  }

  return date.toLocaleDateString("de-DE", {
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
