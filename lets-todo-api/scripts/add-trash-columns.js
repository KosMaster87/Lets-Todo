#!/usr/bin/env node

/**
 * @fileoverview Database migration script to add trash columns
 * @description Adds trashed and trashed_at columns to todos table for soft-deletion
 * @module scripts/add-trash-columns
 */

import mysql from "mysql2/promise";
import { ENV } from "../config/environment.js";

async function addTrashColumns() {
  console.log("🔄 Starting database migration: Adding trash columns...");

  try {
    // Load environment configuration (without specific database)
    const dbConfig = {
      host: ENV.DB_HOST,
      port: ENV.DB_PORT,
      user: ENV.DB_USER,
      password: ENV.DB_PASSWORD,
    };

    console.log(`📡 Connecting to database server: ${dbConfig.host}:${dbConfig.port}`);

    // Connect to database server
    const connection = await mysql.createConnection(dbConfig);

    // Find all user databases with todos tables
    console.log("🔍 Looking for user databases with todos tables...");
    const [databases] = await connection.query(`
      SELECT SCHEMA_NAME as db_name
      FROM INFORMATION_SCHEMA.SCHEMATA
      WHERE SCHEMA_NAME LIKE 'todos_user_%'
    `);

    if (databases.length === 0) {
      console.log("❌ No user databases found matching 'todos_user_%' pattern");
      await connection.end();
      return;
    }

    console.log(`📋 Found ${databases.length} user databases to migrate`);

    // Process each user database
    for (const db of databases) {
      const dbName = db.db_name;
      console.log(`\n🔄 Processing database: ${dbName}`);

      // Switch to this database
      await connection.query(`USE \`${dbName}\``);

      // Check if todos table exists
      const [tables] = await connection.query(
        `
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'todos'
      `,
        [dbName]
      );

      if (tables.length === 0) {
        console.log(`⏭️  No todos table in ${dbName}, skipping`);
        continue;
      }

      // Check if columns already exist
      console.log(`🔍 Checking existing table structure in ${dbName}...`);
      const [columns] = await connection.query(
        `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'todos'
      `,
        [dbName]
      );

      const columnNames = columns.map((col) => col.COLUMN_NAME);
      const hasTrashColumn = columnNames.includes("trashed");
      const hasTrashedAtColumn = columnNames.includes("trashed_at");

      console.log(`📋 Current columns in ${dbName}: ${columnNames.join(", ")}`);

      // Add trashed column if not exists
      if (!hasTrashColumn) {
        console.log(`➕ Adding 'trashed' column to ${dbName}...`);
        await connection.query(`
          ALTER TABLE todos
          ADD COLUMN trashed TINYINT(1) DEFAULT 0 COMMENT 'Indicates if todo is in trash'
        `);
        console.log(`✅ Added 'trashed' column to ${dbName}`);
      } else {
        console.log(`⏭️  'trashed' column already exists in ${dbName}`);
      }

      // Add trashed_at column if not exists
      if (!hasTrashedAtColumn) {
        console.log(`➕ Adding 'trashed_at' column to ${dbName}...`);
        await connection.query(`
          ALTER TABLE todos
          ADD COLUMN trashed_at BIGINT DEFAULT NULL COMMENT 'Timestamp when todo was trashed'
        `);
        console.log(`✅ Added 'trashed_at' column to ${dbName}`);
      } else {
        console.log(`⏭️  'trashed_at' column already exists in ${dbName}`);
      }

      // Update existing todos to have trashed = 0 if NULL
      console.log(`🔄 Updating existing todos in ${dbName}...`);
      const [updateResult] = await connection.query(`
        UPDATE todos
        SET trashed = 0
        WHERE trashed IS NULL
      `);
      console.log(`✅ Updated ${updateResult.affectedRows} existing todos in ${dbName}`);

      // Add index for better performance on trash queries
      try {
        console.log(`📊 Adding index for trash queries in ${dbName}...`);
        await connection.query(`
          CREATE INDEX idx_todos_trashed ON todos (trashed, trashed_at)
        `);
        console.log(`✅ Added index for trash queries in ${dbName}`);
      } catch (indexError) {
        if (indexError.code === "ER_DUP_KEYNAME") {
          console.log(`⏭️  Index already exists in ${dbName}`);
        } else {
          console.warn(`⚠️ Could not create index in ${dbName}:`, indexError.message);
        }
      }

      // Show final table structure for this database
      console.log(`📋 Final table structure for ${dbName}:`);
      const [finalColumns] = await connection.query(`DESCRIBE todos`);
      console.table(finalColumns);
    }

    await connection.end();
    console.log("✅ Migration completed successfully for all databases!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addTrashColumns();
}

export default addTrashColumns;
