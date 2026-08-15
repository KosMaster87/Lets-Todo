/**
 * @fileoverview Router for user authentication and account management
 * @description Handles user registration, login, logout, password changes, and password resets.
 * @module routing/authRouter
 */

import { Router } from "express";
import { ENV, debugLog, errorLog } from "./../config/environment.js";
import { sendPasswordResetEmail } from "./helpers/emailHelpers.js";
import {
  validateRegisterInput,
  hashPassword,
  validateLoginInput,
  validateEmail,
  validateChangePasswordInput,
  validateResetPasswordInput,
} from "./helpers/authHelpers.js";
import { validateUserSession } from "./helpers/dbHelpers.js";
import {
  createUserDbName,
  createCompleteUserSetup,
  processUserLogin,
  processPasswordChange,
} from "./helpers/userAccountHelpers.js";
import {
  validateResetTokenResponse,
  processPasswordReset,
  processForgotPassword,
} from "./helpers/passwordResetHelpers.js";
import { createCookieOptions, createClearCookieOptions } from "./helpers/cookieHelpers.js";
import {
  sendSuccess,
  sendError,
  sendValidationError,
  sendAuthError,
  sendServerError,
  HTTP_STATUS,
} from "./helpers/responseHelpers.js";

const router = Router();

// #################################################

/**
 * GET /api/validate-session - Session-Gültigkeit prüfen
 * Überprüft ob die aktuelle Session noch gültig ist
 */
router.get("/validate-session", async (req, res) => {
  const userId = req.cookies.userId;
  const sessionResult = await validateUserSession(userId);

  if (!sessionResult.valid && sessionResult.error) {
    errorLog("Session validation error:", sessionResult.error);
  }

  res.json(sessionResult);
});

// #################################################

/**
 * POST /api/register - Neuen User registrieren
 * Erstellt automatisch eine eigene Datenbank für den User
 * @param {Object} req.body - Registrierungsdaten
 * @param {string} req.body.email - E-Mail-Adresse
 * @param {string} req.body.password - Passwort (wird gehasht)
 */
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const validation = validateRegisterInput(email, password);
  if (!validation.valid) return sendValidationError(res, validation.error);

  try {
    await processUserRegistration(email, password);
    return createRegistrationSuccessResponse(res);
  } catch (err) {
    return err.code === "ER_DUP_ENTRY"
      ? handleDuplicateEmailError(res)
      : handleRegistrationError(res);
  }
});

/**
 * Creates error response for duplicate email registration
 * @param {Object} res - Express response object
 * @returns {Object} Error response
 */
const handleDuplicateEmailError = (res) => {
  return sendError(
    res,
    "Ein Account mit dieser E-Mail existiert bereits. Versuche dich anzumelden oder das Passwort zurückzusetzen.",
    "EMAIL_ALREADY_EXISTS",
    HTTP_STATUS.CONFLICT
  );
};

/**
 * Creates error response for general registration failure
 * @param {Object} res - Express response object
 * @returns {Object} Error response
 */
const handleRegistrationError = (res) => {
  return sendServerError(res, "Registrierung fehlgeschlagen. Bitte versuche es später erneut.");
};

/**
 * Creates success response for successful registration
 * @param {Object} res - Express response object
 * @returns {Object} Success response
 */
const createRegistrationSuccessResponse = (res) => {
  return sendSuccess(
    res,
    "Registrierung erfolgreich. Du kannst dich jetzt anmelden.",
    {},
    HTTP_STATUS.CREATED
  );
};

/**
 * Processes user registration with database setup
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<void>}
 */
const processUserRegistration = async (email, password) => {
  const password_hash = await hashPassword(password);
  const dbName = createUserDbName(email);
  const created = Date.now();
  await createCompleteUserSetup(email, password_hash, dbName, created);
};

// #################################################

/**
 * POST /api/login - User einloggen
 * Setzt httpOnly Cookie für Session-Management
 * @param {Object} req.body - Login-Daten
 * @param {string} req.body.email - E-Mail-Adresse
 * @param {string} req.body.password - Passwort
 * @param {boolean} [req.body.remember] - "Remember Me" Option für persistenten Login
 */
router.post("/login", async (req, res) => {
  const { email, password, remember = false } = req.body;
  const validation = validateLoginInput(email, password);

  if (!validation.valid) {
    return sendError(res, validation.error, "MISSING_CREDENTIALS");
  }

  try {
    const result = await processUserLogin(email, password);
    if (!result.success) {
      return sendError(res, result.error, result.code, HTTP_STATUS.UNAUTHORIZED);
    }
    return handleSuccessfulLogin(req, res, result);
  } catch (err) {
    return sendServerError(res, "Login-Fehler");
  }
});

