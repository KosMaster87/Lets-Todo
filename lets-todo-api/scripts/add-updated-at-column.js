#!/usr/bin/env node

/**
 * @fileoverview Migration Script: Add updated_at column to users table
 * @description Adds a proper updated_at timestamp column to the users table for tracking
 * password changes and other user data modifications.
 *
 * @module add-updated-at-column
 * @since 1.0.0
 */

import mysql from "mysql2/promise";
import { ENV, debugLog, infoLog, errorLog } from "../config/environment.js";

/**
 * Adds updated_at column to users table
 * @async
 * @function addUpdatedAtColumn
 * @returns {Promise<void>}
 */
const addUpdatedAtColumn = async () => {
  let connection;

  try {
    infoLog("🔧 Starting migration: Add updated_at column to users table");

    // Connect to database
    connection = await mysql.createConnection({
      host: ENV.DB_HOST,
      port: ENV.DB_PORT,
      user: ENV.DB_USER,
      password: ENV.DB_PASSWORD,
      database: ENV.DB_USERS,
    });

    infoLog(`✅ Connected to database: ${ENV.DB_USERS}`);

    // Check if column already exists
    const [columns] = await connection.execute(
      `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'updated_at'
    `,
      [ENV.DB_USERS]
    );

    if (columns.length > 0) {
      infoLog("⚠️  Column 'updated_at' already exists. Migration skipped.");
      return;
    }

    // Add updated_at column
    await connection.execute(`
      ALTER TABLE users
      ADD COLUMN updated_at TIMESTAMP
      DEFAULT CURRENT_TIMESTAMP
      ON UPDATE CURRENT_TIMESTAMP
    `);

    infoLog("✅ Migration completed: updated_at column added to users table");

    // Verify the column was added
    const [verification] = await connection.execute(
      `
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'updated_at'
    `,
      [ENV.DB_USERS]
    );

    if (verification.length > 0) {
      infoLog("✅ Verification successful:", verification[0]);
    } else {
      throw new Error("Migration verification failed: updated_at column not found");
    }
  } catch (error) {
    errorLog("❌ Migration failed:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      debugLog("Database connection closed");
    }
  }
};

/**
 * Main execution function
 * @async
 * @function main
 * @returns {Promise<void>}
 */
const main = async () => {
  try {
    await addUpdatedAtColumn();
    infoLog("🎉 Migration script completed successfully");
    process.exit(0);
  } catch (error) {
    errorLog("💥 Migration script failed:", error);
    process.exit(1);
  }
};

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { addUpdatedAtColumn };
