// lets-todo-app/src/services/navigation-login.js

import { handleNavigationClick, navigateToView } from "./navigation.js";
import { VIEWS } from "./../../utils/constants.js";
import { loginUser } from "./../api-auth.js";

/**
 * Sets up login navigation buttons.
 * Maps login button clicks to their corresponding views and actions.
 */
const setupLoginNavigation = () => {
  const loginLinks = [{ id: "loginCancelBtn", view: VIEWS.MAIN_MENU }];

  loginLinks.forEach(({ id, view }) => {
    const element = document.getElementById(id);
    if (element) {
      element.onclick = (e) => handleNavigationClick(e, view);
    }
  });

  const loginSubmitBtn = document.getElementById("loginSubmitBtn");
  if (loginSubmitBtn) {
    loginSubmitBtn.onclick = (e) => handleLoginSubmit(e);
  }
};

/**
 * Sets up form-specific handlers for the login page.
 * Handles form submission, input validation, and key events.
 */
const setupLoginFormHandlers = () => {
  const loginForm = document.querySelector(".login-menu");
  if (loginForm) {
    loginForm.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleLoginSubmit(e);
      }
    });
  }

  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");

  if (emailInput) {
    emailInput.addEventListener("blur", validateEmail);
  }

  if (passwordInput) {
    passwordInput.addEventListener("blur", validatePassword);
  }
};

/**
 * Handles login form submission.
 * @param {Event} event - Form submission event
 */
const handleLoginSubmit = (event) => {
  event.preventDefault();

  const email = document.getElementById("loginEmail")?.value;
  const password = document.getElementById("loginPassword")?.value;
  const remember = document.getElementById("loginRemember")?.checked;

  if (!email || !password) {
    showLoginError("Bitte fülle alle Felder aus.");
    return;
  }

  if (!isValidEmail(email)) {
    showLoginError("Bitte gib eine gültige E-Mail-Adresse ein.");
    return;
  }

  handleUserLogin({ email, password, remember });
};

/**
 * Validates email input.
 * @param {Event} event - Blur event
 */
const validateEmail = (event) => {
  const email = event.target.value;
  if (email && !isValidEmail(email)) {
    event.target.setCustomValidity("Ungültige E-Mail-Adresse");
  } else {
    event.target.setCustomValidity("");
  }
};

/**
 * Validates password input.
 * @param {Event} event - Blur event
 */
const validatePassword = (event) => {
  const password = event.target.value;
  if (password && password.length < 6) {
    event.target.setCustomValidity(
      "Passwort muss mindestens 6 Zeichen lang sein"
    );
  } else {
    event.target.setCustomValidity("");
  }
};

/**
 * Checks if email format is valid.
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Handle user login using centralized API service
 * @param {Object} userData - User login data
 */
const handleUserLogin = async (userData) => {
  try {
    showLoginLoading(true);

    const result = await loginUser(userData);

    showLoginLoading(false);
    showLoginSuccess("Login erfolgreich! Willkommen zurück!");
    setTimeout(() => {
      navigateToView(VIEWS.MAIN_MENU);
    }, 1500);
  } catch (error) {
    showLoginLoading(false);

    let errorMessage = "Login fehlgeschlagen. Bitte überprüfe deine Daten.";

    if (error.error) {
      errorMessage = error.error;
    } else if (error.message) {
      errorMessage = error.message;
    }

    showLoginError(errorMessage);
  }
};

/**
 * Shows login loading state
 * @param {boolean} loading - Loading state
 */
const showLoginLoading = (loading) => {
  const submitBtn = document.getElementById("loginSubmitBtn");
  if (submitBtn) {
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? "Anmeldung läuft..." : "Anmelden";
  }
};

/**
 * Shows login success message.
 * @param {string} message - Success message to display
 */
const showLoginSuccess = (message) => {
  // TODO: Implement proper toast/success display system
  alert(`✅ ${message}`);
};

/**
 * Shows login error message.
 * @param {string} message - Error message to display
 */
const showLoginError = (message) => {
  // TODO: Implement proper toast/error display system
  alert(`❌ ${message}`);
};

/**
 * Sets up additional login-specific navigation handlers.
 * Called by the main navigation system for all login-related event listeners.
 */
export const setupLoginEventListeners = () => {
  setupLoginNavigation();
  setupLoginFormHandlers();

  // Additional login-specific event listeners can be added here
  // For example: password visibility toggle, forgot password, etc.
};
