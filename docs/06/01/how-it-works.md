## How the Component Adapter Works

### Architecture

The Component Adapter is implemented using the following architecture:

```
┌─────────────────────────┐
│  Your Application       │
│                         │
│  ┌─────────────────┐    │
│  │GustoProvider    │    │
│  │                 │    │
│  │ ┌─────────────┐ │    │
│  │ │Components   │ │    │
│  │ │Provider     │ │    │
│  │ │             │ │    │
│  │ │ Your Custom │ │    │
│  │ │ Components  │ │    │
│  │ └─────────────┘ │    │
│  │                 │    │
│  │ SDK Components  │    │
│  └─────────────────┘    │
│                         │
└─────────────────────────┘
```

1. You create custom components that implement the required interfaces
2. You provide these components through either:
   - `GustoProvider` (recommended): Includes default React Aria components and allows overriding specific ones
   - `GustoProviderCustomUIAdapter`: For complete UI control without React Aria dependencies
3. The SDK's internal components use the `useComponentContext` hook to render UI elements
4. Your custom components are used instead of the default ones for the components you've customized

### Choosing a Provider

The SDK offers two providers for different use cases:

#### GustoProvider (Recommended)

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'

function App() {
  return (
    <GustoProvider
      config={{ baseUrl: '/api/gusto/' }}
      components={{
        Button: MyCustomButton, // Override just what you need
        TextInput: MyCustomTextInput,
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

### Under the Hood

When an SDK component needs to render a UI element like a button or text input, it doesn't create the element directly. Instead, it calls:

```tsx
const { Button } = useComponentContext()
// Later in the render function
<Button onClick={handleClick}>Submit</Button>
```

This indirection allows for complete flexibility in how UI elements are implemented. The SDK doesn't need to know anything about the actual implementation of the button—it only needs to know that a component exists that accepts the expected props.

This pattern isolates the SDK's business logic from the UI implementation details, making it possible to swap out the entire UI layer without affecting functionality.

You can see this pattern in action throughout the SDK's components. For example, in form components that use buttons, text inputs, and other UI elements.

### Default Components

The SDK provides a set of default components implemented with React Aria for accessibility. These are used when no custom components are provided. You can view the default implementations here:

- [Default Component Adapter](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/ComponentAdapter/adapters/defaultComponentAdapter.tsx)
- [UI Components Directory](https://github.com/Gusto/embedded-react-sdk/tree/main/src/components/Common/UI)

### Benefits

This architecture provides several key benefits:

1. **Consistent look and feel**: Your entire application can use a consistent design system
2. **Familiar component API**: Your developers can use the UI components they're already familiar with
3. **Framework flexibility**: You can use any React-compatible UI framework or library
4. **Future-proofing**: As UI trends evolve, you can update your component implementations without waiting for SDK updates

[Back to Component Adapter Overview](../component-adapter.md)
