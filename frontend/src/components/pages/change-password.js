/**
 * @fileoverview Change Password Page Component
 * @description Renders the change password page.
 * @module change-password
 */

/**
 * Renders the change password page.
 * @returns {string} HTML string for the change password page
 */
export const renderChangePasswordPage = () => {
  return `
    <main class="change-password-wrapper" data-view="change-password">
      <section class="change-password-intro">
        <h2>Change Password</h2>
        <p>
          Enter your current password and choose a new, secure
          password for your account.
        </p>
      </section>

      <form class="change-password-menu change-password-form" id="changePasswordForm">
        <!-- Error and Success Messages -->
        <div class="change-password-error" id="changePasswordError" style="display: none;"></div>
        <div class="change-password-success" id="changePasswordSuccess" style="display: none;"></div>

        <div class="form-group">
          <label for="currentPassword">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            placeholder="Your current password"
            required
          />
        </div>

        <div class="form-group">
          <label for="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            placeholder="New password"
            required
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm new password"
            required
          />
        </div>

        <button
          class="menu-btn change-password-submit-btn"
          id="changePasswordSubmitBtn"
        >
          <div class="btn-icon change-password-submit-btn-icon"></div>
          <div class="btn-content">
            <h3>Save Password</h3>
            <p>Apply new password</p>
          </div>
        </button>

        <button
          class="menu-btn change-password-cancel-btn"
          id="changePasswordCancelBtn"
        >
          <div class="btn-icon change-password-cancel-btn-icon"></div>
          <div class="btn-content">
            <h3>Cancel</h3>
            <p>Back to personal data</p>
          </div>
        </button>
      </form>
    </main>
  `;
};
