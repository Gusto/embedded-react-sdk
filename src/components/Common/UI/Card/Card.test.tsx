import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, it } from 'vitest'
import { axe } from 'jest-axe'
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
        render: () => (
          <Card>
            <h3>Card Title</h3>
            <p>This is card content</p>
          </Card>
        ),
      },
      {
        name: 'card with menu',
        render: () => (
          <Card menu={<button aria-label="Card options">⋮</button>}>
            <p>Card content with menu</p>
          </Card>
        ),
      },
      {
        name: 'selectable card',
        render: () => (
          <Card onSelect={() => {}}>
            <p>Selectable card content</p>
          </Card>
        ),
      },
      {
        name: 'complex card',
        render: () => (
          <Card onSelect={() => {}} menu={<button aria-label="More options">⋮</button>}>
            <h3>Complex Card</h3>
            <p>This card has both selection and menu</p>
          </Card>
        ),
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ render }) => {
        const { container } = renderWithProviders(render())
        await expect(
          axe(container, {
            rules: {
              'color-contrast': { enabled: false },
            },
          }),
        ).resolves.toHaveNoViolations()
      },
    )
  })
})
