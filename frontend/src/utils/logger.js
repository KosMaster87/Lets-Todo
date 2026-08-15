/**
 * @fileoverview Debug-gated console logging
 * @description Logs only when DEBUG_MODE is enabled (local development)
 * @module utils/logger
 */

import { DEBUG_MODE } from "./constants.js";

/**
 * Logs to the console only in debug mode (local development).
 * @param {...*} args - Values to log
 */
export const debugLog = (...args) => {
  if (DEBUG_MODE) console.log(...args);
};
