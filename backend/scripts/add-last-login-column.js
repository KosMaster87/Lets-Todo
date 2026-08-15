/**
 * @fileoverview Database migration script to add last_login column
 * @description Adds last_login column to users table for better inactivity detection
 * @module scripts/add-last-login-column
 */

/**
 * Database Migration: Add last_login column
 * Adds last_login column to users table for better inactivity detection
 *
 * Usage: NODE_ENV=feat node scripts/add-last-login-column.js
 */

import mysql from "mysql2/promise";
import { ENV, debugLog, infoLog, errorLog, ENVIRONMENT } from "../config/environment.js";

async function addLastLoginColumn() {
  try {
    infoLog(`Adding last_login column to ${ENVIRONMENT} database...`);

    const connection = await mysql.createConnection({
      host: ENV.DB_HOST,
      port: ENV.DB_PORT,
      user: ENV.DB_USER,
      password: ENV.DB_PASSWORD,
    });

    const usersDB = ENV.DB_USERS;
    await connection.execute(`USE \`${usersDB}\``);

    // Check whether the column already exists
    const [columns] = await connection.execute(
      `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'last_login'
    `,
      [usersDB]
    );

    if (columns.length > 0) {
      infoLog("last_login column already exists!");
    } else {
      // Add the last_login column
      await connection.execute(`
        ALTER TABLE users
        ADD COLUMN last_login BIGINT DEFAULT NULL
        COMMENT 'Unix timestamp (ms) of last login activity'
      `);
      infoLog("last_login column added!");

      // Set last_login for existing users to the created value (fallback)
      await connection.execute(`
        UPDATE users
        SET last_login = created
        WHERE last_login IS NULL AND created IS NOT NULL
      `);
      infoLog("Existing users: last_login set to created value");
    }

    // Show current table structure
    const [tableInfo] = await connection.execute(`DESCRIBE users`);
    console.log("\nCurrent users table structure:");
    tableInfo.forEach((row) => {
      console.log(
        ` ${row.Field}: ${row.Type} ${
          row.Null === "YES" ? "(nullable)" : "(not null)"
        } ${row.Default ? `default: ${row.Default}` : ""}`
      );
    });

    await connection.end();
    infoLog(`${ENVIRONMENT} database migration complete!`);
  } catch (error) {
    errorLog("Migration error:", error);
    process.exit(1);
  }
}

// Run script
if (import.meta.url === `file://${process.argv[1]}`) {
  addLastLoginColumn();
}

export { addLastLoginColumn };
