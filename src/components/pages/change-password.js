// lets-todo-app/src/components/pages/change-password.js

/**
 * Renders the change password page.
 * @returns {string} HTML string for the change password page
 */
export const renderChangePasswordPage = () => {
  return `
    <main class="change-password-wrapper" data-view="change-password">
      <section class="change-password-intro">
        <h2>Passwort ändern</h2>
        <p>
          Gib dein aktuelles Passwort ein und wähle ein neues, sicheres
          Passwort für dein Konto.
        </p>
      </section>

      <form class="change-password-menu change-password-form" id="changePasswordForm">
        <!-- Error and Success Messages -->
        <div class="change-password-error" id="changePasswordError" style="display: none;"></div>
        <div class="change-password-success" id="changePasswordSuccess" style="display: none;"></div>

        <div class="form-group">
          <label for="currentPassword">Aktuelles Passwort</label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            placeholder="Dein aktuelles Passwort"
            required
          />
        </div>

        <div class="form-group">
          <label for="newPassword">Neues Passwort</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            placeholder="Neues Passwort"
            required
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Passwort bestätigen</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Neues Passwort bestätigen"
            required
          />
        </div>

        <button
          class="menu-btn change-password-submit-btn"
          id="changePasswordSubmitBtn"
        >
          <div class="btn-icon change-password-submit-btn-icon"></div>
          <div class="btn-content">
            <h3>Passwort speichern</h3>
            <p>Neues Passwort übernehmen</p>
          </div>
        </button>

        <button
          class="menu-btn change-password-cancel-btn"
          id="changePasswordCancelBtn"
        >
          <div class="btn-icon change-password-cancel-btn-icon"></div>
          <div class="btn-content">
            <h3>Abbrechen</h3>
            <p>Zurück zu persönlichen Daten</p>
          </div>
        </button>
      </form>
    </main>
  `;
};
