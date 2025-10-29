#!/usr/bin/env node

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

      // 2. Remove commented-out console.log statements
      content = content.replace(/^\s*\/\/\s*console\.log.*$/gm, () => {
        this.removedDebugLogs++;
        return "";
      });

      // 3. Remove debug console.log statements (but keep production ones)
      content = content.replace(
        /^\s*console\.log\(.*(?:DEBUG|debug|📝|✅|🔧).*\);?\s*$/gm,
        () => {
          this.removedDebugLogs++;
          return "";
        }
      );

      // 4. Remove development comments
      content = content.replace(
        /^\s*\/\/\s*(TODO|FIXME|DEBUG|HACK|NOTE|TEMP).*$/gm,
        () => {
          this.removedComments++;
          return "";
        }
      );

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
      console.error(`❌ Error processing ${filePath}:`, error.message);
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
      console.error(`❌ Error processing directory ${dirPath}:`, error.message);
    }
  }

  createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = `backup-${timestamp}`;

    console.log(`📦 Creating backup in ${backupDir}/`);

    // This would be implemented with a proper backup strategy
    // For now, we rely on git for version control
    console.log(
      `💡 Use 'git stash' or create a backup branch before running cleanup`
    );
  }

  run() {
    console.log("🚀 Starting staging cleanup process...\n");

    const startTime = Date.now();

    // Process current directory
    this.processDirectory(".");

    const endTime = Date.now();

    console.log("\n📊 Cleanup Summary:");
    console.log(`   • Files processed: ${this.processedFiles}`);
    console.log(`   • JSDoc blocks removed: ${this.removedJsDocBlocks}`);
    console.log(`   • Debug logs removed: ${this.removedDebugLogs}`);
    console.log(`   • Dev comments removed: ${this.removedComments}`);
    console.log(`   • Time taken: ${endTime - startTime}ms`);

    if (this.processedFiles > 0) {
      console.log("\n✅ Staging cleanup completed successfully!");
      console.log("💡 Review changes with: git diff");
      console.log(
        '💡 Commit changes with: git add . && git commit -m "chore: Clean staging branch for production"'
      );
    } else {
      console.log("\n🎯 No files needed cleaning - already production ready!");
    }

    // Self-cleanup: Remove development scripts from staging
    this.removeDevelopmentScripts();
  }

  /**
   * Remove development scripts and tools from staging branch
   */
  removeDevelopmentScripts() {
    try {
      console.log("\n🧹 Removing development scripts from staging branch...");

      // Check if scripts directory exists
      if (fs.existsSync("scripts/")) {
        // Remove the entire scripts directory
        fs.rmSync("scripts/", { recursive: true, force: true });
        console.log("✅ Development scripts removed");
        console.log("🎯 Staging branch is now production-ready!");
      } else {
        console.log("🎯 No development scripts found - already clean!");
      }
    } catch (error) {
      console.error(
        "⚠️  Warning: Could not remove scripts directory:",
        error.message
      );
      console.log("💡 You may need to remove it manually: rm -rf scripts/");
    }
  }
}

// Run the cleanup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleanup = new StagingCleanup();
  cleanup.run();
}

export default StagingCleanup;
