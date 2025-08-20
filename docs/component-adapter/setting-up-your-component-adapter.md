---
title: Setting Up Your Component Adapter
order: 3
---

## Setting Up Your Component Adapter

This guide will walk you through the process of creating and implementing your own Component Adapter for the Gusto Embedded React SDK.

### 1. Create Your Custom Component Implementations

Each component must implement the required props interface defined by the SDK. For example, if you're creating a custom TextInput, it must accept all the props defined in the `TextInputProps` interface ([View interface on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/TextInput/TextInputTypes.ts)).

The component types extend basic HTML element props, so your implementations can accept and forward any standard HTML attributes to the underlying HTML elements. For example:

```tsx
import type { TextInputProps } from '@gusto/embedded-react-sdk'

const MyCustomTextInput = ({
  label,
  description,
  errorMessage,
  isRequired,
  isDisabled,
  isInvalid,
  id,
  name,
  value,
  placeholder,
  onChange,
  onBlur,
  inputRef,
  shouldVisuallyHideLabel,
  ...props // Additional HTML input props are passed through
}: TextInputProps) => {
  // Your custom implementation here
  // Or you could supply an existing text input component from your codebase
  // Or you could supply a component from an external UI library
  return (
    <div className="my-custom-input-wrapper">
      <label htmlFor={id || name}>{label}</label>
      <input
        type="text"
        id={id || name}
        name={name}
        value={value || ''}
        onChange={e => onChange && onChange(e.target.value)}
        {...props} // Spread additional HTML props
      />
      {errorMessage && <div className="error">{errorMessage}</div>}
    </div>
  )
}
```

Make sure your component implementation:

- Handles all required props correctly
- Maintains accessibility features
- Follows your design system guidelines
- Properly passes event handlers
- Forwards additional HTML attributes to the appropriate element

For a complete reference of all component types and their props, see the [Component Inventory](./component-inventory).

