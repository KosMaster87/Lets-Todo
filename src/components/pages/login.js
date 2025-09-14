// lets-todo-app/src/pages/login.js

/**
 * Renders the login page.
 * @returns {string} HTML string for the login page
 */
export const renderLoginPage = () => {
  return `
    <main class="login-wrapper hidden" data-view="login">
      <section class="login-intro">
        <h2>Willkommen zurück!</h2>
        <p>Bitte melde dich an, um auf deine Todos zuzugreifen.</p>
      </section>

      <nav class="login-menu">
        <div class="form-group">
          <label for="loginEmail">E-Mail-Adresse</label>
          <input
            type="email"
            id="loginEmail"
            name="email"
            placeholder="E-Mail-Adresse"
            required
          />
        </div>

        <div class="form-group">
          <label for="loginPassword">Passwort</label>
          <input
            type="password"
            id="loginPassword"
            name="password"
            placeholder="Passwort"
            required
          />
        </div>

        <div class="form-group checkbox-group">
          <input type="checkbox" id="loginRemember" name="remember" />
          <label for="loginRemember">Angemeldet bleiben</label>
        </div>

        <button class="menu-btn loginSubmit-btn" id="loginSubmitBtn">
          <div class="btn-icon loginSubmit-btn-icon"></div>
          <div class="btn-content">
            <h3>Anmelden</h3>
            <p>In dein Konto einloggen</p>
          </div>
        </button>

        <button class="menu-btn loginCancel-btn" id="loginCancelBtn">
          <div class="btn-icon loginCancel-btn-icon"></div>
          <div class="btn-content">
            <h3>Abbrechen</h3>
            <p>Zurück zur Hauptseite</p>
          </div>
        </button>
      </nav>
    </main>
  `;
};
