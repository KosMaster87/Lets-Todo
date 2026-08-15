/**
 * @fileoverview Migration Script: Add user_preferences table to all user databases
 * @description Creates a new table to store user preferences as JSON data
 * in each individual user database (not the central users database).
 *
 * @module scripts/add-user-preferences-table
 */

import mysql from "mysql2/promise";
import { ENV, debugLog, errorLog } from "../config/environment.js";

/**
 * Migration Script: Add user_preferences table to all user databases
 *
 * This script creates a new table to store user preferences as JSON data
 * in each individual user database (not the central users database).
 * It follows the Let's Todo architecture where each user has their own database.
 *
 * Table Structure (in each user database):
 * - id: INT AUTO_INCREMENT PRIMARY KEY
 * - preferences: JSON (stores theme, language, notifications, etc.)
 * - created_at: BIGINT (timestamp when preferences first created)
 * - updated_at: BIGINT (timestamp when preferences last updated)
 *
 * Usage: node scripts/add-user-preferences-table.js
 */

const addUserPreferencesTable = async () => {
  console.log("Starting user_preferences table migration for all user databases...");

  try {
    // Connect to database server (without selecting specific database)
    const dbConfig = {
      host: ENV.DB_HOST,
      port: ENV.DB_PORT,
      user: ENV.DB_USER,
      password: ENV.DB_PASSWORD,
    };

    console.log(`Connecting to database server: ${dbConfig.host}:${dbConfig.port}`);
    const connection = await mysql.createConnection(dbConfig);

    // Find all user databases
    console.log("Looking for user databases...");
    const [databases] = await connection.query(`
      SELECT SCHEMA_NAME as db_name
      FROM INFORMATION_SCHEMA.SCHEMATA
      WHERE SCHEMA_NAME LIKE 'todos_user_%'
      ORDER BY SCHEMA_NAME
    `);

    if (databases.length === 0) {
      console.log("No user databases found matching 'todos_user_%' pattern");
      await connection.end();
      return;
    }

    console.log(`Found ${databases.length} user databases to migrate`);

    // SQL to create user_preferences table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        preferences JSON NOT NULL DEFAULT ('{}'),
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL,
        INDEX idx_updated_at (updated_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    let successCount = 0;
    let skipCount = 0;

    // Process each user database
    for (const db of databases) {
      const dbName = db.db_name;
      console.log(`\nProcessing database: ${dbName}`);

      try {
        // Switch to this user database
        await connection.query(`USE \`${dbName}\``);

        // Check if user_preferences table already exists
        const [tables] = await connection.query(
          `
          SELECT TABLE_NAME
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'user_preferences'
        `,
          [dbName]
        );

        if (tables.length > 0) {
          console.log(`⏭ Table 'user_preferences' already exists in ${dbName}, skipping`);
          skipCount++;
          continue;
        }

        // Create user_preferences table
        await connection.query(createTableSQL);
        console.log(`Created 'user_preferences' table in ${dbName}`);

        // Add default preferences entry
        const defaultPreferences = {
          theme: "light",
          language: "de",
          showNotifications: true,
          autoSave: true,
        };

        const timestamp = Date.now();

        await connection.query(
          `
          INSERT INTO user_preferences (preferences, created_at, updated_at)
          VALUES (?, ?, ?)
        `,
          [JSON.stringify(defaultPreferences), timestamp, timestamp]
        );

        debugLog(`Added default preferences to ${dbName}`);
        successCount++;
      } catch (error) {
        errorLog(`Error processing ${dbName}:`, error);
      }
    }

    await connection.end();

    console.log("\nMigration Summary:");
    console.log(`Successfully migrated: ${successCount} databases`);
    console.log(`⏭ Skipped (already exists): ${skipCount} databases`);
    console.log("Migration completed!");
  } catch (error) {
    errorLog("Migration failed:", error);
    throw error;
  }
};

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addUserPreferencesTable()
    .then(() => {
      console.log("Migration script finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration script failed:", error);
      process.exit(1);
    });
}

export { addUserPreferencesTable };
