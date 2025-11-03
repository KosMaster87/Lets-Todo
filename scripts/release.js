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

  execCommand(command, silent = false, throwOnError = true) {
    try {
      const result = execSync(command, {
        cwd: this.projectRoot,
        encoding: "utf8",
        stdio: silent ? "pipe" : "inherit",
      });
      return result?.toString().trim();
    } catch (error) {
      if (throwOnError) {
        throw error;
      }
      process.exit(1);
    }
  }

  isValidVersion(version) {
    const semverRegex =
      /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    return semverRegex.test(version);
  }

  getCurrentVersion() {
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(this.packageJsonPath, "utf8")
      );
      this.currentVersion = packageJson.version;
      return this.currentVersion;
    } catch (error) {
      process.exit(1);
    }
  }

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
    } catch (error) {
      process.exit(1);
    }
  }

  generateChangelog(fromVersion, toVersion) {
    let lastTag;
    try {
      const allTags = execSync("git tag --sort=-version:refname", {
        cwd: this.projectRoot,
        encoding: "utf8",
        stdio: "pipe",
      })
        .toString()
        .trim()
        .split("\n")
        .filter((tag) => tag.trim());

      if (allTags.length > 0) {
        lastTag = allTags[0];
      } else {
        lastTag = null;
      }
    } catch (error) {
      lastTag = null;
    }

    let gitLogCommand;
    if (lastTag) {
      gitLogCommand = `git log ${lastTag}..HEAD --oneline --no-merges`;
    } else {
      gitLogCommand = `git log --oneline --no-merges -n 20`;
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
      commits = "";
    }

    if (!commits) {
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

    commitLines.forEach((line) => {
      const commit = line.replace(/^[a-f0-9]+\s/, ""); // Remove hash

      if (commit.match(/^chore[\(:]/i)) {
        return;
      }

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
      } else if (commit.match(/^(docs|doc)[\(:]/i)) {
        return;
      } else if (commit.match(/^(style|format)[\(:]/i)) {
        return;
      } else if (commit.match(/^(test|tests)[\(:]/i)) {
        return;
      } else {
        changes.other.push(commit);
      }
    });

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

    const hasChanges =
      changes.added.length > 0 ||
      changes.changed.length > 0 ||
      changes.fixed.length > 0 ||
      changes.security.length > 0 ||
      changes.removed.length > 0 ||
      changes.other.length > 0;

    if (!hasChanges) {
      changelogEntry += "- Minor updates and improvements\n\n";
    }

    return changelogEntry;
  }

  updateChangelog(newEntry) {
    let existingChangelog = "";

    if (fs.existsSync(this.changelogPath)) {
      existingChangelog = fs.readFileSync(this.changelogPath, "utf8");
    } else {
      existingChangelog = `# Changelog - Let's Todo API\n\nAll notable changes to the Let's Todo API will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n`;
    }

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

    this.releaseNotes = newEntry.split("\n").slice(2); // Remove version header
  }

  validateGitState() {
    const currentBranch = this.execCommand("git branch --show-current", true);
    if (currentBranch !== "staging") {
      process.exit(1);
    }

    const status = this.execCommand("git status --porcelain", true);
    if (status) {
      process.exit(1);
    }

    this.execCommand("git fetch origin");

    const behind = this.execCommand(
      "git rev-list --count HEAD..origin/staging",
      true
    );
    if (parseInt(behind) > 0) {
      process.exit(1);
    }
  }

  createReleaseBranch(version) {
    const releaseBranch = `release/v${version}`;

    this.execCommand(`git checkout -b ${releaseBranch}`);

    this.execCommand("git add package.json CHANGELOG.md");
    this.execCommand(`git commit -m "chore: Release API v${version}"`);

    this.execCommand(`git tag -a v${version} -m "Release API v${version}"`);

    this.execCommand(`git push origin ${releaseBranch}`);
    this.execCommand(`git push origin v${version}`);

    return releaseBranch;
  }

  mergeToProduction(releaseBranch, version) {
    this.execCommand("git checkout production");
    this.execCommand("git pull origin production");

    try {
      this.execCommand(
        `git merge ${releaseBranch} --no-ff -m "Release API v${version}"`,
        true,
        true
      );
    } catch (error) {
      const conflicts = this.execCommand(
        "git diff --name-only --diff-filter=U",
        true,
        false
      );

      if (conflicts) {
        const conflictFiles = conflicts.split("\n").filter((f) => f.trim());

        conflictFiles.forEach((file) => {
          if (
            file === "package.json" ||
            file === "CHANGELOG.md" ||
            file === "scripts/release.js"
          ) {
            this.execCommand(`git checkout --theirs ${file}`, false, false);
          }
        });

        this.execCommand("git add .", false, false);
        this.execCommand(
          `git commit -m "Release API v${version}"`,
          false,
          false
        );
      } else {
        throw error;
      }
    }

    this.execCommand("git push origin production");
  }

  createGitHubRelease(version) {
    try {
      this.execCommand("gh --version", true);

      const releaseBody = this.releaseNotes.join("\n").trim();

      const releaseCommand = `gh release create v${version} --title "API Release v${version}" --notes "${releaseBody}" --target production`;
      this.execCommand(releaseCommand);
    } catch (error) {}
  }

  cleanup(releaseBranch) {
    try {
      this.execCommand("git checkout production");

      this.execCommand(`git branch -D ${releaseBranch}`);

      const keepReleaseBranches = process.env.KEEP_RELEASE_BRANCHES === "true";
      if (!keepReleaseBranches) {
        this.execCommand(`git push origin --delete ${releaseBranch}`);
      } else {
      }
    } catch (error) {}
  }

  async release(version) {
    if (!this.isValidVersion(version)) {
      process.exit(1);
    }

    this.getCurrentVersion();
    this.newVersion = version;

    this.validateGitState();

    const changelogEntry = this.generateChangelog(this.currentVersion, version);

    this.updatePackageVersion(version);
    this.updateChangelog(changelogEntry);

    const releaseBranch = this.createReleaseBranch(version);

    this.mergeToProduction(releaseBranch, version);

    this.createGitHubRelease(version);

    this.cleanup(releaseBranch);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const version = process.argv[2];

  if (!version) {
    process.exit(1);
  }

  const releaseManager = new BackendReleaseManager();
  releaseManager.release(version).catch((error) => {
    process.exit(1);
  });
}

export default BackendReleaseManager;
