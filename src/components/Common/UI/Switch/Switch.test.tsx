import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import type { RefObject } from 'react'
import { createRef } from 'react'
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

  it('shows as selected when value is true', () => {
    render(<Switch {...defaultProps} value={true} />)

    const switchInput = screen.getByRole('switch')
    expect(switchInput).toHaveAttribute('checked')
  })

  it('shows as not selected when value is false', () => {
    render(<Switch {...defaultProps} value={false} />)

    const switchInput = screen.getByRole('switch')
    expect(switchInput).not.toHaveAttribute('checked')
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

  it('applies custom id when provided', () => {
    render(<Switch {...defaultProps} id="custom-id" />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement.id).toBe('custom-id')
  })

  it('accepts and applies inputRef when provided', () => {
    const inputRef = createRef<HTMLInputElement>()
    render(<Switch {...defaultProps} inputRef={inputRef as RefObject<HTMLInputElement>} />)

    // After rendering, the ref should be populated
    expect(inputRef.current).not.toBeNull()
    expect(inputRef.current?.tagName).toBe('INPUT')
  })
})
