// lets-todo-api/routing/authRouter.js

import { Router } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { userPool, corePool, userPools } from "../db.js";
import { ENV, debugLog, errorLog } from "../config/environment.js";
import { emailService } from "../services/emailService.js";
import mysql from "mysql2/promise";

const router = Router();

// DEBUG ONLY: Temporärer Endpoint zum Abrufen des letzten Tokens für Tests (vor Session-Middleware)
router.get("/debug/get-latest-token/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const [rows] = await userPool.execute(
      "SELECT token FROM password_reset_tokens WHERE email = ? ORDER BY created_at DESC LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return res.json({ error: "Kein Token gefunden für diese E-Mail" });
    }

    res.json({
      email: email,
      latestToken: rows[0].token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
  if (!email || !password)
    return res.status(400).json({ error: "Email und Passwort erforderlich" });

  // Passwort hashen für sichere Speicherung
  const password_hash = await bcrypt.hash(password, 10);

  // Eindeutiger DB-Name basierend auf E-Mail
  const dbName = `todos_user_${Buffer.from(email)
    .toString("hex")
    .slice(0, 24)}`;
  const created = Date.now();

  try {
    // 1) User in zentrale User-Tabelle eintragen
    const [result] = await userPool.query(
      `INSERT INTO users (email, password_hash, db_name, created)
       VALUES (?, ?, ?, ?)`,
      [email, password_hash, dbName, created]
    );

    const userId = result.insertId;

    // 2) Dedicated User-Datenbank erstellen
    await corePool.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\`
       CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`
    );

    // 3) Todos-Tabelle in User-DB initialisieren UND Pool speichern
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 5,
    });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        created BIGINT,
        updated BIGINT,
        completed TINYINT,
        trashed TINYINT(1) DEFAULT 0 COMMENT 'Indicates if todo is in trash',
        trashed_at BIGINT DEFAULT NULL COMMENT 'Timestamp when todo was trashed'
      );
    `);

    // Add index for better performance on trash queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_todos_trashed ON todos (trashed, trashed_at)
    `);

    // WICHTIG: Pool für zukünftige Requests speichern
    userPools[`user_${userId}`] = pool;

    /**
     * TODO: Personalisierte Erfolgs-Nachricht mit Username
     * autoLogin: true,
     * requiresEmailVerification: false
     */
    res.status(201).json({
      message: "Registrierung erfolgreich. Du kannst dich jetzt anmelden.",
      success: true,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({
        error:
          "Ein Account mit dieser E-Mail existiert bereits. Versuche dich anzumelden oder das Passwort zurückzusetzen.",
        code: "EMAIL_ALREADY_EXISTS",
      });
    res.status(500).json({
      error: "Registrierung fehlgeschlagen. Bitte versuche es später erneut.",
      code: "REGISTRATION_ERROR",
    });
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
  if (!email || !password)
    return res.status(400).json({
      error: "E-Mail und Passwort sind erforderlich.",
      code: "MISSING_CREDENTIALS",
    });

  try {
    const [rows] = await userPool.query(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);
    if (!rows.length)
      return res.status(401).json({
        error: "E-Mail oder Passwort ist falsch.",
        code: "INVALID_CREDENTIALS",
      });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({
        error: "E-Mail oder Passwort ist falsch.",
        code: "INVALID_CREDENTIALS",
      });

    // Eventuelle Gast-Session löschen
    if (req.cookies.guestId) {
      const clearCookieOptions = { path: "/" };
      if (ENV.COOKIE_DOMAIN) clearCookieOptions.domain = ENV.COOKIE_DOMAIN;
      res.clearCookie("guestId", clearCookieOptions);
    }

    // Session-Cookie setzen
    const cookieOptions = {
      httpOnly: false, // Für Frontend-Zugriff
      secure: ENV.COOKIE_SECURE, // false in Development, true in Production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Tage
      path: "/",
    };

    // SameSite nur in Production setzen (mit secure: true)
    if (ENV.COOKIE_SECURE) {
      cookieOptions.sameSite = "lax";
    }

    // Domain nur setzen wenn definiert (Production), in Development weglassen
    if (ENV.COOKIE_DOMAIN) {
      cookieOptions.domain = ENV.COOKIE_DOMAIN;
    }

    debugLog(`User-Login Cookie-Optionen:`, cookieOptions);
    res.cookie("userId", user.id, cookieOptions);

    res.json({
      message: "Login erfolgreich. Willkommen zurück!",
      success: true,
      userId: user.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/validate-session - Session-Gültigkeit prüfen
 * Überprüft ob die aktuelle Session noch gültig ist
 */
router.get("/validate-session", async (req, res) => {
  const userId = req.cookies.userId;

  if (!userId) {
    return res.json({ valid: false, reason: "No session cookie found" });
  }

  try {
    const [rows] = await userPool.query(
      `SELECT id, email FROM users WHERE id = ?`,
      [userId]
    );

    if (!rows.length) {
      return res.json({ valid: false, reason: "User not found" });
    }

    res.json({
      valid: true,
      userId: userId,
      email: rows[0].email,
    });
  } catch (err) {
    errorLog("Session validation error:", err);
    res.json({ valid: false, reason: "Database error" });
  }
});

/**
 * POST /api/logout - User ausloggen
 * Löscht das userId Cookie
 */
router.post("/logout", (req, res) => {
  const clearCookieOptions = { path: "/" };
  if (ENV.COOKIE_DOMAIN) clearCookieOptions.domain = ENV.COOKIE_DOMAIN;
  res.clearCookie("userId", clearCookieOptions);
  res.json({
    message: "Erfolgreich abgemeldet.",
    success: true,
  });
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
    return res.status(400).json({
      error: "E-Mail-Adresse ist erforderlich",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "Ungültiges E-Mail-Format",
    });
  }

  try {
    const [rows] = await userPool.query(
      `SELECT id, email FROM users WHERE email = ?`,
      [email]
    );

    // Aus Sicherheitsgründen immer erfolgreich antworten
    // (verhindert User-Enumeration/Benutzer-Aufzählung)
    if (!rows.length) {
      debugLog(`Password reset requested for non-existent email: ${email}`);
      return res.json({
        success: true,
        message:
          "Falls ein Account mit dieser E-Mail existiert, wurde ein Reset-Link gesendet.",
      });
    }

    const user = rows[0];

    // Sichere Token-Generierung
    const resetToken = crypto.randomBytes(32).toString("hex");
    const currentTime = new Date();
    const expirationTime = new Date(Date.now() + 60 * 60 * 1000); // 1 Stunde gültig

    // Alte Tokens für diesen User löschen (nur einer gültig zur Zeit)
    await userPool.query(
      `DELETE FROM password_reset_tokens WHERE user_id = ?`,
      [user.id]
    );

    // Neuen Token in Datenbank speichern
    await userPool.query(
      `INSERT INTO password_reset_tokens (user_id, email, token, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [user.id, email, resetToken, expirationTime, currentTime]
    );

    debugLog(
      `Password reset token generated for user: ${
        user.id
      } (${email}) - Token: ${resetToken.substring(0, 8)}...`
    );

    // E-Mail mit Reset-Link senden
    try {
      const emailResult = await emailService.sendPasswordResetEmail(
        email,
        resetToken,
        `${user.firstName || ""} ${user.lastName || ""}`.trim() || null
      );

      debugLog(
        `📧 Password-Reset-E-Mail versendet: ${emailResult.messageId} (${emailResult.mode})`
      );
    } catch (emailError) {
      errorLog("❌ Fehler beim E-Mail-Versand:", emailError.message);
      // Trotzdem erfolgreich antworten (Security: keine Info über E-Mail-Probleme)
    }

    res.json({
      success: true,
      message: "Reset-Link wurde an deine E-Mail-Adresse gesendet.",
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
    });
  } catch (err) {
    errorLog(`Forgot password error for email ${email}:`, err);
    res.status(500).json({
      error: "Server-Fehler beim Verarbeiten der Reset-Anfrage",
    });
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

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      error: "Aktuelles und neues Passwort erforderlich",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      error: "Neues Passwort muss mindestens 6 Zeichen lang sein",
    });
  }

  // User-ID aus Cookie/Session extrahieren
  const userId = req.cookies.userId;
  debugLog(`Extracted userId from cookies: ${userId}`);

  if (!userId) {
    errorLog("No userId found in cookies:", req.cookies);
    return res.status(401).json({
      error: "Nicht authentifiziert - Bitte einloggen",
    });
  }

  try {
    // User-Daten aus Datenbank laden
    const [rows] = await userPool.query(
      `SELECT id, email, password_hash FROM users WHERE id = ?`,
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: "User nicht gefunden",
      });
    }

    const user = rows[0];

    // Aktuelles Passwort verifizieren
    const currentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!currentPasswordValid) {
      return res.status(401).json({
        error: "Aktuelles Passwort ist falsch",
      });
    }

    // Neues Passwort hashen
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Passwort in Datenbank aktualisieren
    await userPool.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [
      newPasswordHash,
      userId,
    ]);

    debugLog(
      `Password changed successfully for user ${userId} (${user.email})`
    );

    res.json({
      message: "Simon says... Password successfully changed",
      success: true,
    });
  } catch (err) {
    errorLog(`Password change error for user ${userId}:`, err);
    res.status(500).json({
      error: "Server-Fehler beim Passwort-Update",
    });
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

  if (!token || !newPassword) {
    return res.status(400).json({
      error: "Token und neues Passwort sind erforderlich",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      error: "Neues Passwort muss mindestens 6 Zeichen lang sein",
    });
  }

  try {
    // Token validieren (gleiche Logik wie validate-reset-token)
    const [rows] = await userPool.query(
      `SELECT rt.id, rt.user_id, rt.expires_at, rt.is_used, u.email
       FROM password_reset_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token = ? AND rt.is_used = 0`,
      [token]
    );

    if (!rows.length) {
      return res.status(400).json({
        error: "Token nicht gefunden oder bereits verwendet",
      });
    }

    const resetToken = rows[0];
    const currentTime = new Date();

    if (resetToken.expires_at < currentTime) {
      return res.status(400).json({
        error: "Token ist abgelaufen",
      });
    }

    // Neues Passwort hashen
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Transaktional: Passwort ändern und Token als verwendet markieren
    await userPool.getConnection().then(async (connection) => {
      try {
        await connection.beginTransaction();

        // Passwort aktualisieren
        await connection.query(
          `UPDATE users SET password_hash = ? WHERE id = ?`,
          [newPasswordHash, resetToken.user_id]
        );

        // Token als verwendet markieren
        await connection.query(
          `UPDATE password_reset_tokens SET is_used = 1, used_at = ? WHERE id = ?`,
          [currentTime, resetToken.id]
        );

        // Alle anderen Reset-Tokens dieses Users invalidieren
        await connection.query(
          `UPDATE password_reset_tokens SET is_used = 1, used_at = ?
           WHERE user_id = ? AND id != ? AND is_used = 0`,
          [currentTime, resetToken.user_id, resetToken.id]
        );

        await connection.commit();
        connection.release();

        debugLog(
          `Password reset successful for user: ${resetToken.user_id} (${resetToken.email})`
        );

        res.json({
          success: true,
          message: "Passwort wurde erfolgreich zurückgesetzt",
        });
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
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

  if (!token) {
    return res.status(400).json({
      valid: false,
      error: "Token ist erforderlich",
    });
  }

  try {
    const [rows] = await userPool.query(
      `SELECT rt.id, rt.user_id, rt.expires_at, rt.is_used, u.email
       FROM password_reset_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token = ? AND rt.is_used = 0`,
      [token]
    );

    if (!rows.length) {
      return res.json({
        valid: false,
        error: "Token nicht gefunden oder bereits verwendet",
      });
    }

    const resetToken = rows[0];
    const currentTime = Date.now();

    // Token-Expiration/Ablauf prüfen
    if (resetToken.expires_at < currentTime) {
      return res.json({
        valid: false,
        error: "Token ist abgelaufen",
      });
    }

    debugLog(
      `Valid reset token for user: ${resetToken.user_id} (${resetToken.email})`
    );

    res.json({
      valid: true,
      userId: resetToken.user_id,
      email: resetToken.email,
      expiresAt: resetToken.expires_at,
    });
  } catch (err) {
    errorLog(`Token validation error for token ${token}:`, err);
    res.status(500).json({
      valid: false,
      error: "Server-Fehler bei Token-Validierung",
    });
  }
});

export default router;
