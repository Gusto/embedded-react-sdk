/**
 * Conventional Commits Parser and Validator
 *
 * Shared logic for parsing and validating conventional commit messages.
 * Used by both PR title validation and auto-versioning workflows.
 */

// Valid conventional commit types (must be lowercase)
export const VALID_TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
]

// Changelog section mapping
export const CHANGELOG_SECTIONS = {
  breaking: '### Breaking Changes',
  features: '### Features & Enhancements',
  fixes: '### Fixes',
  chores: '### Chores & Maintenance',
}

/**
 * Parse a conventional commit title and extract its components
 * @param {string} title - The PR title or commit message
 * @returns {object} Parsed result with type, scope, isBreaking, description, and isValid
 */
export function parseConventionalCommit(title) {
  const result = {
    type: null,
    scope: null,
    isBreaking: false,
    description: null,
    isValid: false,
    error: null,
  }

  if (!title || typeof title !== 'string') {
    result.error = 'Title is required and must be a string'
    return result
  }

  // Check for uppercase types (common mistake)
  const uppercaseMatch = title.match(/^([A-Z]+)(\(|!|:)/)
  if (uppercaseMatch) {
    result.error = `Type "${uppercaseMatch[1]}" must be lowercase: "${uppercaseMatch[1].toLowerCase()}"`
    return result
  }

  // Build regex pattern for conventional commits
  const pattern = new RegExp(
    `^(${VALID_TYPES.join('|')})` + // type (lowercase)
      `(?:\\(([\\w\\-\\/,]+)\\))?` + // optional scope in parentheses
      `(!)?` + // optional breaking change indicator
      `:\\s+(.+)$`, // colon, space, and description
  )

  const match = title.match(pattern)

  if (!match) {
    result.error = `Title does not match conventional commits format. Expected: type(optional-scope): description`
    return result
  }

  result.type = match[1]
  result.scope = match[2] || null
  result.isBreaking = match[3] === '!'
  result.description = match[4]
  result.isValid = true

  return result
}

/**
 * Determine the version bump type based on parsed commit
 * @param {object} parsed - Result from parseConventionalCommit
 * @param {boolean} isPreRelease - Whether we're in 0.x.x pre-release (default: true)
 * @returns {string} Version bump type: 'major', 'minor', 'patch', or 'none'
 */
export function getVersionBumpType(parsed, isPreRelease = true) {
  if (!parsed.isValid) {
    return 'none'
  }

  if (parsed.isBreaking) {
    // Per semver spec: During 0.x.x, breaking changes bump MINOR
    return isPreRelease ? 'minor' : 'major'
  }

  if (parsed.type === 'feat') {
    return 'minor'
  }

  if (parsed.type === 'fix') {
    return 'patch'
  }

  // Other types (docs, chore, refactor, etc.) don't bump version
  return 'none'
}

/**
 * Get the changelog section for a parsed commit
 * @param {object} parsed - Result from parseConventionalCommit
 * @returns {string} Changelog section key: 'breaking', 'features', 'fixes', 'chores', or 'none'
 */
export function getChangelogSection(parsed) {
  if (!parsed.isValid) {
    return 'none'
  }

  if (parsed.isBreaking) {
    return 'breaking'
  }

  if (parsed.type === 'feat') {
    return 'features'
  }

  if (parsed.type === 'fix') {
    return 'fixes'
  }

  // Other types go to chores
  return 'chores'
}

/**
 * Calculate the new version based on current version and bump type
 * @param {string} currentVersion - Current semver version (e.g., "0.26.0")
 * @param {string} bumpType - Version bump type: 'major', 'minor', 'patch'
 * @returns {string} New version string
 */
export function calculateNewVersion(currentVersion, bumpType) {
  const [major, minor, patch] = currentVersion.split('.').map(Number)

  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`
    case 'minor':
      return `${major}.${minor + 1}.0`
    case 'patch':
      return `${major}.${minor}.${patch + 1}`
    default:
      return currentVersion
  }
}
