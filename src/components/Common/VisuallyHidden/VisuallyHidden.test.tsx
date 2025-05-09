import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { VisuallyHidden } from './VisuallyHidden'

describe('VisuallyHidden', () => {
  it('renders content', () => {
    render(<VisuallyHidden>Hidden text</VisuallyHidden>)

    const element = screen.getByText('Hidden text')
    expect(element).toBeInTheDocument()
  })

  it('renders with a custom element type when "as" prop is provided', () => {
    render(<VisuallyHidden as="span">Hidden span</VisuallyHidden>)

    const element = screen.getByText('Hidden span')
    expect(element.tagName.toLowerCase()).toBe('span')
  })

  it('accepts custom className', () => {
    const customClass = 'customClass'
    render(
      <VisuallyHidden className={customClass} data-testid="hidden-element">
        Hidden with custom class
      </VisuallyHidden>,
    )

    const element = screen.getByTestId('hidden-element')
    const classNames = element.className.split(' ')
    expect(classNames.includes(customClass)).toBe(true)
  })

  it('passes through additional props to the rendered element', () => {
    render(
      <VisuallyHidden data-testid="hidden-element" aria-label="Test label">
        Hidden with props
      </VisuallyHidden>,
    )

    const element = screen.getByTestId('hidden-element')
    expect(element).toHaveAttribute('aria-label', 'Test label')
  })
})
