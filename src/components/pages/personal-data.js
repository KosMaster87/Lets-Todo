// lets-todo-app/src/components/pages/personal-data.js

/**
 * Renders the personal data page.
 * @returns {string} HTML string for the personal data page
 */
export const renderPersonalDataPage = () => {
  return `
    <main class="personal-data-wrapper" data-view="personal-data">
      <section class="personal-data-intro">
        <h2>Persönliche Daten</h2>
        <p>
          Verwalte deine Kontoinformationen und ändere dein Passwort für mehr
          Sicherheit.
        </p>
      </section>

      <nav class="personal-data-menu">
        <button class="menu-btn reset-password-btn" id="resetPasswordBtn">
          <div class="btn-icon reset-password-btn-icon"></div>
          <div class="btn-content">
            <h3>Passwort zurücksetzen</h3>
            <p>Passwort über E-Mail zurücksetzen</p>
          </div>
        </button>

        <button class="menu-btn download-todos-btn" id="downloadTodosBtn">
          <div class="btn-icon download-todos-btn-icon"></div>
          <div class="btn-content">
            <h3>Todos herunterladen</h3>
            <p>Alle deine Todos als Datei speichern</p>
          </div>
        </button>

        <button class="menu-btn upload-todos-btn" id="uploadTodosBtn">
          <div class="btn-icon upload-todos-btn-icon"></div>
          <div class="btn-content">
            <h3>Todos wiederherstellen</h3>
            <p>Todos aus einer Datei importieren</p>
          </div>
        </button>

        <button
          class="menu-btn personalDataCancel-btn"
          id="personalDataCancelBtn"
        >
          <div class="btn-icon personalDataCancel-btn-icon"></div>
          <div class="btn-content">
            <h3>Zurück</h3>
            <p>Zurück zu den Einstellungen</p>
          </div>
        </button>
      </nav>
    </main>
  `;
};
