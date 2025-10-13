// lets-todo-api/routing/authRouter.js

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
import {
  createUserDbName,
  validateUserSession,
  validateResetTokenResponse,
  processPasswordReset,
  createCompleteUserSetup,
  processUserLogin,
  processForgotPassword,
  processPasswordChange,
} from "./helpers/dbHelpers.js";
import {
  createCookieOptions,
  createClearCookieOptions,
} from "./helpers/cookieHelpers.js";
import {
  sendSuccess,
  sendError,
  sendValidationError,
  sendAuthError,
  sendServerError,
  HTTP_STATUS,
} from "./helpers/responseHelpers.js";

const router = Router();

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
  if (!validation.valid) {
    return sendValidationError(res, validation.error);
  }

  try {
    const password_hash = await hashPassword(password);
    const dbName = createUserDbName(email);
    const created = Date.now();

    await createCompleteUserSetup(email, password_hash, dbName, created);

    return sendSuccess(
      res,
      "Registrierung erfolgreich. Du kannst dich jetzt anmelden.",
      {},
      HTTP_STATUS.CREATED
    );
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return sendError(
        res,
        "Ein Account mit dieser E-Mail existiert bereits. Versuche dich anzumelden oder das Passwort zurückzusetzen.",
        "EMAIL_ALREADY_EXISTS",
        HTTP_STATUS.CONFLICT
      );
    }
    return sendServerError(
      res,
      "Registrierung fehlgeschlagen. Bitte versuche es später erneut."
    );
  }
});

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
      return sendError(
        res,
        result.error,
        result.code,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    if (req.cookies.guestId) {
      res.clearCookie("guestId", createClearCookieOptions());
    }

    const cookieOptions = createCookieOptions();
    debugLog(`User-Login Cookie-Optionen:`, cookieOptions);
    res.cookie("userId", result.user.id, cookieOptions);

    return sendSuccess(res, "Login erfolgreich. Willkommen zurück!", {
      userId: result.user.id,
      remember: remember,
    });
  } catch (err) {
    return sendServerError(res, "Login-Fehler");
  }
});

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

/**
 * POST /api/logout - User ausloggen
 * Löscht das userId Cookie
 */
router.post("/logout", (req, res) => {
  const clearCookieOptions = createClearCookieOptions();
  res.clearCookie("userId", clearCookieOptions);
  return sendSuccess(res, "Erfolgreich abgemeldet.");
});

/**
 * POST /api/forgot-password - Passwort-Reset anfordern
 * Generiert einen Reset-Token und sendet ihn per E-Mail (aktuell nur Platzhalter)
 * @param {Object} req.body - Reset-Request-Daten
 * @param {string} req.body.email - E-Mail-Adresse für Reset-Link
 */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return sendValidationError(res, "E-Mail-Adresse ist erforderlich");
  }

  if (!validateEmail(email)) {
    return sendValidationError(res, "Ungültiges E-Mail-Format");
  }

  try {
    const result = await processForgotPassword(email);

    if (!result.userExists) {
      debugLog(`Password reset requested for non-existent email: ${email}`);
      return sendSuccess(res, result.message);
    }

    await sendPasswordResetEmail(email, result.resetToken, result.user);

    debugLog(
      `Password reset token generated for user: ${
        result.user.id
      } (${email}) - Token: ${result.resetToken.substring(0, 8)}...`
    );

    return sendSuccess(
      res,
      "Reset-Link wurde an deine E-Mail-Adresse gesendet.",
      {
        debug: {
          userId: result.user.id,
          email,
          resetToken: result.resetToken,
          resetLink: `${ENV.FRONTEND_URL}/reset-password/${result.resetToken}`,
          expiresAt: new Date(result.expirationTime).toLocaleString("de-DE"),
        },
      }
    );
  } catch (err) {
    errorLog(`Forgot password error for email ${email}:`, err);
    return sendServerError(
      res,
      "Server-Fehler beim Verarbeiten der Reset-Anfrage"
    );
  }
});

/**
 * PUT /api/change-password - User Passwort ändern
 * Erfordert aktuelles Passwort zur Bestätigung
 * @param {Object} req.body - Password-Change-Daten
 * @param {string} req.body.currentPassword - Aktuelles Passwort zur Verifizierung
 * @param {string} req.body.newPassword - Neues Passwort (wird gehasht)
 */
router.put("/change-password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  debugLog("Password change request:", {
    body: { currentPassword: "***", newPassword: "***" },
    cookies: req.cookies,
    headers: {
      "content-type": req.headers["content-type"],
      cookie: req.headers.cookie || "NO COOKIE HEADER",
    },
  });

  const validation = validateChangePasswordInput(currentPassword, newPassword);
  if (!validation.valid) {
    return sendValidationError(res, validation.error);
  }

  const userId = req.cookies.userId;
  debugLog(`Extracted userId from cookies: ${userId}`);

  if (!userId) {
    errorLog("No userId found in cookies:", req.cookies);
    return sendAuthError(res, "Nicht authentifiziert - Bitte einloggen");
  }

  try {
    const result = await processPasswordChange(
      userId,
      currentPassword,
      newPassword
    );

    if (!result.success) {
      return result.code === "USER_NOT_FOUND"
        ? sendError(res, result.error, result.code, HTTP_STATUS.NOT_FOUND)
        : sendAuthError(res, result.error);
    }

    debugLog(
      `Password changed successfully for user ${userId} (${result.user.email})`
    );
    return sendSuccess(res, "Simon says... Password successfully changed");
  } catch (err) {
    errorLog(`Password change error for user ${userId}:`, err);
    return sendServerError(res, "Server-Fehler beim Passwort-Update");
  }
});

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
  if (!validation.valid) {
    return sendValidationError(res, validation.error);
  }

  try {
    const result = await processPasswordReset(token, newPassword);

    if (!result.success) {
      return sendValidationError(res, result.error);
    }

    debugLog(
      `Password reset successful for user: ${result.resetToken.user_id} (${result.resetToken.email})`
    );
    return sendSuccess(res, "Passwort wurde erfolgreich zurückgesetzt");
  } catch (err) {
    errorLog(`Password reset error for token ${token}:`, err);
    return sendServerError(res, "Server-Fehler beim Passwort-Reset");
  }
});

/**
 * GET /api/validate-reset-token/:token - Reset-Token validieren
 * Prüft ob ein Reset-Token gültig und nicht abgelaufen ist
 * @param {string} req.params.token - Der zu validierende Reset-Token
 */
router.get("/validate-reset-token/:token", async (req, res) => {
  const { token } = req.params;
  const result = await validateResetTokenResponse(token);

  if (result.logData) {
    debugLog(
      `Valid reset token for user: ${result.logData.user_id} (${result.logData.email})`
    );
  }

  if (result.error) {
    errorLog(`Token validation error for token ${token}:`, result.error);
  }

  res.status(result.status).json(result.response);
});

export default router;
