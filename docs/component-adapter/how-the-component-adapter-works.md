---
title: How the Component Adapter Works
order: 2
---

## How the Component Adapter Works

1. You create mappings that connect the SDK props to your UI components
2. You provide these mappings to either:
   - `GustoProvider` (recommended): Includes default React Aria components and allows overriding specific ones
   - `GustoProviderCustomUIAdapter`: For complete UI control without React Aria dependencies
3. Your custom components are used by the SDK instead of the default components

### Choosing a Provider

The SDK offers two providers for different use cases:

#### GustoProvider (Recommended)

```tsx
import { GustoProvider, type ButtonProps, type TextInputProps } from '@gusto/embedded-react-sdk'
import { MyButton } from 'my-codebase/src/my-components/MyButton'

function ButtonAdapter({
  isLoading = false,
  isDisabled = false,
  buttonRef,
  onClick,
  children,
  ...props
}: ButtonProps) {
  return (
    <MyButton
      ref={buttonRef}
      disabled={isDisabled}
      loading={isLoading}
      onClick={onClick}
      {...props}
    >
      {children}
    </MyButton>
  )
},

function App() {
  return (
    <GustoProvider
      config={{ baseUrl: '/api/gusto/' }}
      components={{
        Button: ButtonAdapter, // Override just what you need
      }}
    >
      <EmployeeOnboardingFlow />
    </GustoProvider>
  )
}
```

- Includes React Aria default components out of the box
- Allows overriding specific components while keeping defaults for others
- Best choice for most applications
- Simpler to implement when you only need to customize some components

#### GustoProviderCustomUIAdapter

```tsx
import { GustoProviderCustomUIAdapter } from '@gusto/embedded-react-sdk'

function App() {
  return (
    <GustoProviderCustomUIAdapter
      config={{ baseUrl: '/api/gusto/' }}
      components={myCompleteComponentSet} // Must provide all required components
    >
      <EmployeeOnboardingFlow />
    </GustoProviderCustomUIAdapter>
  )
}
```

- Requires implementing all needed components
- No React Aria dependencies included
- Better for tree-shaking and bundle size optimization
- Ideal when you need complete control over the UI implementation

### Default Components

The SDK provides a set of default components implemented with React Aria for accessibility. These are used when no custom components are provided. You can view the default implementations here:

- [Default Component Adapter](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/ComponentAdapter/adapters/defaultComponentAdapter.tsx)
- [UI Components Directory](https://github.com/Gusto/embedded-react-sdk/tree/main/src/components/Common/UI)

### Benefits

This architecture provides several key benefits:

1. **Consistent look and feel**: Your entire application can use a consistent design system
2. **Framework flexibility**: You can use any React-compatible UI framework or library
3. **Implement once**: Once you have implemented your adapters, any SDK features you add down the road will automatically use your provided custom UI for free

[Back to Component Adapter Overview](./component-adapter)
