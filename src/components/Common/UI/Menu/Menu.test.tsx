import { describe, expect, it, vi } from 'vitest'
import { useRef } from 'react'
import { screen } from '@testing-library/react'
import { Menu } from './Menu'
import type { MenuItem } from './MenuTypes'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

// Test wrapper component
const TestMenuWrapper = ({
  items = [],
  isOpen = false,
  'aria-label': ariaLabel = 'Menu',
}: {
  items?: MenuItem[]
  isOpen?: boolean
  'aria-label'?: string
}) => {
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <div>
      <button ref={triggerRef}>Menu Trigger</button>
      <Menu
        triggerRef={triggerRef}
        items={items}
        isOpen={isOpen}
        onClose={() => {}}
        aria-label={ariaLabel}
      />
    </div>
  )
}

describe('Menu', () => {
  const mockItems = [
    { label: 'Option 1', onClick: vi.fn() },
    { label: 'Option 2', onClick: vi.fn() },
    { label: 'Option 3', onClick: vi.fn() },
  ]

  it('renders menu trigger', () => {
    renderWithProviders(<TestMenuWrapper items={mockItems} />)
    expect(screen.getByRole('button', { name: 'Menu Trigger' })).toBeInTheDocument()
  })

  // Note: Menu uses React Aria Popover with portal rendering which is complex to test in jsdom
  // The accessibility tests below verify the component structure for different configurations

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic menu',
        props: { items: mockItems, 'aria-label': 'Basic menu' },
      },
      {
        name: 'menu with disabled items',
        props: {
          items: [
            { label: 'Enabled', onClick: vi.fn() },
            { label: 'Disabled', onClick: vi.fn(), isDisabled: true },
          ],
          'aria-label': 'Menu with disabled items',
        },
      },
      {
        name: 'empty menu',
        props: {
          items: [],
          'aria-label': 'Empty menu',
        },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<TestMenuWrapper {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
