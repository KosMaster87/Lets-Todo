// lets-todo-api/routing/helpers/userPreferencesHelpers.js

import { userPools } from "./../../db.js";
import { createUserPool } from "./dbHelpers.js";
import { getUserDbName } from "./userAccountHelpers.js";

/**
 * Retrieve the latest preference object for a given user.
 *
 * Attempts to obtain the user's database pool, fetch the most recent preferences row,
 * parse the stored preferences value, and return the resulting object. If no preferences
 * row exists or parsing fails, returns the default preferences. If the user's pool
 * cannot be determined or an unexpected error occurs, logs the issue and resolves to null.v
 *
 * @async
 * @function getUserPreferences
 * @param {string|number} userId - Identifier of the user whose preferences are requested.
 * @returns {Promise<Object|null>} A promise that resolves to the parsed preferences object,
 *                                 the default preferences object when none are found or parsable,
 *                                 or null if the user's database pool cannot be located or on error.
 */
export const getUserPreferences = async (userId) => {
  try {
    const pool = await getUserPoolForUser(userId);
    if (!pool) {
      console.error("Cannot get preferences: user database not found");
      return null;
    }

    const row = await fetchLatestPreferencesRow(pool);
    if (row && row.preferences) {
      const parsed = parsePreferencesValue(row.preferences);
      if (parsed) return parsed;
    }

    return getDefaultPreferences();
  } catch (err) {
    console.error("Error getting user preferences:", err);
    return null;
  }
};

/**
 * Gets user preferences from the user's individual database
 * Ensure a user pool exists and return it (or null if DB not found)
 *
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User preferences object or null
 */
export const getUserPoolForUser = async (userId) => {
  const dbName = await getUserDbName(userId);
  if (!dbName) return null;
  let pool = userPools[`user_${userId}`];
  if (!pool) {
    pool = createUserPool(dbName);
    userPools[`user_${userId}`] = pool;
  }
  return pool;
};

/**
 * Fetches the most recent preferences row from the `user_preferences` table.
 *
 * @async
 * @param {import('mysql2/promise').Pool} pool - A promise-based MySQL connection pool used to execute the query.
 * @returns {Promise<Object|null>} Resolves with the latest row object (contains a `preferences` field) if present, otherwise `null`.
 * @throws {Error} Propagates any error thrown by the database query.
 */
