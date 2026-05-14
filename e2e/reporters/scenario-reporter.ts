import type { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter'
import { mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'

interface TestEntry {
  title: string
  status: string
  durationMs: number
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
  }
}

export default ScenarioReporter
