/**
 * @fileoverview Database Pool Assignment Middleware
 * @description Assigns the correct DB pool to each request (User or Guest)
 * @module middleware/poolMiddleware
 */

import mysql from "mysql2/promise";
import { userPool, userPools } from "./../db.js";
import { ENV } from "./../config/environment.js";

/**
 * Middleware: Pool selection based on user session
 * Only for registered users - Guests use LocalStorage
 * Sets req.pool for subsequent route handlers
 * @param {Request} req - Express Request Object
 * @param {Response} res - Express Response Object
 * @param {Function} next - Next Middleware Function
 */
export async function assignPoolMiddleware(req, res, next) {
  try {
    if (!validateUserAuthentication(req, res)) return;

    const dbName = await getUserDbName(req.cookies.userId);
    if (!dbName) {
      return handleInvalidUserDatabase(res);
    }

    req.pool = getOrCreateUserPool(req.cookies.userId, dbName);
    next();
  } catch (err) {
    console.error("Pool assignment middleware error:", err);
    createServerErrorResponse(res);
  }
}

/**
 * Validates user authentication
 * @param {Request} req - Express Request Object
 * @param {Response} res - Express Response Object
 * @returns {boolean} True if user is authenticated
 */
const validateUserAuthentication = (req, res) => {
  if (!req.cookies.userId) {
    createAuthRequiredResponse(res);
    return false;
  }
  return true;
};

/**
 * Creates authentication error response
 * @param {Response} res - Express Response Object
 */
const createAuthRequiredResponse = (res) => {
  return res.status(401).json({
    error: "Authentication required. Guests use LocalStorage.",
  });
};

/**
 * Handles invalid user database scenario
 * @param {Response} res - Express Response Object
 * @returns {Response} Error response
 */
const handleInvalidUserDatabase = (res) => {
  clearInvalidUserCookie(res);
  return createInvalidSessionResponse(res);
};

/**
 * Creates server error response
 * @param {Response} res - Express Response Object
 */
const createServerErrorResponse = (res) => {
  return res.status(500).json({ error: "Server error during session check" });
};

/**
 * Checks if user pool exists in cache
 * @param {string} poolKey - Pool cache key
 * @returns {boolean} True if pool exists
 */
const hasExistingUserPool = (poolKey) => Boolean(userPools[poolKey]);

/**
 * Creates invalid session error response
 * @param {Response} res - Express Response Object
 */
const createInvalidSessionResponse = (res) => {
  return res.status(401).json({ error: "Invalid user session" });
};

/**
 * Handles existing pool assignment
 * @param {Request} req - Express Request Object
 * @param {string} poolKey - Pool cache key
 * @param {Function} next - Next middleware function
 */
const assignExistingPool = (req, poolKey, next) => {
  req.pool = userPools[poolKey];
  next();
};

/**
 * Reconstructs user pool from database
 * @param {Request} req - Express Request Object
 * @param {Response} res - Express Response Object
 * @param {string} userId - User ID
 * @param {Function} next - Next middleware function
 */
const reconstructUserPool = async (req, res, userId, next) => {
  const dbName = await getUserDbName(userId);
  if (dbName) {
    req.pool = getOrCreateUserPool(userId, dbName);
  } else {
    clearInvalidUserCookie(res);
  }
  next();
};

/**
 * Enhanced pool assignment with fallback reconstruction
 * Reconstructs missing user pools from database
 * Only for user sessions - Guests use LocalStorage
 */
export async function enhancedPoolMiddleware(req, res, next) {
  try {
    if (!req.cookies.userId) {
      return next(); // No user → continue request without pool
    }

    const userId = req.cookies.userId;
    const poolKey = `user_${userId}`;

    if (hasExistingUserPool(poolKey)) {
      return assignExistingPool(req, poolKey, next);
    }

    await reconstructUserPool(req, res, userId, next);
  } catch (err) {
    console.error("Enhanced pool assignment error:", err);
    next();
  }
}

/**
 * Creates or uses cached user pool
 * @param {string} userId - User ID
 * @param {string} dbName - Database name
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
 * Gets user database name from database
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} Database name or null
 */
async function getUserDbName(userId) {
  const [rows] = await userPool.query(`SELECT db_name FROM users WHERE id = ?`, [userId]);
  return rows.length ? rows[0].db_name : null;
}

/**
 * Clears invalid user cookie
 * @param {Object} res - Express Response Object
 */
function clearInvalidUserCookie(res) {
  res.clearCookie("userId", { domain: ".dev2ksoftware.com", path: "/" });
}