/**
 * Handles successful login flow with cookies and response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} result - Login result from processUserLogin
 * @returns {Object} Success response
 */
const handleSuccessfulLogin = (req, res, result) => {
  handleGuestCookieCleanup(req, res);
  setUserAuthCookie(res, result.user.id);
  return createLoginSuccessResponse(res, result.user.id);
};

/**
 * Handles guest cookie cleanup during login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleGuestCookieCleanup = (req, res) => {
  if (req.cookies.guestId) {
    res.clearCookie("guestId", createClearCookieOptions());
  }
};

/**
 * Sets user authentication cookie
 * @param {Object} res - Express response object
 * @param {number} userId - User ID to set in cookie
 */
const setUserAuthCookie = (res, userId) => {
  const cookieOptions = createCookieOptions();
  debugLog(`User-Login Cookie-Optionen:`, cookieOptions);
  res.cookie("userId", userId, cookieOptions);
};

/**
 * Creates login success response
 * @param {Object} res - Express response object
 * @param {number} userId - User ID for response
 * @returns {Object} Success response
 */
const createLoginSuccessResponse = (res, userId) => {
  return sendSuccess(res, "Login erfolgreich. Willkommen zurück!", {
    userId: userId,
  });
};

// #################################################

/**
 * POST /api/logout - User ausloggen
 * Löscht das userId Cookie
 */
router.post("/logout", (req, res) => {
  const clearCookieOptions = createClearCookieOptions();
  res.clearCookie("userId", clearCookieOptions);
  return sendSuccess(res, "Erfolgreich abgemeldet.");
});

// #################################################

/**
 * PUT /api/change-password - User Passwort ändern
 * Erfordert aktuelles Passwort zur Bestätigung
 * @param {Object} req.body - Password-Change-Daten
 * @param {string} req.body.currentPassword - Aktuelles Passwort zur Verifizierung
 * @param {string} req.body.newPassword - Neues Passwort (wird gehasht)
 */
router.put("/change-password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  logPasswordChangeRequest(req);

  const validation = validateChangePasswordInput(currentPassword, newPassword);
  if (!validation.valid) return sendValidationError(res, validation.error);

  const userId = extractAndValidateUserId(req, res);
  if (typeof userId !== "string") return userId;

  try {
    const result = await processPasswordChange(userId, currentPassword, newPassword);
    return result.success
      ? handlePasswordChangeSuccess(userId, result, res)
      : handlePasswordChangeFailure(result, res);
  } catch (err) {
    errorLog(`Password change error for user ${userId}:`, err);
    return sendServerError(res, "Server-Fehler beim Passwort-Update");
  }
});

/**
 * Logs password change request details for debugging
 * @param {Object} req - Express request object
 */
const logPasswordChangeRequest = (req) => {
  debugLog("Password change request:", {
    body: { currentPassword: "***", newPassword: "***" },
    cookies: req.cookies,
    headers: {
      "content-type": req.headers["content-type"],
      cookie: req.headers.cookie || "NO COOKIE HEADER",
    },
  });
};

/**
 * Extracts and validates user ID from cookies
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {string|Object} User ID or error response
 */
const extractAndValidateUserId = (req, res) => {
  const userId = req.cookies.userId;
  debugLog(`Extracted userId from cookies: ${userId}`);

  if (!userId) {
    errorLog("No userId found in cookies:", req.cookies);
    return sendAuthError(res, "Nicht authentifiziert - Bitte einloggen");
  }
  return userId;
};

/**
 * Handles unsuccessful password change attempts
 * @param {Object} result - Result from processPasswordChange
 * @param {Object} res - Express response object
 * @returns {Object} Error response
 */
const handlePasswordChangeFailure = (result, res) => {
  return result.code === "USER_NOT_FOUND"
    ? sendError(res, result.error, result.code, HTTP_STATUS.NOT_FOUND)
    : sendAuthError(res, result.error);
};

/**
 * Handles successful password change
 * @param {string} userId - User ID
 * @param {Object} result - Result from processPasswordChange
 * @param {Object} res - Express response object
 * @returns {Object} Success response
 */
const handlePasswordChangeSuccess = (userId, result, res) => {
  debugLog(`Password changed successfully for user ${userId} (${result.user.email})`);
  return sendSuccess(res, "Simon says... Password successfully changed");
};

// #################################################

