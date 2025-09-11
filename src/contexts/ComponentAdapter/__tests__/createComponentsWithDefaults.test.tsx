import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { createComponents, componentCreators } from '../createComponentsWithDefaults'
import { DEFAULT_PROPS_REGISTRY } from '../defaultPropsRegistry'
import type { ButtonProps } from '@/components/Common/UI/Button/ButtonTypes'

// Simple mock component for testing
const MockButton = ({ variant, isLoading, isDisabled, children, ...props }: ButtonProps) => (
  <button
    data-testid="mock-button"
    data-variant={variant}
    data-loading={isLoading}
    data-disabled={isDisabled}
    {...props}
  >
    {children}
  </button>
)

describe('createComponents', () => {
  it('applies defaults from registry to custom components', () => {
    const components = createComponents({ Button: MockButton })

    const { getByTestId } = render(React.createElement(components.Button, {}, 'Test Button'))

    const button = getByTestId('mock-button')
    expect(button).toHaveAttribute('data-variant', DEFAULT_PROPS_REGISTRY.Button.variant)
    expect(button).toHaveAttribute('data-loading', String(DEFAULT_PROPS_REGISTRY.Button.isLoading))
    expect(button).toHaveAttribute(
      'data-disabled',
      String(DEFAULT_PROPS_REGISTRY.Button.isDisabled),
    )
  })

  it('allows provided props to override defaults', () => {
    const components = createComponents({ Button: MockButton })

    const { getByTestId } = render(
      React.createElement(components.Button, { variant: 'secondary', isLoading: true }, 'Test'),
    )

    const button = getByTestId('mock-button')
    expect(button).toHaveAttribute('data-variant', 'secondary') // Overridden
    expect(button).toHaveAttribute('data-loading', 'true') // Overridden
    expect(button).toHaveAttribute(
      'data-disabled',
      String(DEFAULT_PROPS_REGISTRY.Button.isDisabled),
    ) // Default
  })

  it('includes default components for non-customized components', () => {
    const components = createComponents({ Button: MockButton })

    expect(components.Button).toBeDefined() // Custom
    expect(components.Alert).toBeDefined() // Default
    expect(components.Card).toBeDefined() // Default
  })

  it('handles components without defaults', () => {
    const MockCard = (props: { children: React.ReactNode }) => (
      <div data-testid="mock-card">{props.children}</div>
    )
    const components = createComponents({ Card: MockCard })

    const { getByTestId } = render(<components.Card>Test</components.Card>)
    expect(getByTestId('mock-card')).toHaveTextContent('Test')
  })

  it('sets display names for debugging', () => {
    const enhanced = componentCreators.Button(MockButton)
    expect(enhanced.displayName).toBe('withAutoDefault(Button)')
  })

  it('works with empty input', () => {
    const components = createComponents()
    expect(components.Button).toBeDefined()
  })
})
