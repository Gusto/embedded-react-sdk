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
      {
        name: 'small badge',
        props: { children: 'Small', size: 'small' as const },
      },
      {
        name: 'medium badge',
        props: { children: 'Medium', size: 'medium' as const },
      },
      {
        name: 'large badge',
        props: { children: 'Large', size: 'large' as const },
      },
      {
        name: 'success variant',
        props: { children: 'Success', variant: 'success' as const },
      },
      {
        name: 'warning variant',
        props: { children: 'Warning', variant: 'warning' as const },
      },
      {
        name: 'error variant',
        props: { children: 'Error', variant: 'error' as const },
      },
      {
        name: 'secondary variant',
        props: { children: 'Secondary', variant: 'secondary' as const },
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
