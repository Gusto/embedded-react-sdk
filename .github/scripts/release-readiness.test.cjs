const assert = require('node:assert/strict')
const { test } = require('node:test')
const {
  allowedVersions,
  evaluatePullRequest,
  queueMembers,
  run,
} = require('./release-readiness.cjs')

const repo = { owner: 'example', repo: 'sdk' }
const pull = {
  number: 12,
  state: 'open',
  base: { ref: 'main' },
  head: { sha: 'head', ref: 'chore/release-1.2.4' },
  user: { login: 'author' },
}

function review(id, state, commit = 'head', login = 'reviewer') {
  return { id, state, commit_id: commit, user: { login, type: 'User' } }
}

function fixture(options = {}) {
  const {
    versions = { base: '1.2.3', head: '1.2.4' },
    status = 'ahead',
    reviews = [],
    permission = 'write',
    pull: evaluatedPull = pull,
    currentPull = evaluatedPull,
    entries = [],
    currentEntries = entries,
  } = options
  const reports = []
  let refReads = 0
  let queueReads = 0
  const github = {
    recommendVersion: async () => {
      if (options.recommendationError) throw new Error('release-it failed')
      return options.recommendedVersion ?? '1.2.4'
    },
    rest: {
      git: {
        getRef: async () => ({
          data: { object: { sha: refReads++ > 0 && options.mainMoved ? 'new-main' : 'main' } },
        }),
      },
      repos: {
        compareCommitsWithBasehead: async ({ basehead }) => {
          assert.equal(basehead, 'main...head')
          return { data: { status, merge_base_commit: { sha: 'base' } } }
        },
        getContent: async ({ ref, path }) => {
          assert.ok(['package.json', 'CHANGELOG.md'].includes(path))
          if (options.apiError) throw new Error('API unavailable')
          return {
            data: {
              type: 'file',
              encoding: 'base64',
              content: Buffer.from(
                path === 'package.json'
                  ? JSON.stringify({ version: versions[ref] })
                  : (options.changelog ??
                      `# Changelog\n\n## [${versions.head}]\n\nRelease notes\n`),
              ).toString('base64'),
            },
          }
        },
        getCollaboratorPermissionLevel: async () => ({ data: { permission } }),
      },
      pulls: {
        list: Symbol('pulls'),
        listReviews: Symbol('reviews'),
        get: async () => ({ data: currentPull }),
      },
      checks: {
        create: async parameters => {
          reports.push({ ...parameters, id: reports.length + 1 })
          return { data: { id: reports.length } }
        },
        update: async parameters => Object.assign(reports[parameters.check_run_id - 1], parameters),
      },
    },
    paginate: async endpoint => (endpoint === github.rest.pulls.list ? [evaluatedPull] : reviews),
    graphql: async () => ({
      repository: {
        mergeQueue: {
          entries: {
            nodes: queueReads++ > 0 ? currentEntries : entries,
            pageInfo: { hasNextPage: false },
          },
        },
      },
    }),
  }
  return { github, reports }
}

test('ordinary PRs pass without approval, even when main has advanced', async () => {
  const { github } = fixture({ versions: { base: '1.2.3', head: '1.2.3' }, status: 'diverged' })
  assert.equal(
    (await evaluatePullRequest(github, repo, pull, 'main', github.recommendVersion)).conclusion,
    'success',
  )
})

for (const status of ['behind', 'diverged']) {
  test(`version-changing PRs fail when ${status} from main, even with approval`, async () => {
    const { github } = fixture({ status, reviews: [review(1, 'APPROVED')] })
    const outcome = await evaluatePullRequest(github, repo, pull, 'main', github.recommendVersion)
    assert.equal(outcome.conclusion, 'failure')
    assert.equal(outcome.title, 'Release branch is behind main')
  })
}

test('version changes require approval of the current SHA after every push', async () => {
  for (const reviews of [[], [review(1, 'APPROVED', 'old-head')]]) {
    const { github } = fixture({ reviews })
    const outcome = await evaluatePullRequest(github, repo, pull, 'main', github.recommendVersion)
    assert.equal(outcome.conclusion, 'failure')
    assert.equal(outcome.title, 'Latest release commit needs approval')
  }
  const { github } = fixture({
    reviews: [review(1, 'APPROVED', 'old-head'), review(2, 'APPROVED')],
  })
  assert.equal(
    (await evaluatePullRequest(github, repo, pull, 'main', github.recommendVersion)).conclusion,
    'success',
  )
})

test('comments and pending reviews do not erase an existing approval', async () => {
  const { github } = fixture({
    reviews: [review(3, 'PENDING'), review(2, 'COMMENTED'), review(1, 'APPROVED')],
  })
  assert.equal(
    (await evaluatePullRequest(github, repo, pull, 'main', github.recommendVersion)).conclusion,
    'success',
  )
})

