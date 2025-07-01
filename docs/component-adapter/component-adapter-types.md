## Component Adapter Types

The Component Adapter system uses TypeScript interfaces to ensure type safety and consistent behavior. This document provides links to the type definitions you'll need when implementing custom components.

### Core Types

- [`ComponentsContextType`](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/ComponentAdapter/useComponentContext.ts) - The main interface defining all customizable UI components
- [`GustoProviderCustomUIAdapterProps`](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/GustoProvider/GustoProviderCustomUIAdapter.tsx) - Props for the custom UI adapter
- [UI Component Props](https://github.com/Gusto/embedded-react-sdk/tree/main/src/components/Common/UI) - Individual component prop interfaces

### Example Interface Structure

Here's a simplified look at some common interfaces (see GitHub links above for complete definitions):

```typescript
// Main component context interface
interface ComponentsContextType {
  Button: (props: ButtonProps) => JSX.Element | null
  TextInput: (props: TextInputProps) => JSX.Element | null
  // ... many more components
}

// Example of a component props interface
interface ButtonProps {
  children: ReactNode
  isDisabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  variant?: 'primary' | 'secondary' | 'tertiary'
  // ... additional props
}
```

### Importing Types

All types are exported from the SDK package:

```typescript
import type {
  ComponentsContextType,
  ButtonProps,
  TextInputProps,
  // ... other types as needed
} from '@gusto/embedded-react-sdk'
```

### Type Safety

The Component Adapter system leverages TypeScript to ensure type safety:

1. **Compile-time checking**: TypeScript will flag any missing or incorrect props in your component implementations
2. **IDE support**: You get autocomplete and documentation for all required props
3. **Type inference**: TypeScript can infer the types of your event handlers and other callback functions

For implementation examples and getting started guidance, see the [Setup Guide](./setting-up-your-component-adapter).

[Back to Component Adapter Overview](./component-adapter)
