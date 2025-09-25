// lets-todo-app/src/components/pages/register.js

/**
 * Renders the register page.
 * @returns {string} HTML string for the register page
 */
export const renderRegisterPage = () => {
  return `
    <main class="register-wrapper" data-view="register">
      <section class="register-intro">
        <h2>Registriere dich jetzt</h2>
        <p>
          Erstelle ein kostenloses Konto, um deine Todos sicher zu speichern und
          von überall darauf zuzugreifen.
        </p>
      </section>

      <nav class="register-menu">
        <div class="form-group">
          <label for="registerEmail">E-Mail-Adresse</label>
          <input
            type="email"
            id="registerEmail"
            name="email"
            placeholder="E-Mail-Adresse"
            required
          />
        </div>

        <div class="form-group">
          <label for="registerPassword">Passwort</label>
          <input
            type="password"
            id="registerPassword"
            name="password"
            placeholder="Passwort (mindestens 6 Zeichen)"
            required
          />
        </div>

        <div class="form-group">
          <label for="registerPasswordConfirm">Passwort bestätigen</label>
          <input
            type="password"
            id="registerPasswordConfirm"
            name="passwordConfirm"
            placeholder="Passwort wiederholen"
            required
          />
        </div>

        <div class="form-group checkbox-group">
          <input type="checkbox" id="registerTerms" name="terms" required />
          <label for="registerTerms"
            >Ich akzeptiere die Nutzungsbedingungen</label
          >
        </div>

        <button class="menu-btn register-submit-btn" id="registerSubmitBtn">
          <div class="btn-icon register-submit-btn-icon"></div>
          <div class="btn-content">
            <h3>Registrieren</h3>
            <p>Neues Konto erstellen</p>
          </div>
        </button>

        <button class="menu-btn register-cancel-btn" id="registerCancelBtn">
          <div class="btn-icon register-cancel-btn-icon"></div>
          <div class="btn-content">
            <h3>Abbrechen</h3>
            <p>Zurück zur Hauptseite</p>
          </div>
        </button>
      </nav>
    </main>
  `;
};