export const fetchLatestPreferencesRow = async (pool) => {
  const [rows] = await pool.query(
    `SELECT preferences FROM user_preferences ORDER BY id DESC LIMIT 1`
  );
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Parse a preferences value that may be an object or a JSON string into an object.
 *
 * - Returns null for falsy inputs (null/undefined/empty).
 * - If the input is already an object, it is returned as-is.
 * - If the input is a string, it attempts to JSON.parse it and returns the resulting object.
 * - If parsing fails, an error is logged and null is returned.
 *
 * @param {Object|string|null|undefined} preferences - The preferences value to parse.
 * @returns {Object|null} The parsed preferences object, or null if the input is falsy or invalid JSON.
 */
export const parsePreferencesValue = (preferences) => {
  if (!preferences) return null;
  if (typeof preferences === "object") return preferences;
  try {
    return JSON.parse(preferences);
  } catch (e) {
    console.error("Error parsing preferences JSON:", e);
    return null;
  }
};

// #################################################

/**
 * Saves user preferences to the user's individual database
 * @param {string} userId - User ID
 * @param {Object} preferences - Preferences object
 * @returns {Promise<boolean>} Success status
 */
export const saveUserPreferences = async (userId, preferences) => {
  try {
    const pool = await getUserPoolForUser(userId);
    if (!validateUserPool(pool)) return false;

    const timestamp = Date.now();
    await executePreferenceSaveOperation(pool, preferences, timestamp);

    logPreferenceSaveSuccess(userId, preferences);
    return true;
  } catch (err) {
    logPreferenceSaveError(err);
    return false;
  }
};

/**
 * Validates user pool availability for preferences operations
 * @param {Object|null} pool - Database pool
 * @returns {boolean} True if pool is available
 */
const validateUserPool = (pool) => {
  if (!pool) {
    console.error("Cannot save preferences: user database not found");
    return false;
  }
  return true;
};

/**
 * Executes preference save operation (update or insert)
 * @param {import('mysql2/promise').Pool} pool - Database pool
 * @param {Object} preferences - Preferences to save
 * @param {number} timestamp - Current timestamp
 */
const executePreferenceSaveOperation = async (pool, preferences, timestamp) => {
  const existing = await checkExistingPreferences(pool);

  if (existing) {
    await updateExistingPreferences(pool, preferences, timestamp, existing.id);
  } else {
    await insertNewPreferences(pool, preferences, timestamp);
  }
};

/**
 * Logs successful preference save operation
 * @param {string} userId - User ID
 * @param {Object} preferences - Saved preferences
 */
const logPreferenceSaveSuccess = (userId, preferences) => {
  console.log(`✅ User preferences saved for user ${userId}:`, preferences);
};

/**
 * Logs preference save error
 * @param {Error} err - Error object
 */
const logPreferenceSaveError = (err) => {
  console.error("❌ Error saving user preferences:", err.message);
};

// #################################################

/**
 * Checks if preferences exist in the database
 * @param {import('mysql2/promise').Pool} pool - Database pool
 * @returns {Promise<Object|null>} Existing preference row or null
 */
const checkExistingPreferences = async (pool) => {
  const [existing] = await pool.query(
    `SELECT id FROM user_preferences LIMIT 1`
  );
  return existing.length > 0 ? existing[0] : null;
};

/**
 * Updates existing preferences in the database
 * @param {import('mysql2/promise').Pool} pool - Database pool
 * @param {Object} preferences - Preferences to save
 * @param {number} timestamp - Current timestamp
 * @param {number} existingId - ID of existing preference row
 * @returns {Promise<void>}
 */
const updateExistingPreferences = async (
  pool,
  preferences,
  timestamp,
  existingId
) => {
  await pool.query(
    `UPDATE user_preferences
     SET preferences = ?, updated_at = ?
     WHERE id = ?`,
    [JSON.stringify(preferences), timestamp, existingId]
  );
};

/**
 * Inserts new preferences into the database
 * @param {import('mysql2/promise').Pool} pool - Database pool
 * @param {Object} preferences - Preferences to save
 * @param {number} timestamp - Current timestamp
 * @returns {Promise<void>}
 */
const insertNewPreferences = async (pool, preferences, timestamp) => {
  await pool.query(
    `INSERT INTO user_preferences (preferences, created_at, updated_at)
     VALUES (?, ?, ?)`,
    [JSON.stringify(preferences), timestamp, timestamp]
  );
};

/**
 * Creates user_preferences table in user database
 * @param {mysql.Pool} pool - Database pool for the user
 * @returns {Promise<void>}
 */
export const createUserPreferencesTable = async (pool) => {
  try {
    await createPreferencesTableStructure(pool);
    await insertDefaultPreferences(pool);
    console.log("✅ User preferences table created with default values");
  } catch (err) {
    console.error("❌ Error creating user preferences table:", err);
    throw err;
  }
};

/**
 * Creates the user_preferences table structure
 * @param {import('mysql2/promise').Pool} pool - Database pool
 * @returns {Promise<void>}
 */
const createPreferencesTableStructure = async (pool) => {
  const createTableSQL = getUserPreferencesTableSQL();
  await pool.query(createTableSQL);
};

/**
 * Gets the SQL for creating user_preferences table
 * @returns {string} CREATE TABLE SQL statement
 */
const getUserPreferencesTableSQL = () => {
  return `
    CREATE TABLE IF NOT EXISTS user_preferences (
      id INT AUTO_INCREMENT PRIMARY KEY,
      preferences JSON NOT NULL DEFAULT ('{}'),
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL,
      INDEX idx_updated_at (updated_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;
};

/**
 * Inserts default preferences for new user
 * @param {import('mysql2/promise').Pool} pool - Database pool
 * @returns {Promise<void>}
 */
const insertDefaultPreferences = async (pool) => {
  const defaultPreferences = getDefaultPreferences();
  const timestamp = Date.now();

  await pool.query(
    `INSERT INTO user_preferences (preferences, created_at, updated_at)
     VALUES (?, ?, ?)`,
    [JSON.stringify(defaultPreferences), timestamp, timestamp]
  );
};

/**
 * Gets default user preferences
 * @returns {Object} Default preferences object
 */
export const getDefaultPreferences = () => {
  return {
    theme: "light",
    language: "de",
    showNotifications: true,
    autoSave: true,
  };
};
