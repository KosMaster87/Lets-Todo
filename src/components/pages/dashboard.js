/**
 * @fileoverview Dashboard Page Component
 * @module dashboard-page
 */

import {
  getTodos,
  getTrashedTodos,
  getSessionType,
} from "./../../state/main-state.js";

/**
 * Renders the dashboard page.
 * @returns {string} HTML string for the dashboard page
 */
export const renderDashboardPage = () => {
  const todos = getTodos();
  const trashedTodos = getTrashedTodos();
  const sessionType = getSessionType();

  return `
    <div class="dashboard-wrapper">

      <section class="dashboard-intro">
        <h1 class="dashboard-title">Dashboard</h1>
        <p class="dashboard-subtitle">
          Hier findest du alle wichtigen Funktionen für deine Todos.
        </p>
        ${createSessionInfo(sessionType)}
      </section>

      <nav class="dashboard-menu">
        <button
          class="menu-btn todos-list-dashboard-btn"
          id="todosListDashboardBtn"
        >
          <div class="btn-icon todos-list-dashboard-btn-icon"></div>
          <div class="btn-content">
            <h3>Todo-Liste</h3>
            <p>Alle deine gespeicherten Todos anzeigen</p>
          </div>
        </button>

        <button
          class="menu-btn create-todo-dashboard-btn"
          id="createTodoDashboardBtn"
        >
          <div class="btn-icon create-todo-dashboard-btn-icon"></div>
          <div class="btn-content">
            <h3>Todo erstellen</h3>
            <p>Ein neues Todo schreiben</p>
          </div>
        </button>

        <button class="menu-btn trash-dashboard-btn" id="trashDashboardBtn">
          <div class="btn-icon trash-dashboard-btn-icon"></div>
          <div class="btn-content">
            <h3>Papierkorb</h3>
            <p>Gelöschte Todos verwalten</p>
          </div>
        </button>

        <button class="menu-btn dashboard-cancel-btn" id="dashboardCancelBtn">
          <div class="btn-icon dashboard-cancel-btn-icon"></div>
          <div class="btn-content">
            <h3>Zurück zum Menü</h3>
            <p>Zum Hauptmenü zurückkehren</p>
          </div>
        </button>
      </nav>

      <section class="dashboard-stats">
        <div class="stat-item">
          <div class="stat-number dashboard-total-todos">${todos.length}</div>
          <div class="stat-label">Todos gesamt</div>
        </div>
        <div class="stat-item">
          <div class="stat-number dashboard-completed-todos">${getCompletedCount(
            todos
          )}</div>
          <div class="stat-label">Erledigt</div>
        </div>
        <div class="stat-item">
          <div class="stat-number dashboard-trash-count">${
            trashedTodos.length
          }</div>
          <div class="stat-label">Im Papierkorb</div>
        </div>
      </section>
    </div>
  `;
};

/**
 * Creates session info display.
 * @param {string} sessionType - Session type
 * @returns {string} HTML string for session info
 */
const createSessionInfo = (sessionType) => {
  const sessionText = sessionType === "user" ? "Benutzer-Modus" : "Gast-Modus";
  return `<p class="dashboard-session-info">Aktuelle Sitzung: ${sessionText}</p>`;
};

/**
 * Gets the count of completed todos.
 * @param {Array} todos - Array of todos
 * @returns {number} Count of completed todos
 */
const getCompletedCount = (todos) => {
  return todos.filter((todo) => todo.completed).length;
};
