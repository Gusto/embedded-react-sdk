#!/usr/bin/env node

/**
 * Watches for changes to Expert Circle Builder source files and auto-generates HTML
 * Run: node scripts/watch-expert-circle.js
 *
 * This is useful during development - run in a separate terminal while developing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SOURCE_DIR = path.join(__dirname, '../sdk-app/src/design/prototypes/expert-circle-builder');
const FILES_TO_WATCH = [
  path.join(SOURCE_DIR, 'ExpertCircleBuilder.tsx'),
  path.join(SOURCE_DIR, 'expertCircleMockData.ts'),
  path.join(SOURCE_DIR, 'ExpertCircleBuilder.module.scss'),
  path.join(SOURCE_DIR, 'types.ts'),
  path.join(SOURCE_DIR, 'index.tsx'),
];

let debounceTimer;

const watchFiles = () => {
  console.log('👁️  Watching for changes in Expert Circle Builder...\n');

  FILES_TO_WATCH.forEach(file => {
    if (fs.existsSync(file)) {
      fs.watchFile(file, { interval: 1000 }, () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const fileName = path.basename(file);
          console.log(`📝 ${fileName} changed, regenerating HTML...\n`);
          try {
            execSync('node scripts/generate-expert-circle-html.js', { stdio: 'inherit' });
            console.log('✅ HTML regenerated!\n');
          } catch (error) {
            console.error('❌ Failed to regenerate HTML:', error.message, '\n');
          }
        }, 500);
      });
    }
  });
};

// Initial message
console.log('🚀 Expert Circle Builder HTML Watcher');
console.log('=====================================\n');
console.log('Press Ctrl+C to stop watching.\n');

watchFiles();

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n👋 Stopping watcher...');
  process.exit(0);
});
