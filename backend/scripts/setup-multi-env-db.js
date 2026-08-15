/**
 * @fileoverview MULTI-ENVIRONMENT Database Setup Script
 * @description Creates databases for ALL environments based on NODE_ENV
 *
 * @module scripts/setup-multi-env-db
 */

/**
 * MULTI-ENVIRONMENT Database Setup Script
 * Creates databases for ALL environments based on NODE_ENV:
 *
 * development → Local DBs (127.0.0.1)
 * staging → Staging Server DBs
 * production → Production Server DBs
 *
 * Usage: NODE_ENV=development node scripts/setup-multi-env-db.js
 */

import mysql from "mysql2/promise";
import { ENV, debugLog, infoLog, errorLog, ENVIRONMENT } from "../config/environment.js";

/**
 * Database setup (Multi-Environment Support)
 * Supports: development, staging, production
 */
async function setupDatabase() {
  try {
    infoLog(`Starting ${ENVIRONMENT} Database Setup...`);

    // The app DB user (ENV.DB_USER) must already exist with CREATE DATABASE + ALL
    // PRIVILEGES ON `todos_%`.* granted for its connecting host - provisioned once as
    // part of the MariaDB container setup, not by this script. This used to connect as
    // unauthenticated `root` via a `/root/.my.cnf` on the VPS (same host as MariaDB);
    // that assumption no longer holds now that MariaDB runs in its own container,
    // reached over the network.
    const dbConfig = {
      host: ENV.DB_HOST,
      port: ENV.DB_PORT,
      user: ENV.DB_USER,
      password: ENV.DB_PASSWORD,
    };

    debugLog(`Database connection config:`, {
      ...dbConfig,
      password: "[HIDDEN]",
    });

    // Connection without specific database
    const connection = await mysql.createConnection(dbConfig);

    // 1. Create users database
    const usersDB = ENV.DB_USERS;
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${usersDB}\``);
    infoLog(`Users database created: ${usersDB}`);

    // 2. Create users table
    await connection.execute(`USE \`${usersDB}\``);
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        db_name VARCHAR(255) NOT NULL,
        created BIGINT
      );
    `);
    infoLog("Users table created");

    // 3. Create password reset tokens table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_used TINYINT(1) DEFAULT 0,
        used_at TIMESTAMP NULL,
        INDEX idx_token (token),
        INDEX idx_email (email),
        INDEX idx_expires (expires_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    infoLog("Password reset tokens table created");

    // 3. Create test user (for all non-production environments)
    if (ENVIRONMENT !== "production") {
      try {
        // Environment-specific test user
        const envSuffix = ENVIRONMENT === "development" ? "dev" : ENVIRONMENT;
        const testEmail = `test@${envSuffix}.local`;
        const testPasswordHash = "$2b$10$abcdefghijklmnopqrstuvwxyz123456"; // Dummy hash
        const testDBName = `todos_user_1_${envSuffix}`;

        await connection.execute(
          `INSERT IGNORE INTO users (email, password_hash, db_name, created) VALUES (?, ?, ?, ?)`,
          [testEmail, testPasswordHash, testDBName, Date.now()]
        );
        infoLog(`Test user created: ${testEmail}`);

        // Create test user database
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${testDBName}\``);
        await connection.execute(`USE \`${testDBName}\``);
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS todos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            completed TINYINT(1) DEFAULT 0,
            created BIGINT,
            updated BIGINT
          );
        `);
        infoLog(`Test user database created: ${testDBName}`);

        // Create environment-specific test todos
        if (ENVIRONMENT === "development") {
          await connection.execute(`
            INSERT IGNORE INTO todos (id, title, description, completed, created, updated) VALUES
            (1, 'Welcome to Let\\'s Todo API', 'This todo was automatically created by the setup script', 0, ${Date.now()}, ${Date.now()}),
            (2, 'Test the API', 'Test the various endpoints with Thunder Client or curl', 0, ${Date.now()}, ${Date.now()}),
            (3, 'Completed Example', 'This is an example of a completed todo', 1, ${Date.now()}, ${Date.now()})
          `);
          infoLog("Test todos for development created");
        }
      } catch (err) {
        debugLog("Test user already exists or error:", err.message);
      }
    }

    await connection.end();
    infoLog(`${ENVIRONMENT} Database Setup completed!`);

    // Environment-specific completion messages
    console.log(`\n${ENVIRONMENT.toUpperCase()} Database Setup completed!`);

    if (ENVIRONMENT === "development") {
      console.log("\nYou can now start with:");
      console.log("npm run dev");
      console.log("\nTest user credentials:");
      console.log("Email: test@dev.local");
      console.log("Password: anything (dummy hash)");
    } else if (ENVIRONMENT === "staging") {
      console.log("\nStaging environment is ready!");
      console.log("Test user: test@staging.local");
      console.log("Port: 3004");
    } else {
      console.log("\nProduction database is ready!");
      console.log(" No test user created in production.");
    }
  } catch (error) {
    errorLog("Database Setup Error:", error);
    console.log("\nPossible solutions:");
    console.log("1. MariaDB/MySQL running: sudo systemctl start mariadb");
    console.log("2. Check credentials in .env");
    console.log("3. Check user permissions");
    process.exit(1);
  }
}

// Execute script
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export { setupDatabase };
