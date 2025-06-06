import { describe, it, expect } from 'vitest'
import { run } from 'axe-core'
import type { AxeResults } from 'axe-core'
import { Link } from './Link'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

// Helper function to run axe on a container
const runAxe = async (container: Element): Promise<AxeResults> => {
  return await run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  })
}

describe('Link', () => {
  describe('Accessibility', () => {
    it('should not have any accessibility violations - basic link', async () => {
      const { container } = renderWithProviders(
        <Link href="https://example.com">Visit Example</Link>,
      )
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should not have any accessibility violations - external link', async () => {
      const { container } = renderWithProviders(
        <Link href="https://external.com" target="_blank" rel="noopener noreferrer">
          External Link
        </Link>,
      )
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should not have any accessibility violations - link with aria-label', async () => {
      const { container } = renderWithProviders(
        <Link href="/profile" aria-label="Go to user profile">
          Profile
        </Link>,
      )
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should not have any accessibility violations - disabled link', async () => {
      const { container } = renderWithProviders(
        <Link href="/disabled" aria-disabled="true">
          Disabled Link
        </Link>,
      )
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should not have any accessibility violations - link with description', async () => {
      const { container } = renderWithProviders(
        <div>
          <Link href="/help" aria-describedby="help-desc">
            Help Center
          </Link>
          <div id="help-desc">Get support and documentation</div>
        </div>,
      )
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })
  })
})
