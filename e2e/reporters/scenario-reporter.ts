import type { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter'
import { mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'

interface PhaseTimings {
  provisioningMs: number
  bodyMs: number
}

interface TestEntry {
  title: string
  status: string
  durationMs: number
  timings: PhaseTimings
}

interface ScenarioResult {
  passed: number
  failed: number
  skipped: number
  durationMs: number
  tests: TestEntry[]
}

interface DomainResult {
  scenarios: Record<string, ScenarioResult>
  summary: { passed: number; failed: number; skipped: number }
}

interface ReportData {
  runId: string
  startedAt: string
  finishedAt: string
  domains: Record<string, DomainResult>
  summary: { passed: number; failed: number; skipped: number }
}

function emptyScenarioResult(): ScenarioResult {
  return { passed: 0, failed: 0, skipped: 0, durationMs: 0, tests: [] }
}

function emptyDomainResult(): DomainResult {
  return { scenarios: {}, summary: { passed: 0, failed: 0, skipped: 0 } }
}

function extractAnnotation(test: TestCase, type: string): string | undefined {
  return test.annotations.find(a => a.type === type)?.description ?? undefined
}

function extractPhaseTimings(test: TestCase, totalDurationMs: number): PhaseTimings {
  let provisioningMs = 0
  for (const annotation of test.annotations) {
    if (annotation.type !== 'timing' || !annotation.description) continue
    try {
      const parsed = JSON.parse(annotation.description) as {
        phase?: string
        durationMs?: number
      }
      if (parsed.phase === 'provisioning' && typeof parsed.durationMs === 'number') {
        provisioningMs = parsed.durationMs
      }
    } catch {
      // Malformed timing annotation; ignore so reporter never fails the run.
    }
  }
  const bodyMs = Math.max(0, totalDurationMs - provisioningMs)
  return { provisioningMs, bodyMs }
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

class ScenarioReporter implements Reporter {
  private startedAt = ''
  private domains: Record<string, DomainResult> = {}

  onBegin(): void {
    this.startedAt = new Date().toISOString()
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const domain = extractAnnotation(test, 'tag')?.replace(/^@/, '') ?? 'untagged'
    const scenarioName = extractAnnotation(test, 'scenario') ?? 'default'
    const statusBucket =
      result.status === 'passed' ? 'passed' : result.status === 'skipped' ? 'skipped' : 'failed'

    const domainResult = (this.domains[domain] ??= emptyDomainResult())
    const scenarioResult = (domainResult.scenarios[scenarioName] ??= emptyScenarioResult())

    scenarioResult[statusBucket]++
    scenarioResult.durationMs += result.duration
    scenarioResult.tests.push({
      title: test.title,
      status: result.status,
      durationMs: result.duration,
      timings: extractPhaseTimings(test, result.duration),
    })
  }

  async onEnd(_result: FullResult): Promise<void> {
    const finishedAt = new Date().toISOString()

    const totalSummary = { passed: 0, failed: 0, skipped: 0 }
    for (const domainResult of Object.values(this.domains)) {
      domainResult.summary = { passed: 0, failed: 0, skipped: 0 }
      for (const scenario of Object.values(domainResult.scenarios)) {
        domainResult.summary.passed += scenario.passed
        domainResult.summary.failed += scenario.failed
        domainResult.summary.skipped += scenario.skipped
      }
      totalSummary.passed += domainResult.summary.passed
      totalSummary.failed += domainResult.summary.failed
      totalSummary.skipped += domainResult.summary.skipped
    }

    const report: ReportData = {
      runId: process.env.GITHUB_RUN_ID || `local-${Date.now()}`,
      startedAt: this.startedAt,
      finishedAt,
      domains: this.domains,
      summary: totalSummary,
    }

    const outputPath = resolve(process.cwd(), 'e2e/reports/results.json')
    mkdirSync(dirname(outputPath), { recursive: true })
    writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8')

    this.writeTimingSummary(report)
  }

  private writeTimingSummary(report: ReportData): void {
    const lines: string[] = []
    lines.push('# E2E Phase Timings')
    lines.push('')
    lines.push('Per-test wall time split into `provisioning` (creating a fresh demo company')
    lines.push('and decorating it) vs `body` (everything else: navigation, SDK rendering, user')
    lines.push('interactions, backend round-trips). Provisioning that dominates body time is the')
    lines.push('signal that we should be sharing companies across the suite.')
    lines.push('')
    lines.push(`Run: ${report.runId}`)
    lines.push(`Started: ${report.startedAt}`)
    lines.push(`Finished: ${report.finishedAt}`)
    lines.push('')

    for (const [domain, domainResult] of Object.entries(report.domains)) {
      lines.push(`## Domain: ${domain}`)
      lines.push('')
      let domainProvisioning = 0
      let domainBody = 0
      let domainTotal = 0
      let testCount = 0

      for (const [scenarioName, scenarioResult] of Object.entries(domainResult.scenarios)) {
        lines.push(`### Scenario: ${scenarioName}`)
        lines.push('')
        lines.push('| Test | Status | Provisioning | Body | Total |')
        lines.push('|------|--------|--------------|------|-------|')

        for (const test of scenarioResult.tests) {
          lines.push(
            `| ${test.title} | ${test.status} | ${formatMs(test.timings.provisioningMs)} | ${formatMs(test.timings.bodyMs)} | ${formatMs(test.durationMs)} |`,
          )
          domainProvisioning += test.timings.provisioningMs
          domainBody += test.timings.bodyMs
          domainTotal += test.durationMs
          testCount++
        }
        lines.push('')
      }

      const provisioningPct =
        domainTotal > 0 ? Math.round((domainProvisioning / domainTotal) * 100) : 0
      lines.push(
        `**Domain totals (${testCount} tests):** ${formatMs(domainProvisioning)} provisioning + ${formatMs(domainBody)} body = ${formatMs(domainTotal)} (provisioning is ${provisioningPct}% of wall time)`,
      )
      lines.push('')
    }

    const summaryPath = resolve(process.cwd(), 'e2e/reports/timings.md')
    mkdirSync(dirname(summaryPath), { recursive: true })
    writeFileSync(summaryPath, lines.join('\n'), 'utf-8')
  }
}

export default ScenarioReporter
