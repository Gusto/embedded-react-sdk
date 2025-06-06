import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { UnorderedList, OrderedList } from './index'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('List Components', () => {
  const mockItems = ['Item 1', 'Item 2', 'Item 3']

  describe('UnorderedList', () => {
    it('renders unordered list with items', () => {
      renderWithProviders(<UnorderedList items={mockItems} />)

      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('renders empty unordered list', () => {
      renderWithProviders(<UnorderedList items={[]} />)
      expect(screen.getByRole('list')).toBeInTheDocument()
    })
  })

  describe('OrderedList', () => {
    it('renders ordered list with items', () => {
      renderWithProviders(<OrderedList items={mockItems} />)

      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('renders empty ordered list', () => {
      renderWithProviders(<OrderedList items={[]} />)
      expect(screen.getByRole('list')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic unordered list',
        component: 'UnorderedList',
        props: { items: mockItems },
      },
      {
        name: 'unordered list with aria-label',
        component: 'UnorderedList',
        props: { items: mockItems, 'aria-label': 'Navigation items' },
      },
      {
        name: 'basic ordered list',
        component: 'OrderedList',
        props: { items: mockItems },
      },
      {
        name: 'ordered list with aria-label',
        component: 'OrderedList',
        props: { items: mockItems, 'aria-label': 'Step-by-step instructions' },
      },
      {
        name: 'empty unordered list',
        component: 'UnorderedList',
        props: { items: [] },
      },
      {
        name: 'empty ordered list',
        component: 'OrderedList',
        props: { items: [] },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ component, props }) => {
        const Component = component === 'UnorderedList' ? UnorderedList : OrderedList
        const { container } = renderWithProviders(<Component {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
