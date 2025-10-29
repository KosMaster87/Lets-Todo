/**
 * @fileoverview Register Page Component
 * @description Renders the register page HTML
 * @module register
 */

/**
 * Renders the register page.
 * @returns {string} HTML string for the register page
 */
export const renderRegisterPage = () => {
  return `
    <main class="register-wrapper" data-view="register">
      <section class="register-intro">
        <h2>Register now</h2>
        <p>
          Create a free account to securely save your todos and
          access them from anywhere.
        </p>
      </section>

      <nav class="register-menu">
        <div class="form-group">
          <label for="registerEmail">Email Address</label>
          <input
            type="email"
            id="registerEmail"
            name="email"
            placeholder="Email Address"
            required
          />
        </div>

        <div class="form-group">
          <label for="registerPassword">Password</label>
          <input
            type="password"
            id="registerPassword"
            name="password"
            placeholder="Password (at least 6 characters)"
            required
          />
        </div>

        <div class="form-group">
          <label for="registerPasswordConfirm">Confirm Password</label>
          <input
            type="password"
            id="registerPasswordConfirm"
            name="passwordConfirm"
            placeholder="Repeat password"
            required
          />
        </div>

        <div class="form-group checkbox-group">
          <input type="checkbox" id="registerTerms" name="terms" required />
          <label for="registerTerms"
            >I accept the terms and conditions</label
          >
        </div>

        <button class="menu-btn register-submit-btn" id="registerSubmitBtn">
          <div class="btn-icon register-submit-btn-icon"></div>
          <div class="btn-content">
            <h3>Register</h3>
            <p>Create new account</p>
          </div>
        </button>

        <button class="menu-btn register-cancel-btn" id="registerCancelBtn">
          <div class="btn-icon register-cancel-btn-icon"></div>
          <div class="btn-content">
            <h3>Cancel</h3>
            <p>Back to main page</p>
          </div>
        </button>
      </nav>
    </main>
  `;
};
