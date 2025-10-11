// lets-todo-api/routing/helpers/dbHelpers.js

import { userPool, corePool, userPools } from "../../db.js";
import mysql from "mysql2/promise";
import crypto from "crypto";

/**
 * Finds user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object or null
 */
export const findUserByEmail = async (email) => {
  const [rows] = await userPool.query(`SELECT * FROM users WHERE email = ?`, [
    email,
  ]);
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Creates database name from email
 * @param {string} email - User email
 * @returns {string} Database name
 */
export const createUserDbName = (email) => {
  return `todos_user_${Buffer.from(email).toString("hex").slice(0, 24)}`;
};

/**
 * Finds user by email (limited fields for security)
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object with limited fields or null
 */
export const findUserForPasswordReset = async (email) => {
  const [rows] = await userPool.query(
    `SELECT id, email FROM users WHERE email = ?`,
    [email]
  );
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Clears old reset tokens for user
 * @param {number} userId - User ID
 */
export const clearOldResetTokens = async (userId) => {
  await userPool.query(`DELETE FROM password_reset_tokens WHERE user_id = ?`, [
    userId,
  ]);
};

/**
 * Saves reset token to database
 * @param {number} userId - User ID
 * @param {string} email - User email
 * @param {string} token - Reset token
 * @param {Date} expirationTime - Token expiration time
 */
export const saveResetToken = async (userId, email, token, expirationTime) => {
  const currentTime = new Date();
  await userPool.query(
    `INSERT INTO password_reset_tokens (user_id, email, token, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, email, token, expirationTime, currentTime]
  );
};

/**
 * Validates reset token from database
 * @param {string} token - Reset token
 * @returns {Promise<Object|null>} Reset token data or null if invalid/expired
 */
export const validateResetToken = async (token) => {
  const [rows] = await userPool.query(
    `SELECT rt.id, rt.user_id, rt.expires_at, rt.is_used, u.email
     FROM password_reset_tokens rt
     JOIN users u ON rt.user_id = u.id
     WHERE rt.token = ? AND rt.is_used = 0`,
    [token]
  );

  if (!rows.length) return null;

  const resetToken = rows[0];
  if (resetToken.expires_at < new Date()) return null;

  return resetToken;
};

/**
 * Inserts new user into database
 * @param {string} email - User email
 * @param {string} passwordHash - Hashed password
 * @param {string} dbName - Database name
 * @param {number} created - Creation timestamp
 * @returns {Promise<number>} User ID
 */
export const insertUser = async (email, passwordHash, dbName, created) => {
  const [result] = await userPool.query(
    `INSERT INTO users (email, password_hash, db_name, created)
     VALUES (?, ?, ?, ?)`,
    [email, passwordHash, dbName, created]
  );
  return result.insertId;
};

/**
 * Finds user by ID for session validation
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} User object with limited fields or null
 */
export const findUserById = async (userId) => {
  const [rows] = await userPool.query(
    `SELECT id, email FROM users WHERE id = ?`,
    [userId]
  );
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Finds user by ID with password hash for authentication
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} User object with password hash or null
 */
export const findUserByIdWithPassword = async (userId) => {
  const [rows] = await userPool.query(
    `SELECT id, email, password_hash FROM users WHERE id = ?`,
    [userId]
  );
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Updates user password in database
 * @param {number} userId - User ID
 * @param {string} passwordHash - New hashed password
 */
export const updateUserPassword = async (userId, passwordHash) => {
  await userPool.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [
    passwordHash,
    userId,
  ]);
};

/**
 * Creates user database
 * @param {string} dbName - Database name
 */
export const createUserDatabase = async (dbName) => {
  await corePool.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\`
     CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`
  );
};

/**
 * Creates connection pool for user database
 * @param {string} dbName - Database name
 * @returns {Object} MySQL connection pool
 */
export const createUserPool = (dbName) => {
  return mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: dbName,
    waitForConnections: true,
    connectionLimit: 5,
  });
};

/**
 * Creates todos table in user database
 * @param {Object} pool - MySQL connection pool
 */
export const createTodosTable = async (pool) => {
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
};

/**
 * Creates index for todos table
 * @param {Object} pool - MySQL connection pool
 */
export const createTodosIndex = async (pool) => {
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_todos_trashed ON todos (trashed, trashed_at)
  `);
};

/**
 * Executes password reset transaction
 * @param {Object} resetToken - Reset token data
 * @param {string} newPasswordHash - New hashed password
 * @param {Date} currentTime - Current timestamp
 */
export const executePasswordResetTransaction = async (
  resetToken,
  newPasswordHash,
  currentTime
) => {
  const connection = await userPool.getConnection();

  try {
    await connection.beginTransaction();

    // Passwort aktualisieren
    await connection.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [
      newPasswordHash,
      resetToken.user_id,
    ]);

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
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Generates secure reset token
 * @returns {string} Reset token
 */
export const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Calculates expiration time for reset tokens (1 hour from now)
 * @returns {Date} - Expiration date
 */
export const calculateExpirationTime = () => {
  return new Date(Date.now() + 60 * 60 * 1000);
};

/**
 * Validates user session and returns session data
 * @param {string} userId - User ID from cookie
 * @returns {Promise<Object>} - Session validation result
 */
export const validateUserSession = async (userId) => {
  if (!userId) {
    return { valid: false, reason: "No session cookie found" };
  }

  try {
    const user = await findUserById(userId);

    if (!user) {
      return { valid: false, reason: "User not found" };
    }

    return {
      valid: true,
      userId: userId,
      email: user.email,
    };
  } catch (err) {
    return { valid: false, reason: "Database error", error: err };
  }
};
