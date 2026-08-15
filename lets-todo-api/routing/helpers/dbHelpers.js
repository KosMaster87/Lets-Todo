/**
 * @fileoverview Database helper functions for user databases
 * @description Functions to create user databases, tables, indexes, and validate user sessions
 * @module routing/helpers/dbHelpers
 */

import mysql from "mysql2/promise";
import { corePool } from "./../../db.js";
import { findUserById } from "./userAccountHelpers.js";

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
