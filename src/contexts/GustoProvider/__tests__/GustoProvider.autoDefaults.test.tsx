import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GustoProvider } from '../GustoProvider'
import { useComponentContext } from '../../ComponentAdapter/useComponentContext'
import type { ButtonProps } from '@/components/Common/UI/Button/ButtonTypes'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'

// Mock custom components that consumers might create
const CustomButton = ({ variant, isLoading, isDisabled, children, ...props }: ButtonProps) => (
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

const CustomTextInput = ({
  type,
  isInvalid,
  isDisabled,
  value,
  onChange,
  ...props
}: TextInputProps) => (
  <input
    data-testid="custom-text-input"
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
    const customComponents = {
      Button: (props: ButtonProps) => <CustomButton {...props} />,
      TextInput: (props: TextInputProps) => <CustomTextInput {...props} />,
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
    const customComponents = {
      Button: (props: ButtonProps) => <CustomButton {...props} />,
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
