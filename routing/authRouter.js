// lets-todo-api/routing/authRouter.js

import { Router } from "express";
import { userPool, corePool, userPools } from "../db.js";
import { ENV, debugLog, errorLog } from "../config/environment.js";
import { emailService } from "../services/emailService.js";
import mysql from "mysql2/promise";
import {
  validateRegisterInput,
  hashPassword,
  validateLoginInput,
  validateEmail,
  verifyPassword,
  validateChangePasswordInput,
  validateResetPasswordInput,
} from "./helpers/authHelpers.js";
import {
  findUserByEmail,
  createUserDbName,
  findUserForPasswordReset,
  clearOldResetTokens,
  saveResetToken,
  validateResetToken,
  insertUser,
  findUserById,
  findUserByIdWithPassword,
  updateUserPassword,
  createUserDatabase,
  createUserPool,
  createTodosTable,
  createTodosIndex,
  executePasswordResetTransaction,
  generateResetToken,
  calculateExpirationTime,
  validateUserSession,
  getLatestResetToken,
  validateResetTokenResponse,
} from "./helpers/dbHelpers.js";
import {
  createCookieOptions,
  createClearCookieOptions,
} from "./helpers/cookieHelpers.js";
import { sendPasswordResetEmail } from "./helpers/emailHelpers.js";
import {
  sendSuccess,
  sendError,
  sendValidationError,
  sendAuthError,
  sendServerError,
  HTTP_STATUS,
} from "./helpers/responseHelpers.js";

const router = Router();

// DEBUG ONLY: Temporärer Endpoint zum Abrufen des letzten Tokens für Tests (vor Session-Middleware)
router.get("/debug/get-latest-token/:email", async (req, res) => {
  const { email } = req.params;
  const result = await getLatestResetToken(email);

  if (result.error) {
    return res.status(result.error.includes("Server") ? 500 : 404).json(result);
  }

  res.json(result);
});

