/**
 * @fileoverview Reset Password Page Component
 * @module reset-password-page
 * @since 1.0.0
 */

/**
 * Renders the reset password page.
 * Displays email input form for password reset requests.
 * @function renderResetPasswordPage
 * @returns {string} HTML string for the reset password page
 */
export const renderResetPasswordPage = () => {
  return `
    <main class="reset-password-wrapper" data-view="reset-password">
      <section class="reset-password-intro">
        <h2>Passwort zurücksetzen</h2>
        <p>
          Gib deine E-Mail-Adresse ein und wir senden dir einen Link
          zum Zurücksetzen deines Passworts.
        </p>
      </section>

      <nav class="reset-password-menu">
        <!-- Error and Success Messages -->
        <div class="reset-password-error" id="resetPasswordError" style="display: none;"></div>
        <div class="reset-password-success" id="resetPasswordSuccess" style="display: none;"></div>

        <form class="reset-password-form" id="resetPasswordForm">
          <div class="form-group">
            <label for="resetEmail">E-Mail-Adresse</label>
            <input
              type="email"
              id="resetEmail"
              name="resetEmail"
              placeholder="Deine E-Mail-Adresse"
              required
              autocomplete="email"
            />
          </div>

          <button
            type="submit"
            class="menu-btn reset-password-submit-btn"
            id="resetPasswordSubmitBtn"
          >
            <div class="btn-icon reset-password-submit-btn-icon"></div>
            <div class="btn-content">
              <h3>Reset-Link senden</h3>
              <p>E-Mail mit Zurücksetzen-Link anfordern</p>
            </div>
          </button>

          <button
            type="button"
            class="menu-btn reset-password-cancel-btn"
            id="resetPasswordCancelBtn"
          >
            <div class="btn-icon reset-password-cancel-btn-icon"></div>
            <div class="btn-content">
              <h3>Zurück zum Login</h3>
              <p>Passwort doch noch bekannt?</p>
            </div>
          </button>
        </form>
      </nav>
    </main>
  `;
};
