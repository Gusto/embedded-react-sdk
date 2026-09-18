import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, test, expect } from 'vitest'
import { Select } from './Select'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

// Mock the SVG import
vi.mock('@/assets/icons/caret-down.svg?react', () => ({
  default: () => <div data-testid="caret-down" />,
}))

const defaultProps = {
  label: 'Test Label',
  options: [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
  ],
  placeholder: 'Choose an option',
  onChange: vi.fn(),
  onBlur: vi.fn(),
}

/**
 * Mirrors react-aria's `isContainingBlock` check (see `@react-aria/overlays`'s
 * `calculatePosition`): any of these properties on an ancestor between the overlay
 * and `document.body` establishes a new containing block, which is what causes
 * react-aria to mis-measure available space and collapse the overlay.
 *
 * Starts from the Popover's own parent, not the Popover itself — react-aria sets
 * `position: absolute` on the Popover intentionally to position it, which isn't a
 * containing-block violation.
 */
function findContainingBlockAncestor(overlayRoot: Element): Element | null {
  let el = overlayRoot.parentElement
  while (el && el !== document.body) {
    const style = window.getComputedStyle(el)
    // jsdom's getComputedStyle returns '' rather than the CSS initial value
    // (e.g. 'static', 'none') for properties nothing has explicitly set.
    if (
      (style.position && style.position !== 'static') ||
      (style.transform && style.transform !== 'none') ||
      (style.filter && style.filter !== 'none') ||
      style.contain === 'paint'
    ) {
      return el
    }
    el = el.parentElement
  }
  return null
}

describe('Select overlay positioning under a positioned ancestor', () => {
  const user = userEvent.setup()

  const hostAncestorStyles = [
    { name: 'position: relative', applyTo: (el: HTMLElement) => (el.style.position = 'relative') },
    { name: 'transform', applyTo: (el: HTMLElement) => (el.style.transform = 'translateZ(0)') },
  ]

  test.each(hostAncestorStyles)(
    'listbox is not nested inside a $name host ancestor',
    async ({ applyTo }) => {
      const hostAncestor = document.createElement('div')
      applyTo(hostAncestor)
      document.body.appendChild(hostAncestor)

      renderWithProviders(<Select {...defaultProps} />, { container: hostAncestor })

      await user.click(screen.getByRole('button'))
      const listbox = screen.getByRole('listbox')
      const popover = listbox.closest('.react-aria-Popover')
      expect(popover).not.toBeNull()

      expect(findContainingBlockAncestor(popover!)).toBeNull()
    },
  )
})
