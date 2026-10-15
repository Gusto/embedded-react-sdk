const checkName = 'release-readiness'

async function contentAt(github, repo, ref, path) {
  const { data } = await github.rest.repos.getContent({ ...repo, path, ref })
  if (data.type !== 'file' || data.encoding !== 'base64') {
    throw new Error(`Cannot read ${path} at ${ref}`)
  }
  return Buffer.from(data.content, 'base64').toString('utf8')
}

async function versionAt(github, repo, ref) {
  const { version } = JSON.parse(await contentAt(github, repo, ref, 'package.json'))
  if (typeof version !== 'string' || !version.trim()) {
    throw new Error(`Missing package.json version at ${ref}`)
  }
  return version
}

function result(conclusion, title, summary) {
  return { conclusion, title, summary }
}

function stableVersion(version) {
  if (typeof version !== 'string' || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
    throw new Error(`Expected a stable release version, received ${version}`)
  }
  return version.split('.').map(BigInt)
}

function allowedVersions(baseVersion, recommendedVersion) {
  const [major, minor, patch] = stableVersion(baseVersion)
  const recommended = stableVersion(recommendedVersion)
  const increments = [
    [major, minor, patch + 1n],
    [major, minor + 1n, 0n],
    [major + 1n, 0n, 0n],
  ]
  return increments
    .filter(increment => {
      const difference = increment.findIndex((part, index) => part !== recommended[index])
      return difference === -1 || increment[difference] > recommended[difference]
    })
    .map(increment => increment.join('.'))
}

async function recommendedVersionAt(mainSha, cwd = process.cwd()) {
  const { execFile } = require('node:child_process')
  const { promisify } = require('node:util')
  const execute = promisify(execFile)
  const options = { cwd, timeout: 120_000, maxBuffer: 10 * 1024 * 1024 }
  const { stdout: checkedOutSha } = await execute('git', ['rev-parse', 'HEAD'], options)
  if (checkedOutSha.trim() !== mainSha) {
    throw new Error('Checked-out main is stale. Run Release Readiness again.')
  }
  const { stdout: latestTag } = await execute(
    'git',
    ['describe', '--tags', '--match=*', '--abbrev=0'],
    options,
  )
  const plugin = '--plugins.@release-it/conventional-changelog'
  const { stdout } = await execute(
    process.execPath,
    [
      require('node:path').join(require.resolve('release-it/package.json'), '../bin/release-it.js'),
      '--release-version',
      '--dry-run',
      '--no-git',
      `${plugin}.commitsOpts.from=${latestTag.trim()}`,
      `${plugin}.gitRawCommitsOpts.from=${latestTag.trim()}`,
    ],
    options,
  )
  const version = stdout.trim()
  stableVersion(version)
  return version
}

