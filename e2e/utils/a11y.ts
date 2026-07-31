import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'

/**
 * Runs axe against the current page state and throws a formatted violation
 * report if any are found. Named to match the vitest-side
 * `expectNoAxeViolations` (src/test/accessibility.ts) so failures read the
 * same way in both layers, even though the two run in different
 * environments (real Chromium here vs. jsdom there) and so catch different
 * classes of issues — e.g. this can validate color-contrast and full-page
 * landmark structure, which jsdom cannot render accurately.
 */
export async function expectNoAxeViolations(
  page: Page,
  disableRules: string[] = [],
): Promise<void> {
  const results = await new AxeBuilder({ page }).disableRules(disableRules).analyze()

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
