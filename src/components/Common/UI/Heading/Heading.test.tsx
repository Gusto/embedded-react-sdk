import { describe, it, expect } from 'vitest'
import { run } from 'axe-core'
import type { AxeResults } from 'axe-core'
import { Heading } from './Heading'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

// Helper function to run axe on a container
const runAxe = async (container: Element): Promise<AxeResults> => {
  return await run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  })
}

describe('Heading', () => {
  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'h1 heading',
        render: () => <Heading as="h1">Main Title</Heading>,
      },
      {
        name: 'h2 heading',
        render: () => <Heading as="h2">Section Title</Heading>,
      },
      {
        name: 'h3 heading',
        render: () => <Heading as="h3">Subsection Title</Heading>,
      },
      {
        name: 'h4 heading',
        render: () => <Heading as="h4">Minor Heading</Heading>,
      },
      {
        name: 'h5 heading',
        render: () => <Heading as="h5">Small Heading</Heading>,
      },
      {
        name: 'h6 heading',
        render: () => <Heading as="h6">Smallest Heading</Heading>,
      },
      {
        name: 'heading styled as different level',
        render: () => (
          <Heading as="h1" styledAs="h3">
            H1 styled as H3
          </Heading>
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
