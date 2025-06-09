import { describe, it } from 'vitest'
import { Link } from './Link'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Link', () => {
  describe('Accessibility', () => {
    it('should not have accessibility violations - basic link', async () => {
      const { container } = renderWithProviders(<Link href="/test">Basic Link</Link>)
      await expectNoAxeViolations(container)
    })

    it('should not have accessibility violations - external link', async () => {
      const { container } = renderWithProviders(
        <Link href="https://external.com" target="_blank">
          External Link
        </Link>,
      )
      await expectNoAxeViolations(container)
    })

    it('should not have accessibility violations - link with aria-label', async () => {
      const { container } = renderWithProviders(
        <Link href="/test" aria-label="Custom accessible label">
          Link with ARIA
        </Link>,
      )
      await expectNoAxeViolations(container)
    })

    it('should not have accessibility violations - link with complex content', async () => {
      const { container } = renderWithProviders(
        <Link href="/profile">
          <span>Go to</span> <strong>User Profile</strong>
        </Link>,
      )
      await expectNoAxeViolations(container)
    })

    it('should not have accessibility violations - link with title', async () => {
      const { container } = renderWithProviders(
        <Link href="/help" title="Get help and support">
          Help
        </Link>,
      )
      await expectNoAxeViolations(container)
    })
  })
})
