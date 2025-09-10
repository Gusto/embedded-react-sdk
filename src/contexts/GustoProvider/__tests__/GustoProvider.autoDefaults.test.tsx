import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GustoProvider } from '../GustoProvider'
import { useComponentContext } from '../../ComponentAdapter/useComponentContext'

// Mock custom components that consumers might create
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomButton = ({ variant, isLoading, isDisabled, children, ...props }: any) => (
  <button
    data-testid="custom-button"
    data-variant={variant}
    data-loading={isLoading}
    data-disabled={isDisabled}
    {...props}
  >
    {children}
  </button>
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTextInput = ({ type, isInvalid, isDisabled, value, ...props }: any) => (
  <input
    data-testid="custom-text-input"
    type={type}
    data-invalid={isInvalid}
    data-disabled={isDisabled}
    value={value}
    {...props}
  />
)

// Test component that uses the component context
const TestComponent = () => {
  const Components = useComponentContext()

  return (
    <div>
      <Components.Button>Test Button</Components.Button>
      <Components.TextInput value="test" label="Test Input" />
    </div>
  )
}

describe('GustoProvider auto-defaults integration', () => {
  it('should automatically apply defaults to custom components', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customComponents = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Button: (props: any) => <CustomButton {...props} />,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      TextInput: (props: any) => <CustomTextInput {...props} />,
    }

    const { getByTestId } = render(
      <GustoProvider config={{ baseUrl: 'https://example.com/api/' }} components={customComponents}>
        <TestComponent />
      </GustoProvider>,
    )

    // Custom Button should receive defaults automatically
    const button = getByTestId('custom-button')
    expect(button).toHaveAttribute('data-variant', 'primary') // Default from registry
    expect(button).toHaveAttribute('data-loading', 'false') // Default from registry
    expect(button).toHaveAttribute('data-disabled', 'false') // Default from registry
    expect(button).toHaveTextContent('Test Button')

    // Custom TextInput should receive defaults automatically
    const input = getByTestId('custom-text-input')
    expect(input).toHaveAttribute('type', 'text') // Default from registry
    expect(input).toHaveAttribute('data-invalid', 'false') // Default from registry
    expect(input).toHaveAttribute('data-disabled', 'false') // Default from registry
    expect(input).toHaveAttribute('value', 'test')
  })

  it('should work without custom components (using defaults)', () => {
    const { container } = render(
      <GustoProvider config={{ baseUrl: 'https://example.com/api/' }}>
        <TestComponent />
      </GustoProvider>,
    )

    // Should render the default components without errors
    expect(container).toBeInTheDocument()
  })

  it('should handle partial custom component overrides', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customComponents = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Button: (props: any) => <CustomButton {...props} />,
      // TextInput not overridden - should use default
    }

    const { getByTestId, container } = render(
      <GustoProvider config={{ baseUrl: 'https://example.com/api/' }} components={customComponents}>
        <TestComponent />
      </GustoProvider>,
    )

    // Custom Button should receive defaults
    const button = getByTestId('custom-button')
    expect(button).toHaveAttribute('data-variant', 'primary')

    // Default TextInput should still work
    expect(container).toBeInTheDocument()
  })
})
