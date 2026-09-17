/**
 * @fileoverview Pure helpers for opaque session tokens.
 */

import { createHash, randomBytes } from "node:crypto";

export const createSessionToken = () => randomBytes(32).toString("base64url");

export const hashSessionToken = (token) => {
  return createHash("sha256").update(token).digest("hex");
};
