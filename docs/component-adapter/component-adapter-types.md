---
title: Component Adapter Types
order: 4
---

## Component Adapter Types

The Component Adapter system uses TypeScript interfaces to ensure type safety and consistent behavior. This document provides links to the type definitions you'll need when implementing custom components.

### Core Types

- [Component Inventory](./component-inventory) - Individual component prop interfaces
- [`ComponentsContextType`](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/ComponentAdapter/useComponentContext.ts) - The main interface defining all customizable UI components
- [`GustoProviderCustomUIAdapterProps`](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/GustoProvider/GustoProviderCustomUIAdapter.tsx) - Props for the custom UI adapter

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
