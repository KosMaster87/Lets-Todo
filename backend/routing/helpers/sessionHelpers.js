/**
 * @fileoverview Persistent, revocable user sessions.
 */

import { userPool } from "./../../db.js";
import { hashSessionToken, createSessionToken } from "./sessionTokenHelpers.js";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const ensureSessionsTable = async () => {
  await userPool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token_hash CHAR(64) NOT NULL UNIQUE,
      expires_at BIGINT NOT NULL,
      created BIGINT NOT NULL,
      INDEX idx_sessions_token (token_hash),
      INDEX idx_sessions_expiry (expires_at),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
};

export const createUserSession = async (userId) => {
  const token = createSessionToken();
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_MS;
  await userPool.query(
    `INSERT INTO sessions (user_id, token_hash, expires_at, created) VALUES (?, ?, ?, ?)`,
    [userId, hashSessionToken(token), expiresAt, now]
  );
  return token;
};

export const validateUserSession = async (token) => {
  if (!token) return { valid: false, reason: "No session cookie found" };

  try {
    const [rows] = await userPool.query(
      `SELECT users.id, users.email
       FROM sessions
       INNER JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ? AND sessions.expires_at > ?`,
      [hashSessionToken(token), Date.now()]
    );
    return rows.length ? createValidSession(rows[0]) : createInvalidSession();
  } catch (error) {
    return { valid: false, reason: "Database error", error };
  }
};

export const revokeUserSession = async (token) => {
  if (!token) return;
  await userPool.query(`DELETE FROM sessions WHERE token_hash = ?`, [hashSessionToken(token)]);
};

export const revokeAllUserSessions = async (userId) => {
  await userPool.query(`DELETE FROM sessions WHERE user_id = ?`, [userId]);
};

const createValidSession = (user) => ({
  valid: true,
  userId: String(user.id),
  email: user.email,
});

const createInvalidSession = () => ({ valid: false, reason: "Session expired or invalid" });
