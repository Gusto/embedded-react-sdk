import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { Input } from './Input'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Input', () => {
  it('renders input element', () => {
    renderWithProviders(<Input placeholder="Enter text" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    renderWithProviders(<Input placeholder="Enter your name" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('placeholder', 'Enter your name')
  })

  it('handles disabled state', () => {
    renderWithProviders(<Input placeholder="Disabled input" isDisabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <Input placeholder="Custom input" className="custom-input" />,
    )
    expect(container.querySelector('.custom-input')).toBeInTheDocument()
  })

  describe('numeric input key handling', () => {
    it('blocks the scientific-notation "e" and "E" keys on number inputs', () => {
      renderWithProviders(<Input type="number" aria-label="Amount" />)
      const input = screen.getByRole('spinbutton')
      // fireEvent.keyDown returns false when a handler called preventDefault.
      expect(fireEvent.keyDown(input, { key: 'e' })).toBe(false)
      expect(fireEvent.keyDown(input, { key: 'E' })).toBe(false)
    })

    it('allows digits, decimal point, and control keys on number inputs', () => {
      renderWithProviders(<Input type="number" aria-label="Amount" />)
      const input = screen.getByRole('spinbutton')
      expect(fireEvent.keyDown(input, { key: '5' })).toBe(true)
      expect(fireEvent.keyDown(input, { key: '.' })).toBe(true)
      expect(fireEvent.keyDown(input, { key: 'Backspace' })).toBe(true)
    })

    it('does not block "e" on non-number inputs', () => {
      renderWithProviders(<Input type="text" aria-label="Name" />)
      const input = screen.getByRole('textbox')
      expect(fireEvent.keyDown(input, { key: 'e' })).toBe(true)
    })
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic input',
        props: { placeholder: 'Enter text' },
      },
      {
        name: 'disabled input',
        props: { placeholder: 'Disabled field', isDisabled: true },
      },
      {
        name: 'input with aria-label',
        props: { placeholder: 'Search', 'aria-label': 'Search input' },
      },
      {
        name: 'input with type',
        props: { placeholder: 'Email', type: 'email' },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<Input {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
