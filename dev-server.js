// lets-todo/app/dev-server.js

/**
 * @fileoverview Development Server for Let's Todo App
 * @module dev-server
 */

/**
 * Development Server for Let's Todo App
 * Features:
 * - Static file serving
 * - SPA routing fallback
 * - LiveReload integration for development
 * - Automatic port selection
 * - Cookie domain compatibility with backend
 */

import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import connectLivereload from "connect-livereload";
import { createServer } from "net";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const DEFAULT_PORT = 5500;

/**
 * Configure LiveReload middleware for development environment
 * Only active when NODE_ENV is not production
 */
if (process.env.NODE_ENV !== "production") {
  app.use(
    connectLivereload({
      port: 35729,
    })
  );
}

/**
 * Serve static files from project root directory
 */
app.use(express.static(__dirname));

/**
 * SPA fallback route handler
 * Serves index.html for all routes to enable client-side routing
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

/**
 * Start the development server with automatic port detection
 * Binds to 127.0.0.1 for cookie domain compatibility with backend
 * @async
 * @function startServer
 * @returns {Promise<void>} Promise that resolves when server starts successfully
 */
const startServer = async () => {
  try {
    const port = await findAvailablePort(DEFAULT_PORT);
    app.listen(port, "127.0.0.1", () => {
      console.log(`🚀 lets-todo-app running on http://127.0.0.1:${port}`);
      if (port !== DEFAULT_PORT) {
        console.log(`⚠️  Port ${DEFAULT_PORT} occupied, using port ${port}`);
      }
      if (process.env.NODE_ENV !== "production") {
        console.log(`🔄 LiveReload active on port 35729`);
      }
      console.log(`🔗 Backend API: http://127.0.0.1:3000`);
      console.log(`🍪 Cookie domain compatibility: ✅`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error.message);
    process.exit(1);
  }
};

/**
 * Find the next available port starting from a given port
 * @param {number} startPort - Starting port number to check
 * @returns {Promise<number>} Promise resolving to an available port number
 * @throws {Error} When no available port is found within range
 */
const findAvailablePort = async (startPort) => {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
    if (port > startPort + 10) {
      throw new Error("No available port found");
    }
  }
  return port;
};

/**
 * Check if a specific port is available for use
 * @param {number} port - Port number to check
 * @returns {Promise<boolean>} Promise resolving to true if port is available
 */
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
};

startServer();
