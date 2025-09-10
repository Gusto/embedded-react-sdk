import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { withAutoDefault, withAutoDefaults } from '../withAutoDefaults'

// Mock custom components for testing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MockButton = ({ variant, isLoading, isDisabled, children, ...props }: any) => (
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MockTextInput = ({ type, isInvalid, isDisabled, value, ...props }: any) => (
  <input
    data-testid="mock-text-input"
    type={type}
    data-invalid={isInvalid}
    data-disabled={isDisabled}
    value={value}
    {...props}
  />
)

describe('withAutoDefault (singular)', () => {
  it('should apply default props to Button component', () => {
    const EnhancedButton = withAutoDefault('Button', MockButton)

    const { getByTestId } = render(<EnhancedButton>Click me</EnhancedButton>)

    const button = getByTestId('mock-button')
    expect(button).toHaveAttribute('data-variant', 'primary')
    expect(button).toHaveAttribute('data-loading', 'false')
    expect(button).toHaveAttribute('data-disabled', 'false')
    expect(button).toHaveTextContent('Click me')
  })

  it('should apply default props to TextInput component', () => {
    const EnhancedTextInput = withAutoDefault('TextInput', MockTextInput)

    const { getByTestId } = render(<EnhancedTextInput />)

    const input = getByTestId('mock-text-input')
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveAttribute('data-invalid', 'false')
    expect(input).toHaveAttribute('data-disabled', 'false')
  })

  it('should allow provided props to override defaults', () => {
    const EnhancedButton = withAutoDefault('Button', MockButton)

    const { getByTestId } = render(
      <EnhancedButton variant="secondary" isLoading={true}>
        Loading...
      </EnhancedButton>,
    )

    const button = getByTestId('mock-button')
    expect(button).toHaveAttribute('data-variant', 'secondary') // Overridden
    expect(button).toHaveAttribute('data-loading', 'true') // Overridden
    expect(button).toHaveAttribute('data-disabled', 'false') // Default
  })

  it('should set display name for debugging', () => {
    const EnhancedButton = withAutoDefault('Button', MockButton)
    expect(EnhancedButton.displayName).toBe('withAutoDefault(Button)')
  })
})

describe('withAutoDefaults (plural)', () => {
  it('should enhance multiple components at once', () => {
    const customComponents = {
      Button: MockButton,
      TextInput: MockTextInput,
    }

    const enhancedComponents = withAutoDefaults(customComponents)

    // Should return a complete ComponentsContextType
    expect(enhancedComponents).toHaveProperty('Button')
    expect(enhancedComponents).toHaveProperty('TextInput')
    expect(enhancedComponents).toHaveProperty('Alert') // Should include defaults

    // Test that the enhanced Button component works
    const { getByTestId } = render(
      React.createElement(enhancedComponents.Button, {}, 'Test Button'),
    )

    const button = getByTestId('mock-button')
    expect(button).toHaveAttribute('data-variant', 'primary')
    expect(button).toHaveAttribute('data-loading', 'false')
    expect(button).toHaveAttribute('data-disabled', 'false')
  })
})
