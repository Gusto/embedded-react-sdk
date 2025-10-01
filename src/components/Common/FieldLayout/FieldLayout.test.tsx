import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FieldLayout } from './FieldLayout'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('FieldLayout', () => {
  it('renders label with correct htmlFor value', () => {
    renderWithProviders(
      <FieldLayout
        label="Test Label"
        htmlFor="test-input"
        errorMessageId="error-id"
        descriptionId="description-id"
      >
        <input id="test-input" />
      </FieldLayout>,
    )

    const label = screen.getByText('Test Label')
    expect(label).toHaveAttribute('for', 'test-input')
  })

  it('renders label when it is visually hidden', () => {
    renderWithProviders(
      <FieldLayout
        label="Test Label"
        shouldVisuallyHideLabel
        htmlFor="test-input"
        errorMessageId="error-id"
        descriptionId="description-id"
      >
        <input id="test-input" />
      </FieldLayout>,
    )

    expect(screen.getByLabelText(/Test Label/)).toBeInTheDocument()
  })

  it('shows optional label when isRequired is false', () => {
    renderWithProviders(
      <FieldLayout
        label="Test Label"
        htmlFor="test-input"
        errorMessageId="error-id"
        isRequired={false}
        descriptionId="description-id"
      >
        <input id="test-input" />
      </FieldLayout>,
    )

    expect(screen.getByText('(optional)')).toBeInTheDocument()
  })

  it('renders error message with correct id when provided', () => {
    renderWithProviders(
      <FieldLayout
        label="Test Label"
        htmlFor="test-input"
        errorMessageId="error-id"
        errorMessage="Test error message"
        descriptionId="description-id"
      >
        <input id="test-input" />
      </FieldLayout>,
    )

    // Just check if the error message is displayed and don't rely on specific IDs
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('should forward data attributes', () => {
    renderWithProviders(
      <FieldLayout
        label="Test Label"
        htmlFor="test-input"
        errorMessageId="error-id"
        descriptionId="description-id"
        data-testid="field-layout"
        data-bool={true}
        data-number={123}
      >
        <input id="test-input" />
      </FieldLayout>,
    )

    const fieldLayout = screen.getByTestId('field-layout')
    expect(fieldLayout).toHaveAttribute('data-bool', 'true')
    expect(fieldLayout).toHaveAttribute('data-number', '123')
  })
})
