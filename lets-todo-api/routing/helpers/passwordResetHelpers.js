/**
 * @fileoverview Password reset helper functions for routing
 * @description Helper functions to manage password reset operations securely
 * @module routing/helpers/passwordResetHelpers
 */

import crypto from "crypto";
import { userPool } from "./../../db.js";
import { hashPassword } from "./authHelpers.js";

/**
 * Finds user by email (limited fields for security)
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object with limited fields or null
 */
export const findUserForPasswordReset = async (email) => {
  const [rows] = await userPool.query(`SELECT id, email FROM users WHERE email = ?`, [email]);
  return rows.length > 0 ? rows[0] : null;
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
 * Clears old reset tokens for user
 * @param {number} userId - User ID
 */
export const clearOldResetTokens = async (userId) => {
  await userPool.query(`DELETE FROM password_reset_tokens WHERE user_id = ?`, [userId]);
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
 * Executes all password reset operations within transaction
 * @param {import('mysql2/promise').PoolConnection} connection - Database connection
 * @param {Object} resetToken - Reset token data
 * @param {string} newPasswordHash - New hashed password
 * @param {Date} currentTime - Current timestamp
 */
const executePasswordResetOperations = async (
  connection,
  resetToken,
  newPasswordHash,
  currentTime
) => {
  await updateUserPasswordInTransaction(connection, newPasswordHash, resetToken.user_id);
  await markTokenAsUsed(connection, currentTime, resetToken.id);
  await invalidateOtherTokens(connection, currentTime, resetToken.user_id, resetToken.id);
};

/**
 * Handles transaction rollback and cleanup
 * @param {import('mysql2/promise').PoolConnection} connection - Database connection
 * @param {Error} error - Error that occurred
 */
const handleTransactionError = async (connection, error) => {
  await connection.rollback();
  throw error;
};

/**
 * Executes password reset transaction
 * @param {Object} resetToken - Reset token data
 * @param {string} newPasswordHash - New hashed password
 * @param {Date} currentTime - Current timestamp
 */
export const executePasswordResetTransaction = async (resetToken, newPasswordHash, currentTime) => {
  const connection = await userPool.getConnection();

  try {
    await connection.beginTransaction();
    await executePasswordResetOperations(connection, resetToken, newPasswordHash, currentTime);
    await connection.commit();
  } catch (error) {
    await handleTransactionError(connection, error);
  } finally {
    connection.release();
  }
};

/**
 * Updates user password in the database
 * @param {import('mysql2/promise').PoolConnection} connection - Database connection
 * @param {string} newPasswordHash - New hashed password
 * @param {number} userId - User ID
 * @returns {Promise<void>}
 */
const updateUserPasswordInTransaction = async (connection, newPasswordHash, userId) => {
  await connection.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [
    newPasswordHash,
    userId,
  ]);
};

/**
 * Marks the reset token as used
 * @param {import('mysql2/promise').PoolConnection} connection - Database connection
 * @param {Date} currentTime - Current timestamp
 * @param {number} tokenId - Token ID
 * @returns {Promise<void>}
 */
const markTokenAsUsed = async (connection, currentTime, tokenId) => {
  await connection.query(`UPDATE password_reset_tokens SET is_used = 1, used_at = ? WHERE id = ?`, [
    currentTime,
    tokenId,
  ]);
};

/**
 * Invalidates all other reset tokens for the user
 * @param {import('mysql2/promise').PoolConnection} connection - Database connection
 * @param {Date} currentTime - Current timestamp
 * @param {number} userId - User ID
 * @param {number} currentTokenId - Current token ID to exclude
 * @returns {Promise<void>}
 */
const invalidateOtherTokens = async (connection, currentTime, userId, currentTokenId) => {
  await connection.query(
    `UPDATE password_reset_tokens SET is_used = 1, used_at = ?
     WHERE user_id = ? AND id != ? AND is_used = 0`,
    [currentTime, userId, currentTokenId]
  );
};

/**
 * Validates reset token and returns formatted response
 * @param {string} token - Reset token to validate
 * @returns {Promise<Object>} - Validation response
 */
export const validateResetTokenResponse = async (token) => {
  if (!token) {
    return createMissingTokenResponse();
  }

  try {
    const resetToken = await validateResetToken(token);

    if (!resetToken) {
      return createInvalidTokenResponse();
    }

    return createValidTokenResponse(resetToken);
  } catch (err) {
    return createServerErrorResponse(err);
  }
};

/**
 * Creates error response for missing token
 * @returns {Object} Error response object
 */
const createMissingTokenResponse = () => ({
  status: 400,
  response: {
    valid: false,
    error: "Token is required",
  },
});

/**
 * Creates error response for invalid token
 * @returns {Object} Error response object
 */
const createInvalidTokenResponse = () => ({
  status: 200,
  response: {
    valid: false,
    error: "Token not found or already used",
  },
});

/**
 * Creates success response for valid token
 * @param {Object} resetToken - Valid reset token data
 * @returns {Object} Success response object
 */
const createValidTokenResponse = (resetToken) => ({
  status: 200,
  response: {
    valid: true,
    userId: resetToken.user_id,
    email: resetToken.email,
    expiresAt: resetToken.expires_at,
  },
  logData: resetToken,
});

/**
 * Creates error response for server errors
 * @param {Error} err - Error object
 * @returns {Object} Error response object
 */
const createServerErrorResponse = (err) => ({
  status: 500,
  response: {
    valid: false,
    error: "Server error during token validation",
  },
  error: err,
});

/**
 * Processes password reset with token validation
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} - Reset result
 */
export const processPasswordReset = async (token, newPassword) => {
  const resetToken = await validateResetToken(token);

  if (!resetToken) {
    return createPasswordResetFailureResponse();
  }

  const newPasswordHash = await hashPassword(newPassword);
  const currentTime = new Date();

  await executePasswordResetTransaction(resetToken, newPasswordHash, currentTime);

  return createPasswordResetSuccessResponse(resetToken);
};

/**
 * Creates error response for invalid reset token
 * @returns {Object} Error response object
 */
const createPasswordResetFailureResponse = () => ({
  success: false,
  error: "Token not found or already used",
});

/**
 * Creates success response for password reset
 * @param {Object} resetToken - Reset token data
 * @returns {Object} Success response object
 */
const createPasswordResetSuccessResponse = (resetToken) => ({
  success: true,
  resetToken: resetToken,
});

/**
 * Processes forgot password request with token generation
 * @param {string} email - User email
 * @returns {Promise<Object>} - Process result
 */
export const processForgotPassword = async (email) => {
  const user = await findUserForPasswordReset(email);

  // For security reasons, always respond successfully (prevents user enumeration)
  if (!user) {
    return createUserNotFoundSecurityResponse();
  }

  const { resetToken, expirationTime } = await generateAndSaveResetToken(user, email);

  return createForgotPasswordSuccessResponse(user, resetToken, expirationTime);
};

/**
 * Creates response for non-existent user (security: prevents user enumeration)
 * @returns {Object} Security response object
 */
const createUserNotFoundSecurityResponse = () => ({
  success: true,
  userExists: false,
  message: "If an account with this email exists, a reset link has been sent.",
});

/**
 * Generates and saves new reset token for user
 * @param {Object} user - User object
 * @param {string} email - User email
 * @returns {Promise<Object>} Token generation result
 */
const generateAndSaveResetToken = async (user, email) => {
  const resetToken = generateResetToken();
  const expirationTime = calculateExpirationTime();

  await clearOldResetTokens(user.id);
  await saveResetToken(user.id, email, resetToken, expirationTime);

  return { resetToken, expirationTime };
};

/**
 * Creates success response for forgot password request
 * @param {Object} user - User object
 * @param {string} resetToken - Generated reset token
 * @param {Date} expirationTime - Token expiration time
 * @returns {Object} Success response object
 */
const createForgotPasswordSuccessResponse = (user, resetToken, expirationTime) => ({
  success: true,
  userExists: true,
  user: user,
  resetToken: resetToken,
  expirationTime: expirationTime,
});
