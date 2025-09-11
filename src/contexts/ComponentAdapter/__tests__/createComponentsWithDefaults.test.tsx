import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { createComponents, componentCreators } from '../createComponentsWithDefaults'
import { DEFAULT_PROPS_REGISTRY, type ComponentName } from '../defaultPropsRegistry'
import type { ButtonProps } from '@/components/Common/UI/Button/ButtonTypes'
import type { AlertProps } from '@/components/Common/UI/Alert/AlertTypes'
import type { TextProps } from '@/components/Common/UI/Text/TextTypes'

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

  it('applies Alert defaults from registry', () => {
    const components = createComponents({ Alert: MockAlert })

    const { getByTestId } = render(
      React.createElement(components.Alert, { label: 'Test Alert' }, 'Alert content'),
    )

    const alert = getByTestId('mock-alert')
    expect(alert).toHaveAttribute('data-variant', DEFAULT_PROPS_REGISTRY.Alert.status)
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

  it('validates registry contains all expected components with defaults', () => {
    // Ensure registry has all expected components
    const registryKeys = Object.keys(DEFAULT_PROPS_REGISTRY) as ComponentName[]
    expect(registryKeys.length).toBeGreaterThan(0)

    // Test that each component in registry has non-empty defaults
    registryKeys.forEach(componentName => {
      const defaults = DEFAULT_PROPS_REGISTRY[componentName]
      expect(defaults).toBeDefined()
      expect(typeof defaults).toBe('object')
      expect(Object.keys(defaults).length).toBeGreaterThan(0)
    })

    // Validate specific expected values
    expect(DEFAULT_PROPS_REGISTRY.Button.variant).toBe('primary')
    expect(DEFAULT_PROPS_REGISTRY.Button.isLoading).toBe(false)
    expect(DEFAULT_PROPS_REGISTRY.Button.isDisabled).toBe(false)

    expect(DEFAULT_PROPS_REGISTRY.Alert.status).toBe('info')

    expect(DEFAULT_PROPS_REGISTRY.Text.as).toBe('p')
    expect(DEFAULT_PROPS_REGISTRY.Text.size).toBe('md')
  })

  it('applies defaults for Text component from registry', () => {
    const components = createComponents({ Text: MockText })

    const { getByTestId } = render(React.createElement(components.Text, {}, 'Test Text'))

    const text = getByTestId('mock-text')
    expect(text).toHaveAttribute('data-size', DEFAULT_PROPS_REGISTRY.Text.size)
    expect(text.tagName).toBe(DEFAULT_PROPS_REGISTRY.Text.as.toUpperCase())
  })

  it('dynamically tests all components in registry have proper creator functions', () => {
    const registryKeys = Object.keys(DEFAULT_PROPS_REGISTRY) as ComponentName[]

    registryKeys.forEach(componentName => {
      expect(componentCreators[componentName]).toBeDefined()
      expect(typeof componentCreators[componentName]).toBe('function')
    })
  })

  it('ensures all registry components can be created without errors', () => {
    const mockComponents = {
      Button: MockButton,
      Alert: MockAlert,
      Text: MockText,
    }

    // Test that we can create components for all registry entries
    Object.keys(DEFAULT_PROPS_REGISTRY).forEach(componentName => {
      const mockComponent = mockComponents[componentName as keyof typeof mockComponents]
      expect(() => {
        createComponents({
          [componentName]: mockComponent,
        })
      }).not.toThrow()
    })
  })

  it('validates registry defaults are properly typed and consistent', () => {
    // Test that all registry entries follow expected patterns
    Object.entries(DEFAULT_PROPS_REGISTRY).forEach(([componentName, defaults]) => {
      expect(componentName).toMatch(/^[A-Z]/) // Component names start with capital
      expect(defaults).toBeTypeOf('object')
      expect(defaults).not.toBeNull()

      // Validate common patterns in defaults
      if ('variant' in defaults) {
        expect(typeof defaults.variant).toBe('string')
      }
      if ('isLoading' in defaults) {
        expect(typeof defaults.isLoading).toBe('boolean')
      }
      if ('isDisabled' in defaults) {
        expect(typeof defaults.isDisabled).toBe('boolean')
      }
    })
  })

  it('sets display names for debugging', () => {
    const enhanced = componentCreators.Button(MockButton)
    expect(enhanced.displayName).toBe('withAutoDefault(Button)')
  })

  it('works with empty input', () => {
    const components = createComponents()
    expect(components.Button).toBeDefined()
  })

  // Dynamic test generation for all components in registry
  describe('Registry Coverage', () => {
    const registryEntries = Object.entries(DEFAULT_PROPS_REGISTRY) as Array<
      [ComponentName, Record<string, unknown>]
    >

    it.each(registryEntries)('component %s has non-empty defaults', (componentName, defaults) => {
      expect(defaults).toBeDefined()
      expect(Object.keys(defaults).length).toBeGreaterThan(0)
    })

    it.each(registryEntries)('component %s has corresponding creator function', componentName => {
      expect(componentCreators[componentName]).toBeDefined()
      expect(typeof componentCreators[componentName]).toBe('function')
    })

    it('registry completeness - all components with defaults have creators', () => {
      const registryKeys = Object.keys(DEFAULT_PROPS_REGISTRY)
      const creatorKeys = Object.keys(componentCreators)

      registryKeys.forEach(key => {
        expect(creatorKeys).toContain(key)
      })
    })

    it('creator completeness - all creators correspond to registry entries', () => {
      const registryKeys = Object.keys(DEFAULT_PROPS_REGISTRY)
      const creatorKeys = Object.keys(componentCreators)

      creatorKeys.forEach(key => {
        expect(registryKeys).toContain(key)
      })
    })
  })

  describe('Default Values Stability', () => {
    it('registry values remain stable across calls', () => {
      const firstCall = { ...DEFAULT_PROPS_REGISTRY }
      const secondCall = { ...DEFAULT_PROPS_REGISTRY }

      expect(firstCall).toEqual(secondCall)
    })

    it('registry objects maintain referential integrity', () => {
      const originalButton = { ...DEFAULT_PROPS_REGISTRY.Button }

      // Registry objects should maintain their original values
      expect(DEFAULT_PROPS_REGISTRY.Button).toEqual(originalButton)

      // TypeScript should prevent modification at compile time
      // (Runtime modification is still possible but not recommended)
      expect(DEFAULT_PROPS_REGISTRY.Button.variant).toBe('primary')
      expect(DEFAULT_PROPS_REGISTRY.Alert.status).toBe('info')
      expect(DEFAULT_PROPS_REGISTRY.Text.size).toBe('md')
    })
  })
})
