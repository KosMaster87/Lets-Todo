/**
 * @fileoverview Reset Password Page Component
 * @description Renders the reset password page with email input form
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
        <h2>Reset Password</h2>
        <p>
          Enter your email address and we'll send you a link
          to reset your password.
        </p>
      </section>

      <nav class="reset-password-menu">
        <!-- Error and Success Messages -->
        <div class="reset-password-error" id="resetPasswordError" style="display: none;"></div>
        <div class="reset-password-success" id="resetPasswordSuccess" style="display: none;"></div>

        <form class="reset-password-form" id="resetPasswordForm">
          <div class="form-group">
            <label for="resetEmail">Email Address</label>
            <input
              type="email"
              id="resetEmail"
              name="resetEmail"
              placeholder="Your email address"
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
              <h3>Send Reset Link</h3>
              <p>Request email with reset link</p>
            </div>
          </button>

          <button
            type="button"
            class="menu-btn reset-password-cancel-btn"
            id="resetPasswordCancelBtn"
          >
            <div class="btn-icon reset-password-cancel-btn-icon"></div>
            <div class="btn-content">
              <h3>Back to Login</h3>
              <p>Remember your password?</p>
            </div>
          </button>
        </form>
      </nav>
    </main>
  `;
};
