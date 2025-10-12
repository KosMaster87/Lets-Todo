// lets-todo-api/middleware/poolMiddleware.js

/**
 * Database Pool Assignment Middleware
 * Weist jedem Request den korrekten DB-Pool zu (User oder Gast)
 */

import mysql from "mysql2/promise";
import { userPool, userPools } from "./../db.js";
import { ENV } from "./../config/environment.js";

/**
 * Middleware: Pool-Auswahl basierend auf User-Session
 * Nur für registrierte Benutzer - Gäste verwenden LocalStorage
 * Setzt req.pool für nachfolgende Route-Handler
 * @param {Request} req - Express Request Object
 * @param {Response} res - Express Response Object
 * @param {Function} next - Next Middleware Function
 */
export async function assignPoolMiddleware(req, res, next) {
  try {
    if (!req.cookies.userId) {
      return res.status(401).json({
        error: "Authentifizierung erforderlich. Gäste verwenden LocalStorage.",
      });
    }

    const dbName = await getUserDbName(req.cookies.userId);
    if (!dbName) {
      clearInvalidUserCookie(res);
      return res.status(401).json({ error: "User-Session ungültig" });
    }

    req.pool = getOrCreateUserPool(req.cookies.userId, dbName);
    next();
  } catch (err) {
    console.error("Pool-Assignment-Middleware-Fehler:", err);
    res.status(500).json({ error: "Server-Fehler bei Session-Prüfung" });
  }
}

/**
 * Erweiterte Pool-Zuweisung mit Fallback-Rekonstruktion
 * Rekonstruiert fehlende User-Pools aus der Datenbank
 * Nur für User-Sessions - Gäste verwenden LocalStorage
 */
export async function enhancedPoolMiddleware(req, res, next) {
  try {
    if (!req.cookies.userId) {
      return next(); // Kein User → Request ohne Pool fortsetzen
    }

    const userId = req.cookies.userId;
    const poolKey = `user_${userId}`;

    // Bestehenden Pool verwenden falls vorhanden
    if (userPools[poolKey]) {
      req.pool = userPools[poolKey];
      return next();
    }

    // Pool aus DB rekonstruieren
    const dbName = await getUserDbName(userId);
    if (dbName) {
      req.pool = getOrCreateUserPool(userId, dbName);
    } else {
      clearInvalidUserCookie(res);
    }

    next();
  } catch (err) {
    console.error("Enhanced-Pool-Assignment Fehler:", err);
    next();
  }
}

/**
 * Erstellt oder verwendet gecachten User-Pool
 * @param {string} userId - User-ID
 * @param {string} dbName - Datenbankname
 * @returns {Object} MySQL Connection Pool
 */
function getOrCreateUserPool(userId, dbName) {
  const poolKey = `user_${userId}`;

  if (!userPools[poolKey]) {
    userPools[poolKey] = mysql.createPool({
      host: ENV.DB_HOST,
      port: ENV.DB_PORT,
      user: ENV.DB_USER,
      password: ENV.DB_PASSWORD,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 5,
    });
  }

  return userPools[poolKey];
}

/**
 * Holt User-Datenbank-Namen aus der Datenbank
 * @param {string} userId - User-ID
 * @returns {Promise<string|null>} Datenbankname oder null
 */
async function getUserDbName(userId) {
  const [rows] = await userPool.query(
    `SELECT db_name FROM users WHERE id = ?`,
    [userId]
  );
  return rows.length ? rows[0].db_name : null;
}

/**
 * Löscht ungültiges User-Cookie
 * @param {Object} res - Express Response Object
 */
function clearInvalidUserCookie(res) {
  res.clearCookie("userId", { domain: ".dev2k.org", path: "/" });
}
