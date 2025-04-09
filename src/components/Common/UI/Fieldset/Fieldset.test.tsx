import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Fieldset } from './Fieldset'

describe('Fieldset', () => {
  it('renders legend with correct content', () => {
    render(
      <Fieldset legend="Test Legend">
        <div>Fieldset content</div>
      </Fieldset>,
    )

    const legend = screen.getByText('Test Legend')
    expect(legend).toBeInTheDocument()
  })

  it('renders legend when it is visually hidden', () => {
    render(
      <Fieldset legend="Test Legend" shouldVisuallyHideLegend>
        <div>Fieldset content</div>
      </Fieldset>,
    )

    expect(screen.getByText('Test Legend')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <Fieldset legend="Test Legend" description="Test description">
        <div>Fieldset content</div>
      </Fieldset>,
    )

    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('renders error message when provided', () => {
    render(
      <Fieldset legend="Test Legend" errorMessage="Test error message">
        <div>Fieldset content</div>
      </Fieldset>,
    )

    const errorMessage = screen.getByText('Test error message')
    expect(errorMessage).toBeInTheDocument()
    expect(errorMessage).toHaveAttribute('role', 'alert')
    expect(errorMessage).toHaveAttribute('aria-live', 'polite')

    const errorMessageId = errorMessage.getAttribute('id')
    const fieldset = screen.getByRole('group')
    expect(fieldset).toHaveAttribute('aria-describedby', errorMessageId)
  })
})
