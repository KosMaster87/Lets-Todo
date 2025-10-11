// lets-todo-api/routing/helpers/emailHelpers.js

import { emailService } from "../../services/emailService.js";
import { debugLog, errorLog } from "../../config/environment.js";

/**
 * Sends password reset email with error handling
 * @param {string} email - User email
 * @param {string} resetToken - Reset token
 * @param {Object} user - User object with firstName and lastName
 * @returns {Promise<Object>} - Send result
 */
export const sendPasswordResetEmail = async (email, resetToken, user) => {
  try {
    const fullName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || null;

    const emailResult = await emailService.sendPasswordResetEmail(
      email,
      resetToken,
      fullName
    );

    debugLog(
      `📧 Password-Reset-E-Mail versendet: ${emailResult.messageId} (${emailResult.mode})`
    );

    return { success: true, result: emailResult };
  } catch (emailError) {
    errorLog("❌ Fehler beim E-Mail-Versand:", emailError.message);
    // Trotzdem erfolgreich behandeln (Security: keine Info über E-Mail-Probleme)
    return { success: false, error: emailError };
  }
};
