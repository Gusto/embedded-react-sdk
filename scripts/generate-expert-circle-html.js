#!/usr/bin/env node

/**
 * Generates a standalone HTML file from Expert Circle Builder source files
 * Run: node scripts/generate-expert-circle-html.js
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '../sdk-app/src/design/prototypes/expert-circle-builder');
const OUTPUT_FILE = path.join(__dirname, '../expert-circle-builder.html');

// Read source files
const tsxPath = path.join(SOURCE_DIR, 'ExpertCircleBuilder.tsx');
const dataPath = path.join(SOURCE_DIR, 'expertCircleMockData.ts');
const scssPath = path.join(SOURCE_DIR, 'ExpertCircleBuilder.module.scss');

if (!fs.existsSync(tsxPath) || !fs.existsSync(dataPath) || !fs.existsSync(scssPath)) {
  console.error('❌ Source files not found. Make sure you\'re running from the repo root.');
  process.exit(1);
}

const tsxContent = fs.readFileSync(tsxPath, 'utf8');
const dataContent = fs.readFileSync(dataPath, 'utf8');
const scssContent = fs.readFileSync(scssPath, 'utf8');

// Convert SCSS to CSS (simple conversion - removes variables, nesting, etc.)
let css = scssContent
  .split('\n')
  .map(line => {
    // Remove comments
    if (line.trim().startsWith('//')) return '';
    // Remove nested selectors (simple approach)
    if (line.includes('&')) return line.replace(/&/g, '');
    return line;
  })
  .join('\n')
  .replace(/\$[\w-]+/g, '#2d8659') // Replace variables with default color
  .replace(/@[^;]+;/g, '') // Remove @imports
  .replace(/\n\n+/g, '\n'); // Clean up extra newlines

// Extract mock data and convert to JS
const dataJS = dataContent
  .replace(/import type.*\n/g, '')
  .replace(/import \{[^}]*\} from.*\n/g, '')
  .replace(/export const/g, 'const');

// Extract component code and simplify for standalone use
const componentJS = tsxContent
  .replace(/import.*\n/g, '') // Remove all imports
  .replace(/type Tier.*\n/g, '') // Remove types
  .replace(/type.*\n/g, '')
  .replace(/interface.*\n/g, '')
  .replace(/export function/g, 'function')
  .replace(/: React\.ReactNode|: Tier|: Expert|: CartItem|: Category|: Screen/g, '') // Remove type annotations
  .replace(/as Tier\[\]/g, '') // Remove type assertions
  .replace(/styles\./g, 'className="')
  .replace(/"(.*?)"/g, (match) => {
    // Handle className replacements
    if (match.includes('styles')) {
      return match;
    }
    return match;
  });

// HTML template
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Expert Circle Builder - Prototype</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
        #root { height: 100vh; width: 100%; }

        ${css}
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useMemo, useEffect } = React;

        ${dataJS}

        const TIER_DESCRIPTIONS = {
            simple: 'AI-powered advisors for getting started',
            plus: 'AI + human experts for growing teams',
            premium: 'Full access to all experts — human & AI',
        };

        const EXPERT_TYPE_LABELS = {
            ai_agent: { label: 'AI Advisor', icon: '⚡' },
            internal_expert: { label: 'Internal Expert', icon: '👤' },
            external_expert: { label: 'External Expert', icon: '🎓' },
        };

        ${componentJS}

        ReactDOM.render(<ExpertCircleBuilder />, document.getElementById('root'));
    </script>
</body>
</html>`;

// Write output file
fs.writeFileSync(OUTPUT_FILE, html, 'utf8');
console.log(`✅ Generated standalone HTML: ${path.relative(process.cwd(), OUTPUT_FILE)}`);
