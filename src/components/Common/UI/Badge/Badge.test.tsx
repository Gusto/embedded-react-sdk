import { describe, it } from 'vitest'
import { Badge } from './Badge'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Badge', () => {
  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'default badge',
        props: { children: 'Badge Text' },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<Badge {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