/**
 * POST /api/register - Neuen User registrieren
 * Erstellt automatisch eine eigene Datenbank für den User
 * @param {Object} req.body - Registrierungsdaten
 * @param {string} req.body.email - E-Mail-Adresse
 * @param {string} req.body.password - Passwort (wird gehasht)
 */
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  // Use helper function for validation
  const validation = validateRegisterInput(email, password);
  if (!validation.valid) {
    return sendValidationError(res, validation.error);
  }

  // Use helper function for password hashing
  const password_hash = await hashPassword(password);

  // Eindeutiger DB-Name basierend auf E-Mail
  const dbName = createUserDbName(email);
  const created = Date.now();

  try {
    // 1) User in zentrale User-Tabelle eintragen
    const userId = await insertUser(email, password_hash, dbName, created);

    // 2) Dedicated User-Datenbank erstellen
    await createUserDatabase(dbName);

    // 3) Todos-Tabelle in User-DB initialisieren UND Pool speichern
    const pool = createUserPool(dbName);
    await createTodosTable(pool);
    await createTodosIndex(pool);

    // WICHTIG: Pool für zukünftige Requests speichern
    userPools[`user_${userId}`] = pool;

    /**
     * TODO: Personalisierte Erfolgs-Nachricht mit Username
     * autoLogin: true,
     * requiresEmailVerification: false
     */
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
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const validation = validateLoginInput(email, password);
  if (!validation.valid) {
    return sendError(res, validation.error, "MISSING_CREDENTIALS");
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return sendError(
        res,
        "E-Mail oder Passwort ist falsch.",
        "INVALID_CREDENTIALS",
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return sendError(
        res,
        "E-Mail oder Passwort ist falsch.",
        "INVALID_CREDENTIALS",
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Eventuelle Gast-Session löschen
    if (req.cookies.guestId) {
      const clearCookieOptions = createClearCookieOptions();
      res.clearCookie("guestId", clearCookieOptions);
    }

    // Session-Cookie setzen
    const cookieOptions = createCookieOptions();

    debugLog(`User-Login Cookie-Optionen:`, cookieOptions);
    res.cookie("userId", user.id, cookieOptions);

    return sendSuccess(res, "Login erfolgreich. Willkommen zurück!", {
      userId: user.id,
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
    const user = await findUserForPasswordReset(email);

    // Aus Sicherheitsgründen immer erfolgreich antworten
    // (verhindert User-Enumeration/Benutzer-Aufzählung)
    if (!user) {
      debugLog(`Password reset requested for non-existent email: ${email}`);
      return sendSuccess(
        res,
        "Falls ein Account mit dieser E-Mail existiert, wurde ein Reset-Link gesendet."
      );
    }

    // Sichere Token-Generierung
    const resetToken = generateResetToken();
    const currentTime = new Date();
    const expirationTime = calculateExpirationTime();

    // Alte Tokens für diesen User löschen (nur einer gültig zur Zeit)
    await clearOldResetTokens(user.id);

    // Neuen Token in Datenbank speichern
    await saveResetToken(user.id, email, resetToken, expirationTime);

    debugLog(
      `Password reset token generated for user: ${
        user.id
      } (${email}) - Token: ${resetToken.substring(0, 8)}...`
    );

    // E-Mail mit Reset-Link senden
    await sendPasswordResetEmail(email, resetToken, user);

    return sendSuccess(
      res,
      "Reset-Link wurde an deine E-Mail-Adresse gesendet.",
      {
        // Für Entwicklung - in Produktion entfernen:
        debug: {
          userId: user.id,
          email: email,
          resetToken: resetToken,
          resetLink: `${
            ENV.FRONTEND_URL || "http://localhost:5500"
          }/reset-password/${resetToken}`,
          expiresAt: new Date(expirationTime).toLocaleString("de-DE"),
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

  // User-ID aus Cookie/Session extrahieren
  const userId = req.cookies.userId;
  debugLog(`Extracted userId from cookies: ${userId}`);

  if (!userId) {
    errorLog("No userId found in cookies:", req.cookies);
    return sendAuthError(res, "Nicht authentifiziert - Bitte einloggen");
  }

  try {
    // User-Daten aus Datenbank laden
    const user = await findUserByIdWithPassword(userId);

    if (!user) {
      return sendError(
        res,
        "User nicht gefunden",
        "USER_NOT_FOUND",
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Aktuelles Passwort verifizieren
    const currentPasswordValid = await verifyPassword(
      currentPassword,
      user.password_hash
    );

    if (!currentPasswordValid) {
      return sendAuthError(res, "Aktuelles Passwort ist falsch");
    }

    // Neues Passwort hashen
    const newPasswordHash = await hashPassword(newPassword);

    // Passwort in Datenbank aktualisieren
    await updateUserPassword(userId, newPasswordHash);

    debugLog(
      `Password changed successfully for user ${userId} (${user.email})`
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
    return res.status(400).json({
      error: validation.error,
    });
  }

  try {
    // Token validieren
    const resetToken = await validateResetToken(token);

    if (!resetToken) {
      return res.status(400).json({
        error: "Token nicht gefunden oder bereits verwendet",
      });
    }

    // Neues Passwort hashen
    const newPasswordHash = await hashPassword(newPassword);
    const currentTime = new Date();

    // Transaktional: Passwort ändern und Token als verwendet markieren
    await executePasswordResetTransaction(
      resetToken,
      newPasswordHash,
      currentTime
    );

    debugLog(
      `Password reset successful for user: ${resetToken.user_id} (${resetToken.email})`
    );

    res.json({
      success: true,
      message: "Passwort wurde erfolgreich zurückgesetzt",
    });
  } catch (err) {
    errorLog(`Password reset error for token ${token}:`, err);
    res.status(500).json({
      error: "Server-Fehler beim Passwort-Reset",
    });
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
