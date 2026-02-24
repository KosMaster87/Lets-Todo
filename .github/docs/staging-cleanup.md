# Staging Cleanup Script

## 🎯 Purpose

This script automatically converts development code to production-ready code by removing:

- JSDoc documentation blocks
- Debug console.log statements
- Development comments (TODO, FIXME, DEBUG, etc.)
- Commented-out code

**Keeps:**

- Essential error handling (try-catch blocks)
- Production console.log for server startup and errors
- Important business logic comments

## 🚀 Usage

### NPM Scripts (Recommended)

```bash
# Clean current staging branch
npm run staging:cleanup

# Full workflow: merge feature branch and cleanup
npm run staging:prepare
```

### Direct Execution

```bash
# Node.js version (more intelligent)
node scripts/staging-cleanup.js

# Bash version (simpler, faster)
./scripts/staging-cleanup.sh
```

## 📋 Workflow

1. **Development Branch (`feature/main-feature`)**

   - Full JSDoc documentation
   - Debug logs and console outputs
   - Developer comments and TODOs
   - Extensive code comments

2. **Staging Branch (`staging`)**
   - Production-ready code
   - Minimal comments
   - No debug output
   - Clean, professional codebase

## 🔧 What Gets Removed

### JSDoc Blocks

```javascript
// REMOVED
/**
 * This is a detailed function description
 * @param {string} param - Parameter description
 * @returns {boolean} Return value description
 */
```

### Debug Console Logs

```javascript
// REMOVED
console.log("DEBUG: User data:", userData);
console.log("🔧 Configuration loaded:", config);
// console.log('Commented debug log');
```

### Development Comments

```javascript
// REMOVED
// TODO: Implement better error handling
// FIXME: This is a temporary solution
// DEBUG: Check if this condition works
// HACK: Quick fix for deployment
```

## ✅ What Stays

### Production Logs

```javascript
// KEPT
console.log("Server started on port 3000");
console.error("Database connection failed:", error);
```

### Error Handling

```javascript
// KEPT
try {
  // Business logic
} catch (error) {
  res.status(500).json({ error: "Internal server error" });
}
```

### Essential Comments

```javascript
// KEPT - Important business logic explanation
// Calculate tax based on user location
const tax = calculateTax(amount, userLocation);
```

## 📊 Results

**API Project:**

- 25 files processed
- 212 JSDoc blocks removed
- 26 debug logs removed
- 1,173 lines reduced

**App Project:**

- 111 files processed
- 1,346 JSDoc blocks removed
- 33 debug logs removed
- 27 dev comments removed
- 5,346 lines reduced

## 🎯 Portfolio Benefits

1. **Shows Professional Understanding**

   - Demonstrates knowledge of production vs development code
   - Understanding of clean code principles

2. **Automation Skills**

   - Custom tooling development
   - Build process optimization

3. **DevOps Mindset**
   - Automated deployment preparation
   - Consistent code transformation

## ⚠️ Safety

- Always run on the `staging` branch
- Use git to track changes: `git diff`
- Test thoroughly before deployment
- Keep `feature/main-feature` as your documented version

## 🔄 Update Workflow

```bash
# 1. Develop on feature branch (with full documentation)
git checkout feature/main-feature
# ... make changes ...
git commit -m "feat: Add new feature with documentation"

# 2. Merge to staging and cleanup for production
git checkout staging
git merge feature/main-feature
npm run staging:cleanup

# 3. Review and deploy
git diff  # Review changes
git add .
git commit -m "chore: Prepare staging for production deployment"
git push origin staging
```

This approach demonstrates both development best practices (thorough documentation) and production readiness (clean, optimized code).
