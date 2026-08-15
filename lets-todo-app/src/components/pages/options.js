/**
 * @fileoverview Options Page Component
 * @description Renders the options/settings page
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
        <h2>Settings</h2>
        <p>
          Manage your user settings and personalize your
          experience.
        </p>
      </section>

      <nav class="options-menu">
        <button class="menu-btn theme-toggle-btn" id="themeToggleBtn">
          <div class="btn-icon theme-toggle-btn-icon"></div>
          <div class="btn-content">
            <h3>Dark/Light Mode</h3>
            <p>Switch between light and dark design</p>
          </div>
        </button>

        <button class="menu-btn personal-data-btn" id="personalDataBtn">
          <div class="btn-icon personal-data-btn-icon"></div>
          <div class="btn-content">
            <h3>Personal Data</h3>
            <p>Edit your account information</p>
          </div>
        </button>

        <button class="menu-btn imprint-btn" id="imprintBtn">
          <div class="btn-icon imprint-btn-icon"></div>
          <div class="btn-content">
            <h3>Imprint</h3>
            <p>Legal information and contact</p>
          </div>
        </button>

        <button class="menu-btn options-cancel-btn" id="optionsCancelBtn">
          <div class="btn-icon options-cancel-btn-icon"></div>
          <div class="btn-content">
            <h3>Back</h3>
            <p>Back to main menu</p>
          </div>
        </button>
      </nav>
    </main>
  `;
};
