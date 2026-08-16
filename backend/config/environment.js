/**
 * @fileoverview Backend Environment Configuration
 * @description Multi-Environment Support: development, staging, production
 *
 * @module config/environment
 */

import dotenv from "dotenv";

/**
 * Dynamic loading of environment file based on NODE_ENV
 */
const NODE_ENV = process.env.NODE_ENV || "development";

// Environment name mapping (deployment uses short names)
const envMapping = {
  stage: "staging",
  prod: "production",
  development: "development",
  staging: "staging",
  production: "production",
};

const actualEnv = envMapping[NODE_ENV] || NODE_ENV;

const envFiles = {
  development: "config/env/.env.development",
  staging: "config/env/.env.staging",
  production: "config/env/.env.production",
};

const envFile = envFiles[actualEnv] || "config/env/.env.development";
dotenv.config({ path: envFile });

if (actualEnv === "development") {
  console.log(`Loading environment from: ${envFile} (NODE_ENV: ${NODE_ENV})`);
}

function envBool(value, fallback = false) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

/**
 * Environment detection based on NODE_ENV
 */
function detectEnvironment() {
  // Use mapped environment name
  if (actualEnv && envFiles[actualEnv]) {
    return actualEnv;
  }

  // Development as fallback for local development
  if (
    process.env.DB_HOST === "127.0.0.1" ||
    process.env.DB_HOST === "localhost" ||
    process.cwd().includes("/home/") ||
    process.cwd().includes("/Users/")
  ) {
    return "development";
  }

  // Production as default fallback
  return "production";
}

const ENVIRONMENT = detectEnvironment();

/**
 * Environment-specific configuration for all 3 environments
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

    // CORS - local development
    CORS_ORIGINS: [
      "http://localhost:3000",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:8080",
      "http://localhost:8000",
    ],

    // Cookies
    COOKIE_DOMAIN: undefined, // No domain for localhost
    COOKIE_SECURE: false,

    // Logging
    DEBUG: envBool(process.env.DEBUG, true),
    LOG_LEVEL: process.env.LOG_LEVEL || "verbose",

    // E-Mail Configuration
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || "",
    EMAIL_USER: process.env.EMAIL_USER || "",
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
    EMAIL_HOST: process.env.EMAIL_HOST || "",
    EMAIL_PORT: Number(process.env.EMAIL_PORT) || 587,
    EMAIL_SECURE: envBool(process.env.EMAIL_SECURE, false),
    APP_NAME: process.env.APP_NAME || "Let's Todo",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://127.0.0.1:5500",
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
    CORS_ORIGINS: ["https://lets-todo-staging.dev2ksoftware.com"],

    // Cookies
    COOKIE_DOMAIN: ".dev2ksoftware.com",
    COOKIE_SECURE: true,

    // Logging
    DEBUG: envBool(process.env.DEBUG, false),
    LOG_LEVEL: process.env.LOG_LEVEL || "warn",

    // E-Mail Configuration
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || "",
    EMAIL_USER: process.env.EMAIL_USER || "",
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
    EMAIL_HOST: process.env.EMAIL_HOST || "",
    EMAIL_PORT: Number(process.env.EMAIL_PORT) || 587,
    EMAIL_SECURE: envBool(process.env.EMAIL_SECURE, true),
    APP_NAME: process.env.APP_NAME || "Let's Todo",
    FRONTEND_URL: process.env.FRONTEND_URL || "https://lets-todo-staging.dev2ksoftware.com",
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
    CORS_ORIGINS: ["https://lets-todo.dev2ksoftware.com"],

    // Cookies
    COOKIE_DOMAIN: ".dev2ksoftware.com",
    COOKIE_SECURE: true,

    // Logging
    DEBUG: envBool(process.env.DEBUG, false),
    LOG_LEVEL: process.env.LOG_LEVEL || "error",

    // E-Mail Configuration
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || "",
    EMAIL_USER: process.env.EMAIL_USER || "",
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
    EMAIL_HOST: process.env.EMAIL_HOST || "",
    EMAIL_PORT: Number(process.env.EMAIL_PORT) || 587,
    EMAIL_SECURE: envBool(process.env.EMAIL_SECURE, true),
    APP_NAME: process.env.APP_NAME || "Let's Todo",
    FRONTEND_URL: process.env.FRONTEND_URL || "https://lets-todo.dev2ksoftware.com",
  },
};

/**
 * Current environment configuration
 */
const ENV = CONFIG[ENVIRONMENT];

/**
 * Logging functions
 */
function debugLog(message, data = null) {
  if (ENV.DEBUG) {
    console.log(`[${ENVIRONMENT.toUpperCase()}] ${message}`, data || "");
  }
}

function infoLog(message, data = null) {
  if (ENV.LOG_LEVEL === "verbose" || ENV.LOG_LEVEL === "info") {
    console.log(`[${ENVIRONMENT.toUpperCase()}] ${message}`, data || "");
  }
}

function errorLog(message, error = null) {
  console.error(`[${ENVIRONMENT.toUpperCase()}] ${message}`, error || "");
}

// Initial log on loading
debugLog(`Backend Environment Detection: ${ENVIRONMENT}`, {
  dbHost: ENV.DB_HOST,
  dbPort: ENV.DB_PORT,
  httpPort: ENV.HTTP_PORT,
  corsOrigins: ENV.CORS_ORIGINS,
  debug: ENV.DEBUG,
});

export { debugLog, ENV, ENVIRONMENT, errorLog, infoLog };