/**
 * POST /api/forgot-password - Passwort-Reset anfordern
 * Generiert einen Reset-Token und sendet ihn per E-Mail (aktuell nur Platzhalter)
 * @param {Object} req.body - Reset-Request-Daten
 * @param {string} req.body.email - E-Mail-Adresse für Reset-Link
 */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const validationResult = validateForgotPasswordInput(email, res);
  if (validationResult !== true) return validationResult;

  try {
    const result = await processForgotPassword(email);
    if (!result.userExists) {
      return handleNonExistentUserReset(email, res, result.message);
    }
    return await handleSuccessfulResetRequest(email, result, res);
  } catch (err) {
    errorLog(`Forgot password error for email ${email}:`, err);
    return sendServerError(res, "Server-Fehler beim Verarbeiten der Reset-Anfrage");
  }
});

/**
 * Validates forgot password request input
 * @param {string} email - Email address
 * @param {Object} res - Express response object
 * @returns {boolean|Object} Returns true if valid, or error response if invalid
 */
const validateForgotPasswordInput = (email, res) => {
  if (!email) {
    return sendValidationError(res, "E-Mail-Adresse ist erforderlich");
  }
  if (!validateEmail(email)) {
    return sendValidationError(res, "Ungültiges E-Mail-Format");
  }
  return true;
};

/**
 * Handles case when user doesn't exist for password reset
 * @param {string} email - Email address
 * @param {Object} res - Express response object
 * @param {string} message - Message from processForgotPassword
 * @returns {Object} Success response
 */
const handleNonExistentUserReset = (email, res, message) => {
  debugLog(`Password reset requested for non-existent email: ${email}`);
  return sendSuccess(res, message);
};

/**
 * Creates debug data for password reset response
 * @param {Object} result - Result from processForgotPassword
 * @param {string} email - Email address
 * @returns {Object} Debug data object
 */
const createResetDebugData = (result, email) => ({
  userId: result.user.id,
  email,
  resetToken: result.resetToken,
  resetLink: `${ENV.FRONTEND_URL}/reset-password/${result.resetToken}`,
  expiresAt: new Date(result.expirationTime).toLocaleString("de-DE"),
});

/**
 * Handles successful password reset token generation
 * @param {string} email - Email address
 * @param {Object} result - Result from processForgotPassword
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Success response
 */
const handleSuccessfulResetRequest = async (email, result, res) => {
  await sendPasswordResetEmail(email, result.resetToken, result.user);

  debugLog(
    `Password reset token generated for user: ${
      result.user.id
    } (${email}) - Token: ${result.resetToken.substring(0, 8)}...`
  );

  return sendSuccess(res, "Reset-Link wurde an deine E-Mail-Adresse gesendet.", {
    debug: createResetDebugData(result, email),
  });
};

// #################################################

/**
 * POST /api/reset-password - Passwort mit Reset-Token zurücksetzen
 * Setzt ein neues Passwort basierend auf einem gültigen Reset-Token
 * @param {Object} req.body - Reset-Daten
 * @param {string} req.body.token - Gültiger Reset-Token
 * @param {string} req.body.newPassword - Neues Passwort
 */
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  const validation = validateResetPasswordInput(token, newPassword);
  if (!validation.valid) return sendValidationError(res, validation.error);

  try {
    const result = await processPasswordReset(token, newPassword);
    return result.success
      ? handlePasswordResetSuccess(result, res)
      : sendValidationError(res, result.error);
  } catch (err) {
    return handlePasswordResetError(token, err, res);
  }
});

/**
 * Handles successful password reset completion
 * @param {Object} result - Result from processPasswordReset
 * @param {Object} res - Express response object
 * @returns {Object} Success response
 */
const handlePasswordResetSuccess = (result, res) => {
  debugLog(
    `Password reset successful for user: ${result.resetToken.user_id} (${result.resetToken.email})`
  );
  return sendSuccess(res, "Passwort wurde erfolgreich zurückgesetzt");
};

/**
 * Handles password reset error logging and response
 * @param {string} token - Reset token (for logging)
 * @param {Error} err - Error object
 * @param {Object} res - Express response object
 * @returns {Object} Error response
 */
const handlePasswordResetError = (token, err, res) => {
  errorLog(`Password reset error for token ${token}:`, err);
  return sendServerError(res, "Server-Fehler beim Passwort-Reset");
};

// #################################################

/**
 * GET /api/validate-reset-token/:token - Reset-Token validieren
 * Prüft ob ein Reset-Token gültig und nicht abgelaufen ist
 * @param {string} req.params.token - Der zu validierende Reset-Token
 */
router.get("/validate-reset-token/:token", async (req, res) => {
  const { token } = req.params;
  const result = await validateResetTokenResponse(token);

  if (result.logData) {
    debugLog(`Valid reset token for user: ${result.logData.user_id} (${result.logData.email})`);
  }

  if (result.error) {
    errorLog(`Token validation error for token ${token}:`, result.error);
  }

  res.status(result.status).json(result.response);
});

export default router;
