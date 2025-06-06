import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Switch } from './Switch'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Switch', () => {
  const defaultProps = {
    label: 'Test Switch',
    name: 'test-switch',
  }

  it('renders with correct structure', () => {
    renderWithProviders(<Switch {...defaultProps} />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(screen.getByText('Test Switch')).toBeInTheDocument()
  })

  it('starts unchecked by default', () => {
    renderWithProviders(<Switch {...defaultProps} />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).not.toBeChecked()
  })

  it('can be initially checked', () => {
    renderWithProviders(<Switch {...defaultProps} value={true} />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeChecked()
  })

  it('calls onChange when clicked', async () => {
    const onChange = vi.fn()
    renderWithProviders(<Switch {...defaultProps} onChange={onChange} />)

    const switchElement = screen.getByRole('switch')
    await userEvent.click(switchElement)

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('can be disabled', () => {
    renderWithProviders(<Switch {...defaultProps} isDisabled />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeDisabled()
  })

  it('supports keyboard interaction', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<Switch {...defaultProps} onChange={onChange} />)

    const switchElement = screen.getByRole('switch')
    switchElement.focus()

    await user.keyboard(' ')
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('renders with description', () => {
    const description = 'Helpful description'
    renderWithProviders(<Switch {...defaultProps} description={description} />)
    expect(screen.getByText(description)).toBeInTheDocument()
  })

  it('supports controlled behavior', async () => {
    const onChange = vi.fn()
    const { rerender } = renderWithProviders(
      <Switch {...defaultProps} value={false} onChange={onChange} />,
    )

    const switchElement = screen.getByRole('switch')
    expect(switchElement).not.toBeChecked()

    await userEvent.click(switchElement)
    expect(onChange).toHaveBeenCalledWith(true)

    // Simulate parent component updating the state
    rerender(<Switch {...defaultProps} value={true} onChange={onChange} />)
    expect(switchElement).toBeChecked()
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'default switch',
        props: { label: 'Default Switch' },
      },
      {
        name: 'checked switch',
        props: { label: 'Checked Switch', value: true },
      },
      {
        name: 'disabled switch',
        props: { label: 'Disabled Switch', isDisabled: true },
      },
      {
        name: 'disabled checked switch',
        props: { label: 'Disabled Checked Switch', value: true, isDisabled: true },
      },
      {
        name: 'switch with description',
        props: { label: 'Switch with Description', description: 'This is a helpful description' },
      },
      {
        name: 'switch with onChange handler',
        props: { label: 'Interactive Switch', onChange: vi.fn() },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<Switch {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
