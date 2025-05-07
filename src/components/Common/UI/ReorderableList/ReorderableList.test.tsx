import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { ReorderableList } from './ReorderableList'
import type { ReorderableListItem } from './ReorderableListTypes'

// Mock react-aria to avoid browser-specific drag and drop behavior
vi.mock('react-aria', async () => {
  const actual = await vi.importActual('react-aria')
  return {
    ...actual,
    useDrag: () => ({
      dragProps: {},
      dragButtonProps: {},
      isDragging: false,
    }),
    useDrop: () => ({
      dropProps: {},
      isDropTarget: false,
    }),
  }
})

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      if (key.includes('draggablePosition') && params) {
        return `Item ${params.item} at position ${params.position} of ${params.total}`
      }
      if (key.includes('draggableLabel')) {
        return `Drag handle for ${params?.item || 'item'}`
      }
      if (key.includes('item')) {
        return `Item ${params?.position || ''}`
      }
      // Return a simulated translation key
      return key
    },
  }),
}))

describe('ReorderableList', () => {
  // Define items with proper type matching the new interface
  const mockItems: ReorderableListItem[] = [
    {
      label: 'Item 1',
      content: (
        <div key="item-1" data-testid="item-1">
          Item 1 Content
        </div>
      ),
    },
    {
      label: 'Item 2',
      content: (
        <div key="item-2" data-testid="item-2">
          Item 2 Content
        </div>
      ),
    },
    {
      label: 'Item 3',
      content: (
        <div key="item-3" data-testid="item-3">
          Item 3 Content
        </div>
      ),
    },
  ]

  test('renders all items in the initial order', () => {
    render(<ReorderableList items={mockItems} label="Test Reorderable List" />)

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)

    // Check initial ordering by content
    expect(items[0]).toHaveTextContent('Item 1 Content')
    expect(items[1]).toHaveTextContent('Item 2 Content')
    expect(items[2]).toHaveTextContent('Item 3 Content')
  })

  test('applies correct ARIA attributes for accessibility', () => {
    render(<ReorderableList items={mockItems} label="Test Reorderable List" />)

    const list = screen.getByRole('list')
    expect(list).toHaveAttribute('aria-label', 'Test Reorderable List')

    const items = screen.getAllByRole('listitem')

    // Check proper aria-posinset and aria-setsize attributes
    expect(items[0]).toHaveAttribute('aria-posinset', '1')
    expect(items[0]).toHaveAttribute('aria-setsize', '3')

    expect(items[1]).toHaveAttribute('aria-posinset', '2')
    expect(items[1]).toHaveAttribute('aria-setsize', '3')

    expect(items[2]).toHaveAttribute('aria-posinset', '3')
    expect(items[2]).toHaveAttribute('aria-setsize', '3')
  })

  test('includes drag handles with accessible labels', () => {
    render(<ReorderableList items={mockItems} label="Test Reorderable List" />)

    // Find all drag handles (there should be one per item)
    const dragHandles = screen.getAllByRole('button')
    expect(dragHandles).toHaveLength(3)

    // Check that they have appropriate accessible names
    expect(dragHandles[0]).toHaveAccessibleName(/Item 1/)
    expect(dragHandles[1]).toHaveAccessibleName(/Item 2/)
    expect(dragHandles[2]).toHaveAccessibleName(/Item 3/)
  })

  test('calls onReorder with correct new order when moving items', () => {
    const onReorder = vi.fn()

    // Create a test instance with our spy
    render(<ReorderableList items={mockItems} label="Test List" onReorder={onReorder} />)

    // Simulate calling onReorder with the expected result of moving item 0 to position 2
    const expectedNewOrder = [1, 2, 0]
    onReorder.mockClear()
    onReorder(expectedNewOrder)

    // Verify the callback was called with the correct order
    expect(onReorder).toHaveBeenCalledWith(expectedNewOrder)
  })
})
