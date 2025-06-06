import { describe, it, expect } from 'vitest'
import { run } from 'axe-core'
import type { AxeResults } from 'axe-core'
import { Badge } from './Badge'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

// Helper function to run axe on a container
const runAxe = async (container: Element): Promise<AxeResults> => {
  return await run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  })
}

describe('Badge', () => {
  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic badge',
        render: () => <Badge>Default Badge</Badge>,
      },
      {
        name: 'success status badge',
        render: () => <Badge status="success">Success Badge</Badge>,
      },
      {
        name: 'warning status badge',
        render: () => <Badge status="warning">Warning Badge</Badge>,
      },
      {
        name: 'error status badge',
        render: () => <Badge status="error">Error Badge</Badge>,
      },
      {
        name: 'info status badge',
        render: () => <Badge status="info">Info Badge</Badge>,
      },
      {
        name: 'badge with aria-label',
        render: () => <Badge aria-label="User status indicator">Online</Badge>,
      },
      {
        name: 'badge with custom styling',
        render: () => <Badge className="custom-badge-style">Custom Badge</Badge>,
      },
      {
        name: 'complex badge content',
        render: () => (
          <Badge status="success" aria-label="3 notifications">
            <span>3</span>
          </Badge>
        ),
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ render }) => {
        const { container } = renderWithProviders(render())
        const results = await runAxe(container)
        expect(results.violations).toHaveLength(0)
      },
    )
  })
})
