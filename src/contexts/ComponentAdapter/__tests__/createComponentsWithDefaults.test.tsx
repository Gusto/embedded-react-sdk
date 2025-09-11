import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { createComponents, componentCreators } from '../createComponentsWithDefaults'
import { DEFAULT_PROPS_REGISTRY } from '../defaultPropsRegistry'
import type { ButtonProps } from '@/components/Common/UI/Button/ButtonTypes'
import type { AlertProps } from '@/components/Common/UI/Alert/AlertTypes'
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

const MockAlert = ({ status, label, children, ...props }: AlertProps) => (
  <div data-testid="mock-alert" data-status={status} role="alert" {...props}>
    <span>{label}</span>
    {children}
  </div>
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
    {...{
      name: props.name,
      id: props.id,
      placeholder: props.placeholder,
      className: props.className,
      onBlur: props.onBlur,
    }}
  />
)

describe('createComponents (type-safe version)', () => {
  it('should create components with auto-defaults applied', () => {
    const customComponents = {
      Button: MockButton,
      Alert: MockAlert,
      TextInput: MockTextInput,
    }

    const components = createComponents(customComponents)

    // Test Button with defaults
    const { getByTestId: getButtonTestId } = render(
      React.createElement(components.Button, {}, 'Test Button'),
    )
    const button = getButtonTestId('mock-button')
    expect(button).toHaveAttribute('data-variant', DEFAULT_PROPS_REGISTRY.Button.variant)
    expect(button).toHaveAttribute('data-loading', String(DEFAULT_PROPS_REGISTRY.Button.isLoading))
    expect(button).toHaveAttribute(
      'data-disabled',
      String(DEFAULT_PROPS_REGISTRY.Button.isDisabled),
    )

    // Test Alert with defaults
    const { getByTestId: getAlertTestId } = render(
      React.createElement(components.Alert, { label: 'Test Alert' }),
    )
    const alert = getAlertTestId('mock-alert')
    expect(alert).toHaveAttribute('data-status', DEFAULT_PROPS_REGISTRY.Alert.status)

    // Test TextInput with defaults
    const { getByTestId: getInputTestId } = render(
      React.createElement(components.TextInput, { label: 'Test Input' }),
    )
    const input = getInputTestId('mock-text-input')
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
    const customComponents = {
      Button: MockButton,
      Alert: MockAlert,
    }

    const components = createComponents(customComponents)

    // Test Button with overridden props
    const { getByTestId: getButtonTestId } = render(
      React.createElement(
        components.Button,
        {
          variant: 'secondary',
          isLoading: true,
        },
        'Override Button',
      ),
    )
    const button = getButtonTestId('mock-button')
    expect(button).toHaveAttribute('data-variant', 'secondary') // Overridden
    expect(button).toHaveAttribute('data-loading', 'true') // Overridden
    expect(button).toHaveAttribute(
      'data-disabled',
      String(DEFAULT_PROPS_REGISTRY.Button.isDisabled),
    ) // Default

    // Test Alert with overridden props
    const { getByTestId: getAlertTestId } = render(
      React.createElement(components.Alert, {
        label: 'Test Alert',
        status: 'error',
      }),
    )
    const alert = getAlertTestId('mock-alert')
    expect(alert).toHaveAttribute('data-status', 'error') // Overridden
  })

  it('should include default components for non-customized components', () => {
    const customComponents = {
      Button: MockButton,
    }

    const components = createComponents(customComponents)

    // Should have the custom Button
    expect(components.Button).toBeDefined()

    // Should have default components for non-customized ones
    expect(components.Alert).toBeDefined()
    expect(components.TextInput).toBeDefined()
    expect(components.Card).toBeDefined()
    expect(components.Table).toBeDefined()
  })

  it('should handle components without defaults correctly', () => {
    const MockCard = (props: { children: React.ReactNode; className?: string }) => (
      <div data-testid="mock-card" {...props} />
    )

    const customComponents = {
      Card: MockCard,
    }

    const components = createComponents(customComponents)

    // Card doesn't have defaults, so it should just be copied over
    const { getByTestId } = render(<components.Card>Test Card</components.Card>)
    const card = getByTestId('mock-card')
    expect(card).toHaveTextContent('Test Card')
  })

  it('should set correct display names for debugging', () => {
    const enhancedButton = componentCreators.Button(MockButton)
    const enhancedAlert = componentCreators.Alert(MockAlert)

    expect(enhancedButton.displayName).toBe('withAutoDefault(Button)')
    expect(enhancedAlert.displayName).toBe('withAutoDefault(Alert)')
  })

  it('should work with empty custom components', () => {
    const components = createComponents({})

    // Should return all default components
    expect(components.Button).toBeDefined()
    expect(components.Alert).toBeDefined()
    expect(components.TextInput).toBeDefined()
    expect(components.Card).toBeDefined()
  })

  it('should work with no arguments', () => {
    const components = createComponents()

    // Should return all default components
    expect(components.Button).toBeDefined()
    expect(components.Alert).toBeDefined()
    expect(components.TextInput).toBeDefined()
    expect(components.Card).toBeDefined()
  })
})
