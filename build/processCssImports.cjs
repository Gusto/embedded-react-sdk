#!/usr/bin/env node

/**
 * This script transforms CSS module imports in compiled JS files.
 * It runs after the TypeScript compilation step and modifies import statements.
 */

const { transformFileSync } = require('@babel/core')
const { readFileSync, writeFileSync } = require('fs')
const { resolve, join } = require('path')
const { sync: globSync } = require('glob')
const transformCssModuleImports = require('./transformCssModuleImports.cjs')

// Path to the dist directory
const DIST_DIR = resolve(process.cwd(), 'dist')

// Find all JS files in the dist directory
const jsFiles = globSync(join(DIST_DIR, '**/*.js'))

console.log(`Processing ${jsFiles.length} JavaScript files...`)

let transformedCount = 0

// Process each file
jsFiles.forEach(filePath => {
  // Read the file content
  const originalContent = readFileSync(filePath, 'utf-8')

  // Skip files that don't import .module.scss
  if (!originalContent.includes('.module.scss')) {
    return
  }

  try {
    // Transform the file using our plugin
    const result = transformFileSync(filePath, {
      plugins: [transformCssModuleImports],
      babelrc: false,
      configFile: false,
    })

    // Only write the file if it was actually changed
    if (result && result.code !== originalContent) {
      writeFileSync(filePath, result.code)
      transformedCount++
      console.log(`Transformed: ${filePath}`)
    }
  } catch (error) {
    console.error(`Error transforming ${filePath}:`, error)
  }
})

console.log(`Successfully transformed ${transformedCount} files`)
