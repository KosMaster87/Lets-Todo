// lets-todo-api/routing/helpers/authHelpers.js

import bcrypt from "bcrypt";

/**
 * Hashes a password for secure storage
 * @param {string} password - The plain text password
 * @returns {Promise<string>} - The hashed password
 */
export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Validates the input for user registration
 * @param {string} email - The user's email address
 * @param {string} password - The user's password
 * @returns {Object} - An object containing the validation result
 */
export const validateRegisterInput = (email, password) => {
  if (!email || !password) {
    return {
      valid: false,
      error: "Email und Passwort erforderlich",
    };
  }
  return { valid: true };
};

/**
 * Validates the input for user login
 * @param {string} email - The user's email address
 * @param {string} password - The user's password
 * @returns {Object} - An object containing the validation result
 */
export const validateLoginInput = (email, password) => {
  if (!email || !password) {
    return {
      valid: false,
      error: "E-Mail und Passwort sind erforderlich.",
    };
  }
  return { valid: true };
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Verifies password against hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if password matches
 */
export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Validates input for password change
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Object} - Validation result
 */
export const validateChangePasswordInput = (currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    return {
      valid: false,
      error: "Aktuelles und neues Passwort sind erforderlich",
    };
  }

  if (newPassword.length < 6) {
    return {
      valid: false,
      error: "Neues Passwort muss mindestens 6 Zeichen lang sein",
    };
  }

  return { valid: true };
};

/**
 * Validates input for password reset
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Object} - Validation result
 */
export const validateResetPasswordInput = (token, newPassword) => {
  if (!token || !newPassword) {
    return {
      valid: false,
      error: "Token und neues Passwort sind erforderlich",
    };
  }

  if (newPassword.length < 6) {
    return {
      valid: false,
      error: "Neues Passwort muss mindestens 6 Zeichen lang sein",
    };
  }

  return { valid: true };
};
