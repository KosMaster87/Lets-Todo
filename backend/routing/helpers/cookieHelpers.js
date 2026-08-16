/**
 * @fileoverview Cookie helper functions
 * @description Provides utility functions for creating and clearing cookies with appropriate options.
 * @module routing/helpers/cookieHelpers
 */

import { ENV } from "./../../config/environment.js";

/**
 * Creates cookie options for user session
 * @returns {Object} Cookie configuration options
 */
export const createCookieOptions = () => {
  const cookieOptions = {
    httpOnly: true,
    secure: ENV.COOKIE_SECURE,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };

  if (ENV.COOKIE_SECURE) cookieOptions.sameSite = "lax";
  if (ENV.COOKIE_DOMAIN) cookieOptions.domain = ENV.COOKIE_DOMAIN;

  return cookieOptions;
};

/**
 * Creates cookie clear options
 * @returns {Object} Cookie clear configuration options
 */
export const createClearCookieOptions = () => {
  const clearCookieOptions = { path: "/" };
  if (ENV.COOKIE_DOMAIN) clearCookieOptions.domain = ENV.COOKIE_DOMAIN;
  return clearCookieOptions;
};
