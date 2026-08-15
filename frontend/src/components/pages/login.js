/**
 * @fileoverview Login Page Component
 * @description Renders the login page HTML
 * @module login
 */

/**
 * Renders the login page.
 * @returns {string} HTML string for the login page
 */
export const renderLoginPage = () => {
  return `
    <main class="login-wrapper" data-view="login">
      <section class="login-intro">
        <h2>Welcome back!</h2>
        <p>Please login to access your todos.</p>
      </section>

      <nav class="login-menu">
        <div class="form-group">
          <label for="loginEmail">Email Address</label>
          <input
            type="email"
            id="loginEmail"
            name="email"
            placeholder="Email Address"
            required
          />
        </div>

        <div class="form-group">
          <label for="loginPassword">Password</label>
          <input
            type="password"
            id="loginPassword"
            name="password"
            placeholder="Password"
            required
          />
        </div>

        <div class="form-group checkbox-group">
          <input type="checkbox" id="loginRemember" name="remember" />
          <label for="loginRemember">Stay logged in</label>
        </div>

        <button class="menu-btn login-submit-btn" id="loginSubmitBtn">
          <div class="btn-icon login-submit-btn-icon"></div>
          <div class="btn-content">
            <h3>Login</h3>
            <p>Login to your account</p>
          </div>
        </button>

        <div class="login-forgot-password">
          <button class="link-button" id="loginForgotPasswordBtn">
            Forgot password?
          </button>
        </div>

        <button class="menu-btn login-cancel-btn" id="loginCancelBtn">
          <div class="btn-icon login-cancel-btn-icon"></div>
          <div class="btn-content">
            <h3>Cancel</h3>
            <p>Back to main page</p>
          </div>
        </button>
      </nav>
    </main>
  `;
};
