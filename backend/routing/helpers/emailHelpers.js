/**
 * @fileoverview Email helper functions for routing
 * @description Helper functions to send emails with proper logging and error handling
 * @module routing/helpers/emailHelpers
 */

import { emailService } from "./../../services/emailService.js";
import { debugLog, errorLog } from "./../../config/environment.js";

/**
 * Sends password reset email with error handling
 * @param {string} email - User email
 * @param {string} resetToken - Reset token
 * @param {Object} user - User object with firstName and lastName
 * @returns {Promise<Object>} - Send result
 */
export const sendPasswordResetEmail = async (email, resetToken, user) => {
  try {
    const fullName = constructFullName(user);
    const emailResult = await emailService.sendPasswordResetEmail(email, resetToken, fullName);

    logEmailSuccess(emailResult);
    return createEmailSuccessResponse(emailResult);
  } catch (emailError) {
    logEmailError(emailError);
    return createEmailErrorResponse(emailError);
  }
};

/**
 * Constructs full name from user object
 * @param {Object} user - User object with firstName and lastName
 * @returns {string|null} - Full name or null
 */
const constructFullName = (user) => {
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return fullName || null;
};

/**
 * Logs successful email sending
 * @param {Object} emailResult - Email result object
 */
const logEmailSuccess = (emailResult) => {
  debugLog(`📧 Password reset email sent: ${emailResult.messageId} (${emailResult.mode})`);
};

/**
 * Logs email sending error
 * @param {Error} emailError - Email error object
 */
const logEmailError = (emailError) => {
  errorLog("❌ Error sending email:", emailError.message);
  // Still handle as successful (Security: no info about email problems)
};

/**
 * Creates email success response
 * @param {Object} emailResult - Email result object
 * @returns {Object} - Success response
 */
const createEmailSuccessResponse = (emailResult) => ({
  success: true,
  result: emailResult,
});

/**
 * Creates email error response
 * @param {Error} emailError - Email error object
 * @returns {Object} - Error response
 */
const createEmailErrorResponse = (emailError) => ({
  success: false,
  error: emailError,
});
