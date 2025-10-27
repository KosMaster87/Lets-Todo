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
        <h2>Set New Password</h2>
        <p>
          Please enter your new password. It must be at least 6 characters long
          and should contain a combination of letters and numbers for security reasons.
        </p>
      </section>

      <!-- Token Validation Status -->
      <div class="token-validation-status" id="tokenValidationStatus">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Validating token...</p>
        </div>
      </div>

      <!-- Reset Form (initially hidden) -->
      <nav class="reset-password-confirm-menu" id="resetPasswordConfirmMenu" style="display: none;">
        <!-- Error and Success Messages -->
        <div class="reset-password-confirm-error" id="resetPasswordConfirmError" style="display: none;"></div>
        <div class="reset-password-confirm-success" id="resetPasswordConfirmSuccess" style="display: none;"></div>

        <!-- User Email Display -->
        <div class="reset-user-info" id="resetUserInfo" style="display: none;">
          <p>Reset password for: <strong id="resetUserEmail"></strong></p>
        </div>

        <form class="reset-password-confirm-form" id="resetPasswordConfirmForm">
          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              placeholder="At least 6 characters"
              required
              minlength="6"
              autocomplete="new-password"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Repeat password"
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
            <p class="strength-text" id="strengthText">Password Strength</p>
          </div>

          <button
            type="submit"
            class="menu-btn reset-password-confirm-submit-btn"
            id="resetPasswordConfirmSubmitBtn"
          >
            <div class="btn-icon reset-password-confirm-submit-btn-icon"></div>
            <div class="btn-content">
              <h3>Save Password</h3>
              <p>Apply new password</p>
            </div>
          </button>

          <button
            type="button"
            class="menu-btn reset-password-confirm-cancel-btn"
            id="resetPasswordConfirmCancelBtn"
          >
            <div class="btn-icon reset-password-confirm-cancel-btn-icon"></div>
            <div class="btn-content">
              <h3>To Login</h3>
              <p>Back to login</p>
            </div>
          </button>
        </form>
      </nav>

      <!-- Invalid Token Message (initially hidden) -->
      <nav class="invalid-token-message" id="invalidTokenMessage" style="display: none;">
        <div class="error-icon">⚠️</div>
        <h3>Invalid or Expired Link</h3>
        <p>This reset link is no longer valid. Please request a new one.</p>

        <button
          type="button"
          class="menu-btn request-new-reset-btn"
          id="requestNewResetBtn"
        >
          <div class="btn-icon request-new-reset-btn-icon"></div>
          <div class="btn-content">
            <h3>Request New Link</h3>
            <p>Back to reset request</p>
          </div>
        </button>

        <button
          type="button"
          class="menu-btn back-to-login-btn"
          id="backToLoginBtn"
        >
          <div class="btn-icon back-to-login-btn-icon"></div>
          <div class="btn-content">
            <h3>To Login</h3>
            <p>Back to login</p>
          </div>
        </button>
      </nav>
    </main>
  `;
};