To learn more about how each component should be implemented, you can reference the default implementations in the SDK ([View on GitHub](https://github.com/Gusto/embedded-react-sdk/tree/main/src/components/Common/UI)).

### 2. Create Your Component Adapter Object

Create an object that implements the `ComponentsContextType` interface ([View interface on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/ComponentAdapter/useComponentContext.ts)) with your custom components:

```tsx
import type { ComponentsContextType } from '@gusto/embedded-react-sdk'

const myCustomComponents: ComponentsContextType = {
  Alert: props => <MyCustomAlert {...props} />,
  Badge: props => <MyCustomBadge {...props} />,
  Button: props => <MyCustomButton {...props} />,
  ButtonIcon: props => <MyCustomButtonIcon {...props} />,
  CalendarPreview: props => <MyCustomCalendarPreview {...props} />,
  Card: props => <MyCustomCard {...props} />,
  Checkbox: props => <MyCustomCheckbox {...props} />,
  CheckboxGroup: props => <MyCustomCheckboxGroup {...props} />,
  ComboBox: props => <MyCustomComboBox {...props} />,
  DatePicker: props => <MyCustomDatePicker {...props} />,
  Heading: props => <MyCustomHeading {...props} />,
  Link: props => <MyCustomLink {...props} />,
  Menu: props => <MyCustomMenu {...props} />,
  NumberInput: props => <MyCustomNumberInput {...props} />,
  OrderedList: props => <MyCustomOrderedList {...props} />,
  ProgressBar: props => <MyCustomProgressBar {...props} />,
  Radio: props => <MyCustomRadio {...props} />,
  RadioGroup: props => <MyCustomRadioGroup {...props} />,
  Select: props => <MyCustomSelect {...props} />,
  Switch: props => <MyCustomSwitch {...props} />,
  Table: props => <MyCustomTable {...props} />,
  Text: props => <MyCustomText {...props} />,
  TextInput: props => <MyCustomTextInput {...props} />,
  UnorderedList: props => <MyCustomUnorderedList {...props} />,
}
```

### 3. Choose Your Provider

The SDK offers two ways to provide your custom components, each suited for different needs:

#### Option A: Using GustoProvider (Recommended)

The `GustoProvider` is the recommended approach for most applications. Using the `GustoProvider`, you are able to supply only the components you want to override and then the rest fall back to default React Aria components:

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'

function App() {
  return (
    <GustoProvider
      config={{ baseUrl: '/api/gusto/' }}
      components={{
        Button: MyCustomButton, // Override just what you need
        TextInput: MyCustomTextInput,
        // Other components will use React Aria defaults
      }}
    >
      {/* Your application components */}
      <EmployeeOnboardingFlow companyId="company_123" />
    </GustoProvider>
  )
}
```

Benefits of using `GustoProvider`:

- Only need to implement the components you want to customize
- Includes accessible React Aria components as defaults
- Simpler integration path
- Best choice for most applications

#### Option B: Using GustoProviderCustomUIAdapter

If you need complete control over the UI implementation or want to optimize bundle size through tree-shaking, use the `GustoProviderCustomUIAdapter`:

```tsx
import { GustoProviderCustomUIAdapter } from '@gusto/embedded-react-sdk'

function App() {
  return (
    <GustoProviderCustomUIAdapter
      config={{ baseUrl: '/api/gusto/' }}
      components={myCustomComponents} // Must provide all required components
    >
      {/* Your application components */}
      <EmployeeOnboardingFlow companyId="company_123" />
    </GustoProviderCustomUIAdapter>
  )
}
```

Benefits of using `GustoProviderCustomUIAdapter`:

- Complete control over component implementation
- No React Aria dependencies included
- Better for tree-shaking and bundle size optimization
- Ideal when you want to fully customize the UI layer

Choose this option when you:

- Want to implement all UI components yourself
- Need to minimize bundle size
- Don't want React Aria as a dependency
- Have a complete design system you want to use

### 4. Testing Your Implementation

After implementing your Component Adapter, it's a good practice to:

1. Test all components with various props and states
2. Verify that event handlers work as expected
3. Check accessibility features
4. Test across different browsers and devices

### Complete Example

Here's an example showing how to customize a few common components using Material UI with `GustoProvider`. For a full list of customizable components and their props, see the [Component Inventory](./component-inventory.md).

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

// Create Material UI implementations for the components you want to customize
const materialUIComponents = {
  // TextInput implementation
  TextInput: ({
    label,
    description,
    errorMessage,
    isRequired,
    isDisabled,
    isInvalid,
    id,
    name,
    value,
    placeholder,
    onChange,
    onBlur,
    ...props
  }) => (
    <TextField
      id={id || name}
      name={name}
      label={label}
      value={value || ''}
      placeholder={placeholder}
      disabled={isDisabled}
      error={isInvalid}
      helperText={isInvalid ? errorMessage : description}
      required={isRequired}
      onChange={e => onChange && onChange(e.target.value)}
      onBlur={onBlur}
      fullWidth
      margin="normal"
      {...props}
    />
  ),

  // Button implementation
  Button: ({ children, isDisabled, isLoading, onClick, variant = 'primary', ...props }) => {
    const muiVariant =
      variant === 'primary' ? 'contained' : variant === 'secondary' ? 'outlined' : 'text'

    return (
      <Button disabled={isDisabled || isLoading} onClick={onClick} variant={muiVariant} {...props}>
        {isLoading ? 'Loading...' : children}
      </Button>
    )
  },

  // Other components can be customized as needed...
}

function App() {
  return (
    <GustoProvider
      config={{ baseUrl: '/api/gusto/' }}
      components={materialUIComponents} // Only the components you want to customize
    >
      <EmployeeOnboardingFlow companyId="company_123" />
    </GustoProvider>
  )
}
```

Other helpful resources setting up component adapters:

- [Component Inventory](./component-inventory.md)
- [Default Component Implementations](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/ComponentAdapter/adapters/defaultComponentAdapter.tsx)

[Back to Component Adapter Overview](./component-adapter)
