import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FieldLayout } from './FieldLayout'

describe('FieldLayout', () => {
  it('renders label with correct htmlFor value', () => {
    render(
      <FieldLayout label="Test Label" htmlFor="test-input" errorMessageId="error-id">
        <input id="test-input" />
      </FieldLayout>,
    )

    const label = screen.getByText('Test Label')
    expect(label).toHaveAttribute('for', 'test-input')
  })

  it('renders label when it is visually hidden', () => {
    render(
      <FieldLayout
        label="Test Label"
        shouldVisuallyHideLabel
        htmlFor="test-input"
        errorMessageId="error-id"
      >
        <input id="test-input" />
      </FieldLayout>,
    )

    expect(screen.getByLabelText(/Test Label/)).toBeInTheDocument()
  })

  it('shows optional label when isRequired is false', () => {
    render(
      <FieldLayout
        label="Test Label"
        htmlFor="test-input"
        errorMessageId="error-id"
        isRequired={false}
      >
        <input id="test-input" />
      </FieldLayout>,
    )

    expect(screen.getByText('optionalLabel')).toBeInTheDocument()
  })

  it('renders error message with correct id when provided', () => {
    render(
      <FieldLayout
        label="Test Label"
        htmlFor="test-input"
        errorMessageId="error-id"
        errorMessage="Test error message"
      >
        <input id="test-input" />
      </FieldLayout>,
    )

    const errorMessage = screen.getByText('Test error message')
    expect(errorMessage).toHaveAttribute('id', 'error-id')
  })
})
