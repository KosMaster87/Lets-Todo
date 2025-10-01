// lets-todo-app/src/services/navigation-register.js

import { handleNavigationClick, navigateToView } from "./navigation.js";
import { VIEWS } from "../utils/constants.js";
import { registerUser } from "./api-auth.js";

/**
 * Sets up register navigation buttons.
 * Maps register button clicks to their corresponding views and actions.
 */
const setupRegisterNavigation = () => {
  const registerLinks = [{ id: "registerCancelBtn", view: VIEWS.MAIN_MENU }];

  registerLinks.forEach(({ id, view }) => {
    const element = document.getElementById(id);
    if (element) {
      element.onclick = (e) => handleNavigationClick(e, view);
    }
  });

  const registerSubmitBtn = document.getElementById("registerSubmitBtn");
  if (registerSubmitBtn) {
    registerSubmitBtn.onclick = (e) => handleRegisterSubmit(e);
  }
};

/**
 * Sets up form-specific handlers for the register page.
 */
const setupRegisterFormHandlers = () => {
  // Setup form submission on Enter key
  const registerForm = document.querySelector(".register-menu");
  if (registerForm) {
    registerForm.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleRegisterSubmit(e);
      }
    });
  }

  // Setup individual input validation
  const emailInput = document.getElementById("registerEmail");
  const passwordInput = document.getElementById("registerPassword");
  const passwordConfirmInput = document.getElementById(
    "registerPasswordConfirm"
  );

  if (emailInput) {
    emailInput.addEventListener("blur", validateEmail);
  }

  if (passwordInput) {
    passwordInput.addEventListener("blur", validatePassword);
  }

  if (passwordConfirmInput) {
    passwordConfirmInput.addEventListener("blur", validatePasswordConfirm);
  }
};

/**
 * Handles register form submission.
 * @param {Event} event - Form submission event
 */
const handleRegisterSubmit = (event) => {
  event.preventDefault();

  const email = document.getElementById("registerEmail")?.value;
  const password = document.getElementById("registerPassword")?.value;
  const passwordConfirm = document.getElementById(
    "registerPasswordConfirm"
  )?.value;
  const termsAccepted = document.getElementById("registerTerms")?.checked;

  // Basic validation
  if (!email || !password || !passwordConfirm) {
    showRegisterError("Bitte fülle alle Felder aus.");
    return;
  }

  if (!isValidEmail(email)) {
    showRegisterError("Bitte gib eine gültige E-Mail-Adresse ein.");
    return;
  }

  if (password.length < 6) {
    showRegisterError("Das Passwort muss mindestens 6 Zeichen lang sein.");
    return;
  }

  if (password !== passwordConfirm) {
    showRegisterError("Die Passwörter stimmen nicht überein.");
    return;
  }

  if (!termsAccepted) {
    showRegisterError("Du musst die Nutzungsbedingungen akzeptieren.");
    return;
  }

  // Call registration API
  handleUserRegistration({ email, password });
};

/**
 * Handle user registration using centralized API service
 * @param {Object} userData - User registration data
 */
const handleUserRegistration = async (userData) => {
  try {
    showRegisterLoading(true);

    const result = await registerUser(userData);
    /**
     * result TODO
     */
    // Personalisierte Erfolgs-Nachricht
    // showRegisterSuccess(`Willkommen ${result.username || email}! Registrierung erfolgreich.`);
    // --------------------------

    // Analytics Event senden
    // analytics.track('user_registered', {
    //   userId: result.userId,
    //   email: userData.email,
    //   registrationDate: result.createdAt,
    //   userType: result.accountType || 'free'
    // });
    // --------------------------

    // Direkt einloggen ohne nochmal Passwort eingeben - Bei bestehender Registrierung, direkt autologin.
    // if (result.autoLogin) {
    //   setSession({
    //     sessionType: "user",
    //     userId: result.userId,
    //     userEmail: userData.email,
    //     sessionId: `user_${result.userId}`,
    //   });

    //   navigateToView(VIEWS.DASHBOARD); // Direkt ins Dashboard!
    // }

    // --------------------------

    // EmailVerification oder ProfileSetup Views je nach Bedarf
    // if (result.requiresEmailVerification) {
    //   navigateToView(VIEWS.EMAIL_VERIFICATION);
    // } else if (result.requiresProfileSetup) {
    //   navigateToView(VIEWS.PROFILE_SETUP);
    // } else {
    //   navigateToView(VIEWS.LOGIN);
    // }

    // --------------------------

    showRegisterLoading(false);
    showRegisterSuccess(
      "Registrierung erfolgreich! Du kannst dich jetzt anmelden."
    );

    // Navigate to login page after successful registration
    setTimeout(() => {
      navigateToView(VIEWS.LOGIN);
    }, 2000);
  } catch (error) {
    showRegisterLoading(false);

    let errorMessage =
      "Registrierung fehlgeschlagen. Bitte versuche es erneut.";

    if (error.error) {
      if (error.error.includes("already exists")) {
        errorMessage = "Diese E-Mail-Adresse ist bereits registriert.";
      } else {
        errorMessage = error.error;
      }
    }

    showRegisterError(errorMessage);
    console.error("Registration error:", error);
  }
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
 * Validates password confirmation input.
 * @param {Event} event - Blur event
 */
const validatePasswordConfirm = (event) => {
  const passwordConfirm = event.target.value;
  const password = document.getElementById("registerPassword")?.value;

  if (passwordConfirm && password && passwordConfirm !== password) {
    event.target.setCustomValidity("Passwörter stimmen nicht überein");
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

// ✅ API logic moved to centralized api-auth.js service

/**
 * Shows register loading state
 * @param {boolean} loading - Loading state
 */
const showRegisterLoading = (loading) => {
  const submitBtn = document.getElementById("registerSubmitBtn");
  if (submitBtn) {
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? "Registrierung läuft..." : "Registrieren";
  }
};

/**
 * Shows register success message.
 * @param {string} message - Success message to display
 */
const showRegisterSuccess = (message) => {
  // TODO: Implement proper toast/success display system
  alert(`✅ ${message}`);
};

/**
 * Shows register error message.
 * @param {string} message - Error message to display
 */
const showRegisterError = (message) => {
  // TODO: Implement proper toast/error display system
  alert(`❌ ${message}`);
};

/**
 * Sets up additional register-specific navigation handlers.
 * Called by the main navigation system for all register-related event listeners.
 */
export const setupRegisterEventListeners = () => {
  setupRegisterNavigation();
  setupRegisterFormHandlers();

  // Additional register-specific event listeners can be added here
  // For example: password strength indicator, email availability check, etc.
};
