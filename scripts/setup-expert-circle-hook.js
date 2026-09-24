#!/usr/bin/env node

/**
 * Sets up a git pre-commit hook to auto-generate expert-circle-builder.html
 * Run: node scripts/setup-expert-circle-hook.js
 */

const fs = require('fs');
const path = require('path');

const hookDir = path.join(__dirname, '../.git/hooks');
const hookFile = path.join(hookDir, 'pre-commit');

// Create .git/hooks directory if it doesn't exist
if (!fs.existsSync(hookDir)) {
  fs.mkdirSync(hookDir, { recursive: true });
}

// Read existing hook if it exists
let existingHook = '';
if (fs.existsSync(hookFile)) {
  existingHook = fs.readFileSync(hookFile, 'utf8');
}

// Add our generation command if not already present
const generationCommand = 'node scripts/generate-expert-circle-html.js';
if (!existingHook.includes(generationCommand)) {
  const hookContent = `#!/bin/bash

# Auto-generate expert-circle-builder.html if source files changed
MODIFIED_FILES=$(git diff --cached --name-only)

if echo "$MODIFIED_FILES" | grep -q "sdk-app/src/design/prototypes/expert-circle-builder/.*\\(tsx\\|ts\\|scss\\)$"; then
  echo "📝 Generating expert-circle-builder.html..."
  ${generationCommand}
  git add expert-circle-builder.html 2>/dev/null || true
fi

${existingHook}
`;

  fs.writeFileSync(hookFile, hookContent, 'utf8');
  fs.chmodSync(hookFile, 0o755);
  console.log('✅ Git pre-commit hook installed!');
  console.log('   The expert-circle-builder.html will now auto-generate when you commit changes.');
} else {
  console.log('ℹ️  Hook already set up.');
}
