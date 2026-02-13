/**
 * Tests for Conventional Commits Parser and Versioning Logic
 *
 * Run with: npx vitest run build/versioning/conventionalCommits.test.js
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'

import {
  parseConventionalCommit,
  getVersionBumpType,
  getChangelogSection,
  calculateNewVersion,
  VALID_TYPES,
} from './conventionalCommits.js'

import { updateChangelog, updatePackageVersion, getCurrentVersion } from './updateChangelog.js'

describe('parseConventionalCommit', () => {
  describe('valid titles', () => {
    it('parses simple feat title', () => {
      const result = parseConventionalCommit('feat: add new component')
      expect(result.isValid).toBe(true)
      expect(result.type).toBe('feat')
      expect(result.scope).toBe(null)
      expect(result.isBreaking).toBe(false)
      expect(result.description).toBe('add new component')
    })

    it('parses fix title with scope', () => {
      const result = parseConventionalCommit('fix(SDK-123): resolve validation issue')
      expect(result.isValid).toBe(true)
      expect(result.type).toBe('fix')
      expect(result.scope).toBe('SDK-123')
      expect(result.isBreaking).toBe(false)
      expect(result.description).toBe('resolve validation issue')
    })

    it('parses breaking change with !', () => {
      const result = parseConventionalCommit('feat!: redesign JSX component props')
      expect(result.isValid).toBe(true)
      expect(result.type).toBe('feat')
      expect(result.isBreaking).toBe(true)
      expect(result.description).toBe('redesign JSX component props')
    })

    it('parses breaking change with scope and !', () => {
      const result = parseConventionalCommit('fix(api)!: change response format')
      expect(result.isValid).toBe(true)
      expect(result.type).toBe('fix')
      expect(result.scope).toBe('api')
      expect(result.isBreaking).toBe(true)
      expect(result.description).toBe('change response format')
    })

    it('parses all valid commit types', () => {
      VALID_TYPES.forEach(type => {
        const result = parseConventionalCommit(`${type}: test description`)
        expect(result.isValid).toBe(true)
        expect(result.type).toBe(type)
      })
    })

    it('parses scope with special characters', () => {
      const result = parseConventionalCommit('feat(path/to/thing): add feature')
      expect(result.isValid).toBe(true)
      expect(result.scope).toBe('path/to/thing')
    })
  })

  describe('invalid titles', () => {
    it('rejects uppercase types', () => {
      const result = parseConventionalCommit('FEAT: add component')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('must be lowercase')
    })

    it('rejects invalid types', () => {
      const result = parseConventionalCommit('feature: add component')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('does not match')
    })

    it('rejects missing description', () => {
      const result = parseConventionalCommit('feat:')
      expect(result.isValid).toBe(false)
    })

    it('rejects missing colon', () => {
      const result = parseConventionalCommit('feat add component')
      expect(result.isValid).toBe(false)
    })

    it('rejects missing space after colon', () => {
      const result = parseConventionalCommit('feat:add component')
      expect(result.isValid).toBe(false)
    })

    it('handles null input', () => {
      const result = parseConventionalCommit(null)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('required')
    })

    it('handles empty string', () => {
      const result = parseConventionalCommit('')
      expect(result.isValid).toBe(false)
    })
  })
})

describe('getVersionBumpType', () => {
  describe('pre-release (0.x.x)', () => {
    it('returns minor for feat', () => {
      const parsed = parseConventionalCommit('feat: add feature')
      expect(getVersionBumpType(parsed, true)).toBe('minor')
    })

    it('returns patch for fix', () => {
      const parsed = parseConventionalCommit('fix: fix bug')
      expect(getVersionBumpType(parsed, true)).toBe('patch')
    })

    it('returns minor for breaking changes (pre-1.0)', () => {
      const parsed = parseConventionalCommit('feat!: breaking change')
      expect(getVersionBumpType(parsed, true)).toBe('minor')
    })

    it('returns none for chore', () => {
      const parsed = parseConventionalCommit('chore: update deps')
      expect(getVersionBumpType(parsed, true)).toBe('none')
    })

    it('returns none for docs', () => {
      const parsed = parseConventionalCommit('docs: update readme')
      expect(getVersionBumpType(parsed, true)).toBe('none')
    })
  })

  describe('post-release (1.x.x+)', () => {
    it('returns major for breaking changes', () => {
      const parsed = parseConventionalCommit('feat!: breaking change')
      expect(getVersionBumpType(parsed, false)).toBe('major')
    })
  })

  it('returns none for invalid parsed result', () => {
    const parsed = parseConventionalCommit('invalid')
    expect(getVersionBumpType(parsed)).toBe('none')
  })
})

describe('getChangelogSection', () => {
  it('returns breaking for breaking changes', () => {
    const parsed = parseConventionalCommit('feat!: breaking')
    expect(getChangelogSection(parsed)).toBe('breaking')
  })

  it('returns features for feat', () => {
    const parsed = parseConventionalCommit('feat: feature')
    expect(getChangelogSection(parsed)).toBe('features')
  })

  it('returns fixes for fix', () => {
    const parsed = parseConventionalCommit('fix: fix')
    expect(getChangelogSection(parsed)).toBe('fixes')
  })

  it('returns chores for other types', () => {
    const parsed = parseConventionalCommit('chore: chore')
    expect(getChangelogSection(parsed)).toBe('chores')

    const parsed2 = parseConventionalCommit('docs: docs')
    expect(getChangelogSection(parsed2)).toBe('chores')
  })

  it('returns none for invalid', () => {
    const parsed = parseConventionalCommit('invalid')
    expect(getChangelogSection(parsed)).toBe('none')
  })
})

describe('calculateNewVersion', () => {
  it('bumps major version', () => {
    expect(calculateNewVersion('1.2.3', 'major')).toBe('2.0.0')
    expect(calculateNewVersion('0.26.0', 'major')).toBe('1.0.0')
  })

  it('bumps minor version', () => {
    expect(calculateNewVersion('1.2.3', 'minor')).toBe('1.3.0')
    expect(calculateNewVersion('0.26.0', 'minor')).toBe('0.27.0')
  })

  it('bumps patch version', () => {
    expect(calculateNewVersion('1.2.3', 'patch')).toBe('1.2.4')
    expect(calculateNewVersion('0.26.0', 'patch')).toBe('0.26.1')
  })

  it('returns same version for none', () => {
    expect(calculateNewVersion('1.2.3', 'none')).toBe('1.2.3')
  })
})

describe('updateChangelog', () => {
  let tempDir
  let changelogPath

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'changelog-test-'))
    changelogPath = path.join(tempDir, 'CHANGELOG.md')
  })

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('creates new version section when it does not exist', () => {
    fs.writeFileSync(
      changelogPath,
      '# Changelog\n\n## 0.26.0\n\n### Features & Enhancements\n\n- Old feature\n',
    )

    updateChangelog(changelogPath, '0.27.0', 'features', 'New feature')

    const result = fs.readFileSync(changelogPath, 'utf8')
    expect(result).toContain('## 0.27.0')
    expect(result).toContain('- New feature')
  })

  it('adds to existing version section', () => {
    fs.writeFileSync(
      changelogPath,
      '# Changelog\n\n## 0.27.0\n\n### Features & Enhancements\n\n- Existing feature\n',
    )

    updateChangelog(changelogPath, '0.27.0', 'features', 'Another feature')

    const result = fs.readFileSync(changelogPath, 'utf8')
    expect(result).toContain('- Another feature')
    expect(result).toContain('- Existing feature')
  })

  it('creates new section in existing version', () => {
    fs.writeFileSync(
      changelogPath,
      '# Changelog\n\n## 0.27.0\n\n### Features & Enhancements\n\n- Feature\n',
    )

    updateChangelog(changelogPath, '0.27.0', 'fixes', 'Bug fix')

    const result = fs.readFileSync(changelogPath, 'utf8')
    expect(result).toContain('### Fixes')
    expect(result).toContain('- Bug fix')
  })

  it('returns false for none section', () => {
    fs.writeFileSync(changelogPath, '# Changelog\n')
    const result = updateChangelog(changelogPath, '0.27.0', 'none', 'description')
    expect(result).toBe(false)
  })
})

describe('package.json version helpers', () => {
  let tempDir
  let packagePath

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'package-test-'))
    packagePath = path.join(tempDir, 'package.json')
    fs.writeFileSync(packagePath, JSON.stringify({ name: 'test', version: '0.26.0' }, null, 2))
  })

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('gets current version', () => {
    expect(getCurrentVersion(packagePath)).toBe('0.26.0')
  })

  it('updates version', () => {
    updatePackageVersion(packagePath, '0.27.0')
    expect(getCurrentVersion(packagePath)).toBe('0.27.0')
  })
})
