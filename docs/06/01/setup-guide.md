## Setting Up Your Component Adapter

This guide will walk you through the process of creating and implementing your own Component Adapter for the Gusto Embedded React SDK.

### 1. Create Your Custom Component Implementations

Each component must implement the required props interface defined by the SDK. For example, if you're creating a custom TextInput, it must accept all the props defined in the `TextInputProps` interface ([View interface on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/TextInput/TextInputTypes.ts)).

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
  ...props
}: TextInputProps) => {
  // Your custom implementation here
  return (
    <div className="my-custom-input-wrapper">
      <label htmlFor={id || name}>{label}</label>
      <input
        type="text"
        id={id || name}
        name={name}
        value={value || ''}
        onChange={e => onChange && onChange(e.target.value)}
        // ...other props
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
  Card: props => <MyCustomCard {...props} />,
  Checkbox: props => <MyCustomCheckbox {...props} />,
  CheckboxGroup: props => <MyCustomCheckboxGroup {...props} />,
  ComboBox: props => <MyCustomComboBox {...props} />,
  DatePicker: props => <MyCustomDatePicker {...props} />,
  OrderedList: props => <MyCustomOrderedList {...props} />,
  UnorderedList: props => <MyCustomUnorderedList {...props} />,
  NumberInput: props => <MyCustomNumberInput {...props} />,
  Radio: props => <MyCustomRadio {...props} />,
  RadioGroup: props => <MyCustomRadioGroup {...props} />,
  Select: props => <MyCustomSelect {...props} />,
  Switch: props => <MyCustomSwitch {...props} />,
  TextInput: props => <MyCustomTextInput {...props} />,
  Link: props => <MyCustomLink {...props} />,
  Menu: props => <MyCustomMenu {...props} />,
  Table: props => <MyCustomTable {...props} />,
  Heading: props => <MyCustomHeading {...props} />,
  Text: props => <MyCustomText {...props} />,
  CalendarPreview: props => <MyCustomCalendarPreview {...props} />,
  ProgressBar: props => <MyCustomProgressBar {...props} />,
}
```

### 3. Use GustoProviderCustomUIAdapter

Instead of using the standard `GustoApiProvider`, use the `GustoProviderCustomUIAdapter` ([View on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/GustoProvider/GustoProviderCustomUIAdapter.tsx)) to provide your custom components:

```tsx
import { GustoProviderCustomUIAdapter } from '@gusto/embedded-react-sdk'

function App() {
  return (
    <GustoProviderCustomUIAdapter
      config={{ baseUrl: '/api/gusto/' }}
      components={myCustomComponents}
    >
      {/* Your application components */}
      <EmployeeOnboardingFlow companyId="company_123" />
    </GustoProviderCustomUIAdapter>
  )
}
```

### 4. Implement Only the Components You Need

You don't need to implement every component in the `ComponentsContextType` interface. You can choose to implement only the ones you want to customize and let the default components handle the rest by importing the `defaultComponents` ([View on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/ComponentAdapter/adapters/defaultComponentAdapter.tsx)):

```tsx
import { GustoProviderCustomUIAdapter, defaultComponents } from '@gusto/embedded-react-sdk'

// Merge your custom components with the defaults
const customComponents = {
  ...defaultComponents,
  Button: props => <MyCustomButton {...props} />,
  TextInput: props => <MyCustomTextInput {...props} />,
}

function App() {
  return (
    <GustoProviderCustomUIAdapter config={{ baseUrl: '/api/gusto/' }} components={customComponents}>
      {/* Your application components */}
    </GustoProviderCustomUIAdapter>
  )
}
```

> **Important Note**: When using the partial implementation approach (spreading `defaultComponents`), be aware that the default components include React Aria design system dependencies. This can potentially increase your bundle size and prevent React Aria from being properly tree-shaken away, which goes against our optimization goals. For optimal bundle size, consider implementing all required components with your own design system instead of relying on the default implementations.

### 5. Testing Your Implementation

After implementing your Component Adapter, it's a good practice to:

1. Test all components with various props and states
2. Verify that event handlers work as expected
3. Check accessibility features
4. Test across different browsers and devices

For examples of testing, you can look at the SDK's test files ([View test examples on GitHub](https://github.com/Gusto/embedded-react-sdk/tree/main/test)).

### Complete Example

Here's a more complete example showing a custom implementation with a UI library (in this case, Material UI):

```tsx
import { GustoProviderCustomUIAdapter, defaultComponents } from '@gusto/embedded-react-sdk'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputAdornment from '@mui/material/InputAdornment'
import FormHelperText from '@mui/material/FormHelperText'

// Create Material UI implementations of SDK components
const materialUIComponents = {
  ...defaultComponents,

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

  Button: ({ children, isDisabled, isLoading, onClick, variant = 'primary', ...props }) => {
    // Map SDK button variants to Material UI variants
    const muiVariant =
      variant === 'primary' ? 'contained' : variant === 'secondary' ? 'outlined' : 'text'

    return (
      <Button disabled={isDisabled || isLoading} onClick={onClick} variant={muiVariant} {...props}>
        {isLoading ? 'Loading...' : children}
      </Button>
    )
  },

  Checkbox: ({
    label,
    description,
    errorMessage,
    isRequired,
    isDisabled,
    isInvalid,
    id,
    name,
    value,
    onChange,
    ...props
  }) => (
    <div>
      <FormControlLabel
        control={
          <Checkbox
            id={id || name}
            name={name}
            checked={!!value}
            disabled={isDisabled}
            onChange={e => onChange && onChange(e.target.checked)}
            required={isRequired}
            {...props}
          />
        }
        label={label + (isRequired ? ' *' : '')}
      />
      {description && <FormHelperText>{description}</FormHelperText>}
      {isInvalid && errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
    </div>
  ),
}

function App() {
  return (
    <GustoProviderCustomUIAdapter
      config={{ baseUrl: '/api/gusto/' }}
      components={materialUIComponents}
    >
      <EmployeeOnboardingFlow companyId="company_123" />
    </GustoProviderCustomUIAdapter>
  )
}
```

[Back to Component Adapter Overview](../component-adapter.md)
