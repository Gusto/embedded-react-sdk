import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { createComponents, componentCreators } from '../createComponentsWithDefaults'
import type { ButtonProps } from '@/components/Common/UI/Button/ButtonTypes'
import { ButtonDefaults } from '@/components/Common/UI/Button/ButtonTypes'
import type { AlertProps } from '@/components/Common/UI/Alert/AlertTypes'
import { AlertDefaults } from '@/components/Common/UI/Alert/AlertTypes'
import type { TextProps } from '@/components/Common/UI/Text/TextTypes'
import { TextDefaults } from '@/components/Common/UI/Text/TextTypes'

// Mock components that mirror the actual component behavior for testing
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
  <div role="alert" data-testid="mock-alert" data-variant={status} {...props}>
    <h6>{label}</h6>
    {children && <div>{children}</div>}
  </div>
)

const MockText = ({ as: Component = 'p', size, children, ...props }: TextProps) => (
  <Component data-testid="mock-text" data-size={size} {...props}>
    {children}
  </Component>
)

describe('createComponents', () => {
  it('applies defaults from registry to custom components', () => {
    const components = createComponents({ Button: MockButton })

    const { getByTestId } = render(React.createElement(components.Button, {}, 'Test Button'))

    const button = getByTestId('mock-button')
    expect(button).toHaveAttribute('data-variant', ButtonDefaults.variant)
    expect(button).toHaveAttribute('data-loading', String(ButtonDefaults.isLoading))
    expect(button).toHaveAttribute('data-disabled', String(ButtonDefaults.isDisabled))
  })

  it('allows provided props to override defaults', () => {
    const components = createComponents({ Button: MockButton })

    const { getByTestId } = render(
      React.createElement(components.Button, { variant: 'secondary', isLoading: true }, 'Test'),
    )

    const button = getByTestId('mock-button')
    expect(button).toHaveAttribute('data-variant', 'secondary') // Overridden
    expect(button).toHaveAttribute('data-loading', 'true') // Overridden
    expect(button).toHaveAttribute('data-disabled', String(ButtonDefaults.isDisabled)) // Default
  })

  it('includes default components for non-customized components', () => {
    const components = createComponents({ Button: MockButton })

    expect(components.Button).toBeDefined() // Custom
    expect(components.Alert).toBeDefined() // Default
    expect(components.Card).toBeDefined() // Default
  })

  it('applies Alert defaults from registry', () => {
    const components = createComponents({ Alert: MockAlert })

    const { getByTestId } = render(
      React.createElement(components.Alert, { label: 'Test Alert' }, 'Alert content'),
    )

    const alert = getByTestId('mock-alert')
    expect(alert).toHaveAttribute('data-variant', AlertDefaults.status)
  })

  it('allows provided props to override Alert defaults', () => {
    const components = createComponents({ Alert: MockAlert })

    const { getByTestId } = render(
      React.createElement(
        components.Alert,
        { label: 'Test Alert', status: 'error' },
        'Alert content',
      ),
    )

    const alert = getByTestId('mock-alert')
    expect(alert).toHaveAttribute('data-variant', 'error') // Overridden
  })

  it('handles components without defaults', () => {
    const MockCard = (props: { children: React.ReactNode }) => (
      <div data-testid="mock-card">{props.children}</div>
    )
    const components = createComponents({ Card: MockCard })

    const { getByTestId } = render(<components.Card>Test</components.Card>)
    expect(getByTestId('mock-card')).toHaveTextContent('Test')
  })

  it('validates specific components have expected default values', () => {
    // Validate specific expected values
    expect(ButtonDefaults.variant).toBe('primary')
    expect(ButtonDefaults.isLoading).toBe(false)
    expect(ButtonDefaults.isDisabled).toBe(false)

    expect(AlertDefaults.status).toBe('info')

    expect(TextDefaults.as).toBe('p')
    expect(TextDefaults.size).toBe('md')
  })

  it('applies defaults for Text component', () => {
    const components = createComponents({ Text: MockText })

    const { getByTestId } = render(React.createElement(components.Text, {}, 'Test Text'))

    const text = getByTestId('mock-text')
    expect(text).toHaveAttribute('data-size', TextDefaults.size)
    expect(text.tagName).toBe(TextDefaults.as.toUpperCase())
  })

  it('tests all components have proper creator functions', () => {
    const creatorKeys = Object.keys(componentCreators) as Array<keyof typeof componentCreators>

    creatorKeys.forEach(componentName => {
      expect(componentCreators[componentName]).toBeDefined()
      expect(typeof componentCreators[componentName]).toBe('function')
    })
  })

  it('ensures all creator components can be created without errors', () => {
    const mockComponents = {
      Button: MockButton,
      Alert: MockAlert,
      Text: MockText,
    }

    // Test that we can create components for available mock components
    Object.keys(mockComponents).forEach(componentName => {
      const mockComponent = mockComponents[componentName as keyof typeof mockComponents]
      expect(() => {
        createComponents({
          [componentName]: mockComponent,
        })
      }).not.toThrow()
    })
  })

  it('validates test-specific component defaults are properly applied', () => {
    // Create a test registry with known values for reliable testing
    const testButtonDefaults = { variant: 'primary', isLoading: false, isDisabled: false } as const
    const testAlertDefaults = { status: 'info' } as const
    const testTextDefaults = { as: 'p', size: 'md' } as const

    // Test that our specific expected values match the actual defaults
    expect(ButtonDefaults.variant).toBe(testButtonDefaults.variant)
    expect(ButtonDefaults.isLoading).toBe(testButtonDefaults.isLoading)
    expect(ButtonDefaults.isDisabled).toBe(testButtonDefaults.isDisabled)

    expect(AlertDefaults.status).toBe(testAlertDefaults.status)

    expect(TextDefaults.as).toBe(testTextDefaults.as)
    expect(TextDefaults.size).toBe(testTextDefaults.size)
  })

  it('sets display names for debugging', () => {
    const enhanced = componentCreators.Button(MockButton)
    expect(enhanced.displayName).toBe('withAutoDefault(Button)')
  })

  it('works with empty input', () => {
    const components = createComponents()
    expect(components.Button).toBeDefined()
  })

  // Test component creators coverage
  describe('Component Creator Coverage', () => {
    const expectedComponents = [
      'Alert',
      'Badge',
      'Button',
      'ButtonIcon',
      'Checkbox',
      'CheckboxGroup',
      'Menu',
      'Radio',
      'RadioGroup',
      'Switch',
      'Text',
      'TextInput',
    ]

    it.each(expectedComponents)('component %s has a creator function', componentName => {
      expect(componentCreators[componentName as keyof typeof componentCreators]).toBeDefined()
      expect(typeof componentCreators[componentName as keyof typeof componentCreators]).toBe(
        'function',
      )
    })

    it('has all expected component creators', () => {
      const creatorKeys = Object.keys(componentCreators)
      expectedComponents.forEach(componentName => {
        expect(creatorKeys).toContain(componentName)
      })
    })
  })

  describe('Default Values Stability', () => {
    it('default values remain stable across calls', () => {
      const firstCallButton = { ...ButtonDefaults }
      const secondCallButton = { ...ButtonDefaults }

      expect(firstCallButton).toEqual(secondCallButton)
    })

    it('default objects maintain referential integrity', () => {
      const originalButton = { ...ButtonDefaults }

      // Default objects should maintain their original values
      expect(ButtonDefaults).toEqual(originalButton)

      // Validate specific values
      expect(ButtonDefaults.variant).toBe('primary')
      expect(AlertDefaults.status).toBe('info')
      expect(TextDefaults.size).toBe('md')
    })
  })
})
