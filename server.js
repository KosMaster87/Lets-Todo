// server.js

/**
 * Express Server for Todo App with User and Guest Session Management
 * Features:
 * - Separate database per user/guest
 * - Cookie-based authentication
 * - RESTful Todo API
 */

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ENV, ENVIRONMENT, debugLog } from "./config/environment.js";
import authRouter from "./routing/authRouter.js";
import todosRouter from "./routing/todosRouter.js";
import userRouter from "./routing/userRouter.js";
import {
  assignPoolMiddleware,
  enhancedPoolMiddleware,
} from "./middleware/poolMiddleware.js"; // assign and enhance

const app = express();

/**
 * TODO
 *
 * Strukturverbesserungen (optional)
 * Middleware setup in functions
 * Add error handler
 * Implement graceful shutdown
 */

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ENV.CORS_ORIGINS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Always log CORS configuration (even in production)
console.log("🔧 CORS configured for origins:", ENV.CORS_ORIGINS);
console.log("🔧 Environment:", ENVIRONMENT);
console.log("🔧 HTTP_PORT:", ENV.HTTP_PORT);

// User table creation skipped (already created in setup)
debugLog("Table creation skipped - already created in setup-dev-db.js");

app.use("/api", authRouter);

// User routes (no pool middleware needed - uses userPool directly)
app.use("/api/user", userRouter);

// Pool middleware for all following routes
app.use(assignPoolMiddleware);
app.use(enhancedPoolMiddleware);

// Todos router (requires req.pool from middleware)
app.use("/api/todos", todosRouter);

/**
 * 404 fallback for unknown routes
 */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/**
 * Start server and listen for incoming connections
 * Binds to all available network interfaces (0.0.0.0)
 */
app.listen(ENV.HTTP_PORT, ENV.HTTP_HOST, () => {
  // Always log the port (even in production)
  console.log(
    `✅ Server running on ${ENV.HTTP_HOST}:${ENV.HTTP_PORT} (${ENVIRONMENT})`
  );

  debugLog("Environment configuration:", {
    dbHost: ENV.DB_HOST,
    corsOrigins: ENV.CORS_ORIGINS,
    cookieDomain: ENV.COOKIE_DOMAIN,
  });
});