async function evaluatePullRequest(
  github,
  repo,
  pull,
  mainSha,
  recommendVersion = recommendedVersionAt,
) {
  const headSha = pull.head.sha
  const { data: comparison } = await github.rest.repos.compareCommitsWithBasehead({
    ...repo,
    basehead: `${mainSha}...${headSha}`,
    per_page: 1,
  })
  const [baseVersion, headVersion] = await Promise.all([
    versionAt(github, repo, comparison.merge_base_commit.sha),
    versionAt(github, repo, headSha),
  ])
  if (baseVersion === headVersion) {
    return result(
      'success',
      'No package version change',
      'Release-specific review is not required.',
    )
  }
  if (!['ahead', 'identical'].includes(comparison.status)) {
    return result(
      'failure',
      'Release branch is behind main',
      'Update the branch with main, refresh the changelog, then request approval of the new commit.',
    )
  }

  const recommendedVersion = await recommendVersion(mainSha)
  const allowed = allowedVersions(baseVersion, recommendedVersion)
  if (!allowed.includes(headVersion)) {
    return result(
      'failure',
      'Release version does not match release-it',
      `release-it recommends ${recommendedVersion}. Set package.json to one of: ${allowed.join(', ')}. Received ${headVersion}.`,
    )
  }
  const changelog = await contentAt(github, repo, headSha, 'CHANGELOG.md')
  const firstEntry = changelog.match(/^##[ \t]+(.+)$/m)?.[1]
  if (!firstEntry?.startsWith(`[${headVersion}]`)) {
    return result(
      'failure',
      'Changelog version does not match package.json',
      `The first CHANGELOG.md entry must be ## [${headVersion}].`,
    )
  }

  const reviews = await github.paginate(github.rest.pulls.listReviews, {
    ...repo,
    pull_number: pull.number,
    per_page: 100,
  })
  const latestDecisions = new Map()
  for (const review of [...reviews].sort((left, right) => left.id - right.id)) {
    if (['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'].includes(review.state)) {
      latestDecisions.set(review.user.login, review)
    }
  }
  let approved = false
  for (const review of latestDecisions.values()) {
    if (review.user.login === pull.user.login || review.user.type !== 'User') continue
    if (!['APPROVED', 'CHANGES_REQUESTED'].includes(review.state)) continue
    const { data } = await github.rest.repos.getCollaboratorPermissionLevel({
      ...repo,
      username: review.user.login,
    })
    if (!['write', 'maintain', 'admin'].includes(data.permission)) continue
    if (review.state === 'CHANGES_REQUESTED') {
      return result('failure', 'Changes requested', 'Resolve outstanding maintainer reviews.')
    }
    if (review.commit_id === headSha) approved = true
  }
  return approved
    ? result('success', 'Release commit approved', `${headVersion} is approved at ${headSha}.`)
    : result(
        'failure',
        'Latest release commit needs approval',
        `Ask another maintainer to approve ${headSha}. Any new commit, including an update from main, requires fresh approval.`,
      )
}

async function queueEntries(github, repo) {
  const entries = []
  let after = null
  do {
    const data = await github.graphql(
      `query($owner: String!, $repo: String!, $after: String) {
        repository(owner: $owner, name: $repo) {
          mergeQueue(branch: "main") {
            entries(first: 100, after: $after) {
              nodes { position headCommit { oid } pullRequest { number headRefOid } }
              pageInfo { hasNextPage endCursor }
            }
          }
        }
      }`,
      { ...repo, after },
    )
    const page = data.repository.mergeQueue?.entries
    entries.push(...(page?.nodes ?? []))
    after = page?.pageInfo.hasNextPage ? page.pageInfo.endCursor : null
  } while (after)
  return entries.sort((left, right) => left.position - right.position)
}

function queueMembers(entries, sha) {
  const matching = entries.filter(entry => entry.headCommit?.oid === sha)
  if (!matching.length) return []
  const position = Math.max(...matching.map(entry => entry.position))
  return entries.filter(entry => entry.position <= position)
}

async function mainCommit(github, repo) {
  const { data } = await github.rest.git.getRef({ ...repo, ref: 'heads/main' })
  return data.object.sha
}

async function stillCurrent(github, repo, pulls, mainSha) {
  if ((await mainCommit(github, repo)) !== mainSha) return false
  for (const pull of pulls) {
    const { data } = await github.rest.pulls.get({ ...repo, pull_number: pull.number })
    if (data.state !== 'open' || data.base.ref !== 'main' || data.head.sha !== pull.head.sha) {
      return false
    }
  }
  return true
}

async function report(github, repo, sha, evaluate) {
  const { data: check } = await github.rest.checks.create({
    ...repo,
    name: checkName,
    head_sha: sha,
    status: 'in_progress',
  })
  let outcome
  try {
    outcome = await evaluate()
  } catch (error) {
    outcome = result('failure', 'Unable to verify release readiness', error.message)
  }
  await github.rest.checks.update({
    ...repo,
    check_run_id: check.id,
    status: 'completed',
    conclusion: outcome.conclusion,
    output: { title: outcome.title, summary: outcome.summary },
  })
  return outcome
}

async function run({ github, context, core, recommendVersion = recommendedVersionAt }) {
  const repo = context.repo
  const mainSha = await mainCommit(github, repo)
  const pulls = await github.paginate(github.rest.pulls.list, {
    ...repo,
    state: 'open',
    base: 'main',
    per_page: 100,
  })
  const outcomes = new Map()
  let recommendation
  const cachedRecommendation = () => (recommendation ??= recommendVersion(mainSha))
  for (const pull of pulls) {
    const outcome = await report(github, repo, pull.head.sha, async () => {
      const evaluated = await evaluatePullRequest(github, repo, pull, mainSha, cachedRecommendation)
      if (!(await stillCurrent(github, repo, [pull], mainSha))) {
        return result(
          'failure',
          'PR or main changed during evaluation',
          'Run Release Readiness again.',
        )
      }
      return evaluated
    })
    outcomes.set(pull.number, { pull, outcome })
    core.info(`#${pull.number}: ${outcome.title}`)
  }

  const entries = await queueEntries(github, repo)
  const groupShas = new Set(entries.map(entry => entry.headCommit?.oid).filter(Boolean))
  for (const sha of groupShas) {
    await report(github, repo, sha, async () => {
      const members = queueMembers(entries, sha)
      const memberPulls = []
      for (const entry of members) {
        const evaluated = outcomes.get(entry.pullRequest.number)
        if (!evaluated || evaluated.pull.head.sha !== entry.pullRequest.headRefOid) {
          return result(
            'failure',
            'Merge queue changed during evaluation',
            'Run Release Readiness again.',
          )
        }
        if (evaluated.outcome.conclusion !== 'success') return evaluated.outcome
        memberPulls.push(evaluated.pull)
      }
      const currentMembers = queueMembers(await queueEntries(github, repo), sha)
      if (
        JSON.stringify(currentMembers) !== JSON.stringify(members) ||
        !(await stillCurrent(github, repo, memberPulls, mainSha))
      ) {
        return result(
          'failure',
          'Merge queue changed during evaluation',
          'Run Release Readiness again.',
        )
      }
      return result(
        'success',
        'Queued PRs are ready',
        'Approval was checked against each original PR head.',
      )
    })
  }
}

module.exports = { allowedVersions, evaluatePullRequest, recommendedVersionAt, queueMembers, run }
