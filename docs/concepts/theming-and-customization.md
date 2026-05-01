---
title: Theming and Customization
sidebar_position: 6
---

The SDK provides two levels of visual customization: **theming** for CSS variable overrides, and **component adapters** for replacing UI primitives entirely.

## Setup

Import the SDK stylesheet before rendering any components:

```typescript
import '@gusto/embedded-react-sdk/style.css'
```

This is typically done at your application root alongside the `GustoProvider` setup.

## Theming

Theming overrides CSS variables that control colors, typography, shadows, and spacing across all SDK components. Pass a `theme` object to `GustoProvider`:

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'

function App({ children }) {
  return (
    <GustoProvider
      theme={{
        colorPrimary: '#1a73e8',
        colorPrimaryAccent: '#1557b0',
        colorPrimaryContent: '#ffffff',
        fontFamily: 'Inter, sans-serif',
      }}
      config={{ baseUrl: '/api/gusto/' }}
    >
      {children}
    </GustoProvider>
  )
}
```

The SDK ships with a baseline theme as a starting point. Override any subset of variables — unspecified variables keep their defaults.

### Variable categories

Theme variables are available for:

- **Colors** — primary, body, border, error, warning, success colors with content/accent variants
- **Typography** — font family, sizes, weights, line heights
- **Shadows** — elevation levels
- **Spacing and radii** — layout spacing and border radius values

For a complete list of available variables, see the [theme variables reference](../guides/theme-variables.md).

### Accessibility

Ensure sufficient contrast between background and content colors. For example, `colorBodyContent` and `colorBodySubContent` are displayed on top of `colorBody` and `colorBodyAccent`. Both pairings must meet [WCAG 2.2 contrast minimums](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

## Component adapters

For customization beyond CSS variables — replacing the underlying UI components with your own — use component adapters.

The SDK renders all UI through a `ComponentsContext`. By providing your own implementations for components like `Button`, `TextInput`, or `Select`, you can integrate your design system while the SDK handles all business logic.

### Partial overrides with GustoProvider (recommended)

`GustoProvider` accepts a `components` prop with partial overrides. Unspecified components fall back to the built-in React Aria defaults:

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'

function App({ children }) {
  return (
    <GustoProvider
      config={{ baseUrl: '/api/gusto/' }}
      components={{
        Button: MyCustomButton,
        TextInput: MyCustomTextInput,
      }}
    >
      {children}
    </GustoProvider>
  )
}
```

### Full control with GustoProviderCustomUIAdapter

If you want to provide all UI components yourself (e.g., to avoid the React Aria dependency or optimize bundle size), use `GustoProviderCustomUIAdapter`. This requires implementing every component in the adapter interface:

```tsx
import { GustoProviderCustomUIAdapter } from '@gusto/embedded-react-sdk'

function App({ children }) {
  return (
    <GustoProviderCustomUIAdapter
      config={{ baseUrl: '/api/gusto/' }}
      components={myFullComponentMap}
    >
      {children}
    </GustoProviderCustomUIAdapter>
  )
}
```

### Strategy

1. **Start with theming** — override CSS variables to match your brand colors and typography
2. **Add component adapters selectively** — only replace the specific components where theming isn't sufficient
3. **Use `GustoProviderCustomUIAdapter` only when** you need full control over the UI layer or want to eliminate the React Aria dependency

For detailed setup instructions, component interfaces, and a complete inventory of adaptable components, see the [component adapter documentation](../guides/component-adapter.md).
