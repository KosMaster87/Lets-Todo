/**
 * 🔄 Database Migration: Add last_login column
 * Fügt last_login Spalte zur users Tabelle hinzu für bessere Inaktivitäts-Erkennung
 *
 * Usage: NODE_ENV=feat node scripts/add-last-login-column.js
 */

import mysql from "mysql2/promise";
import {
  ENV,
  debugLog,
  infoLog,
  errorLog,
  ENVIRONMENT,
} from "../config/environment.js";

async function addLastLoginColumn() {
  try {
    infoLog(`🔄 Adding last_login column to ${ENVIRONMENT} database...`);

    const connection = await mysql.createConnection({
      host: ENV.DB_HOST,
      port: ENV.DB_PORT,
      user: ENV.DB_USER,
      password: ENV.DB_PASSWORD,
    });

    const usersDB = ENV.DB_USERS;
    await connection.execute(`USE \`${usersDB}\``);

    // Prüfe ob Spalte bereits existiert
    const [columns] = await connection.execute(
      `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'last_login'
    `,
      [usersDB]
    );

    if (columns.length > 0) {
      infoLog("✅ last_login Spalte existiert bereits!");
    } else {
      // Füge last_login Spalte hinzu
      await connection.execute(`
        ALTER TABLE users
        ADD COLUMN last_login BIGINT DEFAULT NULL
        COMMENT 'Unix timestamp (ms) of last login activity'
      `);
      infoLog("✅ last_login Spalte hinzugefügt!");

      // Setze last_login für bestehende User auf created-Wert (Fallback)
      await connection.execute(`
        UPDATE users
        SET last_login = created
        WHERE last_login IS NULL AND created IS NOT NULL
      `);
      infoLog("📅 Bestehende User: last_login auf created-Wert gesetzt");
    }

    // Zeige aktuelle Tabellen-Struktur
    const [tableInfo] = await connection.execute(`DESCRIBE users`);
    console.log("\n📋 Aktuelle users-Tabelle Struktur:");
    tableInfo.forEach((row) => {
      console.log(
        `  ${row.Field}: ${row.Type} ${
          row.Null === "YES" ? "(nullable)" : "(not null)"
        } ${row.Default ? `default: ${row.Default}` : ""}`
      );
    });

    await connection.end();
    infoLog(`✅ ${ENVIRONMENT} Database Migration abgeschlossen!`);
  } catch (error) {
    errorLog("❌ Migration Fehler:", error);
    process.exit(1);
  }
}

// Script ausführen
if (import.meta.url === `file://${process.argv[1]}`) {
  addLastLoginColumn();
}

export { addLastLoginColumn };
