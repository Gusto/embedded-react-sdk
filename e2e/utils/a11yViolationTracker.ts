import type { Page } from '@playwright/test'
import { getAxeViolations } from './a11y'

export interface A11yViolation {
  ruleId: string
  impact: string | null | undefined
  help: string
  helpUrl: string
  /** CSS target selector for the offending node, as reported by axe. */
  target: string
  /** Where this violation was first observed -- see getCallerLabel/'initial page load'. */
  firstSeenAt: string
  /**
   * Other locations where the same violation (same rule + target, target
   * normalized to ignore React's per-render auto-generated ids) recurred.
   * Populated instead of pushing a duplicate entry -- a single broken shared
   * component (e.g. an Alert rendered on every step) would otherwise produce
   * one near-identical entry per screen in the flow.
   */
  recurredAt: string[]
}

// React assigns a fresh auto id (`useId`) on every mount, e.g. `_r_78_` or,
// prefixed by react-aria, `react-aria9538091323-_r_eq_`. Stripping these
// before deduping means the *same* structural violation on two different
// screens (necessarily different mounts, so different ids) collapses to one
// entry instead of looking like two distinct issues.
const AUTO_ID_PATTERN = /react-aria\d+-_r_[0-9a-z]+_|_r_[0-9a-z]+_/gi

function dedupeKey(ruleId: string, target: string): string {
  return `${ruleId}::${target.replace(AUTO_ID_PATTERN, '<id>')}`
}

/**
 * Collects axe violations across every checkpoint in a single test -- initial
 * page load, every `waitForLoadingComplete` call, and (via the caller) the
 * final page state -- so a11y issues on screens a test passes through but
 * never ends on don't go unnoticed the way they would checking only the
 * final state.
 *
 * A plain class rather than something scoped per-`Page`: Playwright workers
 * are separate OS processes with no shared memory, and within one worker
 * tests run strictly sequentially, so a single process-wide instance never
 * sees two tests' checks interleaved. `reset()` at the start of each test
 * (see `localTestFixture.ts`) is what keeps results from leaking between
 * tests, not any per-page bookkeeping.
 */
export class A11yViolationTracker {
  private violations: A11yViolation[] = []
  private seen = new Map<string, A11yViolation>()

  /** Clears all collected violations. Call at the start of every test. */
  reset(): void {
    this.violations = []
    this.seen.clear()
  }

  /**
   * Runs axe against the current page and records any violations under
   * `location`. Never throws -- a failed axe run (e.g. the page navigated
   * away mid-check) is silently skipped rather than crashing the caller.
   */
  async check(page: Page, location: string): Promise<void> {
    const axeViolations = await getAxeViolations(page).catch(() => [])

    for (const violation of axeViolations) {
      for (const node of violation.nodes) {
        const target = node.target.join(' ')
        const key = dedupeKey(violation.id, target)
        const existing = this.seen.get(key)

        if (existing) {
          if (location !== existing.firstSeenAt && !existing.recurredAt.includes(location)) {
            existing.recurredAt.push(location)
          }
          continue
        }

        const record: A11yViolation = {
          ruleId: violation.id,
          impact: violation.impact,
          help: violation.help,
          helpUrl: violation.helpUrl,
          target,
          firstSeenAt: location,
          recurredAt: [],
        }
        this.seen.set(key, record)
        this.violations.push(record)
      }
    }
  }

  getViolations(): readonly A11yViolation[] {
    return this.violations
  }

  format(): string {
    return this.violations
      .map(v => {
        const recurrence = v.recurredAt.length > 0 ? ` (also at: ${v.recurredAt.join(', ')})` : ''
        return (
          `${v.ruleId} (${v.impact}): ${v.help}\n` +
          `    - ${v.target}\n` +
          `    ${v.helpUrl}\n` +
          `    first seen at: ${v.firstSeenAt}${recurrence}`
        )
      })
      .join('\n\n')
  }
}

/** Process-wide singleton used by waitForLoadingComplete and localTestFixture. */
export const a11yViolationTracker = new A11yViolationTracker()
