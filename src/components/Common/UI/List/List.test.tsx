import { describe, it, expect } from 'vitest'
import { run } from 'axe-core'
import type { AxeResults } from 'axe-core'
import { UnorderedList, OrderedList } from './index'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

// Helper function to run axe on a container
const runAxe = async (container: Element): Promise<AxeResults> => {
  return await run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  })
}

const mockListItems = ['First item', 'Second item', 'Third item']

const mockComplexItems = [
  <span key="1">
    Item with <strong>bold text</strong>
  </span>,
  <div key="2">Item with nested element</div>,
  'Simple text item',
]

describe('List Components', () => {
  describe('Accessibility', () => {
    describe('UnorderedList', () => {
      it('should not have any accessibility violations - basic unordered list', async () => {
        const { container } = renderWithProviders(<UnorderedList items={mockListItems} />)
        const results = await runAxe(container)
        expect(results.violations).toHaveLength(0)
      })

      it('should not have any accessibility violations - unordered list with aria-label', async () => {
        const { container } = renderWithProviders(
          <UnorderedList items={mockListItems} aria-label="Navigation menu items" />,
        )
        const results = await runAxe(container)
        expect(results.violations).toHaveLength(0)
      })

      it('should not have any accessibility violations - unordered list with aria-labelledby', async () => {
        const { container } = renderWithProviders(
          <div>
            <h3 id="list-title">Shopping List</h3>
            <UnorderedList items={mockListItems} aria-labelledby="list-title" />
          </div>,
        )
        const results = await runAxe(container)
        expect(results.violations).toHaveLength(0)
      })

      it('should not have any accessibility violations - unordered list with description', async () => {
        const { container } = renderWithProviders(
          <div>
            <UnorderedList items={mockListItems} aria-describedby="list-description" />
            <div id="list-description">Items are in no particular order</div>
          </div>,
        )
        const results = await runAxe(container)
        expect(results.violations).toHaveLength(0)
      })

      it('should not have any accessibility violations - unordered list with complex items', async () => {
        const { container } = renderWithProviders(<UnorderedList items={mockComplexItems} />)
        const results = await runAxe(container)
        expect(results.violations).toHaveLength(0)
      })

      it('should not have any accessibility violations - empty unordered list', async () => {
        const { container } = renderWithProviders(
          <UnorderedList items={[]} aria-label="Empty list" />,
        )
        const results = await runAxe(container)
        expect(results.violations).toHaveLength(0)
      })
    })

    describe('OrderedList', () => {
      it('should not have any accessibility violations - basic ordered list', async () => {
        const { container } = renderWithProviders(<OrderedList items={mockListItems} />)
        const results = await runAxe(container)
        expect(results.violations).toHaveLength(0)
      })

      it('should not have any accessibility violations - ordered list with aria-label', async () => {
        const { container } = renderWithProviders(
          <OrderedList items={mockListItems} aria-label="Step-by-step instructions" />,
        )
        const results = await runAxe(container)
        expect(results.violations).toHaveLength(0)
      })

      it('should not have any accessibility violations - ordered list with aria-labelledby', async () => {
        const { container } = renderWithProviders(
          <div>
            <h3 id="steps-title">Installation Steps</h3>
            <OrderedList items={mockListItems} aria-labelledby="steps-title" />
          </div>,
        )
        const results = await runAxe(container)
        expect(results.violations).toHaveLength(0)
      })
    })
  })
})
