// lets-todo-app/src/components/pages/todo-view.js

import { getCurrentTodo } from "../../state.js";
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
        <h2>Deine Todo</h2>
        <p>
          Hier siehst du deine Todo im Detail. Du kannst sie bearbeiten,
          teilen oder löschen.
        </p>
      </section>

      <nav class="todo-view-menu">
        <button class="menu-btn todo-view-back-btn" id="todosCancelBtn">
          <div class="btn-icon todo-view-back-btn-icon"></div>
          <div class="btn-content">
            <h3>Zurück zu Todos</h3>
            <p>Zur Todos-Liste zurückkehren</p>
          </div>
        </button>

        <button class="menu-btn todo-view-save-btn" id="todosSaveBtn">
          <div class="btn-icon todo-view-save-btn-icon"></div>
          <div class="btn-content">
            <h3>Todo speichern</h3>
            <p>Änderungen speichern</p>
          </div>
        </button>
      </nav>

      <section class="todo-display">
        <div class="todo-header">
          <h3 class="todo-title" id="todoDisplayTitle" contenteditable="true" data-placeholder="Titel deiner Todo eingeben...">${escapeHtml(
            currentTodo.title || "Untitled"
          )}</h3>
        </div>

        <div class="todo-content-display" id="todoContentDisplay" contenteditable="true" data-placeholder="Schreibe hier den Inhalt deiner Todo...">${escapeHtml(
          currentTodo.content || currentTodo.title || "Kein Inhalt vorhanden..."
        )}</div>

        ${renderSingleActionButtons(currentTodo)}

        <div class="todo-meta-info">
          <span class="todo-creation-date">Erstellt: ${formatDate(
            currentTodo.created || new Date()
          )}</span>
          <span class="todo-status-badge ${
            currentTodo.completed ? "completed" : "pending"
          }">
            ${currentTodo.completed ? "Erledigt" : "Ausstehend"}
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
        <h2>Keine Todo ausgewählt</h2>
        <p>
          Bitte wähle eine Notiz aus der Liste aus, um sie anzuzeigen.
        </p>
      </section>

      <nav class="todo-view-menu">
        <button class="menu-btn todo-view-back-btn" id="todoViewBackBtn">
          <div class="btn-icon todo-view-back-btn-icon"></div>
          <div class="btn-content">
            <h3>Zurück zu Todos</h3>
            <p>Zur Todos-Liste zurückkehren</p>
          </div>
        </button>
      </nav>

      <section class="todo-display">
        <div class="todo-placeholder">
          <p>Keine Todo zum Anzeigen ausgewählt.</p>
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
 * Prevented XSS-Attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
const escapeHtml = (text) => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};
