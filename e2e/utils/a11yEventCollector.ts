import type { Page } from '@playwright/test'
import { getAxeViolations } from './a11y'

export interface A11yEventViolation {
  ruleId: string
  impact: string | null | undefined
  help: string
  helpUrl: string
  /** CSS target selector for the offending node, as reported by axe. */
  target: string
  /** SDK event type the violation was first observed on. */
  firstSeenEvent: string
  /**
   * Other SDK event types where the same violation (same rule + target,
   * `target` normalized to ignore React's per-render auto-generated ids)
   * recurred. Populated instead of pushing a duplicate entry -- a single
   * broken shared component (e.g. an Alert rendered on every step) would
   * otherwise produce one near-identical entry per screen in the flow.
   */
  recurredOnEvents: string[]
}

export interface A11yEventCollector {
  getViolations: () => readonly A11yEventViolation[]
  /** Resolves once every axe run queued so far has finished. */
  awaitPending: () => Promise<void>
  format: () => string
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
 * Exposes `__e2eOnSdkEvent` on the browser `window`, called by the e2e
 * harness's top-level `onEvent` handler (`e2e/main.tsx`) on every SDK event.
 * Runs the same axe check as the end-of-test gate, but against whatever
 * screen the flow is on for that event -- catching violations on
 * intermediate screens a test navigates through but never ends on (the
 * final-state check in `localTestFixture.ts` only sees the last screen).
 *
 * Violations are collected rather than thrown: the exposed function is
 * invoked fire-and-forget from a synchronous React event handler in the
 * browser, so there's no call site to propagate a rejection to. Runs are
 * serialized on a queue so SDK events firing in quick succession don't
 * evaluate axe concurrently against a page that's mid-transition.
 */
export async function createA11yEventCollector(page: Page): Promise<A11yEventCollector> {
  const violations: A11yEventViolation[] = []
  const seen = new Map<string, A11yEventViolation>()
  let queue: Promise<void> = Promise.resolve()

  await page.exposeFunction('__e2eOnSdkEvent', (eventType: string) => {
    queue = queue.then(async () => {
      const axeViolations = await getAxeViolations(page).catch(() => [])

      for (const violation of axeViolations) {
        for (const node of violation.nodes) {
          const target = node.target.join(' ')
          const key = dedupeKey(violation.id, target)
          const existing = seen.get(key)

          if (existing) {
            if (
              eventType !== existing.firstSeenEvent &&
              !existing.recurredOnEvents.includes(eventType)
            ) {
              existing.recurredOnEvents.push(eventType)
            }
            continue
          }

          const record: A11yEventViolation = {
            ruleId: violation.id,
            impact: violation.impact,
            help: violation.help,
            helpUrl: violation.helpUrl,
            target,
            firstSeenEvent: eventType,
            recurredOnEvents: [],
          }
          seen.set(key, record)
          violations.push(record)
        }
      }
    })
  })

  return {
    getViolations: () => violations,
    awaitPending: () => queue,
    format: () =>
      violations
        .map(v => {
          const recurrence =
            v.recurredOnEvents.length > 0 ? ` (also on: ${v.recurredOnEvents.join(', ')})` : ''
          return (
            `${v.ruleId} (${v.impact}): ${v.help}\n` +
            `    - ${v.target}\n` +
            `    ${v.helpUrl}\n` +
            `    first seen on event: ${v.firstSeenEvent}${recurrence}`
          )
        })
        .join('\n\n'),
  }
}
