import { describe, it, expect } from 'vitest'
import { run } from 'axe-core'
import type { AxeResults } from 'axe-core'
import { useRef } from 'react'
import { Menu } from './Menu'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

// Helper function to run axe on a container
const runAxe = async (container: Element): Promise<AxeResults> => {
  return await run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  })
}

const mockMenuItems = [
  { label: 'Profile', onClick: () => {} },
  { label: 'Settings', onClick: () => {} },
  { label: 'Logout', onClick: () => {} },
]

const mockMenuItemsWithIcons = [
  { label: 'Profile', icon: '👤', onClick: () => {} },
  { label: 'Settings', icon: '⚙️', onClick: () => {} },
  { label: 'Logout', icon: '🚪', onClick: () => {} },
]

const mockMenuItemsWithDisabled = [
  { label: 'Profile', onClick: () => {} },
  { label: 'Settings', onClick: () => {}, isDisabled: true },
  { label: 'Logout', onClick: () => {} },
]

// Test wrapper component
const TestMenuWrapper = ({
  items = mockMenuItems,
  isOpen = true,
  'aria-label': ariaLabel = 'Menu',
  ...props
}: {
  items?: typeof mockMenuItems
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
        {...props}
      />
    </div>
  )
}

describe('Menu', () => {
  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic menu',
        props: {},
      },
      {
        name: 'menu with icons',
        props: { items: mockMenuItemsWithIcons },
      },
      {
        name: 'menu with disabled items',
        props: { items: mockMenuItemsWithDisabled },
      },
      {
        name: 'closed menu',
        props: { isOpen: false },
      },
      {
        name: 'menu with custom aria-label',
        props: { 'aria-label': 'User profile actions' },
      },
      {
        name: 'menu with href items',
        props: {
          items: [
            { label: 'Profile', href: '/profile', onClick: () => {} },
            { label: 'Settings', href: '/settings', onClick: () => {} },
            { label: 'Logout', onClick: () => {} },
          ],
        },
      },
      {
        name: 'empty menu',
        props: { items: [] },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<TestMenuWrapper {...props} />)
        const results = await runAxe(container)
        expect(results.violations).toHaveLength(0)
      },
    )
  })
})
