/**
 * @fileoverview Assigns a user database pool only after session authentication.
 */

import mysql from "mysql2/promise";
import { ENV } from "./../config/environment.js";
import { userPools } from "./../db.js";
import { sendAuthError, sendServerError } from "./../routing/helpers/responseHelpers.js";
import { getUserDbName } from "./../routing/helpers/userAccountHelpers.js";
import { validateUserSession } from "./../routing/helpers/sessionHelpers.js";

export async function assignPoolMiddleware(req, res, next) {
  try {
    const session = await validateRequestSession(req);
    if (!session.valid) return sendAuthError(res, session.reason);

    const dbName = await getUserDbName(session.userId);
    if (!dbName) return sendAuthError(res, "Invalid user session");

    req.userId = session.userId;
    req.pool = getOrCreateUserPool(session.userId, dbName);
    return next();
  } catch (error) {
    return sendServerError(res, "Server error during session check");
  }
}

const validateRequestSession = (req) => {
  return validateUserSession(req.cookies[ENV.SESSION_COOKIE_NAME]);
};

const getOrCreateUserPool = (userId, dbName) => {
  const poolKey = `user_${userId}`;
  if (!userPools[poolKey]) userPools[poolKey] = createUserPool(dbName);
  return userPools[poolKey];
};

const createUserPool = (dbName) => {
  return mysql.createPool({
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    user: ENV.DB_USER,
    password: ENV.DB_PASSWORD,
    database: dbName,
    waitForConnections: true,
    connectionLimit: 5,
  });
};
