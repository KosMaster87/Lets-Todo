/**
 * 🌐 MULTI-ENVIRONMENT Database Setup Script
 * Erstellt Datenbanken für ALLE Environments basierend auf NODE_ENV:
 *
 * 🏠 development  → Lokale DBs (127.0.0.1)
 * 🚀 feat        → Feature Server DBs
 * 🎭 staging     → Staging Server DBs
 * 🏭 production  → Production Server DBs
 *
 * Usage: NODE_ENV=development node scripts/setup-multi-env-db.js
 */

import mysql from "mysql2/promise";
import {
  ENV,
  debugLog,
  infoLog,
  errorLog,
  ENVIRONMENT,
} from "../config/environment.js";

/**
 * Setup für Datenbank (Multi-Environment Support)
 * Unterstützt: development, feature, staging, production
 */
async function setupDatabase() {
  try {
    infoLog(`Starte ${ENVIRONMENT} Database Setup...`);

    // Verbindung ohne spezifische Datenbank
    const connection = await mysql.createConnection({
      host: ENV.DB_HOST,
      port: ENV.DB_PORT,
      user: ENV.DB_USER,
      password: ENV.DB_PASSWORD,
    });

    // 1. Users-Datenbank erstellen
    const usersDB = ENV.DB_USERS;
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${usersDB}\``);
    infoLog(`Users-Datenbank erstellt: ${usersDB}`);

    // 2. Users-Tabelle erstellen
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
    infoLog("Users-Tabelle erstellt");

    // 3. Password-Reset-Tokens Tabelle erstellen
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
    infoLog("Password-Reset-Tokens Tabelle erstellt");

    // 3. Test-Benutzer erstellen (für alle non-production Environments)
    if (ENVIRONMENT !== "production") {
      try {
        // Environment-spezifische Test-User
        const envSuffix = ENVIRONMENT === "development" ? "dev" : ENVIRONMENT;
        const testEmail = `test@${envSuffix}.local`;
        const testPasswordHash = "$2b$10$abcdefghijklmnopqrstuvwxyz123456"; // Dummy-Hash
        const testDBName = `todos_user_1_${envSuffix}`;

        await connection.execute(
          `INSERT IGNORE INTO users (email, password_hash, db_name, created) VALUES (?, ?, ?, ?)`,
          [testEmail, testPasswordHash, testDBName, Date.now()]
        );
        infoLog(`Test-User erstellt: ${testEmail}`);

        // Test-User-Datenbank erstellen
        await connection.execute(
          `CREATE DATABASE IF NOT EXISTS \`${testDBName}\``
        );
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
        infoLog(`Test-User-Datenbank erstellt: ${testDBName}`);

        // Environment-spezifische Test-Todos erstellen
        if (ENVIRONMENT === "development") {
          await connection.execute(`
            INSERT IGNORE INTO todos (id, title, description, completed, created, updated) VALUES
            (1, 'Welcome to Let\\'s Todo API', 'Diese Todo wurde automatisch vom Setup-Script erstellt', 0, ${Date.now()}, ${Date.now()}),
            (2, 'Test the API', 'Teste die verschiedenen Endpoints mit Thunder Client oder curl', 0, ${Date.now()}, ${Date.now()}),
            (3, 'Completed Example', 'Dies ist ein Beispiel einer erledigten Todo', 1, ${Date.now()}, ${Date.now()})
          `);
          infoLog("Test-Todos für Development erstellt");
        }
      } catch (err) {
        debugLog("Test-User bereits vorhanden oder Fehler:", err.message);
      }
    }

    await connection.end();
    infoLog(`✅ ${ENVIRONMENT} Database Setup abgeschlossen!`);

    // Environment-spezifische Abschluss-Meldungen
    console.log(
      `\n🎯 ${ENVIRONMENT.toUpperCase()} Database Setup abgeschlossen!`
    );

    if (ENVIRONMENT === "development") {
      console.log("\n🚀 Sie können jetzt starten mit:");
      console.log("npm run dev");
      console.log("\n👤 Test-User Zugangsdaten:");
      console.log("Email: test@dev.local");
      console.log("Password: beliebig (Dummy-Hash)");
    } else if (ENVIRONMENT === "feature") {
      console.log("\n🚀 Feature Environment ist bereit!");
      console.log("👤 Test-User: test@feature.local");
      console.log("Port: 3003");
    } else if (ENVIRONMENT === "staging") {
      console.log("\n🚀 Staging Environment ist bereit!");
      console.log("👤 Test-User: test@staging.local");
      console.log("Port: 3004");
    } else {
      console.log("\n🚀 Production-Datenbank ist bereit!");
      console.log("⚠️  Kein Test-User in Production erstellt.");
    }
  } catch (error) {
    errorLog("❌ Database Setup Fehler:", error);
    console.log("\n💡 Mögliche Lösungen:");
    console.log("1. MariaDB/MySQL läuft: sudo systemctl start mariadb");
    console.log("2. Zugangsdaten in .env prüfen");
    console.log("3. User-Berechtigung prüfen");
    process.exit(1);
  }
}

// Script ausführen
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export { setupDatabase };
