## How the Component Adapter Works

The Component Adapter uses React's Context API to provide UI components to the SDK. At its core, the system consists of:

1. **ComponentsContext** - A React context that holds references to all UI components ([View on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/ComponentAdapter/useComponentContext.ts))
2. **ComponentsProvider** - A provider component that makes custom UI components available throughout the component tree ([View on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/ComponentAdapter/ComponentsProvider.tsx))
3. **useComponentContext** - A hook to access the components within SDK components ([View on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/ComponentAdapter/useComponentContext.ts))

When you use the SDK, all UI components (buttons, inputs, selects, etc.) are rendered through this context. By default, the SDK uses its own React Aria-based components, but you can override any or all of these with your own custom implementations.

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
2. You provide these components through the `GustoProviderCustomUIAdapter` ([View on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/GustoProvider/GustoProviderCustomUIAdapter.tsx))
3. The SDK's internal components use the `useComponentContext` hook to render UI elements
4. Your custom components are used instead of the default ones

### Under the Hood

When an SDK component needs to render a UI element like a button or text input, it doesn't create the element directly. Instead, it calls:

```tsx
const { Button } = useComponentContext()
// Later in the render function
;<Button onClick={handleClick}>Submit</Button>
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
