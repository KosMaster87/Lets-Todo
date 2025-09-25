// lets-todo-app/src/components/pages/todos.js

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

      <section class="todo-creation">
        <div class="todo-form">
          <div class="form-group">
            <label for="todoTitle">Titel</label>
            <input
              type="text"
              class="form-control text-input"
              id="todoTitle"
              name="title"
              placeholder="Titel deiner Todo"
              required
            />
          </div>

          <div class="form-group">
            <label for="todoContent">Inhalt</label>
            <textarea
              class="form-control textarea-input"
              id="todoContent"
              name="content"
              placeholder="Schreibe hier den Inhalt deiner Todo..."
              rows="6"
              required
            ></textarea>
          </div>

          <div class="todo-actions">
            <button
              class="action-btn bookmark-btn"
              id="bookmarkBtn"
              title="Als Lesezeichen markieren"
            >
              <div class="action-icon bookmark-icon"></div>
            </button>

            <button
              class="action-btn save-todo-btn"
              id="saveTodoBtn"
              title="Todo speichern"
            >
              <div class="action-icon save-todo-icon"></div>
            </button>

            <button
              class="action-btn share-btn"
              id="shareBtn"
              title="Notiz teilen"
            >
              <div class="action-icon share-icon"></div>
            </button>

            <button
              class="action-btn copy-btn"
              id="copyBtn"
              title="Notiz kopieren"
            >
              <div class="action-icon copy-icon"></div>
            </button>

            <button
              class="action-btn delete-todo-btn"
              id="deleteTodoBtn"
              title="Todo löschen"
            >
              <div class="action-icon delete-todo-icon"></div>
            </button>
          </div>
        </div>
      </section>
    </main>
  `;
};
