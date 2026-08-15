#!/usr/bin/env node

/**
 * @fileoverview Staging branch cleanup script
 * @description Cleans up development artifacts, comments, and debug logs from staging branch
 * to prepare for production deployment.
 *
 * @module staging-cleanup
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class StagingCleanup {
  constructor() {
    this.processedFiles = 0;
    this.removedJsDocBlocks = 0;
    this.removedDebugLogs = 0;
    this.removedComments = 0;
  }

  processFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, "utf8");
      const originalContent = content;

      // 1. Remove JSDoc blocks ()
      content = content.replace(/\/\*\*[\s\S]*?\*\//g, (match) => {
        // Keep JSDoc for main module exports or critical API documentation
        if (match.includes("@module") || match.includes("@api")) {
          return match;
        }
        this.removedJsDocBlocks++;
        return "";
      });

      // 2. Remove ALL single-line comments (// comments)
      content = content.replace(/^\s*\/\/.*$/gm, () => {
        this.removedComments++;
        return "";
      });

      // 3. Remove ALL console statements (production ready)
      content = content.replace(
        /^\s*console\.(log|warn|info|error|debug)\([\s\S]*?\);?\s*$/gm,
        () => {
          this.removedDebugLogs++;
          return "";
        }
      );

      // 4. Disable DEBUG_MODE for production
      content = content.replace(/export const DEBUG_MODE = true;/g, () => {
        this.removedDebugLogs++;
        return "export const DEBUG_MODE = false;";
      });

      // 5. Clean up multiple empty lines (max 2 consecutive)
      content = content.replace(/\n\s*\n\s*\n+/g, "\n\n");

      // 6. Remove trailing whitespace
      content = content.replace(/[ \t]+$/gm, "");

      // Only write if content changed
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, "utf8");
        this.processedFiles++;
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  }

  processDirectory(dirPath, excludeDirs = ["node_modules", ".git", "docs"]) {
    try {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip excluded directories
          if (!excludeDirs.includes(item)) {
            this.processDirectory(fullPath, excludeDirs);
          }
        } else if (item.endsWith(".js") && !item.includes(".min.")) {
          this.processFile(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error processing directory ${dirPath}:`, error.message);
    }
  }

  createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = `backup-${timestamp}`;

    console.log(`Creating backup in ${backupDir}/`);

    // This would be implemented with a proper backup strategy
    // For now, we rely on git for version control
    console.log(`Use 'git stash' or create a backup branch before running cleanup`);
  }

  run() {
    console.log("Starting staging cleanup process...\n");

    const startTime = Date.now();

    // Process current directory
    this.processDirectory(".");

    const endTime = Date.now();

    console.log("\nCleanup Summary:");
    console.log(` • Files processed: ${this.processedFiles}`);
    console.log(` • JSDoc blocks removed: ${this.removedJsDocBlocks}`);
    console.log(` • Debug logs removed: ${this.removedDebugLogs}`);
    console.log(` • Dev comments removed: ${this.removedComments}`);
    console.log(` • Time taken: ${endTime - startTime}ms`);

    if (this.processedFiles > 0) {
      console.log("\nStaging cleanup completed successfully!");
      console.log("Review changes with: git diff");
      console.log(
        'Commit changes with: git add . && git commit -m "chore: Clean staging branch for production"'
      );
    } else {
      console.log("\nNo files needed cleaning - already production ready!");
    }

    // Self-cleanup: Remove development scripts from staging
    this.removeDevelopmentScripts();
  }

  /**
   * Remove development scripts and tools from staging branch
   */
  removeDevelopmentScripts() {
    try {
      console.log("\nRemoving development files and directories from staging branch...");

      let removedCount = 0;

      // Remove development/deployment directories
      ["deploy", "nginx", "docs", "docs-api", "docs-app"].forEach((dir) => {
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
          console.log(`Removed directory: ${dir}/`);
          removedCount++;
        }
      });

      // Remove specific development scripts but keep release.js
      const scriptsToRemove = [
        "scripts/staging-cleanup.js",
        "scripts/README.md",
        "scripts/script-overview.md",
      ];

      scriptsToRemove.forEach((scriptPath) => {
        if (fs.existsSync(scriptPath)) {
          fs.unlinkSync(scriptPath);
          console.log(`Removed file: ${scriptPath}`);
          removedCount++;
        }
      });

      // Remove development documentation files
      [
        "copilot-instructions.md",
        "overview.md",
        "DEPLOYMENT.md",
        "jsdoc.config.json",
        "nodemon.json",
      ].forEach((file) => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
          console.log(`Removed file: ${file}`);
          removedCount++;
        }
      });

      if (removedCount > 0) {
        console.log(`Removed ${removedCount} development items - staging is now production-ready!`);
      } else {
        console.log("No development files found - already clean!");
      }
    } catch (error) {
      console.error(" Warning: Could not remove development files:", error.message);
      console.log("You may need to remove them manually");
    }
  }
}

// Run the cleanup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleanup = new StagingCleanup();
  cleanup.run();
}

export default StagingCleanup;
