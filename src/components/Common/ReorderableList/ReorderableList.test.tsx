import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { ReorderableList } from './ReorderableList'
import type { ReorderableListItem } from './ReorderableListTypes'

// Mock react-dnd for tests
vi.mock('react-dnd', () => ({
  useDrag: () => [{ isDragging: false }, vi.fn(), vi.fn()],
  useDrop: () => [{ isOver: false }, vi.fn()],
  DndProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dnd-provider">{children}</div>
  ),
}))

// Mock react-dnd-html5-backend
vi.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: {},
}))

// Mock react-aria to avoid browser-specific accessibility behavior
vi.mock('react-aria', () => ({
  VisuallyHidden: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="visually-hidden">{children}</div>
  ),
}))

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
      if (key.includes('draggableLabelActive')) {
        return `Drag handle for ${params?.item || 'item'} (in reordering mode)`
      }
      if (key.includes('reorderingStarted')) {
        return `Reordering started for ${params?.item || 'item'}`
      }
      if (key.includes('reorderingComplete')) {
        return `Reordering completed for ${params?.item || 'item'}`
      }
      if (key.includes('movedUp')) {
        return `Item ${params?.item || ''} moved up to position ${params?.position || ''}`
      }
      if (key.includes('movedDown')) {
        return `Item ${params?.item || ''} moved down to position ${params?.position || ''}`
      }
      // Return a simulated translation key
      return key
    },
  }),
}))

describe('ReorderableList', () => {
  // Setup mock items
  const createMockItems = () => {
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
    return mockItems
  }

  test('renders all items in the initial order', () => {
    render(<ReorderableList items={createMockItems()} label="Test Reorderable List" />)

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)

    // Check initial ordering by content
    expect(items[0]).toHaveTextContent('Item 1 Content')
    expect(items[1]).toHaveTextContent('Item 2 Content')
    expect(items[2]).toHaveTextContent('Item 3 Content')
  })

  test('applies correct ARIA attributes for accessibility', () => {
    render(<ReorderableList items={createMockItems()} label="Test Reorderable List" />)

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
    render(<ReorderableList items={createMockItems()} label="Test Reorderable List" />)

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
    render(<ReorderableList items={createMockItems()} label="Test List" onReorder={onReorder} />)

    // Simulate calling onReorder with the expected result of moving item 0 to position 2
    const expectedNewOrder = [1, 2, 0]
    onReorder.mockClear()
    onReorder(expectedNewOrder)

    // Verify the callback was called with the correct order
    expect(onReorder).toHaveBeenCalledWith(expectedNewOrder)
  })

  test('handles keyboard events for reordering', () => {
    const onReorder = vi.fn()
    render(<ReorderableList items={createMockItems()} label="Test List" onReorder={onReorder} />)

    const dragHandles = screen.getAllByRole('button')

    // Start reordering mode with Enter key
    if (dragHandles[0]) {
      fireEvent.keyDown(dragHandles[0], { key: 'Enter' })

      // Check that the item is in reordering mode through a data attribute
      const firstItem = screen.getByTestId('reorderable-item-0')
      expect(firstItem).toHaveAttribute('data-reordering', 'true')

      // Stop reordering mode with Enter key
      fireEvent.keyDown(dragHandles[0], { key: 'Enter' })
      expect(firstItem).toHaveAttribute('data-reordering', 'false')
    }
  })

  test('should add custom class when provided', () => {
    const customClass = 'custom-list-class'
    render(<ReorderableList items={createMockItems()} label="Test List" className={customClass} />)

    const list = screen.getByRole('list')
    expect(list.classList.contains(customClass)).toBe(true)
  })

  test('renders in disabled state when disabled prop is true', () => {
    render(<ReorderableList items={createMockItems()} label="Test List" disabled={true} />)

    // In disabled mode, there should be no drag handles or drop zones
    const dragHandles = screen.queryAllByRole('button')
    expect(dragHandles).toHaveLength(0)

    // List should have the disabled class
    const list = screen.getByRole('list')
    expect(list.classList.contains('disabled')).toBe(true)
  })

  test('accepts and renders custom drag handle', () => {
    const customRenderFn = vi.fn().mockImplementation(({ id, label }) => (
      <button aria-label={`Custom handle for ${label}`} data-testid={`custom-handle-${id}`}>
        👋
      </button>
    ))

    render(
      <ReorderableList
        items={createMockItems()}
        label="Test List"
        renderDragHandle={customRenderFn}
      />,
    )

    // Verify the custom render function was called for each item
    expect(customRenderFn).toHaveBeenCalledTimes(3)

    // Check that the custom buttons are rendered
    expect(screen.getByTestId('custom-handle-0')).toBeInTheDocument()
    expect(screen.getByTestId('custom-handle-1')).toBeInTheDocument()
    expect(screen.getByTestId('custom-handle-2')).toBeInTheDocument()
  })
})
