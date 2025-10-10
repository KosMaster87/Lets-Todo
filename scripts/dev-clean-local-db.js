#!/usr/bin/env node

// scripts/dev-clean-local-db.js
// 🏠 LOKAL: Script to clean all LOCAL todo databases while preserving structure
// ⚠️  NUR für lokale Development-Umgebung (127.0.0.1) verwenden!

import mysql from "mysql2/promise";
import { ENV } from "../config/environment.js";

async function cleanDatabase() {
  console.log("🧹 Starting database cleanup...");

  try {
    // Load environment configuration (without specific database)
    const dbConfig = {
      host: ENV.DB_HOST,
      port: ENV.DB_PORT,
      user: ENV.DB_USER,
      password: ENV.DB_PASSWORD,
    };

    console.log(
      `📡 Connecting to database server: ${dbConfig.host}:${dbConfig.port}`
    );

    // Connect to database server
    const connection = await mysql.createConnection(dbConfig);

    // 1. Find and drop all user databases
    console.log("🔍 Looking for user databases to clean...");
    const [userDatabases] = await connection.query(`
      SELECT SCHEMA_NAME as db_name
      FROM INFORMATION_SCHEMA.SCHEMATA
      WHERE SCHEMA_NAME LIKE 'todos_user_%'
    `);

    if (userDatabases.length > 0) {
      console.log(`📋 Found ${userDatabases.length} user databases to drop`);

      for (const db of userDatabases) {
        const dbName = db.db_name;
        console.log(`🗑️  Dropping database: ${dbName}`);
        await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
      }
      console.log("✅ All user databases dropped");
    } else {
      console.log("📋 No user databases found");
    }

    // 2. Clean users database
    const usersDB = ENV.DB_USERS || "todos_users_dev";
    console.log(`🧹 Cleaning users database: ${usersDB}`);

    // Check if users database exists
    const [userDbExists] = await connection.query(
      `
      SELECT SCHEMA_NAME
      FROM INFORMATION_SCHEMA.SCHEMATA
      WHERE SCHEMA_NAME = ?
    `,
      [usersDB]
    );

    if (userDbExists.length > 0) {
      await connection.query(`USE \`${usersDB}\``);

      // Check if users table exists
      const [usersTable] = await connection.query(
        `
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
      `,
        [usersDB]
      );

      if (usersTable.length > 0) {
        const [result] = await connection.query(`DELETE FROM users`);
        console.log(`✅ Deleted ${result.affectedRows} users from users table`);
      } else {
        console.log("⏭️  No users table found");
      }
    } else {
      console.log(`⏭️  Users database ${usersDB} doesn't exist`);
    }

    // 3. Show final state
    console.log("\n📊 Final database state:");
    const [finalDatabases] = await connection.query(`
      SELECT SCHEMA_NAME as database_name
      FROM INFORMATION_SCHEMA.SCHEMATA
      WHERE SCHEMA_NAME LIKE 'todos_%'
      ORDER BY SCHEMA_NAME
    `);

    if (finalDatabases.length > 0) {
      console.table(finalDatabases);
    } else {
      console.log("📋 No todo databases remaining");
    }

    await connection.end();
    console.log("\n✅ Database cleanup completed successfully!");
    console.log("\n🚀 You can now run setup to create fresh databases:");
    console.log("node scripts/setup-dev-db.js");
  } catch (error) {
    console.error("❌ Database cleanup failed:", error.message);
    process.exit(1);
  }
}

// Run cleanup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Add confirmation prompt
  console.log("⚠️  This will DELETE ALL todo data and users!");
  console.log("⚠️  This action cannot be undone!");
  console.log("\nPress Ctrl+C to cancel, or any key to continue...");

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on("data", () => {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    cleanDatabase();
  });
}

export default cleanDatabase;
