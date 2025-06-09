import { run } from 'axe-core'
import type { AxeResults, ElementContext, RunOptions } from 'axe-core'
import type { RenderResult } from '@testing-library/react'
import { expect } from 'vitest'

// Extend expect with jest-axe matchers
declare module 'vitest' {
  interface Assertion {
    toHaveNoViolations(): void
  }
}

// Rules commonly disabled in component tests
const DEFAULT_DISABLED_RULES = {
  'color-contrast': { enabled: false }, // Design system colors may not meet contrast in isolation
}

// Additional rules disabled for integration tests
const INTEGRATION_TEST_DISABLED_RULES = {
  ...DEFAULT_DISABLED_RULES,
  'page-has-heading-one': { enabled: false }, // Component tests don't need page-level rules
  region: { enabled: false }, // Component tests don't need page-level rules
}

export interface AxeTestOptions {
  rules?: RunOptions['rules']
  isIntegrationTest?: boolean
  context?: ElementContext
  options?: Omit<RunOptions, 'rules'>
}

/** Runs axe accessibility tests and returns results */
export const runAxe = async (
  container: Element | Document = document,
  options: AxeTestOptions = {},
): Promise<AxeResults> => {
  const { rules: customRules, isIntegrationTest = false, context, options: axeOptions } = options

  const defaultRules = isIntegrationTest ? INTEGRATION_TEST_DISABLED_RULES : DEFAULT_DISABLED_RULES
  const rules = { ...defaultRules, ...customRules }

  return await run(context ?? container, {
    rules,
    ...axeOptions,
  })
}

/** Runs axe and uses jest-axe matcher for clear violation reporting */
export const expectNoAxeViolations = async (
  container: Element | Document = document,
  options: AxeTestOptions = {},
): Promise<void> => {
  const results = await runAxe(container, options)
  expect(results).toHaveNoViolations()
}

/** Runs axe and logs violations without failing - useful for discovery */
export const runAxeAndLog = async (
  container: Element | Document = document,
  options: AxeTestOptions = {},
  testName?: string,
): Promise<AxeResults> => {
  const results = await runAxe(container, options)

  if (results.violations.length > 0) {
    const context = testName ? ` in ${testName}` : ''
    // eslint-disable-next-line no-console
    console.warn(
      `Accessibility violations found${context}:`,
      results.violations.map(violation => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        nodes: violation.nodes.length,
        helpUrl: violation.helpUrl,
      })),
    )
  }

  return results
}

// Helper functions for @testing-library/react render results

export const runAxeOnRender = async (
  renderResult: RenderResult,
  options: AxeTestOptions = {},
): Promise<AxeResults> => {
  return runAxe(renderResult.container, options)
}

export const expectNoAxeViolationsOnRender = async (
  renderResult: RenderResult,
  options: AxeTestOptions = {},
): Promise<void> => {
  return expectNoAxeViolations(renderResult.container, options)
}

export const runAxeAndLogOnRender = async (
  renderResult: RenderResult,
  options: AxeTestOptions = {},
  testName?: string,
): Promise<AxeResults> => {
  return runAxeAndLog(renderResult.container, options, testName)
}
