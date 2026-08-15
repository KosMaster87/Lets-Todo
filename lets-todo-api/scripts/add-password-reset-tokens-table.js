/**
 * @fileoverview Database Migration: Add password_reset_tokens table
 * @description Creates the password_reset_tokens table for secure password reset functionality.
 * This table stores temporary tokens with expiration times for password reset requests.
 *
 * Key Features:
 * - Secure token storage with expiration
 * - User association via foreign key
 * - Automatic cleanup of expired tokens
 * - Unique constraint to prevent token collisions
 * - Index optimization for fast token lookups
 *
 * Security Considerations:
 * - Tokens have limited lifetime (default: 1 hour)
 * - Tokens are cryptographically secure random strings
 * - Used tokens are marked as used to prevent replay attacks
 * - Foreign key ensures data integrity with users table
 *
 * @module add-password-reset-tokens-table
 * @requires ../db.js
 * @requires ../config/environment.js
 * @since 1.0.0
 */

import { userPool } from "../db.js";
import { debugLog, errorLog } from "../config/environment.js";

/**
 * Creates the password_reset_tokens table with proper schema and constraints.
 * @async
 * @function createPasswordResetTokensTable
 * @returns {Promise<void>}
 * @throws {Error} When table creation fails
 */
const createPasswordResetTokensTable = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token VARCHAR(255) NOT NULL UNIQUE,
      expires_at BIGINT NOT NULL COMMENT 'Unix timestamp when token expires',
      created_at BIGINT NOT NULL COMMENT 'Unix timestamp when token was created',
      used_at BIGINT DEFAULT NULL COMMENT 'Unix timestamp when token was used (prevents reuse)',
      is_used TINYINT(1) DEFAULT 0 COMMENT 'Flag indicating if token has been used',

      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

      INDEX idx_token_lookup (token, expires_at, is_used),
      INDEX idx_user_tokens (user_id, created_at),
      INDEX idx_cleanup (expires_at, is_used)
    ) ENGINE=InnoDB
      DEFAULT CHARSET=utf8mb4
      COLLATE=utf8mb4_general_ci
      COMMENT='Stores password reset tokens with expiration and usage tracking';
  `;

  await userPool.query(createTableSQL);
  debugLog("✅ Created password_reset_tokens table successfully");
};

/**
 * Verifies that the password_reset_tokens table was created correctly.
 * @async
 * @function verifyTableCreation
 * @returns {Promise<boolean>} True if table exists with correct structure
 */
const verifyTableCreation = async () => {
  try {
    const [result] = await userPool.query(`
      SELECT COUNT(*) as table_exists
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = 'password_reset_tokens'
    `);

    if (result[0].table_exists === 0) {
      throw new Error("Table was not created");
    }

    // Verify table structure
    const [columns] = await userPool.query(`
      SHOW COLUMNS FROM password_reset_tokens
    `);

    const expectedColumns = [
      "id",
      "user_id",
      "token",
      "expires_at",
      "created_at",
      "used_at",
      "is_used",
    ];

    const actualColumns = columns.map((col) => col.Field);
    const missingColumns = expectedColumns.filter(
      (col) => !actualColumns.includes(col)
    );

    if (missingColumns.length > 0) {
      throw new Error(`Missing columns: ${missingColumns.join(", ")}`);
    }

    debugLog("✅ Table structure verification successful");
    return true;
  } catch (error) {
    errorLog("❌ Table verification failed:", error);
    return false;
  }
};

/**
 * Creates a cleanup procedure for expired tokens.
 * This can be used by a cron job to regularly clean up expired tokens.
 * @async
 * @function createTokenCleanupProcedure
 * @returns {Promise<void>}
 */
const createTokenCleanupProcedure = async () => {
  const procedureSQL = `
    CREATE PROCEDURE IF NOT EXISTS CleanupExpiredResetTokens()
    BEGIN
      DELETE FROM password_reset_tokens
      WHERE expires_at < UNIX_TIMESTAMP() * 1000
      OR (is_used = 1 AND used_at < (UNIX_TIMESTAMP() * 1000 - 86400000)); -- Remove used tokens older than 24h

      SELECT ROW_COUNT() as deleted_tokens;
    END
  `;

  await userPool.query(procedureSQL);
  debugLog("✅ Created token cleanup procedure");
};

/**
 * Displays migration summary information.
 * @function displayMigrationSummary
 * @returns {void}
 */
const displayMigrationSummary = () => {
  console.log("\n" + "=".repeat(60));
  console.log("🔐 PASSWORD RESET TOKENS TABLE MIGRATION COMPLETED");
  console.log("=".repeat(60));
  console.log("");
  console.log("📋 What was created:");
  console.log("   • password_reset_tokens table with security features");
  console.log("   • Foreign key constraint to users table");
  console.log("   • Optimized indexes for token lookups");
  console.log("   • Token cleanup stored procedure");
  console.log("");
  console.log("🔧 Features:");
  console.log("   • Secure token storage with expiration");
  console.log("   • Usage tracking to prevent token reuse");
  console.log("   • Automatic cleanup capability");
  console.log("   • Performance-optimized queries");
  console.log("");
  console.log("⚠️  Security Notes:");
  console.log("   • Tokens expire after 1 hour by default");
  console.log("   • Used tokens cannot be reused");
  console.log("   • Regular cleanup recommended via cron job");
  console.log("");
  console.log("🚀 Next Steps:");
  console.log("   • Update /api/forgot-password to generate tokens");
  console.log("   • Implement token validation endpoint");
  console.log("   • Configure email service for sending reset links");
  console.log("=".repeat(60));
};

/**
 * Main migration execution function.
 * Creates the password reset tokens table and associated database objects.
 * @async
 * @function runMigration
 * @returns {Promise<void>}
 */
const runMigration = async () => {
  try {
    console.log("🚀 Starting password reset tokens table migration...\n");

    await createPasswordResetTokensTable();
    await createTokenCleanupProcedure();

    const isValid = await verifyTableCreation();
    if (!isValid) {
      throw new Error("Table verification failed");
    }

    displayMigrationSummary();
  } catch (error) {
    errorLog("❌ Migration failed:", error);
    console.log("\n🔄 Rollback Information:");
    console.log(
      "   To rollback, run: DROP TABLE IF EXISTS password_reset_tokens;"
    );
    console.log(
      "   To rollback procedure: DROP PROCEDURE IF EXISTS CleanupExpiredResetTokens;"
    );
    process.exit(1);
  }
};

// Execute migration if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration()
    .then(() => {
      console.log("\n✅ Migration completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      errorLog("Migration execution failed:", error);
      process.exit(1);
    });
}

export { runMigration, createPasswordResetTokensTable, verifyTableCreation };
