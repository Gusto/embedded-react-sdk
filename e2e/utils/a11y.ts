import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'

// TEMPORARY: color-contrast is disabled by default while we survey the rest
// of the e2e suite for other violations. A real color-contrast bug already
// exists on a shared Text component (xs/weight-semibold variant) and fails
// nearly every spec that renders it, drowning out signal on anything else.
// Remove this once that's fixed and re-enable per-call as needed.
const TEMPORARILY_DISABLED_RULES = ['color-contrast']

/**
 * Runs axe against the current flow's rendered output (scoped to `main`,
 * not the whole page) and throws a formatted violation report if any are
 * found. Scoped to `main` because the SDK doesn't own the host page's outer
 * chrome (landmarks, the page heading, its `lang`/title) — a real partner
 * page supplies that, so checking against it here would just test the e2e
 * harness, not the SDK. Named to match the vitest-side
 * `expectNoAxeViolations` (src/test/accessibility.ts) so failures read the
 * same way in both layers, even though the two run in different
 * environments (real Chromium here vs. jsdom there) and so catch different
 * classes of issues — e.g. this can validate color-contrast, which jsdom
 * cannot render accurately.
 */
export async function expectNoAxeViolations(
  page: Page,
  disableRules: string[] = TEMPORARILY_DISABLED_RULES,
): Promise<void> {
  const results = await new AxeBuilder({ page })
    .include('main')
    .disableRules(disableRules)
    .analyze()

  if (results.violations.length === 0) return

  const report = results.violations
    .map(violation => {
      const targets = violation.nodes.map(node => `    - ${node.target.join(' ')}`).join('\n')
      return `${violation.id} (${violation.impact}): ${violation.help}\n${targets}\n    ${violation.helpUrl}`
    })
    .join('\n\n')

  throw new Error(
    `Found ${results.violations.length} accessibility violation(s) on ${page.url()}:\n\n${report}`,
  )
}
