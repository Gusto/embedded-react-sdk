import type { AxeResults, ElementContext, RunOptions } from 'axe-core'
import type { RenderResult } from '@testing-library/react'

/**
 * Configuration options for runAxe functions
 */
export interface AxeTestOptions {
  /** Custom rules to override defaults */
  rules?: RunOptions['rules']
  /** Whether to use integration test defaults (more permissive) */
  isIntegrationTest?: boolean
  /** Custom axe context */
  context?: ElementContext
  /** Custom axe options */
  options?: Omit<RunOptions, 'rules'>
}

declare global {
  /**
   * Runs axe accessibility tests on a container and returns results
   * @param container - The DOM container to test
   * @param options - Configuration options
   * @returns Promise<AxeResults> - Raw axe results
   */
  function runAxe(container?: Element | Document, options?: AxeTestOptions): Promise<AxeResults>

  /**
   * Runs axe and asserts there are no violations
   * @param container - The DOM container to test
   * @param options - Configuration options
   * @throws - If there are accessibility violations
   */
  function expectNoAxeViolations(
    container?: Element | Document,
    options?: AxeTestOptions,
  ): Promise<void>

  /**
   * Runs axe and logs violations without failing the test
   * Useful for discovery/monitoring during development
   * @param container - The DOM container to test
   * @param options - Configuration options
   * @param testName - Optional test name for logging context
   * @returns Promise<AxeResults> - Raw axe results for further processing
   */
  function runAxeAndLog(
    container?: Element | Document,
    options?: AxeTestOptions,
    testName?: string,
  ): Promise<AxeResults>

  /**
   * Helper function for testing with @testing-library/react render results
   * @param renderResult - Result from @testing-library/react render function
   * @param options - Configuration options
   * @returns Promise<AxeResults> - Raw axe results
   */
  function runAxeOnRender(renderResult: RenderResult, options?: AxeTestOptions): Promise<AxeResults>

  /**
   * Helper function for asserting no violations with @testing-library/react render results
   * @param renderResult - Result from @testing-library/react render function
   * @param options - Configuration options
   */
  function expectNoAxeViolationsOnRender(
    renderResult: RenderResult,
    options?: AxeTestOptions,
  ): Promise<void>

  /**
   * Helper function for logging violations with @testing-library/react render results
   * @param renderResult - Result from @testing-library/react render function
   * @param options - Configuration options
   * @param testName - Optional test name for logging context
   * @returns Promise<AxeResults> - Raw axe results
   */
  function runAxeAndLogOnRender(
    renderResult: RenderResult,
    options?: AxeTestOptions,
    testName?: string,
  ): Promise<AxeResults>
}
