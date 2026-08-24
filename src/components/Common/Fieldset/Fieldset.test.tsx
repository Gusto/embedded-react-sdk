import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Fieldset } from './Fieldset'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Fieldset', () => {
  it('renders legend with correct content', () => {
    renderWithProviders(
      <Fieldset legend="Test Legend">
        <div>Fieldset content</div>
      </Fieldset>,
    )

    const legend = screen.getByText('Test Legend')
    expect(legend).toBeInTheDocument()
  })

  it('renders legend when it is visually hidden', () => {
    renderWithProviders(
      <Fieldset legend="Test Legend" shouldVisuallyHideLegend>
        <div>Fieldset content</div>
      </Fieldset>,
    )

    expect(screen.getByText('Test Legend')).toBeInTheDocument()
  })

  it('nests the legend in a heading when headingLevel is provided', () => {
    renderWithProviders(
      <Fieldset legend="Test Legend" headingLevel="h2">
        <div>Fieldset content</div>
      </Fieldset>,
    )

    expect(screen.getByRole('heading', { level: 2, name: 'Test Legend' })).toBeInTheDocument()
    expect(screen.getByRole('group')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    renderWithProviders(
      <Fieldset legend="Test Legend" description="Test description">
        <div>Fieldset content</div>
      </Fieldset>,
    )

    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('renders error message when provided', () => {
    renderWithProviders(
      <Fieldset legend="Test Legend" errorMessage="Test error message">
        <div>Fieldset content</div>
      </Fieldset>,
    )

    // Updated to work with the component provider pattern
    const errorMessage = screen.getByText('Test error message')
    expect(errorMessage).toBeInTheDocument()

    const fieldset = screen.getByRole('group')
    expect(fieldset).toHaveAttribute('aria-describedby')
  })
})
