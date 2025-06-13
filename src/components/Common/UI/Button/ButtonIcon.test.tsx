import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ButtonIcon } from './ButtonIcon'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

// Mock the SVG import
vi.mock('@/assets/icons/plus.svg?react', () => ({
  default: () => <div data-testid="plus-icon" />,
}))

describe('ButtonIcon', () => {
  it('renders correctly with default props', () => {
    renderWithProviders(<ButtonIcon aria-label="test-label">↓</ButtonIcon>)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('data-variant', 'icon')
  })

  it('handles press events', async () => {
    const handlePress = vi.fn()
    renderWithProviders(
      <ButtonIcon aria-label="test-label" onClick={handlePress}>
        ↓
      </ButtonIcon>,
    )
    const button = screen.getByRole('button')

    await userEvent.click(button)
    expect(handlePress).toHaveBeenCalledTimes(1)
  })

  it('is disabled when isDisabled is true', () => {
    renderWithProviders(
      <ButtonIcon aria-label="test-label" isDisabled>
        ↓
      </ButtonIcon>,
    )
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('shows loading state when isLoading is true', () => {
    renderWithProviders(
      <ButtonIcon aria-label="test-label" isLoading>
        ↓
      </ButtonIcon>,
    )
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('data-loading', 'true')
  })

  it('shows error state when isError is true', () => {
    renderWithProviders(
      <ButtonIcon aria-label="test-label" isError>
        ↓
      </ButtonIcon>,
    )
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-error', 'true')
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic icon button with aria-label',
        props: { 'aria-label': 'Close dialog', children: '×' },
      },
      {
        name: 'disabled icon button',
        props: { 'aria-label': 'Disabled action', isDisabled: true, children: '⚙️' },
      },
      {
        name: 'loading icon button',
        props: { 'aria-label': 'Loading action', isLoading: true, children: '⏳' },
      },
      {
        name: 'error state icon button',
        props: { 'aria-label': 'Error action', isError: true, children: '⚠️' },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<ButtonIcon {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
