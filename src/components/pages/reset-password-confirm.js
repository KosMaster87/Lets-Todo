/**
 * @fileoverview Reset Password Confirmation Page Component
 * @module reset-password-confirm-page
 * @since 1.0.0
 */

/**
 * Renders the reset password confirmation page.
 * Displays password input form for completing the password reset process.
 * @function renderResetPasswordConfirmPage
 * @param {string} token - The reset token from URL parameters
 * @returns {string} HTML string for the reset password confirmation page
 */
export const renderResetPasswordConfirmPage = (token = "") => {
  return `
    <main class="reset-password-confirm-wrapper" data-view="reset-password-confirm" data-token="${token}">
      <section class="reset-password-confirm-intro">
        <h2>Neues Passwort setzen</h2>
        <p>
          Bitte gib dein neues Passwort ein. Es muss mindestens 6 Zeichen lang sein
          und sollte aus Sicherheitsgründen eine Kombination aus Buchstaben und Zahlen enthalten.
        </p>
      </section>

      <!-- Token Validation Status -->
      <div class="token-validation-status" id="tokenValidationStatus">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Token wird validiert...</p>
        </div>
      </div>

      <!-- Reset Form (initially hidden) -->
      <nav class="reset-password-confirm-menu" id="resetPasswordConfirmMenu" style="display: none;">
        <!-- Error and Success Messages -->
        <div class="reset-password-confirm-error" id="resetPasswordConfirmError" style="display: none;"></div>
        <div class="reset-password-confirm-success" id="resetPasswordConfirmSuccess" style="display: none;"></div>

        <!-- User Email Display -->
        <div class="reset-user-info" id="resetUserInfo" style="display: none;">
          <p>Passwort zurücksetzen für: <strong id="resetUserEmail"></strong></p>
        </div>

        <form class="reset-password-confirm-form" id="resetPasswordConfirmForm">
          <div class="form-group">
            <label for="newPassword">Neues Passwort</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              placeholder="Mindestens 6 Zeichen"
              required
              minlength="6"
              autocomplete="new-password"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">Passwort bestätigen</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Passwort wiederholen"
              required
              minlength="6"
              autocomplete="new-password"
            />
          </div>

          <!-- Password Strength Indicator -->
          <div class="password-strength" id="passwordStrength" style="display: none;">
            <div class="strength-bar">
              <div class="strength-fill" id="strengthFill"></div>
            </div>
            <p class="strength-text" id="strengthText">Passwort-Stärke</p>
          </div>

          <button
            type="submit"
            class="menu-btn reset-password-confirm-submit-btn"
            id="resetPasswordConfirmSubmitBtn"
          >
            <div class="btn-icon reset-password-confirm-submit-btn-icon"></div>
            <div class="btn-content">
              <h3>Passwort speichern</h3>
              <p>Neues Passwort übernehmen</p>
            </div>
          </button>

          <button
            type="button"
            class="menu-btn reset-password-confirm-cancel-btn"
            id="resetPasswordConfirmCancelBtn"
          >
            <div class="btn-icon reset-password-confirm-cancel-btn-icon"></div>
            <div class="btn-content">
              <h3>Zum Login</h3>
              <p>Zurück zur Anmeldung</p>
            </div>
          </button>
        </form>
      </nav>

      <!-- Invalid Token Message (initially hidden) -->
      <nav class="invalid-token-message" id="invalidTokenMessage" style="display: none;">
        <div class="error-icon">⚠️</div>
        <h3>Ungültiger oder abgelaufener Link</h3>
        <p>Dieser Reset-Link ist nicht mehr gültig. Bitte fordere einen neuen an.</p>

        <button
          type="button"
          class="menu-btn request-new-reset-btn"
          id="requestNewResetBtn"
        >
          <div class="btn-icon request-new-reset-btn-icon"></div>
          <div class="btn-content">
            <h3>Neuen Link anfordern</h3>
            <p>Zurück zur Reset-Anfrage</p>
          </div>
        </button>

        <button
          type="button"
          class="menu-btn back-to-login-btn"
          id="backToLoginBtn"
        >
          <div class="btn-icon back-to-login-btn-icon"></div>
          <div class="btn-content">
            <h3>Zum Login</h3>
            <p>Zurück zur Anmeldung</p>
          </div>
        </button>
      </nav>
    </main>
  `;
};
