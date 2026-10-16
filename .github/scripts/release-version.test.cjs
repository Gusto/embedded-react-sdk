const assert = require('node:assert/strict')
const { execFileSync } = require('node:child_process')
const { mkdtempSync, readFileSync, rmSync, writeFileSync } = require('node:fs')
const { tmpdir } = require('node:os')
const { join } = require('node:path')
const { test } = require('node:test')
const { recommendedVersionAt } = require('./release-readiness.cjs')

for (const [base, message, expected] of [
  ['0.56.7', 'fix: repair payroll', '0.56.8'],
  ['0.56.7', 'feat: add payroll feature', '0.56.8'],
  ['0.56.7', 'feat!: change payroll contract', '0.57.0'],
]) {
  test(`release-it recommends ${expected} for ${message} without modifying the checkout`, async t => {
    const cwd = mkdtempSync(join(tmpdir(), 'release-version-'))
    t.after(() => rmSync(cwd, { recursive: true, force: true }))
    const git = (...args) =>
      execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
    git('init', '--initial-branch=main')
    git('config', 'user.name', 'Release Test')
    git('config', 'user.email', 'release@example.com')
    git('config', 'commit.gpgsign', 'false')
    git('config', 'tag.gpgsign', 'false')
    git('config', 'core.hooksPath', '/dev/null')
    const manifest = JSON.stringify({ name: 'release-test', version: base })
    const changelog = `# Changelog\n\n## [${base}]\n\nPrevious notes\n`
    writeFileSync(join(cwd, 'package.json'), manifest)
    writeFileSync(join(cwd, 'CHANGELOG.md'), changelog)
    writeFileSync(
      join(cwd, '.release-it.json'),
      readFileSync(join(__dirname, '../../.release-it.json')),
    )
    git('add', '.')
    git('commit', '-m', `chore: release ${base}`)
    git('tag', `v${base}`)
    git('commit', '--allow-empty', '-m', message)
    const head = git('rev-parse', 'HEAD')
    assert.equal(await recommendedVersionAt(head, cwd), expected)
    assert.equal(git('status', '--porcelain'), '')
    assert.equal(git('rev-parse', 'HEAD'), head)
    assert.equal(git('branch', '--show-current'), 'main')
    assert.equal(git('tag'), `v${base}`)
    assert.equal(readFileSync(join(cwd, 'package.json'), 'utf8'), manifest)
    assert.equal(readFileSync(join(cwd, 'CHANGELOG.md'), 'utf8'), changelog)
    await assert.rejects(recommendedVersionAt('stale-main', cwd), /Checked-out main is stale/)
  })
}
