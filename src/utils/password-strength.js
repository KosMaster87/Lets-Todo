/**
 * @fileoverview Password strength calculation utilities
 * @description Provides functions to evaluate and categorize password strength
 * @module password-strength
 */

import { DEBUG_MODE } from "./constants.js";

/**
 * @function logPasswordValidation
 * @description Logs password validation status for debugging
 * @param {string} action - The action being logged
 * @param {string} details - Additional details to log
 * @returns {void} No return value - performs logging side effect
 */
const logPasswordValidation = (action, details = "") => {
  if (DEBUG_MODE) {
    console.log(
      `[Password Validation] ${action}${details ? ": " + details : ""}`
    );
  }
};

/**
 * @function calculatePasswordScore
 * @description Calculates numerical password strength score based on criteria
 * @param {string} password - Password string to evaluate
 * @returns {number} Score from 0-5 based on password complexity
 */
const calculatePasswordScore = (password) => {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score;
};

/**
 * @function getStrengthLevel
 * @description Maps numerical score to strength level with CSS class and text
 * @param {number} score - Numerical password score (0-5)
 * @returns {Object} Object with class and text properties for strength level
 */
const getStrengthLevel = (score) => {
  if (score <= 1) return { class: "weak", text: "Weak" };
  if (score <= 2) return { class: "fair", text: "Fair" };
  if (score <= 3) return { class: "good", text: "Good" };
  return { class: "strong", text: "Strong" };
};

/**
 * @function calculatePasswordStrength
 * @description Calculates complete password strength analysis
 * @param {string} password - Password string to analyze
 * @returns {Object} Strength object with class and text properties
 */
export const calculatePasswordStrength = (password) => {
  const score = calculatePasswordScore(password);
  const strength = getStrengthLevel(score);

  logPasswordValidation("Password strength calculated", strength.text);
  return strength;
};
