/**
 * @fileoverview User Router
 * @description Router for handling user-related operations such as
 *              preferences and profile management.
 * @module routing/userRouter
 */

import { Router } from "express";
import { debugLog, errorLog } from "./../config/environment.js";
import { validateUserSession } from "./helpers/dbHelpers.js";
import { findUserById } from "./helpers/userAccountHelpers.js";
import { getUserPreferences, saveUserPreferences } from "./helpers/userPreferencesHelpers.js";
import {
  sendSuccess,
  sendError,
  sendValidationError,
  sendAuthError,
  sendServerError,
} from "./helpers/responseHelpers.js";

const router = Router();

/**
 * Middleware: Validate user session for all user routes
 * Ensures only authenticated users can access these endpoints
 */
router.use(async (req, res, next) => {
  const userId = req.cookies.userId;

  const userIdValidation = validateUserIdFromCookies(userId, res);
  if (userIdValidation !== true) return userIdValidation;

  const sessionResult = await validateUserSession(userId);
  const sessionValidation = validateUserSessionResult(sessionResult, res);
  if (sessionValidation !== true) return sessionValidation;

  addUserInfoToRequest(req, userId, sessionResult);
  next();
});

/**
 * Validates user ID from cookies
 * @param {string} userId - User ID from cookies
 * @param {Object} res - Express response object
 * @returns {boolean|Object} Returns true if valid, or error response if invalid
 */
const validateUserIdFromCookies = (userId, res) => {
  if (!userId) {
    return sendAuthError(res, "Authentifizierung erforderlich");
  }
  return true;
};

/**
 * Validates user session and returns result
 * @param {Object} sessionResult - Session validation result
 * @param {Object} res - Express response object
 * @returns {boolean|Object} Returns true if valid, or error response if invalid
 */
const validateUserSessionResult = (sessionResult, res) => {
  if (!sessionResult.valid) {
    return sendAuthError(res, sessionResult.reason || "Session ungültig");
  }
  return true;
};

/**
 * Adds user information to request object
 * @param {Object} req - Express request object
 * @param {string} userId - User ID
 * @param {Object} sessionResult - Session validation result
 */
const addUserInfoToRequest = (req, userId, sessionResult) => {
  req.userId = userId;
  req.userEmail = sessionResult.email;
};

/**
 * GET /api/user/preferences - Load user preferences
 * Returns user preferences from the database or default values
 */
router.get("/preferences", async (req, res) => {
  try {
    debugLog(`Loading preferences for user ${req.userId}`);
    const preferences = await getUserPreferences(req.userId);
    return handlePreferencesLoadSuccess(preferences, res);
  } catch (err) {
    return handlePreferencesLoadError(err, res);
  }
});

/**
 * Creates default user preferences object
 * @returns {Object} Default preferences object
 */
const createDefaultPreferences = () => ({
  theme: "light",
  language: "de",
  showNotifications: true,
  autoSave: true,
});

/**
 * Handles successful preferences loading
 * @param {Object} preferences - User preferences from database
 * @param {Object} res - Express response object
 * @returns {Object} Success response
 */
const handlePreferencesLoadSuccess = (preferences, res) => {
  return sendSuccess(res, "Benutzereinstellungen geladen", {
    preferences: preferences || createDefaultPreferences(),
  });
};

/**
 * Handles preferences loading error
 * @param {Error} err - Error object
 * @param {Object} res - Express response object
 * @returns {Object} Error response
 */
const handlePreferencesLoadError = (err, res) => {
  errorLog("Error loading user preferences:", err);
  return sendServerError(res, "Fehler beim Laden der Benutzereinstellungen");
};

/**
 * PUT /api/user/preferences - Save/update user preferences
 * Saves user preferences to the database
 * @param {Object} req.body - Preferences object
 * @param {string} req.body.theme - Theme preference (light/dark)
 * @param {string} req.body.language - Language preference
 * @param {boolean} req.body.showNotifications - Notification preference
 * @param {boolean} req.body.autoSave - Auto-save preference
 */
router.put("/preferences", async (req, res) => {
  try {
    const preferences = req.body;

    const validation = validatePreferencesObject(preferences, res);
    if (validation !== true) return validation;

    debugLog(`Saving preferences for user ${req.userId}:`, preferences);

    const success = await saveUserPreferences(req.userId, preferences);
    return success
      ? handlePreferencesSaveSuccess(preferences, res)
      : sendServerError(res, "Fehler beim Speichern der Benutzereinstellungen");
  } catch (err) {
    return handlePreferencesSaveError(err, res);
  }
});

/**
 * Validates preferences object from request body
 * @param {Object} preferences - Preferences object to validate
 * @param {Object} res - Express response object
 * @returns {boolean|Object} Returns true if valid, or error response if invalid
 */
const validatePreferencesObject = (preferences, res) => {
  if (!preferences || typeof preferences !== "object") {
    return sendValidationError(res, "Gültige Benutzereinstellungen erforderlich");
  }
  return true;
};

/**
 * Handles successful preferences save
 * @param {Object} preferences - Saved preferences object
 * @param {Object} res - Express response object
 * @returns {Object} Success response
 */
const handlePreferencesSaveSuccess = (preferences, res) => {
  return sendSuccess(res, "Benutzereinstellungen gespeichert", {
    preferences: preferences,
  });
};

/**
 * Handles preferences save error
 * @param {Error} err - Error object
 * @param {Object} res - Express response object
 * @returns {Object} Error response
 */
const handlePreferencesSaveError = (err, res) => {
  errorLog("Error saving user preferences:", err);
  return sendServerError(res, "Fehler beim Speichern der Benutzereinstellungen");
};

/**
 * GET /api/user/profile - Get user profile information
 * Returns basic user profile data (email, creation date, etc.)
 */
router.get("/profile", async (req, res) => {
  try {
    debugLog(`Loading profile for user ${req.userId}`);

    const user = await findUserById(req.userId);
    if (!user) return sendAuthError(res, "Benutzer nicht gefunden");

    return handleProfileLoadSuccess(user, res);
  } catch (err) {
    return handleProfileLoadError(err, res);
  }
});

/**
 * Creates safe profile data object (without sensitive information)
 * @param {Object} user - User object from database
 * @returns {Object} Safe profile data object
 */
const createSafeProfileData = (user) => ({
  id: user.id,
  email: user.email,
  created: user.created,
  lastLogin: user.last_login,
});

/**
 * Handles successful profile loading
 * @param {Object} user - User object from database
 * @param {Object} res - Express response object
 * @returns {Object} Success response
 */
const handleProfileLoadSuccess = (user, res) => {
  const profileData = createSafeProfileData(user);
  return sendSuccess(res, "Benutzerprofil geladen", {
    profile: profileData,
  });
};

/**
 * Handles profile loading error
 * @param {Error} err - Error object
 * @param {Object} res - Express response object
 * @returns {Object} Error response
 */
const handleProfileLoadError = (err, res) => {
  errorLog("Error loading user profile:", err);
  return sendServerError(res, "Fehler beim Laden des Benutzerprofils");
};

export default router;
