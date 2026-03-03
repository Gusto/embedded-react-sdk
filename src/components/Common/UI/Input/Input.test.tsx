import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
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

  it('stays controlled when value is initially undefined and then defined', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { rerender } = renderWithProviders(
      <Input placeholder="Controlled" value={undefined} onChange={() => {}} />,
    )
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('')

    rerender(<Input placeholder="Controlled" value="hello" onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('hello')

    const errorCalls = errorSpy.mock.calls.filter(
      call =>
        typeof call[0] === 'string' &&
        call[0].includes('uncontrolled') &&
        call[0].includes('controlled'),
    )
    expect(errorCalls).toHaveLength(0)
    errorSpy.mockRestore()
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
