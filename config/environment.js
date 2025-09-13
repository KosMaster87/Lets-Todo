// lets-todo-api/config/env/environment.js

/**
 * Backend Environment-Konfiguration
 * Multi-Environment Support: development, feature, staging, production
 */

import dotenv from "dotenv";

/**
 * Dynamisches Laden der Environment-Datei basierend auf NODE_ENV
 */
const NODE_ENV = process.env.NODE_ENV || "development";

// Environment name mapping (deployment uses short names)
const envMapping = {
  feat: "feature",
  stage: "staging",
  prod: "production",
  development: "development",
  feature: "feature",
  staging: "staging",
  production: "production",
};

const actualEnv = envMapping[NODE_ENV] || NODE_ENV;

const envFiles = {
  development: "config/env/.env.development",
  feature: "config/env/.env.feature",
  staging: "config/env/.env.staging",
  production: "config/env/.env.production",
};

const envFile = envFiles[actualEnv] || "config/env/.env.development";
dotenv.config({ path: envFile });

console.log(`🔧 Loading environment from: ${envFile} (NODE_ENV: ${NODE_ENV})`);

/**
 * Environment-Detection basierend auf NODE_ENV
 */
function detectEnvironment() {
  // Use mapped environment name
  if (actualEnv && envFiles[actualEnv]) {
    return actualEnv;
  }

  // Development als Fallback für lokale Entwicklung
  if (
    process.env.DB_HOST === "127.0.0.1" ||
    process.env.DB_HOST === "localhost" ||
    process.cwd().includes("/home/") ||
    process.cwd().includes("/Users/")
  ) {
    return "development";
  }

  // Production als Standard-Fallback
  return "production";
}

const ENVIRONMENT = detectEnvironment();

/**
 * Environment-spezifische Konfiguration für alle 4 Environments
 */
const CONFIG = {
  development: {
    // Database
    DB_HOST: process.env.DB_HOST || "127.0.0.1",
    DB_PORT: Number(process.env.DB_PORT) || 3306,
    DB_USER: process.env.DB_USER || "root",
    DB_PASSWORD: process.env.DB_PASSWORD || "",
    DB_NAME: process.env.DB_NAME || "todos_dev",
    DB_USERS: process.env.DB_USERS || "todos_users_dev",

    // Server
    HTTP_PORT: Number(process.env.PORT) || 3000,
    HTTP_HOST: "127.0.0.1",

    // CORS - lokale Development
    CORS_ORIGINS: [
      "http://localhost:3000",
      "http://localhost:5500",
      "http://localhost:5501",
      "http://127.0.0.1:5500",
      "http://127.0.0.1:5501",
      "http://localhost:8080",
      "http://localhost:8000",
    ],

    // Cookies
    COOKIE_DOMAIN: undefined, // Keine Domain für localhost
    COOKIE_SECURE: false,

    // Logging
    DEBUG: Boolean(process.env.DEBUG) || true,
    LOG_LEVEL: process.env.LOG_LEVEL || "verbose",
  },

  feature: {
    // Database
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_PORT: Number(process.env.DB_PORT) || 3306,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME || "todos_main",
    DB_USERS: process.env.DB_USERS || "todos_users",

    // Server
    HTTP_PORT: Number(process.env.PORT) || 3003,
    HTTP_HOST: "0.0.0.0",

    // CORS - Feature Environment
    CORS_ORIGINS: [
      "https://lets-todo-app-feat.dev2k.org",
      "http://localhost:3000", // Für lokale Tests
    ],

    // Cookies
    COOKIE_DOMAIN: ".dev2k.org",
    COOKIE_SECURE: true,

    // Logging
    DEBUG: Boolean(process.env.DEBUG) || true,
    LOG_LEVEL: process.env.LOG_LEVEL || "debug",
  },

  staging: {
    // Database
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_PORT: Number(process.env.DB_PORT) || 3306,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME || "todos_main",
    DB_USERS: process.env.DB_USERS || "todos_users",

    // Server
    HTTP_PORT: Number(process.env.PORT) || 3004,
    HTTP_HOST: "0.0.0.0",

    // CORS - Staging Environment
    CORS_ORIGINS: ["https://lets-todo-app-stage.dev2k.org"],

    // Cookies
    COOKIE_DOMAIN: ".dev2k.org",
    COOKIE_SECURE: true,

    // Logging
    DEBUG: Boolean(process.env.DEBUG) || false,
    LOG_LEVEL: process.env.LOG_LEVEL || "warn",
  },

  production: {
    // Database
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_PORT: Number(process.env.DB_PORT) || 3306,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME || "todos_main",
    DB_USERS: process.env.DB_USERS || "todos_users",

    // Server
    HTTP_PORT: Number(process.env.PORT) || 3002,
    HTTP_HOST: "0.0.0.0",

    // CORS - Production Environment
    CORS_ORIGINS: ["https://lets-todo.dev2k.org"],

    // Cookies
    COOKIE_DOMAIN: ".dev2k.org",
    COOKIE_SECURE: true,

    // Logging
    DEBUG: Boolean(process.env.DEBUG) || false,
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
  },
};

/**
 * Aktuelle Environment-Konfiguration
 */
const ENV = CONFIG[ENVIRONMENT];

/**
 * Logging-Funktionen
 */
function debugLog(message, data = null) {
  if (ENV.DEBUG) {
    console.log(`🔧 [${ENVIRONMENT.toUpperCase()}] ${message}`, data || "");
  }
}

function infoLog(message, data = null) {
  if (ENV.LOG_LEVEL === "verbose" || ENV.LOG_LEVEL === "info") {
    console.log(`ℹ️ [${ENVIRONMENT.toUpperCase()}] ${message}`, data || "");
  }
}

function errorLog(message, error = null) {
  console.error(`❌ [${ENVIRONMENT.toUpperCase()}] ${message}`, error || "");
}

// Initial-Log beim Laden
debugLog(`Backend Environment Detection: ${ENVIRONMENT}`, {
  dbHost: ENV.DB_HOST,
  dbPort: ENV.DB_PORT,
  httpPort: ENV.HTTP_PORT,
  corsOrigins: ENV.CORS_ORIGINS,
  debug: ENV.DEBUG,
});

export { ENV, ENVIRONMENT, debugLog, infoLog, errorLog };
