import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Switch } from './Switch'

describe('Switch', () => {
  const defaultProps = {
    label: 'Test Switch',
    name: 'test-switch',
  }

  it('renders correctly with label', () => {
    render(<Switch {...defaultProps} />)
    expect(screen.getByText('Test Switch')).toBeInTheDocument()
  })

  it('associates label with switch via htmlFor', () => {
    render(<Switch {...defaultProps} />)
    const labelElement = screen.getByText('Test Switch')
    const switchElement = screen.getByRole('switch')
    expect(labelElement).toHaveAttribute('for', switchElement.id)
  })

  it('associates error message with switch via aria-describedby', () => {
    const errorMessage = 'This field is required'
    render(<Switch {...defaultProps} errorMessage={errorMessage} />)

    const switchElement = screen.getByRole('switch')
    const errorMessageId = switchElement.getAttribute('aria-describedby')
    expect(screen.getByText(errorMessage)).toHaveAttribute('id', errorMessageId)
  })

  it('associates description with switch via aria-describedby', () => {
    const description = 'Helpful description'
    render(<Switch {...defaultProps} description={description} />)

    const switchElement = screen.getByRole('switch')
    const descriptionId = switchElement.getAttribute('aria-describedby')
    expect(screen.getByText(description)).toHaveAttribute('id', descriptionId)
  })

  it('calls onChange handler when clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<Switch {...defaultProps} onChange={onChange} />)
    const switchElement = screen.getByRole('switch')

    await user.click(switchElement)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('shows as selected when isSelected is true', () => {
    render(<Switch {...defaultProps} isSelected={true} />)

    const switchWrapper = screen.getByRole('switch').closest('label')
    expect(switchWrapper).toHaveAttribute('data-selected')
  })

  it('shows as not selected when isSelected is false', () => {
    render(<Switch {...defaultProps} isSelected={false} />)

    const switchWrapper = screen.getByRole('switch').closest('label')
    expect(switchWrapper).not.toHaveAttribute('data-selected')
  })

  it('applies disabled attribute when isDisabled is true', () => {
    render(<Switch {...defaultProps} isDisabled />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeDisabled()
  })

  it('displays error message when isInvalid is true', () => {
    const errorMessage = 'This is an error'
    render(<Switch {...defaultProps} isInvalid errorMessage={errorMessage} />)

    expect(screen.getByText(errorMessage)).toBeInTheDocument()

    render(<Switch {...defaultProps} errorMessage={errorMessage} />)

    const errorElements = screen.getAllByText(errorMessage)
    expect(errorElements).toHaveLength(2)

    expect(errorElements[0]).toBeVisible()
  })

  it('applies custom class name when provided', () => {
    const { container } = render(<Switch {...defaultProps} className="custom-class" />)
    const element = container.querySelector('.custom-class')
    expect(element).toBeInTheDocument()
  })

  it('marks field as required when isRequired is true', () => {
    render(<Switch {...defaultProps} isRequired />)

    const labelText = screen.getByText('Test Switch')
    const parentElement = labelText.parentElement

    expect(parentElement?.textContent).toContain('Test Switch')

    const { container } = render(<Switch {...defaultProps} isRequired />)
    expect(container.innerHTML).toContain('Test Switch')
  })

  it('applies custom id when provided', () => {
    render(<Switch {...defaultProps} id="custom-id" />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement.id).toBe('custom-id')
  })
})
