// server.js

/**
 * Express-Server für Todo-App mit User- und Gast-Session-Management
 * Features:
 * - Separate Datenbank pro User/Gast
 * - Cookie-basierte Authentifizierung
 * - RESTful Todo-API
 */

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import {
  ENV,
  ENVIRONMENT,
  debugLog
} from "./config/environment.js";
import authRouter from "./routing/authRouter.js";
import todosRouter from "./routing/todosRouter.js";
import {
  assignPoolMiddleware,
  enhancedPoolMiddleware,
} from "./middleware/poolMiddleware.js"; // zuweisen und erweitern

const app = express();

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

// Immer CORS-Konfiguration loggen (auch in Production)
console.log("🔧 CORS konfiguriert für Origins:", ENV.CORS_ORIGINS);
console.log("🔧 Environment:", ENVIRONMENT);
console.log("🔧 HTTP_PORT:", ENV.HTTP_PORT);

// User-Tabelle einmalig anlegen (wird bereits beim Setup erstellt)
debugLog(
  "Tabellen-Erstellung übersprungen - bereits in setup-dev-db.js erstellt"
);

app.use("/api", authRouter);

// Pool-Middleware für alle folgenden Routen
app.use(assignPoolMiddleware);
app.use(enhancedPoolMiddleware);

// Todos-Router (benötigt req.pool von Middleware)
app.use("/api/todos", todosRouter);

/**
 * 404-Fallback für unbekannte Routen
 */
app.use((req, res) => {
  res.status(404).json({ message: "Route nicht gefunden" });
});

/**
 * Server starten und auf eingehende Verbindungen hören
 * Bindet an alle verfügbaren Netzwerk-Interfaces (0.0.0.0)
 */
app.listen(ENV.HTTP_PORT, ENV.HTTP_HOST, () => {
  // Immer den Port loggen (auch in Production)
  console.log(
    `✅ Server läuft auf ${ENV.HTTP_HOST}:${ENV.HTTP_PORT} (${ENVIRONMENT})`
  );

  debugLog("Environment-Konfiguration:", {
    dbHost: ENV.DB_HOST,
    corsOrigins: ENV.CORS_ORIGINS,
    cookieDomain: ENV.COOKIE_DOMAIN,
  });
});
