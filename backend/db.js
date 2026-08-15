/**
 * Database connection management for the Todo app
 * Manages three different pool types:
 * - Core pool: for DDL operations (database creation)
 * - User pool: central user management
 * - Guest pools: dynamic pools per guest session
 */

// db.js
import mysql from "mysql2/promise";
import { ENV, debugLog, errorLog } from "./config/environment.js";

/**
 * Map for storing connection pools per guest ID or user ID
 * Structure: { "guestId": pool, "user_123": pool }
 * @type {Object<string, mysql.Pool>}
 */
const guestPools = {};

/**
 * Map for storing connection pools per user ID
 * Structure: { "user_123": pool }
 * @type {Object<string, mysql.Pool>}
 */
const userPools = {};

/**
 * Core pool for DDL operations (Data Definition Language) | database creation/deletion
 * Connects WITHOUT a specific database
 * @type {mysql.Pool}
 */
const corePool = mysql.createPool({
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
});

/**
 * Pool for central user management
 * Connects to the todos_users database
 * @type {mysql.Pool}
 */
const userPool = mysql.createPool({
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_USERS || "todos_users", // central user DB
  waitForConnections: true,
  connectionLimit: 5,
});

/**
 * Tests the core pool connection on app start
 * Implements a "fail-fast" pattern - the app only starts if the DB is reachable
 * Exits the process on connection errors (Docker's restart policy restarts it automatically)
 * @async
 * @function testCoreConnection
 */
(async function testCoreConnection() {
  try {
    // Get a connection from the pool (tests DB reachability)
    const conn = await corePool.getConnection();
    debugLog("Core pool connected to MariaDB (DDL pool)");

    // IMPORTANT: return the connection to the pool
    // Without release() this connection would be permanently "blocked"
    conn.release();
  } catch (err) {
    errorLog("Core pool connection error:", err.message);
    console.error("Check: is the DB running? Are credentials correct? Is the network ok?");

    // Fail-fast: exit the app instead of starting in a broken state
    // Docker's restart policy restarts the app automatically once the DB is available again
    process.exit(1);
  }
})();

export { corePool, guestPools, userPool, userPools };
