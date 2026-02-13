/**
 * Changelog Update Script
 *
 * Updates CHANGELOG.md with new entries based on PR titles.
 */

import fs from 'fs'
import { CHANGELOG_SECTIONS } from './conventionalCommits.js'

/**
 * Update the changelog with a new entry
 * @param {string} changelogPath - Path to CHANGELOG.md
 * @param {string} version - Version string (e.g., "0.27.0")
 * @param {string} section - Section key: 'breaking', 'features', 'fixes', 'chores'
 * @param {string} description - Entry description
 * @returns {boolean} Whether the changelog was updated
 */
export function updateChangelog(changelogPath, version, section, description) {
  if (!section || section === 'none' || !description) {
    return false
  }

  const changelog = fs.readFileSync(changelogPath, 'utf8')
  const sectionHeader = CHANGELOG_SECTIONS[section] || CHANGELOG_SECTIONS.chores
  const entry = `- ${description}`
  const versionHeader = `## ${version}`

  let updatedChangelog

  if (changelog.includes(versionHeader)) {
    // Version section exists
    if (changelog.includes(sectionHeader)) {
      // Subsection exists, add entry after header
      const sectionRegex = new RegExp(
        '(' + sectionHeader.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')\\n\\n',
      )
      updatedChangelog = changelog.replace(sectionRegex, `$1\n\n${entry}\n`)
    } else {
      // Subsection doesn't exist, add it after version header
      updatedChangelog = changelog.replace(
        `${versionHeader}\n`,
        `${versionHeader}\n\n${sectionHeader}\n\n${entry}\n`,
      )
    }
  } else {
    // Version section doesn't exist, create it
    const newSection = `${versionHeader}\n\n${sectionHeader}\n\n${entry}\n`
    updatedChangelog = changelog.replace('# Changelog\n', `# Changelog\n\n${newSection}\n`)
  }

  fs.writeFileSync(changelogPath, updatedChangelog)
  return true
}

/**
 * Update package.json with new version
 * @param {string} packagePath - Path to package.json
 * @param {string} newVersion - New version string
 */
export function updatePackageVersion(packagePath, newVersion) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  pkg.version = newVersion
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n')
}

/**
 * Get current version from package.json
 * @param {string} packagePath - Path to package.json
 * @returns {string} Current version string
 */
export function getCurrentVersion(packagePath) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  return pkg.version
}

// CLI interface
const args = process.argv.slice(2)
const command = args[0]

if (command === 'update-changelog') {
  const [, changelogPath, version, section, ...descParts] = args
  const description = descParts.join(' ')

  if (!changelogPath || !version || !section || !description) {
    console.error(
      'Usage: node updateChangelog.js update-changelog <changelog-path> <version> <section> <description>',
    )
    process.exit(1)
  }

  const updated = updateChangelog(changelogPath, version, section, description)
  console.log(updated ? `Updated CHANGELOG.md with: - ${description}` : 'No update needed')
  process.exit(updated ? 0 : 1)
}

if (command === 'update-version') {
  const [, packagePath, newVersion] = args

  if (!packagePath || !newVersion) {
    console.error('Usage: node updateChangelog.js update-version <package-path> <new-version>')
    process.exit(1)
  }

  updatePackageVersion(packagePath, newVersion)
  console.log(`Updated package.json to version ${newVersion}`)
  process.exit(0)
}

if (command === 'get-version') {
  const [, packagePath] = args

  if (!packagePath) {
    console.error('Usage: node updateChangelog.js get-version <package-path>')
    process.exit(1)
  }

  console.log(getCurrentVersion(packagePath))
  process.exit(0)
}
