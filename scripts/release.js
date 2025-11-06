#!/usr/bin/env node

/**
 * @fileoverview Production Release Script for Let's Todo API Backend
 * @description Professional release script that handles version bumping, branch management,
 * changelog generation, and GitHub releases for the backend API.
 *
 * @module release-script
 * @version 1.0.0
 * @author Let's Todo Team
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BackendReleaseManager {
  constructor() {
    this.projectRoot = path.resolve(__dirname, "..");
    this.packageJsonPath = path.join(this.projectRoot, "package.json");
    this.changelogPath = path.join(this.projectRoot, "CHANGELOG.md");
    this.currentVersion = null;
    this.newVersion = null;
    this.releaseNotes = [];
  }

  /**
   * Execute shell command with proper error handling
   */
  execCommand(command, silent = false) {
    try {
      const result = execSync(command, {
        cwd: this.projectRoot,
        encoding: "utf8",
        stdio: silent ? "pipe" : "inherit",
      });
      return result?.toString().trim();
    } catch (error) {
      console.error(`❌ Command failed: ${command}`);
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Validate semantic version format
   */
  isValidVersion(version) {
    const semverRegex =
      /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    return semverRegex.test(version);
  }

  /**
   * Get current version from package.json
   */
  getCurrentVersion() {
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(this.packageJsonPath, "utf8")
      );
      this.currentVersion = packageJson.version;
      return this.currentVersion;
    } catch (error) {
      console.error("❌ Could not read package.json");
      process.exit(1);
    }
  }

  /**
   * Update version in package.json
   */
  updatePackageVersion(newVersion) {
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(this.packageJsonPath, "utf8")
      );
      packageJson.version = newVersion;
      fs.writeFileSync(
        this.packageJsonPath,
        JSON.stringify(packageJson, null, 2) + "\n"
      );
      console.log(
        `✅ Updated package.json: ${this.currentVersion} → ${newVersion}`
      );
    } catch (error) {
      console.error("❌ Could not update package.json");
      process.exit(1);
    }
  }

  /**
   * Generate changelog based on git commits
   */
  generateChangelog(fromVersion, toVersion) {
    console.log(`📝 Generating changelog from last release to ${toVersion}...`);

    // Get the last git tag instead of package.json version
    let lastTag;
    try {
      lastTag = execSync("git describe --tags --abbrev=0", {
        cwd: this.projectRoot,
        encoding: "utf8",
        stdio: "pipe",
      })
        .toString()
        .trim();
      console.log(`📋 Found last tag: ${lastTag}`);
    } catch (error) {
      console.log("ℹ️  No previous tags found, limiting to recent commits");
      lastTag = null;
    }

    // Get commits since last version
    let gitLogCommand;
    if (lastTag) {
      gitLogCommand = `git log ${lastTag}..HEAD --oneline --no-merges`;
    } else {
      // For first release, limit to commits from the last 30 days or max 20 commits
      // This prevents including all historical commits in a monorepo
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateFilter = thirtyDaysAgo.toISOString().split("T")[0];

      console.log(
        `ℹ️  First release - limiting to commits since ${dateFilter} (last 30 days)`
      );
      gitLogCommand = `git log --since="${dateFilter}" --oneline --no-merges -n 20`;
    }

    let commits;
    try {
      commits = execSync(gitLogCommand, {
        cwd: this.projectRoot,
        encoding: "utf8",
        stdio: "pipe",
      })
        .toString()
        .trim();
    } catch (error) {
      // If command fails, fall back to recent commits only
      console.log("ℹ️  Falling back to recent commits (last 10)");
      commits = this.execCommand(`git log --oneline --no-merges -n 10`, true);
    }

    if (!commits) {
      console.log("ℹ️  No commits found for changelog");
      return [];
    }

    const commitLines = commits.split("\n").filter((line) => line.trim());
    const changes = {
      added: [],
      changed: [],
      fixed: [],
      removed: [],
      security: [],
      other: [],
    };

    // Categorize commits based on conventional commit format
    commitLines.forEach((line) => {
      const commit = line.replace(/^[a-f0-9]+\s/, ""); // Remove hash

      if (commit.match(/^(feat|feature)[\(:]/i)) {
        changes.added.push(commit.replace(/^(feat|feature)[\(:]\s*/i, ""));
      } else if (commit.match(/^fix[\(:]/i)) {
        changes.fixed.push(commit.replace(/^fix[\(:]\s*/i, ""));
      } else if (commit.match(/^(update|change|refactor)[\(:]/i)) {
        changes.changed.push(
          commit.replace(/^(update|change|refactor)[\(:]\s*/i, "")
        );
      } else if (commit.match(/^(remove|delete)[\(:]/i)) {
        changes.removed.push(commit.replace(/^(remove|delete)[\(:]\s*/i, ""));
      } else if (commit.match(/^(security|sec)[\(:]/i)) {
        changes.security.push(commit.replace(/^(security|sec)[\(:]\s*/i, ""));
      } else {
        changes.other.push(commit);
      }
    });

    // Build changelog entry
    const today = new Date().toISOString().split("T")[0];
    let changelogEntry = `## [${toVersion}] - ${today}\n\n`;

    if (changes.added.length > 0) {
      changelogEntry += "### Added\n";
      changes.added.forEach((change) => {
        changelogEntry += `- ${change}\n`;
      });
      changelogEntry += "\n";
    }

    if (changes.changed.length > 0) {
      changelogEntry += "### Changed\n";
      changes.changed.forEach((change) => {
        changelogEntry += `- ${change}\n`;
      });
      changelogEntry += "\n";
    }

    if (changes.fixed.length > 0) {
      changelogEntry += "### Fixed\n";
      changes.fixed.forEach((change) => {
        changelogEntry += `- ${change}\n`;
      });
      changelogEntry += "\n";
    }

    if (changes.security.length > 0) {
      changelogEntry += "### Security\n";
      changes.security.forEach((change) => {
        changelogEntry += `- ${change}\n`;
      });
      changelogEntry += "\n";
    }

    if (changes.removed.length > 0) {
      changelogEntry += "### Removed\n";
      changes.removed.forEach((change) => {
        changelogEntry += `- ${change}\n`;
      });
      changelogEntry += "\n";
    }

    if (changes.other.length > 0) {
      changelogEntry += "### Other\n";
      changes.other.forEach((change) => {
        changelogEntry += `- ${change}\n`;
      });
      changelogEntry += "\n";
    }

    return changelogEntry;
  }

  /**
   * Update CHANGELOG.md file
   */
  updateChangelog(newEntry) {
    let existingChangelog = "";

    // Read existing changelog if it exists
    if (fs.existsSync(this.changelogPath)) {
      existingChangelog = fs.readFileSync(this.changelogPath, "utf8");
    } else {
      // Create new changelog with header
      existingChangelog = `# Changelog - Let's Todo API\n\nAll notable changes to the Let's Todo API will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n`;
    }

    // Insert new entry after the header
    const lines = existingChangelog.split("\n");
    const headerEndIndex = lines.findIndex(
      (line, index) =>
        (index > 0 && line.startsWith("## ")) ||
        (index > 5 && line.trim() === "")
    );

    if (headerEndIndex > 0) {
      lines.splice(headerEndIndex, 0, newEntry);
    } else {
      lines.push(newEntry);
    }

    const updatedChangelog = lines.join("\n");
    fs.writeFileSync(this.changelogPath, updatedChangelog);
    console.log(`✅ Updated CHANGELOG.md`);

    // Store release notes for GitHub release
    this.releaseNotes = newEntry.split("\n").slice(2); // Remove version header
  }

  /**
   * Check if we're on the correct branch and it's clean
   */
  validateGitState() {
    console.log("🔍 Validating git state...");

    // Check if we're on staging branch
    const currentBranch = this.execCommand("git branch --show-current", true);
    if (currentBranch !== "staging") {
      console.error("❌ Must be on 'staging' branch to create release");
      console.log("💡 Run: git checkout staging");
      process.exit(1);
    }

    // Check if working directory is clean
    const status = this.execCommand("git status --porcelain", true);
    if (status) {
      console.error("❌ Working directory must be clean");
      console.log("💡 Commit or stash your changes first");
      process.exit(1);
    }

    // Ensure we have the latest staging
    console.log("📡 Fetching latest changes...");
    this.execCommand("git fetch origin");

    const behind = this.execCommand(
      "git rev-list --count HEAD..origin/staging",
      true
    );
    if (parseInt(behind) > 0) {
      console.error("❌ Your staging branch is behind origin/staging");
      console.log("💡 Run: git pull origin staging");
      process.exit(1);
    }

    console.log("✅ Git state is valid");
  }

  /**
   * Create and push release branch
   */
  createReleaseBranch(version) {
    const releaseBranch = `release/v${version}`;

    console.log(`🌿 Creating release branch: ${releaseBranch}`);

    // Create release branch from staging
    this.execCommand(`git checkout -b ${releaseBranch}`);

    // Add and commit version changes
    this.execCommand("git add package.json CHANGELOG.md");
    this.execCommand(`git commit -m "chore: Release API v${version}"`);

    // Create git tag
    this.execCommand(`git tag -a v${version} -m "Release API v${version}"`);

    // Push release branch and tag
    this.execCommand(`git push origin ${releaseBranch}`);
    this.execCommand(`git push origin v${version}`);

    console.log(`✅ Created and pushed release branch: ${releaseBranch}`);
    return releaseBranch;
  }

  /**
   * Merge release to production
   */
  mergeToProduction(releaseBranch, version) {
    console.log("🚀 Merging to production branch...");

    // Switch to production branch
    this.execCommand("git checkout production");
    this.execCommand("git pull origin production");

    try {
      // Merge release branch
      this.execCommand(
        `git merge ${releaseBranch} --no-ff -m "Release API v${version}"`
      );
    } catch (error) {
      console.log("⚠️  Merge conflicts detected, resolving automatically...");
      
      // Check for conflicts
      const conflicts = this.execCommand(
        "git diff --name-only --diff-filter=U",
        true
      );

      if (conflicts) {
        const conflictFiles = conflicts.split("\n").filter((f) => f.trim());
        console.log(`📝 Resolving conflicts in: ${conflictFiles.join(", ")}`);

        conflictFiles.forEach((file) => {
          if (
            file === "package.json" ||
            file === "CHANGELOG.md"
          ) {
            // Use incoming changes (theirs) for these files
            this.execCommand(`git checkout --theirs ${file}`);
            console.log(`✅ Resolved ${file} using incoming changes`);
          }
        });

        // Complete the merge
        this.execCommand("git add .");
        this.execCommand(
          `git commit -m "Release API v${version}"`
        );
        console.log("✅ Merge conflicts resolved automatically");
      } else {
        throw error;
      }
    }

    // Push to production
    this.execCommand("git push origin production");

    console.log("✅ Successfully merged to production");
  }

  /**
   * Create GitHub release
   */
  createGitHubRelease(version) {
    console.log("🐙 Creating GitHub release...");

    try {
      // Check if GitHub CLI is available
      this.execCommand("gh --version", true);

      // Create release notes from changelog
      const releaseBody = this.releaseNotes.join("\n").trim();

      // Create GitHub release
      const releaseCommand = `gh release create v${version} --title "API Release v${version}" --notes "${releaseBody}" --target production`;
      this.execCommand(releaseCommand);

      console.log(`✅ Created GitHub release: v${version}`);
      console.log(
        `🔗 View at: https://github.com/KosMaster87/lets-todo-api/releases/tag/v${version}`
      );
    } catch (error) {
      console.warn(
        "⚠️  Could not create GitHub release (gh CLI not available)"
      );
      console.log("💡 Install GitHub CLI or create release manually");
    }
  }

  /**
   * Cleanup: delete release branch (optional)
   */
  cleanup(releaseBranch) {
    console.log("🧹 Cleaning up...");

    try {
      // Switch back to staging
      this.execCommand("git checkout staging");

      // Delete local release branch
      this.execCommand(`git branch -d ${releaseBranch}`);

      // Optionally delete remote release branch
      const keepReleaseBranches = process.env.KEEP_RELEASE_BRANCHES === "true";
      if (!keepReleaseBranches) {
        this.execCommand(`git push origin --delete ${releaseBranch}`);
        console.log(`✅ Deleted release branch: ${releaseBranch}`);
      } else {
        console.log(`ℹ️  Keeping release branch: ${releaseBranch}`);
      }
    } catch (error) {
      console.warn("⚠️  Cleanup had issues, but release was successful");
    }
  }

  /**
   * Main release process
   */
  async release(version) {
    console.log("🚀 Starting release process...\n");
    console.log(`📦 Let's Todo API Release v${version}`);
    console.log("=".repeat(50));

    // Validate input
    if (!this.isValidVersion(version)) {
      console.error(
        "❌ Invalid version format. Use semantic versioning (e.g., 1.2.3)"
      );
      process.exit(1);
    }

    // Get current version
    this.getCurrentVersion();
    this.newVersion = version;

    console.log(`📊 Version: ${this.currentVersion} → ${version}\n`);

    // Validate git state
    this.validateGitState();

    // Generate changelog
    const changelogEntry = this.generateChangelog(this.currentVersion, version);

    // Update files
    this.updatePackageVersion(version);
    this.updateChangelog(changelogEntry);

    // Create release branch
    const releaseBranch = this.createReleaseBranch(version);

    // Merge to production
    this.mergeToProduction(releaseBranch, version);

    // Create GitHub release
    this.createGitHubRelease(version);

    // Cleanup
    this.cleanup(releaseBranch);

    console.log("\n" + "=".repeat(50));
    console.log("🎉 API RELEASE COMPLETED SUCCESSFULLY! 🎉");
    console.log("=".repeat(50));
    console.log(`✅ Version ${version} is now live on production`);
    console.log(
      `🔗 GitHub: https://github.com/KosMaster87/lets-todo-api/releases/tag/v${version}`
    );
    console.log(`🌿 Production branch updated`);
    console.log(`📝 Changelog updated`);
    console.log("\n💡 Next steps:");
    console.log("   • Deploy to your hosting platform");
    console.log("   • Update API documentation if needed");
    console.log("   • Continue development on feature/main-feature");
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const version = process.argv[2];

  if (!version) {
    console.error("❌ Please provide a version number");
    console.log("💡 Usage: npm run release -- 1.2.3");
    console.log("💡 Usage: node scripts/release.js 1.2.3");
    process.exit(1);
  }

  const releaseManager = new BackendReleaseManager();
  releaseManager.release(version).catch((error) => {
    console.error("❌ Release failed:", error.message);
    process.exit(1);
  });
}

export default BackendReleaseManager;
