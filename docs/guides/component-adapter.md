---
title: Component Adapter
sidebar_position: 6
---

The Component Adapter provides a "bring your own UI" approach — replace SDK UI primitives with components from your own design system while keeping all of the SDK's business logic and functionality.

:::tip
Component adapters are powerful but involve higher maintenance overhead. Start with [theming](./theme-variables.md) first and use component adapters only when theming isn't sufficient.
:::

## How It Works

1. You create mappings that connect the SDK's prop interfaces to your UI components
2. You provide these mappings to a provider component
3. The SDK renders your components instead of its defaults

## Choosing a Provider

### GustoProvider (Recommended)

Includes default React Aria components out of the box. Override only the components you need — everything else falls back to accessible defaults.

```tsx
import { GustoProvider, Employee } from '@gusto/embedded-react-sdk'

function App() {
  return (
    <GustoProvider
      config={{ baseUrl: '/api/gusto/' }}
      components={{
        Button: MyCustomButton,
        TextInput: MyCustomTextInput,
      }}
    >
      <Employee.OnboardingFlow companyId="company-uuid" onEvent={() => {}} />
    </GustoProvider>
  )
}
```

### GustoProviderCustomUIAdapter

For complete UI control without React Aria dependencies. You must provide all required components.

```tsx
import { GustoProviderCustomUIAdapter, Employee } from '@gusto/embedded-react-sdk'

function App() {
  return (
    <GustoProviderCustomUIAdapter
      config={{ baseUrl: '/api/gusto/' }}
      components={myCompleteComponentSet}
    >
      <Employee.OnboardingFlow companyId="company-uuid" onEvent={() => {}} />
    </GustoProviderCustomUIAdapter>
  )
}
```

Use `GustoProviderCustomUIAdapter` when you want to implement all UI components yourself, minimize bundle size, or eliminate the React Aria dependency.

## Step-by-Step Setup

### 1. Implement the Props Interface

Each component must implement the required props interface defined by the SDK. Component types extend basic HTML element props, so your implementations can accept and forward standard HTML attributes.

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
  return (
    <div className="my-custom-input-wrapper">
      <label htmlFor={id || name}>{label}</label>
      <input
        type="text"
        id={id || name}
        name={name}
        value={value || ''}
        onChange={e => onChange && onChange(e.target.value)}
        {...props}
      />
      {errorMessage && <div className="error">{errorMessage}</div>}
    </div>
  )
}
```

### 2. Create Your Adapter Object

Create an object implementing the `ComponentsContextType` interface with your custom components:

```tsx
import type { ComponentsContextType } from '@gusto/embedded-react-sdk'

const myCustomComponents: Partial<ComponentsContextType> = {
  Button: props => <MyCustomButton {...props} />,
  TextInput: props => <MyCustomTextInput {...props} />,
  Select: props => <MyCustomSelect {...props} />,
}
```

### 3. Provide to Your App

```tsx
<GustoProvider config={{ baseUrl: '/api/gusto/' }} components={myCustomComponents}>
  <YourApp />
</GustoProvider>
```

## Complete Material UI Example

```tsx
import { GustoProvider, Employee } from '@gusto/embedded-react-sdk'
import TextField from '@mui/material/TextField'
import MuiButton from '@mui/material/Button'

const materialUIComponents = {
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
    const muiVariant =
      variant === 'primary' ? 'contained' : variant === 'secondary' ? 'outlined' : 'text'

    return (
      <MuiButton
        disabled={isDisabled || isLoading}
        onClick={onClick}
        variant={muiVariant}
        {...props}
      >
        {isLoading ? 'Loading...' : children}
      </MuiButton>
    )
  },
}

function App() {
  return (
    <GustoProvider config={{ baseUrl: '/api/gusto/' }} components={materialUIComponents}>
      <Employee.OnboardingFlow companyId="company_123" onEvent={() => {}} />
    </GustoProvider>
  )
}
```

## FAQ

### Can I use a different UI framework?

Yes. Any React-compatible UI library works (Material UI, Chakra UI, Ant Design, etc.) as long as your components implement the `ComponentsContextType` interface.

### Do I need to implement all components?

No. With `GustoProvider`, you only implement the components you want to customize. All others fall back to React Aria defaults.

With `GustoProviderCustomUIAdapter`, you must provide all required components. There is no public `defaultComponents` export to merge with — this is an internal implementation detail. If you only want to override some components, use `GustoProvider` instead, which handles defaults for you.

### How do I handle complex components like ComboBox or DatePicker?

Options:

1. Use a third-party library that provides similar functionality
2. Implement a simplified version
3. Keep the SDK defaults for complex components and only customize simpler ones

Reference the [default implementations](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/ComponentAdapter/adapters/defaultComponentAdapter.tsx) to understand required behavior.

### My custom component isn't working. What should I check?

1. **All required props implemented** — verify against the prop interface
2. **Event handlers** — `onChange` and `onBlur` must be called with the correct parameter types
3. **Accessibility** — ensure proper labeling, ARIA attributes, and keyboard navigation
4. **Correct types** — import and use prop types from the SDK

### My form values aren't being captured correctly.

The SDK expects specific value formats from each component's `onChange` handler:

| Component   | onChange parameter |
| ----------- | ------------------ |
| Checkbox    | `boolean`          |
| DatePicker  | `Date \| null`     |
| NumberInput | `number`           |
| Select      | `string`           |
| TextInput   | `string`           |

### What about accessibility?

When using the Component Adapter, you are responsible for ensuring accessibility compliance. The SDK's default components are built with accessibility in mind, but this does not automatically transfer to custom implementations. Pay attention to proper labeling, ARIA attributes, keyboard navigation, focus management, and color contrast.

## Component Reference

For the complete list of customizable components and their prop interfaces, see the [default implementations](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/ComponentAdapter/adapters/defaultComponentAdapter.tsx).

## TypeScript Types

All component adapter types are exported from the main SDK package:

```typescript
import type {
  ComponentsContextType,
  ButtonProps,
  TextInputProps,
  SelectProps,
  CheckboxProps,
  // ... other component prop types
} from '@gusto/embedded-react-sdk'
```
