import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, it } from 'vitest'
import { Card } from './Card'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Card Component', () => {
  test('renders children correctly', () => {
    renderWithProviders(<Card>Test Content</Card>)

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  test('renders menu when provided', () => {
    renderWithProviders(<Card menu={<div>Menu Content</div>}>Test Content</Card>)

    expect(screen.getByText('Menu Content')).toBeInTheDocument()
  })

  test('does not render menu when not provided', () => {
    renderWithProviders(<Card>Test Content</Card>)

    expect(screen.queryByText('Menu Content')).not.toBeInTheDocument()
  })

  test('calls onSelect when checkbox is clicked', async () => {
    const onSelectMock = vi.fn()
    renderWithProviders(<Card onSelect={onSelectMock}>Test Content</Card>)

    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)

    expect(onSelectMock).toHaveBeenCalledTimes(1)
  })

  test('does not render checkbox if onSelect is not provided', () => {
    renderWithProviders(<Card>Test Content</Card>)

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic card',
        props: { children: 'Basic card content' },
      },
      {
        name: 'card with custom className',
        props: { className: 'custom-style', children: 'Styled card' },
      },
      {
        name: 'card with complex content',
        props: {
          children: (
            <div>
              <h3>Card Title</h3>
              <p>Card description with multiple elements.</p>
              <button>Action Button</button>
            </div>
          ),
        },
      },
      {
        name: 'card with text content',
        props: { children: 'Simple text content in a card' },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<Card {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
