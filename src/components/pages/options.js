/**
 * @fileoverview Options Page Component
 * @module options
 */

/**
 * Renders the options page.
 * @returns {string} HTML string for the options page
 */
export const renderOptionsPage = () => {
  return `
    <main class="options-wrapper" data-view="options">
      <section class="options-intro">
        <h2>Einstellungen</h2>
        <p>
          Verwalte deine Benutzereinstellungen und personalisiere deine
          Erfahrung.
        </p>
      </section>

      <nav class="options-menu">
        <button class="menu-btn theme-toggle-btn" id="themeToggleBtn">
          <div class="btn-icon theme-toggle-btn-icon"></div>
          <div class="btn-content">
            <h3>Dark/Light Mode</h3>
            <p>Zwischen hellem und dunklem Design wechseln</p>
          </div>
        </button>

        <button class="menu-btn personal-data-btn" id="personalDataBtn">
          <div class="btn-icon personal-data-btn-icon"></div>
          <div class="btn-content">
            <h3>Persönliche Daten</h3>
            <p>Deine Kontoinformationen bearbeiten</p>
          </div>
        </button>

        <button class="menu-btn options-cancel-btn" id="optionsCancelBtn">
          <div class="btn-icon options-cancel-btn-icon"></div>
          <div class="btn-content">
            <h3>Zurück</h3>
            <p>Zurück zum Hauptmenü</p>
          </div>
        </button>
      </nav>
    </main>
  `;
};
