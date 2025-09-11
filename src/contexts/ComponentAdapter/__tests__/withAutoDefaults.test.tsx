import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { withAutoDefault, withAutoDefaults } from '../withAutoDefaults'
import { DEFAULT_PROPS_REGISTRY } from '../defaultPropsRegistry'
import type { ComponentsContextType } from '../useComponentContext'
import type { ButtonProps } from '@/components/Common/UI/Button/ButtonTypes'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'

// Mock custom components for testing
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

const MockTextInput = ({
  type,
  isInvalid,
  isDisabled,
  value,
  onChange,
  ...props
}: TextInputProps) => (
  <input
    data-testid="mock-text-input"
    type={type}
    data-invalid={isInvalid}
    data-disabled={isDisabled}
    value={value}
    onChange={e => onChange?.(e.target.value)}
    // Omit non-HTML props from spreading to avoid React warnings
    {...{
      name: props.name,
      id: props.id,
      placeholder: props.placeholder,
      className: props.className,
      onBlur: props.onBlur,
    }}
  />
)

describe('withAutoDefault (singular)', () => {
  it('should apply default props to Button component', () => {
    const EnhancedButton = withAutoDefault(
      'Button',
      MockButton as React.ComponentType<Record<string, unknown>>,
    )

    const { getByTestId } = render(<EnhancedButton>Click me</EnhancedButton>)

    const button = getByTestId('mock-button')
    expect(button).toHaveAttribute('data-variant', DEFAULT_PROPS_REGISTRY.Button.variant)
    expect(button).toHaveAttribute('data-loading', String(DEFAULT_PROPS_REGISTRY.Button.isLoading))
    expect(button).toHaveAttribute(
      'data-disabled',
      String(DEFAULT_PROPS_REGISTRY.Button.isDisabled),
    )
    expect(button).toHaveTextContent('Click me')
  })

  it('should apply default props to TextInput component', () => {
    const EnhancedTextInput = withAutoDefault(
      'TextInput',
      MockTextInput as unknown as React.ComponentType<Record<string, unknown>>,
    )

    const { getByTestId } = render(<EnhancedTextInput />)

    const input = getByTestId('mock-text-input')
    expect(input).toHaveAttribute('type', DEFAULT_PROPS_REGISTRY.TextInput.type)
    expect(input).toHaveAttribute(
      'data-invalid',
      String(DEFAULT_PROPS_REGISTRY.TextInput.isInvalid),
    )
    expect(input).toHaveAttribute(
      'data-disabled',
      String(DEFAULT_PROPS_REGISTRY.TextInput.isDisabled),
    )
  })

  it('should allow provided props to override defaults', () => {
    const EnhancedButton = withAutoDefault(
      'Button',
      MockButton as React.ComponentType<Record<string, unknown>>,
    )

    const { getByTestId } = render(
      <EnhancedButton variant="secondary" isLoading={true}>
        Loading...
      </EnhancedButton>,
    )

    const button = getByTestId('mock-button')
    expect(button).toHaveAttribute('data-variant', 'secondary') // Overridden
    expect(button).toHaveAttribute('data-loading', 'true') // Overridden
    expect(button).toHaveAttribute(
      'data-disabled',
      String(DEFAULT_PROPS_REGISTRY.Button.isDisabled),
    ) // Default
  })

  it('should set display name for debugging', () => {
    const EnhancedButton = withAutoDefault(
      'Button',
      MockButton as React.ComponentType<Record<string, unknown>>,
    )
    expect(EnhancedButton.displayName).toBe('withAutoDefault(Button)')
  })
})

describe('withAutoDefaults (plural)', () => {
  it('should enhance multiple components at once', () => {
    const customComponents = {
      Button: MockButton as unknown as React.ComponentType<Record<string, unknown>>,
      TextInput: MockTextInput as unknown as React.ComponentType<Record<string, unknown>>,
    }

    const enhancedComponents = withAutoDefaults(
      customComponents as unknown as Partial<ComponentsContextType>,
    )

    // Should return a complete ComponentsContextType
    expect(enhancedComponents).toHaveProperty('Button')
    expect(enhancedComponents).toHaveProperty('TextInput')
    expect(enhancedComponents).toHaveProperty('Alert') // Should include defaults

    // Test that the enhanced Button component works
    const { getByTestId } = render(
      React.createElement(enhancedComponents.Button, {}, 'Test Button'),
    )

    const button = getByTestId('mock-button')
    expect(button).toHaveAttribute('data-variant', DEFAULT_PROPS_REGISTRY.Button.variant)
    expect(button).toHaveAttribute('data-loading', String(DEFAULT_PROPS_REGISTRY.Button.isLoading))
    expect(button).toHaveAttribute(
      'data-disabled',
      String(DEFAULT_PROPS_REGISTRY.Button.isDisabled),
    )
  })
})
