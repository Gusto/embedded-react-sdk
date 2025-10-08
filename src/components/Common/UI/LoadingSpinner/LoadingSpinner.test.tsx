import { describe, it } from 'vitest'
import { LoadingSpinner } from './LoadingSpinner'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('LoadingSpinner', () => {
  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'large spinner',
        props: { size: 'lg' as const },
      },
      {
        name: 'small spinner',
        props: { size: 'sm' as const },
      },
      {
        name: 'inline spinner',
        props: { style: 'inline' as const },
      },
      {
        name: 'block spinner',
        props: { style: 'block' as const },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<LoadingSpinner {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
