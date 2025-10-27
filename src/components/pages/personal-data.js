/**
 * @fileoverview Personal Data Page Component
 * @module personal-data
 */

/**
 * Renders the personal data page.
 * @returns {string} HTML string for the personal data page
 */
export const renderPersonalDataPage = () => {
  return `
    <main class="personal-data-wrapper" data-view="personal-data">
      <section class="personal-data-intro">
        <h2>Personal Data</h2>
        <p>
          Manage your account information and change your password for more
          security.
        </p>
      </section>

      <nav class="personal-data-menu">
        <button class="menu-btn reset-password-btn" id="resetPasswordBtn">
          <div class="btn-icon reset-password-btn-icon"></div>
          <div class="btn-content">
            <h3>Reset Password</h3>
            <p>Reset password via email</p>
          </div>
        </button>

        <button class="menu-btn change-password-btn" id="changePasswordBtn">
          <div class="btn-icon change-password-btn-icon"></div>
          <div class="btn-content">
            <h3>Change Password</h3>
            <p>Securely change current password</p>
          </div>
        </button>

        <button class="menu-btn download-todos-btn" id="downloadTodosBtn">
          <div class="btn-icon download-todos-btn-icon"></div>
          <div class="btn-content">
            <h3>Download Todos</h3>
            <p>Save all your todos as a file</p>
          </div>
        </button>

        <button class="menu-btn upload-todos-btn" id="uploadTodosBtn">
          <div class="btn-icon upload-todos-btn-icon"></div>
          <div class="btn-content">
            <h3>Restore Todos</h3>
            <p>Import todos from a file</p>
          </div>
        </button>

        <button
          class="menu-btn personal-data-cancel-btn"
          id="personalDataCancelBtn"
        >
          <div class="btn-icon personal-data-cancel-btn-icon"></div>
          <div class="btn-content">
            <h3>Back</h3>
            <p>Back to settings</p>
          </div>
        </button>
      </nav>
    </main>
  `;
};
