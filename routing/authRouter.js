// lets-todo-api/routing/authRouter.js

import { Router } from "express";
import bcrypt from "bcrypt";
import { userPool, corePool, userPools } from "../db.js";
import { ENV, debugLog, errorLog } from "../config/environment.js";
import mysql from "mysql2/promise";

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
    res.status(201).json({ message: "Simon says... User registered" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res
        .status(409)
        .json({ error: "Simon says... Email already registered" });
    res.status(500).json({ error: err.message });
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
    return res
      .status(400)
      .json({ error: "Simon says... Email and password required" });

  try {
    const [rows] = await userPool.query(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);
    if (!rows.length)
      return res
        .status(401)
        .json({ error: "Simon says... Invalid login details" });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res
        .status(401)
        .json({ error: "Simon says... Invalid login details" });

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

    res.json({ message: "Simon says... Login successful", userId: user.id });
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
  res.json({ message: "Simon says... Logout successful" });
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

export default router;
