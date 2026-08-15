/**
 * @fileoverview Authentication helper functions
 * @description Provides utility functions for password hashing, input validation, and email format checking.
 * @module routing/helpers/authHelpers
 */

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
    return createValidationError("Email and password are required");
  }
  return createValidationSuccess();
};

/**
 * Validates the input for user login
 * @param {string} email - The user's email address
 * @param {string} password - The user's password
 * @returns {Object} - An object containing the validation result
 */
export const validateLoginInput = (email, password) => {
  if (!email || !password) {
    return createValidationError("Email and password are required");
  }
  return createValidationSuccess();
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
 * Validates password length requirement
 * @param {string} password - Password to validate
 * @returns {boolean} - True if password meets length requirement
 */
const isValidPasswordLength = (password) => password.length >= 6;

/**
 * Creates validation error for missing fields
 * @param {string} message - Error message
 * @returns {Object} - Validation error object
 */
const createValidationError = (message) => ({ valid: false, error: message });

/**
 * Creates validation success object
 * @returns {Object} - Validation success object
 */
const createValidationSuccess = () => ({ valid: true });

/**
 * Validates input for password change
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Object} - Validation result
 */
export const validateChangePasswordInput = (currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    return createValidationError("Current and new password are required");
  }

  if (!isValidPasswordLength(newPassword)) {
    return createValidationError("New password must be at least 6 characters long");
  }

  return createValidationSuccess();
};

/**
 * Validates input for password reset
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Object} - Validation result
 */
export const validateResetPasswordInput = (token, newPassword) => {
  if (!token || !newPassword) {
    return createValidationError("Token and new password are required");
  }

  if (!isValidPasswordLength(newPassword)) {
    return createValidationError("New password must be at least 6 characters long");
  }

  return createValidationSuccess();
};