test('dismissal or a later request for changes supersedes approval', async () => {
  for (const state of ['DISMISSED', 'CHANGES_REQUESTED']) {
    const { github } = fixture({ reviews: [review(1, 'APPROVED'), review(2, state)] })
    assert.equal(
      (await evaluatePullRequest(github, repo, pull, 'main', github.recommendVersion)).conclusion,
      'failure',
    )
  }
})

test('another maintainer requesting changes blocks an approved release', async () => {
  const { github } = fixture({
    reviews: [review(1, 'APPROVED'), review(2, 'CHANGES_REQUESTED', 'old-head', 'other')],
  })
  assert.equal(
    (await evaluatePullRequest(github, repo, pull, 'main', github.recommendVersion)).title,
    'Changes requested',
  )
})

test('self-approval, bots, and reviewers without write access cannot approve releases', async () => {
  for (const options of [
    { reviews: [review(1, 'APPROVED', 'head', 'author')] },
    { reviews: [{ ...review(1, 'APPROVED'), user: { login: 'bot', type: 'Bot' } }] },
    { reviews: [review(1, 'APPROVED')], permission: 'read' },
    { reviews: [review(1, 'APPROVED')], permission: 'triage' },
  ]) {
    const { github } = fixture(options)
    assert.equal(
      (await evaluatePullRequest(github, repo, pull, 'main', github.recommendVersion)).conclusion,
      'failure',
    )
  }
})

test('any version change triggers the check, including a downgrade', async () => {
  const { github } = fixture({ versions: { base: '1.2.3', head: '1.2.2' } })
  assert.equal(
    (await evaluatePullRequest(github, repo, pull, 'main', github.recommendVersion)).conclusion,
    'failure',
  )
})

async function execute(options) {
  const state = fixture(options)
  await run({
    github: state.github,
    context: { repo },
    core: { info() {} },
    recommendVersion: state.github.recommendVersion,
  })
  return state.reports
}

test('the reported check is attached to the original PR head', async () => {
  const reports = await execute({ reviews: [review(1, 'APPROVED')] })
  assert.equal(reports.length, 1)
  assert.equal(reports[0].head_sha, 'head')
  assert.equal(reports[0].name, 'release-readiness')
  assert.equal(reports[0].conclusion, 'success')
})

test('main advancing during evaluation fails the check', async () => {
  const reports = await execute({ reviews: [review(1, 'APPROVED')], mainMoved: true })
  assert.equal(reports[0].conclusion, 'failure')
  assert.equal(reports[0].output.title, 'PR or main changed during evaluation')
})

test('non-release branches skip the freshness check entirely, even when main is moving', async () => {
  const nonReleasePull = { ...pull, head: { ...pull.head, ref: 'fix/off-cycle-reason-enum-hook' } }
  const reports = await execute({ pull: nonReleasePull, mainMoved: true })
  assert.equal(reports[0].conclusion, 'success')
  assert.equal(reports[0].output.title, 'Not a release branch')
})

test('a merge queue group with no release branches skips the freshness check too', async () => {
  const nonReleasePull = { ...pull, head: { ...pull.head, ref: 'fix/off-cycle-reason-enum-hook' } }
  const reports = await execute({
    pull: nonReleasePull,
    entries: [entry],
    currentEntries: [],
    mainMoved: true,
  })
  assert.deepEqual(
    reports.map(check => check.conclusion),
    ['success', 'success'],
  )
})

test('a push, close, or base change during evaluation cannot produce a passing check', async () => {
  for (const currentPull of [
    { ...pull, head: { sha: 'new-head' } },
    { ...pull, state: 'closed' },
    { ...pull, base: { ref: 'other' } },
  ]) {
    const reports = await execute({ reviews: [review(1, 'APPROVED')], currentPull })
    assert.equal(reports[0].conclusion, 'failure')
  }
})

test('API errors and missing package versions fail closed', async () => {
  for (const options of [{ apiError: true }, { versions: { base: '1.2.3' } }]) {
    const reports = await execute(options)
    assert.equal(reports[0].conclusion, 'failure')
    assert.equal(reports[0].output.title, 'Unable to verify release readiness')
  }
})

const entry = {
  position: 1,
  headCommit: { oid: 'group' },
  pullRequest: { number: 12, headRefOid: 'head' },
}

test('merge queue checks use original PR approval, not approval of the synthetic commit', async () => {
  const reports = await execute({ entries: [entry], reviews: [review(1, 'APPROVED')] })
  assert.deepEqual(
    reports.map(check => [check.head_sha, check.conclusion]),
    [
      ['head', 'success'],
      ['group', 'success'],
    ],
  )
})

test('merge queues propagate failed release approval', async () => {
  const reports = await execute({ entries: [entry] })
  assert.equal(reports[1].conclusion, 'failure')
  assert.equal(reports[1].output.title, 'Latest release commit needs approval')
})

