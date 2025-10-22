// lets-todo-api/routing/helpers/userAccountHelpers.js

import { userPool, userPools } from "./../../db.js";
import { hashPassword, verifyPassword } from "./authHelpers.js";
import {
  createUserDatabase,
  createUserPool,
  createTodosTable,
  createTodosIndex,
} from "./dbHelpers.js";
import { createUserPreferencesTable } from "./userPreferencesHelpers.js";

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
 * Creates database name from email
 * @param {string} email - User email
 * @returns {string} Database name
 */
export const createUserDbName = (email) => {
  return `todos_user_${Buffer.from(email).toString("hex").slice(0, 24)}`;
};

/**
 * Gets user database name by user ID
 * @param {string|number} userId - User ID
 * @returns {Promise<string|null>} Database name or null if user not found
 */
export const getUserDbName = async (userId) => {
  try {
    const [rows] = await userPool.query(
      `SELECT db_name FROM users WHERE id = ?`,
      [userId]
    );
    return rows.length > 0 ? rows[0].db_name : null;
  } catch (err) {
    console.error("Error getting user database name:", err);
    return null;
  }
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
 * Creates complete user setup with database and tables
 * @param {string} email - User email
 * @param {string} password_hash - Hashed password
 * @param {string} dbName - Database name
 * @param {number} created - Creation timestamp
 * @returns {Promise<number>} - User ID
 */
export const createCompleteUserSetup = async (
  email,
  password_hash,
  dbName,
  created
) => {
  // 1) User in zentrale User-Tabelle eintragen
  const userId = await insertUser(email, password_hash, dbName, created);

  // 2) Dedicated User-Datenbank erstellen
  await createUserDatabase(dbName);

  // 3) Todos-Tabelle in User-DB initialisieren und Pool erstellen
  const pool = createUserPool(dbName);
  await createTodosTable(pool);
  await createTodosIndex(pool);

  // 4) User Preferences Tabelle erstellen
  await createUserPreferencesTable(pool);

  // 5) Pool für zukünftige Requests speichern
  userPools[`user_${userId}`] = pool;

  return userId;
};

/**
 * Processes user login with authentication
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @returns {Promise<Object>} - Login result
 */
export const processUserLogin = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) {
    return createInvalidCredentialsResponse();
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return createInvalidCredentialsResponse();
  }

  return createLoginSuccessResponse(user);
};

/**
 * Creates error response for invalid login credentials
 * @returns {Object} Error response object
 */
const createInvalidCredentialsResponse = () => ({
  success: false,
  error: "E-Mail oder Passwort ist falsch.",
  code: "INVALID_CREDENTIALS",
});

/**
 * Creates success response for valid login
 * @param {Object} user - User object
 * @returns {Object} Success response object
 */
const createLoginSuccessResponse = (user) => ({
  success: true,
  user: user,
});

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
 * Processes password change with current password verification
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} - Process result
 */
export const processPasswordChange = async (
  userId,
  currentPassword,
  newPassword
) => {
  const user = await findUserByIdWithPassword(userId);
  if (!user) return createUserNotFoundResponse();

  const isCurrentPasswordValid = await validateCurrentPassword(
    currentPassword,
    user
  );
  if (!isCurrentPasswordValid) return createInvalidCurrentPasswordResponse();

  const newPasswordHash = await hashPassword(newPassword);
  await updateUserPassword(userId, newPasswordHash);

  return createPasswordChangeSuccessResponse(user);
};

/**
 * Creates error response for user not found
 * @returns {Object} Error response object
 */
const createUserNotFoundResponse = () => ({
  success: false,
  error: "User nicht gefunden",
  code: "USER_NOT_FOUND",
});

/**
 * Creates error response for invalid current password
 * @returns {Object} Error response object
 */
const createInvalidCurrentPasswordResponse = () => ({
  success: false,
  error: "Aktuelles Passwort ist falsch",
  code: "INVALID_CURRENT_PASSWORD",
});

/**
 * Creates success response for password change
 * @param {Object} user - User object
 * @returns {Object} Success response object
 */
const createPasswordChangeSuccessResponse = (user) => ({
  success: true,
  user: user,
});

/**
 * Validates current password against user's stored password
 * @param {string} currentPassword - Current password to validate
 * @param {Object} user - User object with password hash
 * @returns {Promise<boolean>} Password validation result
 */
const validateCurrentPassword = async (currentPassword, user) => {
  return await verifyPassword(currentPassword, user.password_hash);
};