test('merge queue membership and source changes invalidate the result', async () => {
  for (const options of [
    { entries: [entry], currentEntries: [] },
    { entries: [{ ...entry, pullRequest: { number: 12, headRefOid: 'different-head' } }] },
  ]) {
    const reports = await execute({ ...options, reviews: [review(1, 'APPROVED')] })
    assert.equal(reports[1].conclusion, 'failure')
    assert.equal(reports[1].output.title, 'Merge queue changed during evaluation')
  }
})

test('each merge group includes preceding queued PRs, but not subsequent ones', () => {
  const second = { ...entry, position: 2, headCommit: { oid: 'second' } }
  const third = { ...entry, position: 3, headCommit: { oid: 'third' } }
  assert.deepEqual(queueMembers([entry, second, third], 'second'), [entry, second])
  assert.deepEqual(queueMembers([entry, second, third], 'gone'), [])
  assert.deepEqual(queueMembers([entry, { ...second, headCommit: entry.headCommit }], 'group'), [
    entry,
    { ...second, headCommit: entry.headCommit },
  ])
})

test('release versions allow only the recommended bump or the next higher version levels', () => {
  assert.deepEqual(allowedVersions('1.2.3', '1.2.4'), ['1.2.4', '1.3.0', '2.0.0'])
  assert.deepEqual(allowedVersions('1.2.3', '1.3.0'), ['1.3.0', '2.0.0'])
  assert.deepEqual(allowedVersions('1.2.3', '2.0.0'), ['2.0.0'])
  assert.deepEqual(allowedVersions('0.56.7', '0.57.0'), ['0.57.0', '1.0.0'])
  assert.deepEqual(allowedVersions('1.2.9', '1.2.10'), ['1.2.10', '1.3.0', '2.0.0'])
  for (const version of ['1.2.4-rc.1', '1.2.4+build', '01.2.4', '', undefined]) {
    assert.throws(() => allowedVersions('1.2.3', version), /stable release version/)
  }
})

test('approved release PRs must use a permitted release-it version', async () => {
  for (const head of ['1.2.4', '1.3.0', '2.0.0']) {
    const { github } = fixture({
      versions: { base: '1.2.3', head },
      reviews: [review(1, 'APPROVED')],
    })
    const outcome = await evaluatePullRequest(github, repo, pull, 'main', github.recommendVersion)
    assert.equal(outcome.conclusion, 'success', head)
  }
  for (const head of [
    '1.2.2',
    '1.2.5',
    '1.2.6',
    '1.3.1',
    '1.4.0',
    '2.0.1',
    '3.0.0',
    '1.2.4-rc.1',
  ]) {
    const { github } = fixture({
      versions: { base: '1.2.3', head },
      reviews: [review(1, 'APPROVED')],
    })
    const outcome = await evaluatePullRequest(github, repo, pull, 'main', github.recommendVersion)
    assert.equal(outcome.title, 'Release version does not match release-it', head)
  }
  const { github } = fixture({ recommendedVersion: '1.3.0', reviews: [review(1, 'APPROVED')] })
  const outcome = await evaluatePullRequest(github, repo, pull, 'main', github.recommendVersion)
  assert.equal(outcome.title, 'Release version does not match release-it')
})

test('the first changelog entry must match the package version', async () => {
  for (const changelog of [
    '# Changelog\n\n## [1.2.3]\nOld notes\n\n## [1.2.4]\nRelease notes',
    '# Changelog\n\n## [Unreleased]\nNotes\n\n## [1.2.4]\nRelease notes',
    '# Changelog\n\n## [1.2.40]\nNotes',
    '# Changelog\n\nNo entries',
  ]) {
    const reports = await execute({ changelog, reviews: [review(1, 'APPROVED')] })
    assert.equal(reports[0].conclusion, 'failure')
    assert.equal(reports[0].output.title, 'Changelog version does not match package.json')
  }
  const reports = await execute({
    changelog:
      '# Changelog\r\n\r\n## [1.2.4](https://example.com/compare) (2026-10-15)\r\n\r\nNotes',
    reviews: [review(1, 'APPROVED')],
  })
  assert.equal(reports[0].conclusion, 'success')
})

test('release-it failures fail closed for PRs and merge groups', async () => {
  const reports = await execute({
    recommendationError: true,
    entries: [entry],
    reviews: [review(1, 'APPROVED')],
  })
  assert.deepEqual(
    reports.map(check => check.conclusion),
    ['failure', 'failure'],
  )
  assert.equal(reports[0].output.title, 'Unable to verify release readiness')
})

test('ordinary PRs do not need release-it or changelog validation', async () => {
  const reports = await execute({
    versions: { base: '1.2.3', head: '1.2.3' },
    recommendationError: true,
    changelog: '',
  })
  assert.equal(reports[0].conclusion, 'success')
})
